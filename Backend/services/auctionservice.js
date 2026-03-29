const { sequelize, Op, Room, Bid } = require('../models');
const WalletService = require('./walletservice');
const notificationService = require("./notificationservice");
const { Sequelize } = require('sequelize');

class AuctionService {

  /**
   * Close auction → pick winner
   */
  static async closeAuction(roomUid) {
    return sequelize.transaction(async (t) => {

      const room = await Room.findOne({
        where: { room_uid: roomUid },
        transaction: t,
        lock: Sequelize.Transaction.LOCK.UPDATE
      });

      if (!room) throw new Error('ROOM_NOT_FOUND');
      if (room.listing_status !== 'active') {
        throw new Error('ROOM_NOT_ACTIVE');
      }

      const leadingBid = await Bid.findOne({
        where: {
          room_uid: roomUid,
          bid_status: 'leading'
        },
        transaction: t,
        lock: Sequelize.Transaction.LOCK.UPDATE
      });

      if (!leadingBid) throw new Error('NO_BIDS_AVAILABLE');

      const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000);

      await leadingBid.update(
        { expires_at: expiresAt },
        { transaction: t }
      );

      await room.update(
        { listing_status: 'locked' },
        { transaction: t }
      );

      await notificationService.createNotification(
        leadingBid.bidder_public_id,
        "auction_won",
        "Auction Won",
        "You are the highest bidder. Confirm within 48 hours.",
        "room",
        room.room_uid
      );

      return {
        room_uid: room.room_uid,
        bid_uid: leadingBid.bid_uid,
        expires_at: expiresAt
      };
    });
  }

  /**
   * Confirm winning bid
   */
  static async confirmWinningBid(bidUid, buyerPublicId) {
    return sequelize.transaction(async (t) => {

      const bid = await Bid.findOne({
        where: { bid_uid: bidUid },
        transaction: t,
        lock: Sequelize.Transaction.LOCK.UPDATE
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

      const room = await Room.findOne({
        where: { room_uid: bid.room_uid },
        transaction: t,
        lock: Sequelize.Transaction.LOCK.UPDATE
      });

      if (!room || room.listing_status !== 'locked') {
        throw new Error('ROOM_NOT_LOCKED');
      }

      return {
        room_uid: room.room_uid,
        bid_uid: bid.bid_uid,
        amount: bid.bid_amount,
        seller_public_id: room.seller_public_id
      };
    });
  }

  /**
   * Reject / expire winning bid
   */
  static async rejectOrExpireBid(bidUid) {
    return sequelize.transaction(async (t) => {

      const bid = await Bid.findOne({
        where: { bid_uid: bidUid },
        transaction: t,
        lock: Sequelize.Transaction.LOCK.UPDATE
      });

      if (!bid || bid.bid_status !== 'leading') {
        throw new Error('INVALID_BID_STATE');
      }

      // ✅ expiry check
      if (bid.expires_at && new Date() > bid.expires_at) {
        bid.bid_status = 'expired';
      }

      const roomUid = bid.room_uid;

      await bid.update({
        bid_status: 'expired',
        bid_rank: null,
        expires_at: null
      }, { transaction: t });

      // ✅ FIX: pass transaction
      await WalletService.unlockFunds(
        bid.bidder_public_id,
        bid.bid_amount,
        bid.bid_uid
      );

      // 🔒 find next candidate safely
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
        lock: Sequelize.Transaction.LOCK.UPDATE
      });

      if (!nextBid) {
        const room = await Room.findOne({
          where: { room_uid: roomUid },
          transaction: t,
          lock: Sequelize.Transaction.LOCK.UPDATE
        });

        if (room.listing_status === 'locked') {
          await room.update(
            { listing_status: 'cancelled' },
            { transaction: t }
          );
        }

        return { status: 'ROOM_CANCELLED_NO_BIDS' };
      }

      const newExpiry = new Date(Date.now() + 48 * 60 * 60 * 1000);

      await nextBid.update({
        bid_status: 'leading',
        bid_rank: 1,
        expires_at: newExpiry
      }, { transaction: t });

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
        new_leading_bid_uid: nextBid.bid_uid,
        expires_at: newExpiry
      };
    });
  }

  /**
   * Buy Now validation
   */
  static async buyNow(roomUid, buyerPublicId) {
    return sequelize.transaction(async (t) => {

      const room = await Room.findOne({
        where: { room_uid: roomUid },
        transaction: t,
        lock: Sequelize.Transaction.LOCK.UPDATE
      });

      if (!room) throw new Error('ROOM_NOT_FOUND');

      if (!['public', 'private'].includes(room.room_type)) {
        throw new Error('INVALID_ROOM_TYPE');
      }

      if (room.listing_status !== 'active') {
        throw new Error('ROOM_NOT_ACTIVE');
      }

      if (room.seller_public_id === buyerPublicId) {
        throw new Error('CANNOT_BUY_OWN_ROOM');
      }

      return {
        room_uid: room.room_uid,
        amount: room.base_price,
        seller_public_id: room.seller_public_id
      };
    });
  }
}

module.exports = AuctionService;