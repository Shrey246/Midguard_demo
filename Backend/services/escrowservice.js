const { sequelize, Escrow, Wallet, WalletTransaction, Order } = require("../models");
const notificationService = require("./notificationservice");
const { Sequelize } = require('sequelize');


/**
 * 🔒 Create Escrow
 */
async function createEscrow({
  sessionId,
  orderUid,
  roomUid,
  buyerPublicId,
  sellerPublicId,
  amount,
  platformFee,
  sellerNetAmount,
  transaction
}) {
  return Escrow.create({
    session_id: sessionId,
    order_uid: orderUid,
    room_uid: roomUid,
    buyer_public_id: buyerPublicId,
    seller_public_id: sellerPublicId,
    escrow_amount: amount,
    platform_fee: platformFee,
    seller_net_amount: sellerNetAmount,
    escrow_status: "funds_received",
    funds_received_at: new Date()
  }, { transaction });
}

/**
 * 🚚 Seller confirms shipment
 */
async function confirmShipment(sessionId, sellerPublicId, courierName, trackingLink) {

  const transaction = await sequelize.transaction();

  try {
    const order = await Order.findOne({
      where: { session_id: sessionId },
      transaction,
      lock: Sequelize.Transaction.LOCK.UPDATE
    });

    if (!order) throw new Error("ORDER_NOT_FOUND");
    if (order.seller_public_id !== sellerPublicId) {
      throw new Error("UNAUTHORIZED_SELLER");
    }
    if (order.payment_status !== "held") {
      throw new Error("ORDER_NOT_READY_FOR_SHIPMENT");
    }

    const escrow = await Escrow.findOne({
      where: { session_id: sessionId },
      transaction,
      lock: Sequelize.Transaction.LOCK.UPDATE
    });

    if (!escrow) throw new Error("ESCROW_NOT_FOUND");

    // Update order
    order.shipping_status = "shipped";
    order.courier_name = courierName;
    order.tracking_link = trackingLink;
    order.shipped_at = new Date();
    await order.save({ transaction });

    // Update escrow
    escrow.seller_dispatched = true;
    escrow.escrow_status = "in_transit";
    await escrow.save({ transaction });

    await transaction.commit();

    await notificationService.createNotification(
      order.buyer_public_id,
      "shipment_sent",
      "Shipment Sent",
      "Your item has been shipped.",
      "order",
      sessionId
    );

    return { success: true, message: "Shipment confirmed" };

  } catch (err) {
    await transaction.rollback();
    throw err;
  }
}

/**
 * 💻 Seller delivers DIGITAL product
 */
async function confirmDigitalDelivery(sessionId, sellerPublicId) {

  const transaction = await sequelize.transaction();

  try {
    const order = await Order.findOne({
      where: { session_id: sessionId },
      transaction,
      lock: Sequelize.Transaction.LOCK.UPDATE
    });

    if (!order) throw new Error("ORDER_NOT_FOUND");
    if (order.seller_public_id !== sellerPublicId) {
      throw new Error("UNAUTHORIZED_SELLER");
    }

    const escrow = await Escrow.findOne({
      where: { session_id: sessionId },
      transaction,
      lock: Sequelize.Transaction.LOCK.UPDATE
    });

    if (!escrow) throw new Error("ESCROW_NOT_FOUND");

    order.digital_delivery_confirmed = true;
    await order.save({ transaction });

    escrow.escrow_status = "delivered";
    await escrow.save({ transaction });

    await transaction.commit();

    await notificationService.createNotification(
      order.buyer_public_id,
      "digital_delivered",
      "Digital Product Delivered",
      "Your product has been delivered.",
      "order",
      sessionId
    );

    return { success: true };

  } catch (err) {
    await transaction.rollback();
    throw err;
  }
}

/**
 * 📦 Buyer confirms delivery → RELEASE MONEY
 */
