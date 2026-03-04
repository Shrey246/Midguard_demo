// backend/services/auctionservice.js

const { sequelize, Op } = require('../models');
const { Room, Bid, Order, Escrow } = require('../models');
const WalletService = require('./walletservice');
const { ulid } = require('ulid');
const AddressService = require('./addressservice');

class AuctionService {

  /**
   * Close an active auction and select highest bid
   * - locks the room
   * - assigns 48h confirmation window to leading bid
   */
static async closeAuction(roomUid) {
  return sequelize.transaction(async (t) => {

    // 1️⃣ Lock & validate room
    const room = await Room.findOne({
      where: { room_uid: roomUid },
      transaction: t,
      lock: t.LOCK.UPDATE
    });

    if (!room) {
      throw new Error('ROOM_NOT_FOUND');
    }

    if (room.listing_status !== 'active') {
      throw new Error('ROOM_NOT_ACTIVE');
    }

    // 2️⃣ Get current leading bid
    const leadingBid = await Bid.findOne({
      where: {
        room_uid: roomUid,
        bid_status: 'leading'
      },
      transaction: t,
      lock: t.LOCK.UPDATE
    });

    if (!leadingBid) {
      throw new Error('NO_BIDS_AVAILABLE');
    }

    // 3️⃣ Start 48-hour confirmation window
    const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000);

    await leadingBid.update(
      { expires_at: expiresAt },
      { transaction: t }
    );

    // 4️⃣ Lock the room (no more bids)
    await room.update(
      { listing_status: 'locked' },
      { transaction: t }
    );

    // 5️⃣ Return minimal info for controller/logging
    return {
      room_uid: room.room_uid,
      bid_uid: leadingBid.bid_uid,
      expires_at: expiresAt
    };
  });
}


  /**
   * Buyer confirms winning bid within 48h
   * - creates order
   * - creates escrow
   * - moves locked funds → escrow
   */
  static async confirmWinningBid(bidUid, buyerPublicId, addressUid) {
  return sequelize.transaction(async (t) => {

    // 1️⃣ Fetch & lock bid
    const bid = await Bid.findOne({
      where: { bid_uid: bidUid },
      transaction: t,
      lock: t.LOCK.UPDATE
    });

    if (!bid || bid.bid_status !== 'leading') {
      throw new Error('INVALID_BID');
    }

    if (bid.bidder_public_id !== buyerPublicId) {
      throw new Error('NOT_BID_OWNER');
    }

    if (bid.expires_at && new Date() > bid.expires_at) {
      throw new Error('BID_EXPIRED');
    }

    // 2️⃣ Fetch & lock room
    const room = await Room.findOne({
      where: { room_uid: bid.room_uid },
      transaction: t,
      lock: t.LOCK.UPDATE
    });

    if (!room || room.listing_status !== 'locked') {
      throw new Error('ROOM_NOT_LOCKED');
    }

    // 3️⃣ Session + fee calculation
    const sessionId = ulid();

    const platformFeePercent = 0.05; // 5%
    const platformFee = Number(bid.bid_amount) * platformFeePercent;
    const sellerNetAmount = Number(bid.bid_amount) - platformFee;

    // 4️⃣ Create Order
    const order = await Order.create(
      {
        session_id: sessionId,
        accepted_bid_uid: bid.bid_uid,
        room_uid: room.room_uid,
        buyer_public_id: buyerPublicId,
        seller_public_id: room.seller_public_id,
        final_amount: bid.bid_amount,
        platform_fee: platformFee,
        seller_net_amount: sellerNetAmount,
        order_status: 'in_progress',
        buyer_confirmation_status: 'confirmed',
        payment_status: 'held'
      },
      { transaction: t }
    );

    // 5️⃣ Create Escrow
    await Escrow.create(
      {
        session_id: sessionId,
        order_uid: order.session_id,
        room_uid: room.room_uid,
        buyer_public_id: buyerPublicId,
        seller_public_id: room.seller_public_id,
        escrow_amount: bid.bid_amount,
        platform_fee: platformFee,
        seller_net_amount: sellerNetAmount,
        escrow_status: 'funds_received'
      },
      { transaction: t }
    );

    // 5.5️⃣ Snapshot buyer address (IMMUTABLE)
        await AddressService.snapshotOrderAddress(
        order.session_id,     // order_uid
         buyerPublicId,
         addressUid,
        t                     // pass transaction
       );


    // 6️⃣ Move money: locked → escrow
    await WalletService.lockedToEscrow(
      buyerPublicId,
      bid.bid_amount,
      sessionId
    );

    // 7️⃣ Final state updates
    await bid.update(
      { bid_status: 'won' },
      { transaction: t }
    );

    await room.update(
      { listing_status: 'completed' },
      { transaction: t }
    );

    return {
      session_id: sessionId
    };
  });
}


  /**
   * Buyer rejects or times out
   * - expires current bid
   * - unlocks funds
   * - promotes next waitlisted bid
   */
