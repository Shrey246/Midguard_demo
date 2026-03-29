const { sequelize, Order, Room } = require('../models');
const WalletService = require('./walletservice');
const AddressService = require('./addressservice');
const notificationService = require('./notificationservice');
const { ulid } = require('ulid');
const EscrowService = require('./escrowservice');
const { Sequelize } = require('sequelize');

class OrderService {

  // =========================
  // 🔧 INTERNAL FLOW
  // =========================
  static async _createOrderFlow({
    room,
    buyer_public_id,
    seller_public_id,
    amount,
    accepted_bid_uid = null,
    address_uid
  }, t) {

    const sessionId = ulid();
    const orderUid = ulid();

    const platformFee = Number(amount) * 0.05;
    const sellerNetAmount = Number(amount) - platformFee;

    const order = await Order.create({
      order_uid: orderUid,
      session_id: sessionId,
      accepted_bid_uid,
      room_uid: room.room_uid,
      buyer_public_id,
      seller_public_id,
      final_amount: amount,
      platform_fee: platformFee,
      seller_net_amount: sellerNetAmount,
      order_status: 'in_progress',
      buyer_confirmation_status: 'confirmed',
      payment_status: 'held'
    }, { transaction: t });

    // ✅ CREATE ESCROW
    await EscrowService.createEscrow({
      sessionId,
      orderUid,
      roomUid: room.room_uid,
      buyerPublicId: buyer_public_id,
      sellerPublicId: seller_public_id,
      amount,
      platformFee,
      sellerNetAmount,
      transaction: t
    });

    // ✅ SNAPSHOT ADDRESS
    await AddressService.snapshotOrderAddress(
      orderUid,
      buyer_public_id,
      address_uid,
      t
    );

    // ✅ MARK ROOM COMPLETED
    await room.update(
      { listing_status: 'completed' },
      { transaction: t }
    );

    return { session_id: sessionId, order };
  }

  // =========================
  // 🟣 AUCTION FLOW
  // =========================
  static async createFromWinningBid(data) {
    return sequelize.transaction(async (t) => {

      const {
        room_uid,
        bid_uid,
        amount,
        seller_public_id,
        buyer_public_id,
        address_uid
      } = data;

      const room = await Room.findOne({
        where: { room_uid },
        transaction: t,
        lock: Sequelize.Transaction.LOCK.UPDATE
      });

      if (!room) throw new Error('ROOM_NOT_FOUND');

      // 🔒 CRITICAL VALIDATIONS
      if (room.listing_status !== "active") {
        throw new Error("ROOM_NOT_AVAILABLE");
      }

      if (room.seller_public_id !== seller_public_id) {
        throw new Error("SELLER_MISMATCH");
      }

      if (Number(amount) <= 0) {
        throw new Error("INVALID_AMOUNT");
      }

      // 💰 MOVE LOCKED → ESCROW
      await WalletService.lockedToEscrow(
        buyer_public_id,
        amount,
        room_uid,
        t
      );

      const result = await this._createOrderFlow({
        room,
        buyer_public_id,
        seller_public_id,
        amount,
        accepted_bid_uid: bid_uid,
        address_uid
      }, t);

      await notificationService.createNotification(
        seller_public_id,
        "item_sold",
        "Item Sold",
        "Your auction item has been sold.",
        "order",
        result.session_id
      );

      return result;
    });
  }

  // =========================
  // 🟢 BUY NOW FLOW
  // =========================
  static async createFromBuyNow(data) {
    return sequelize.transaction(async (t) => {

      const {
        room_uid,
        amount,
        seller_public_id,
        buyer_public_id,
        address_uid
      } = data;

      const room = await Room.findOne({
        where: { room_uid },
        transaction: t,
        lock: Sequelize.Transaction.LOCK.UPDATE
      });

      if (!room) throw new Error('ROOM_NOT_FOUND');

      // 🔒 CRITICAL VALIDATIONS
      if (room.listing_status !== "active") {
        throw new Error("ROOM_NOT_AVAILABLE");
      }

      if (room.seller_public_id !== seller_public_id) {
        throw new Error("SELLER_MISMATCH");
      }

      if (Number(amount) <= 0) {
        throw new Error("INVALID_AMOUNT");
      }

      // 💰 MOVE AVAILABLE → ESCROW
      await WalletService.availableToEscrow(
        buyer_public_id,
        amount,
        room_uid,
        t
      );

      const result = await this._createOrderFlow({
        room,
        buyer_public_id,
        seller_public_id,
        amount,
        address_uid
      }, t);

      await notificationService.createNotification(
        seller_public_id,
        "item_sold",
        "Item Sold",
        "Your item has been purchased.",
        "order",
        result.session_id
      );

      return result;
    });
  }
}

module.exports = OrderService;