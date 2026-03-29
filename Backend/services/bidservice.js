const { Bid, Room, sequelize } = require('../models');
const WalletService = require('./walletservice');
const { ulid } = require('ulid');
const notificationService = require("./notificationservice");
const { Sequelize, Op } = require('sequelize');

const BID_INCREMENT_PERCENT = 0.25;

class BidService {

  static async placeBid({ roomUid, bidderPublicId, bidAmount }) {

    if (Number(bidAmount) <= 0) {
      throw new Error('INVALID_BID_AMOUNT');
    }

    return sequelize.transaction(async (t) => {

      // 🔒 Lock room
      const room = await Room.findOne({
        where: { room_uid: roomUid },
        transaction: t,
        lock: Sequelize.Transaction.LOCK.UPDATE
      });

      // ⛔ BLOCK IF AUCTION ENDED
      if (room.end_time && new Date() > room.end_time) {
        throw new Error('AUCTION_ENDED');
      }

      if (!room || room.listing_status !== 'active') {
        throw new Error('ROOM_NOT_OPEN_FOR_BIDDING');
      }

      // ❌ Prevent self-bidding
      if (room.seller_public_id === bidderPublicId) {
        throw new Error('CANNOT_BID_OWN_ROOM');
      }

      // 🔒 Check existing bids
      const existingBid = await Bid.findOne({
        where: {
          room_uid: roomUid,
          bidder_public_id: bidderPublicId,
          bid_status: {
            [Op.in]: ['placed', 'leading', 'waitlisted']
          }
        },
        transaction: t,
        lock: Sequelize.Transaction.LOCK.UPDATE
      });

      if (existingBid) {
        throw new Error('ALREADY_BID_IN_ROOM');
      }

      // 🔒 Get highest bid
      const highestBid = await Bid.findOne({
        where: {
          room_uid: roomUid,
          bid_status: {
            [Op.in]: ['leading']
          }
        },
        order: [['bid_amount', 'DESC']],
        transaction: t,
        lock: Sequelize.Transaction.LOCK.UPDATE
      });

      const minimumBid = highestBid
        ? Number(highestBid.bid_amount) * (1 + BID_INCREMENT_PERCENT)
        : Number(room.base_price);

      if (Number(bidAmount) < minimumBid) {
        throw new Error(`BID_TOO_LOW_MIN_${minimumBid.toFixed(2)}`);
      }

      // ⚠️ IMPORTANT NOTE:
      // WalletService uses its own transaction → acceptable for now
      await WalletService.lockFunds(
        bidderPublicId,
        bidAmount,
        roomUid
      );

      // ✅ Create bid
      const newBid = await Bid.create({
        bid_uid: ulid(),
        room_uid: roomUid,
        bidder_public_id: bidderPublicId,
        bid_amount: bidAmount,
        locked_amount: bidAmount,
        bid_status: 'placed'
      }, { transaction: t });

      await notificationService.createNotification(
        room.seller_public_id,
        "new_bid",
        "New Bid Received",
        "A new bid has been placed on your listing.",
        "room",
        roomUid
      );

      // 🔄 Recalculate ranks
      const previousLeader = highestBid ? highestBid.bidder_public_id : null;

      await this.recalculateBidRanks(roomUid, t);

      const newLeader = await Bid.findOne({
        where: {
          room_uid: roomUid,
          bid_status: "leading"
        },
        transaction: t,
        lock: Sequelize.Transaction.LOCK.UPDATE
      });

      // 🟢 Notify new leader
      if (newLeader && newLeader.bidder_public_id === bidderPublicId) {
        await notificationService.createNotification(
          bidderPublicId,
          "leading_bid",
          "You Are Leading",
          "You are currently the highest bidder.",
          "bid",
          newLeader.bid_uid
        );
      }

      // 🔴 Notify previous leader
      if (previousLeader && previousLeader !== bidderPublicId) {
        await notificationService.createNotification(
          previousLeader,
          "outbid",
          "You Have Been Outbid",
          "Another bidder has placed a higher bid.",
          "room",
          roomUid
        );
      }

      return newBid;
    });
  }

  static async recalculateBidRanks(roomUid, transaction) {

    const bids = await Bid.findAll({
      where: {
        room_uid: roomUid,
        bid_status: {
          [Op.in]: ['placed', 'leading', 'waitlisted']
        }
      },
      order: [
        ['bid_amount', 'DESC'],
        ['created_at', 'ASC']
      ],
      transaction,
      lock: Sequelize.Transaction.LOCK.UPDATE
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

      await bids[i].update({
        bid_status: status,
        bid_rank: rank
      }, { transaction });
    }
  }
}

module.exports = BidService;