async function confirmDelivery(sessionId, buyerPublicId) {

  const transaction = await sequelize.transaction();

  try {
    const order = await Order.findOne({
      where: { session_id: sessionId },
      transaction,
      lock: Sequelize.Transaction.LOCK.UPDATE
    });

    if (!order) throw new Error("ORDER_NOT_FOUND");
    if (order.buyer_public_id !== buyerPublicId) {
      throw new Error("UNAUTHORIZED_BUYER");
    }

    const escrow = await Escrow.findOne({
      where: { session_id: sessionId },
      transaction,
      lock: Sequelize.Transaction.LOCK.UPDATE
    });

    if (!escrow) throw new Error("ESCROW_NOT_FOUND");
    if (escrow.escrow_status === "disputed") {
      throw new Error("ESCROW_DISPUTED");
    }

    // Step 1: Mark delivered
    escrow.buyer_received = true;
    escrow.escrow_status = "delivered";
    await escrow.save({ transaction });

    // Step 2: Credit seller
    const sellerWallet = await Wallet.findOne({
      where: { user_public_id: order.seller_public_id },
      transaction,
      lock: Sequelize.Transaction.LOCK.UPDATE
    });

    if (!sellerWallet) throw new Error("WALLET_NOT_FOUND");

    const amount = Number(escrow.seller_net_amount);

    sellerWallet.available_balance += amount;
    await sellerWallet.save({ transaction });

    await WalletTransaction.create({
      transaction_uid: `txn_${Date.now()}`,
      user_public_id: order.seller_public_id,
      amount,
      transaction_type: "credit",
      reference_type: "escrow", // ✅ FIXED
      reference_id: escrow.session_id
    }, { transaction });

    // Step 3: Finalize states
    escrow.escrow_status = "released";
    await escrow.save({ transaction });

    order.order_status = "completed";
    order.payment_status = "released";
    await order.save({ transaction });

    await transaction.commit();

    await notificationService.createNotification(
      order.seller_public_id,
      "payment_released",
      "Payment Released",
      "Funds added to your wallet.",
      "order",
      sessionId
    );

    return { success: true };

  } catch (err) {
    await transaction.rollback();
    throw err;
  }
}

/**
 * ⚠️ Raise dispute
 */
async function raiseDispute(sessionId, userPublicId, reason) {

  const transaction = await sequelize.transaction();

  try {
    const order = await Order.findOne({
      where: { session_id: sessionId },
      transaction,
      lock: Sequelize.Transaction.LOCK.UPDATE
    });

    if (!order) throw new Error("ORDER_NOT_FOUND");

    if (
      order.buyer_public_id !== userPublicId &&
      order.seller_public_id !== userPublicId
    ) {
      throw new Error("UNAUTHORIZED");
    }

    const escrow = await Escrow.findOne({
      where: { session_id: sessionId },
      transaction,
      lock: Sequelize.Transaction.LOCK.UPDATE
    });

    if (!escrow) throw new Error("ESCROW_NOT_FOUND");

    escrow.dispute_raised = true;
    escrow.dispute_reason = reason;
    escrow.escrow_status = "disputed";
    await escrow.save({ transaction });

    order.order_status = "cancelled";
    await order.save({ transaction });

    await transaction.commit();

    return { success: true };

  } catch (err) {
    await transaction.rollback();
    throw err;
  }
}

/**
 * 📊 Get escrow details
 */
async function getEscrowDetails(sessionId) {

  const escrow = await Escrow.findOne({
    where: { session_id: sessionId }
  });

  const order = await Order.findOne({
    where: { session_id: sessionId }
  });

  if (!escrow || !order) {
    throw new Error("DATA_NOT_FOUND");
  }

  return { escrow, order };
}

  // =========================
// 🔁 REFUND ESCROW (CORE)
// =========================
  async function refundEscrow(sessionId) {

  const transaction = await sequelize.transaction();

  try {
    const escrow = await Escrow.findOne({
      where: { session_id: sessionId },
      transaction,
      lock: Sequelize.Transaction.LOCK.UPDATE
    });

    if (!escrow) throw new Error("ESCROW_NOT_FOUND");

    if (escrow.escrow_status === "released") {
      throw new Error("ALREADY_RELEASED");
    }

    const order = await Order.findOne({
      where: { session_id: sessionId },
      transaction,
      lock: Sequelize.Transaction.LOCK.UPDATE
    });

    if (!order) throw new Error("ORDER_NOT_FOUND");

    // 💰 CREDIT BUYER BACK
    const buyerWallet = await Wallet.findOne({
      where: { user_public_id: escrow.buyer_public_id },
      transaction,
      lock: Sequelize.Transaction.LOCK.UPDATE
    });

    if (!buyerWallet) throw new Error("WALLET_NOT_FOUND");

    const amount = Number(escrow.escrow_amount);

    buyerWallet.available_balance += amount;
    await buyerWallet.save({ transaction });

    await WalletTransaction.create({
      transaction_uid: `txn_${Date.now()}`,
      user_public_id: escrow.buyer_public_id,
      amount,
      transaction_type: "credit",
      reference_type: "escrow_refund",
      reference_id: escrow.session_id
    }, { transaction });

    // 🔄 UPDATE STATES
    escrow.escrow_status = "refunded";
    await escrow.save({ transaction });

    order.order_status = "cancelled";
    order.payment_status = "refunded";
    await order.save({ transaction });

    await transaction.commit();

    return { success: true };

  } catch (err) {
    await transaction.rollback();
    throw err;
  }
   }


module.exports = {
  createEscrow,
  confirmShipment,
  confirmDigitalDelivery,
  confirmDelivery,
  raiseDispute,
  getEscrowDetails,
  refundEscrow
};