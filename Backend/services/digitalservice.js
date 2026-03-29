const { Order, Asset, Escrow, Wallet, WalletTransaction } = require("../models");
const escrowService = require("./escrowservice");
const notificationService = require("./notificationservice");



/**
 * Seller uploads digital product
 */
async function uploadDigitalProduct({ sessionId, sellerPublicId, assetUid }) {

    const order = await Order.findOne({
        where: { session_id: sessionId }
    });

    if (!order) {
        throw new Error("Order not found");
    }

    if (order.seller_public_id !== sellerPublicId) {
        throw new Error("Unauthorized seller");
    }

    const asset = await Asset.findOne({
        where: { asset_uid: assetUid }
    });

    if (!asset) {
        throw new Error("Asset not found");
    }

    if (asset.uploader_public_id !== sellerPublicId) {
        throw new Error("Seller did not upload this asset");
    }

    // Mark escrow as delivered
    const escrow = await Escrow.findOne({
        where: { session_id: sessionId }
    });

    if (!escrow) {
        throw new Error("Escrow not found");
    }

    escrow.escrow_status = "delivered";

    await escrow.save();

    order.order_status = "in_progress";

    await order.save();

    await notificationService.createNotification(
        order.buyer_public_id,
        "digital_product_ready",
        "Your Product Is Ready",
        "The seller has uploaded your digital product. You can now download it.",
        "order",
        sessionId
        );

    return {
        success: true,
        message: "Digital product uploaded"
    };

}



/**
 * Buyer downloads digital product
 */
async function downloadDigitalProduct({ sessionId, buyerPublicId }) {

    const order = await Order.findOne({
        where: { session_id: sessionId }
    });

    if (!order) {
        throw new Error("Order not found");
    }

    if (order.buyer_public_id !== buyerPublicId) {
        throw new Error("Unauthorized buyer");
    }

    const asset = await Asset.findOne({
        where: {
            context_type: "chat",
            context_id: sessionId
        }
    });

    if (!asset) {
        throw new Error("Digital asset not found");
    }

    return {
        file_url: asset.file_url,
        file_type: asset.file_type
    
    };
}



/**
 * Buyer confirms delivery
 * Releases escrow
 */
async function confirmDelivery({ sessionId, buyerPublicId }) {

    const order = await Order.findOne({
        where: { session_id: sessionId }
    });
    

    if (escrow.escrow_status !== "delivered") {
   throw new Error("Escrow not ready for release");
    } 

    if (!order) {
        throw new Error("Order not found");
    }

    if (order.buyer_public_id !== buyerPublicId) {
        throw new Error("Unauthorized buyer");
    }

    const escrow = await Escrow.findOne({
        where: { session_id: sessionId }
    });

    if (!escrow) {
        throw new Error("Escrow not found");
    }

    if (escrow.escrow_status !== "delivered") {
        throw new Error("Product not delivered yet");
    }

    await escrowService.releaseEscrow(sessionId);

    const sellerWallet = await Wallet.findOne({
        where: { user_public_id: order.seller_public_id }
    });

    if (!sellerWallet) {
        throw new Error("Seller wallet not found");
    }

    const amount = parseFloat(escrow.seller_net_amount);

    sellerWallet.available_balance =
        parseFloat(sellerWallet.available_balance) + amount;

    await sellerWallet.save();

    await WalletTransaction.create({
        transaction_uid: `txn_${Date.now()}`,
        user_public_id: order.seller_public_id,
        amount: amount,
        transaction_type: "credit"
    });

    escrow.escrow_status = "completed";

    await escrow.save();

    order.payment_status = "released";
    order.order_status = "completed";
    order.buyer_confirmation_status = "confirmed";

    await order.save();

    await notificationService.createNotification(
        order.seller_public_id,
        "payment_released",
        "Payment Released",
        "The buyer confirmed delivery. Payment has been released to your wallet.",
        "order",
        sessionId
        );

    return {
        success: true,
        message: "Delivery confirmed and escrow released"
    };
}



module.exports = {
    uploadDigitalProduct,
    downloadDigitalProduct,
    confirmDelivery
};