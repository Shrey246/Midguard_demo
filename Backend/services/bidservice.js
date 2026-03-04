// backend/services/bidservice.js

const { Bid, Room, sequelize } = require('../models');
const WalletService = require('./walletservice');
const { ulid } = require('ulid');

const BID_INCREMENT_PERCENT = 0.25; // 25%

class BidService {

  // 🔹 Place a new bid
  static async placeBid({ roomUid, bidderPublicId, bidAmount }) {

    if (bidAmount <= 0) {
      throw new Error('INVALID_BID_AMOUNT');
    }

    return sequelize.transaction(async (t) => {

      // 1️⃣ Check room exists & is active
      const room = await Room.findOne({
        where: { room_uid: roomUid },
        transaction: t,
        lock: t.LOCK.UPDATE
      });

      if (!room || room.listing_status !== 'active') {
        throw new Error('ROOM_NOT_OPEN_FOR_BIDDING');
      }

      // 2️⃣ Prevent multiple bids by same user in same room
      const existingBid = await Bid.findOne({
        where: {
          room_uid: roomUid,
          bidder_public_id: bidderPublicId,
          bid_status: ['placed', 'leading', 'waitlisted']
        },
        transaction: t,
        lock: t.LOCK.UPDATE
      });

      if (existingBid) {
        throw new Error('ALREADY_BID_IN_ROOM');
      }

      // 3️⃣ Find current highest bid
      const highestBid = await Bid.findOne({
        where: {
          room_uid: roomUid,
          bid_status: ['leading']
        },
        order: [['bid_amount', 'DESC']],
        transaction: t,
        lock: t.LOCK.UPDATE
      });

      const minimumBid = highestBid
        ? Number(highestBid.bid_amount) * (1 + BID_INCREMENT_PERCENT)
        : Number(room.base_price);

      if (Number(bidAmount) < minimumBid) {
        throw new Error(
          `BID_TOO_LOW_MIN_${minimumBid.toFixed(2)}`
        );
      }

      // 4️⃣ Lock wallet money FIRST
      await WalletService.lockFunds(
        bidderPublicId,
        bidAmount,
        roomUid
      );

      // 5️⃣ Create the bid
      const newBid = await Bid.create(
        {
          bid_uid: ulid(),
          room_uid: roomUid,
          bidder_public_id: bidderPublicId,
          bid_amount: bidAmount,
          locked_amount: bidAmount,
          bid_status: 'placed'
        },
        { transaction: t }
      );

      // 6️⃣ Re-rank all bids in this room
      await this.recalculateBidRanks(roomUid, t);

      return newBid;
    });
  }

  // 🔹 Recalculate ranks & statuses
  static async recalculateBidRanks(roomUid, transaction) {

    const bids = await Bid.findAll({
      where: {
        room_uid: roomUid,
        bid_status: ['placed', 'leading', 'waitlisted']
      },
      order: [
        ['bid_amount', 'DESC'],
        ['created_at', 'ASC']
      ],
      transaction,
      lock: transaction.LOCK.UPDATE
    });

    for (let i = 0; i < bids.length; i++) {
      let status = 'outbid';
      let rank = null;

      if (i === 0) {
        status = 'leading';
        rank = 1;
      } else if (i === 1 || i === 2) {
        status = 'waitlisted';
        rank = i + 1;
      }

      await bids[i].update(
        {
          bid_status: status,
          bid_rank: rank
        },
        { transaction }
      );
    }
  }

}

module.exports = BidService;