static async rejectOrExpireBid(bidUid) {
  return sequelize.transaction(async (t) => {

    // 1️⃣ Fetch & lock bid
    const bid = await Bid.findOne({
      where: { bid_uid: bidUid },
      transaction: t,
      lock: t.LOCK.UPDATE
    });

    if (!bid || bid.bid_status !== 'leading') {
      throw new Error('INVALID_BID_STATE');
    }

    const roomUid = bid.room_uid;
    const bidderPublicId = bid.bidder_public_id;
    const bidAmount = bid.bid_amount;

    // 2️⃣ Mark bid as expired
    await bid.update(
      {
        bid_status: 'expired',
        bid_rank: null,
        expires_at: null
      },
      { transaction: t }
    );

    // 3️⃣ Unlock buyer’s funds
    await WalletService.unlockFunds(
      bidderPublicId,
      bidAmount,
      bid.bid_uid
    );

    // 4️⃣ Find next highest waitlisted bid
    const nextBid = await Bid.findOne({
      where: {
        room_uid: roomUid,
        bid_status: 'waitlisted'
      },
      order: [
        ['bid_amount', 'DESC'],
        ['created_at', 'ASC']
      ],
      transaction: t,
      lock: t.LOCK.UPDATE
    });

    // 5️⃣ If no bids left → cancel room
    if (!nextBid) {
      const room = await Room.findOne({
        where: { room_uid: roomUid },
        transaction: t,
        lock: t.LOCK.UPDATE
      });

      await room.update(
        { listing_status: 'cancelled' },
        { transaction: t }
      );

      return {
        room_uid: roomUid,
        status: 'ROOM_CANCELLED_NO_BIDS'
      };
    }

    // 6️⃣ Promote next bid
    const newExpiry = new Date(Date.now() + 48 * 60 * 60 * 1000);

    await nextBid.update(
      {
        bid_status: 'leading',
        bid_rank: 1,
        expires_at: newExpiry
      },
      { transaction: t }
    );

    // 7️⃣ Demote others safely
    await Bid.update(
      {
        bid_status: 'outbid',
        bid_rank: null
      },
      {
        where: {
          room_uid: roomUid,
          bid_status: 'waitlisted',
          bid_uid: { [Op.ne]: nextBid.bid_uid }
        },
        transaction: t
      }
    );

    return {
      room_uid: roomUid,
      new_leading_bid_uid: nextBid.bid_uid,
      expires_at: newExpiry
    };
  });
}

  /**
   * Public room buy-now flow (fixed price)
   * - validates room_type
   * - creates order
   * - creates escrow
   * - snapshots address
   */
  static async buyNow(roomUid, buyerPublicId, addressUid) {
    return sequelize.transaction(async (t) => {

      // 1️⃣ Lock & validate room
      const room = await Room.findOne({
        where: { room_uid: roomUid },
        transaction: t,
        lock: t.LOCK.UPDATE
      });

      if (!room) {
        throw new Error('ROOM_NOT_FOUND');
      }

      if (!['public', 'private'].includes(room.room_type)) {
          throw new Error('INVALID_ROOM_TYPE');
         }

      if (room.listing_status !== 'active') {
        throw new Error('ROOM_NOT_ACTIVE');
      }

      // 2️⃣ Prevent seller buying own room
      if (room.seller_public_id === buyerPublicId) {
        throw new Error('CANNOT_BUY_OWN_ROOM');
      }

      // 3️⃣ Pricing & session
      const sessionId = ulid();

      const finalAmount = Number(room.base_price);
      const platformFeePercent = 0.05;
      const platformFee = finalAmount * platformFeePercent;
      const sellerNetAmount = finalAmount - platformFee;

      // 4️⃣ Create Order
      const order = await Order.create(
        {
          session_id: sessionId,
          accepted_bid_uid: null,
          room_uid: room.room_uid,
          buyer_public_id: buyerPublicId,
          seller_public_id: room.seller_public_id,
          final_amount: finalAmount,
          platform_fee: platformFee,
          seller_net_amount: sellerNetAmount,
          order_status: 'in_progress',
          buyer_confirmation_status: 'confirmed',
          payment_status: 'held'
        },
        { transaction: t }
      );

      // 5️⃣ Create Escrow
      await Escrow.create(
        {
          session_id: sessionId,
          order_uid: order.session_id,
          room_uid: room.room_uid,
          buyer_public_id: buyerPublicId,
          seller_public_id: room.seller_public_id,
          escrow_amount: finalAmount,
          platform_fee: platformFee,
          seller_net_amount: sellerNetAmount,
          escrow_status: 'funds_received'
        },
        { transaction: t }
      );

      // 6️⃣ Snapshot address
      await AddressService.snapshotOrderAddress(
        order.session_id,
        buyerPublicId,
        addressUid,
        t
      );

      // 7️⃣ Move funds: available → escrow
        await WalletService.availableToEscrow(
          buyerPublicId,
          finalAmount,
          sessionId
         );


      // 8️⃣ Mark room completed
      await room.update(
        { listing_status: 'completed' },
        { transaction: t }
      );

      return {
        session_id: sessionId
      };
    });
  }

    /**
   * Buyer releases escrow (confirms delivery)
   */
  static async releaseEscrow(sessionId, buyerPublicId) {
    return sequelize.transaction(async (t) => {

      // 1️⃣ Fetch escrow
      const escrow = await Escrow.findOne({
        where: { session_id: sessionId },
        transaction: t,
        lock: t.LOCK.UPDATE
      });

      if (!escrow) {
        throw new Error('ESCROW_NOT_FOUND');
      }

      if (escrow.buyer_public_id !== buyerPublicId) {
        throw new Error('NOT_ESCROW_BUYER');
      }

      if (escrow.escrow_status !== 'funds_received') {
        throw new Error('INVALID_ESCROW_STATE');
      }

      // 2️⃣ Fetch order
      const order = await Order.findOne({
        where: { session_id: sessionId },
        transaction: t,
        lock: t.LOCK.UPDATE
      });

      if (!order) {
        throw new Error('ORDER_NOT_FOUND');
      }

      // 3️⃣ Credit seller wallet
      await WalletService.creditSeller(
        escrow.seller_public_id,
        escrow.seller_net_amount,
        t
       );


      // 4️⃣ Update escrow
      await escrow.update(
        {
          escrow_status: 'completed',
          buyer_approved: true,
          closed_at: new Date()
        },
        { transaction: t }
      );

      // 5️⃣ Update order
      await order.update(
        {
          order_status: 'completed',
          payment_status: 'released',
          completed_at: new Date()
        },
        { transaction: t }
      );

      return { success: true };
    });
  }
}
module.exports = AuctionService;
