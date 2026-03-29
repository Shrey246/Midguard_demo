const {
  Order,
  Room,
  Escrow,
  Wallet,
  sequelize
} = require("../models");

const escrowService = require("./escrowservice");
const walletService = require("./walletservice");
const notificationService = require("./notificationservice");


/**
 * Initiate trade (order created)
 */
async function initiateTrade(sessionId) {

  const order = await Order.findOne({
    where: { session_id: sessionId }
  });

  if (!order) {
    throw new Error("Order not found");
  }

  if (order.trade_status !== "initiated") {
    throw new Error("Trade already initiated");
  }

  order.trade_status = "awaiting_buyer_approval";

  await order.save();

    await notificationService.createNotification(
    order.buyer_public_id,
    "trade_initiated",
    "Trade Started",
    "The seller has initiated the trade. Please review and approve.",
    "order",
    sessionId
  );

  return {
    success: true,
    message: "Trade initiated. Awaiting buyer approval."
  };
}



/**
 * Buyer approves trade
 */
async function approveTrade(sessionId, buyerPublicId) {

  const transaction = await sequelize.transaction();

  try {

    const order = await Order.findOne({
      where: { session_id: sessionId },
      transaction
    });

    if (!order) {
      throw new Error("Order not found");
    }

    if (order.buyer_public_id !== buyerPublicId) {
      throw new Error("Unauthorized buyer");
    }

    if (order.trade_status !== "awaiting_buyer_approval") {
      throw new Error("Trade cannot be approved at this stage");
    }

    const room = await Room.findOne({
      where: { room_uid: order.room_uid },
      transaction
    });

    if (!room) {
      throw new Error("Room not found");
    }

    // Lock funds (except auction where funds already locked)
    if (room.room_type !== "auction") {
      await walletService.lockFunds(
        buyerPublicId,
        order.final_amount,
        order.room_uid,
        transaction
      );
    }

    // Create escrow
    const escrow = await Escrow.create({
      session_id: sessionId,
      order_uid: order.order_uid,
      room_uid: order.room_uid,
      buyer_public_id: order.buyer_public_id,
      seller_public_id: order.seller_public_id,
      escrow_amount: order.final_amount,
      seller_net_amount: order.seller_net_amount,
      escrow_status: "holding"
    }, { transaction });

    order.trade_status = "escrow_active";

    await order.save({ transaction });
    await notificationService.createNotification(
      order.seller_public_id,
      "trade_approved",
      "Trade Approved",
      "The buyer approved the trade. You can now proceed with shipment.",
      "order",
      sessionId
    );

    await transaction.commit();

    return {
      success: true,
      message: "Trade approved and escrow activated",
      escrow
    };

  } catch (error) {

    await transaction.rollback();
    throw error;

  }
}



/**
 * Seller confirms shipment (physical goods)
 */




/**
 * Seller confirms digital delivery
 */
async function confirmDigitalDelivery(sessionId, sellerPublicId) {

  const order = await Order.findOne({
    where: { session_id: sessionId }
  });

  if (!order) {
    throw new Error("Order not found");
  }

  if (order.seller_public_id !== sellerPublicId) {
    throw new Error("Unauthorized seller");
  }

  order.trade_status = "delivery_in_progress";

  await order.save();

  await notificationService.createNotification(
    order.buyer_public_id,
    "digital_delivery_sent",
    "Digital Product Delivered",
    "The seller has delivered your digital product.",
    "order",
    sessionId
  );

  return {
    success: true,
    message: "Digital product sent"
  };
}



/**
 * Buyer confirms delivery
 */




/**
 * Cancel trade
 */
async function cancelTrade(sessionId, userPublicId) {

  const order = await Order.findOne({
    where: { session_id: sessionId }
  });

  if (!order) {
    throw new Error("Order not found");
  }

  if (
    order.buyer_public_id !== userPublicId &&
    order.seller_public_id !== userPublicId
  ) {
    throw new Error("Unauthorized");
  }

  order.trade_status = "cancelled";

  await order.save();

    await notificationService.createNotification(
    order.buyer_public_id,
    "trade_cancelled",
    "Trade Cancelled",
    "The trade has been cancelled.",
    "order",
    sessionId
  );

  await notificationService.createNotification(
    order.seller_public_id,
    "trade_cancelled",
    "Trade Cancelled",
    "The trade has been cancelled.",
    "order",
    sessionId
  );

  return {
    success: true,
    message: "Trade cancelled"
  };
}



/**
 * Raise dispute
 */




module.exports = {
  initiateTrade,
  approveTrade,
  confirmShipment,
  confirmDigitalDelivery,
  confirmDelivery,
  cancelTrade,
  raiseDispute
};