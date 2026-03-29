// backend/controllers/escrowcontroller.js

const EscrowService = require("../services/escrowservice");

class EscrowController {

  // 📦 Seller confirms shipment
  static async confirmShipment(req, res) {
    try {
      const sellerPublicId = req.user.publicId;
      const { sessionId } = req.params;
      const { courierName, trackingLink } = req.body;

      const result = await EscrowService.confirmShipment(
        sessionId,
        sellerPublicId,
        courierName,
        trackingLink
      );

      return res.status(200).json({ success: true, data: result });

    } catch (err) {
      return res.status(400).json({ success: false, error: err.message });
    }
  }

  // 💻 Seller delivers digital product
  static async confirmDigitalDelivery(req, res) {
    try {
      const sellerPublicId = req.user.publicId;
      const { sessionId } = req.params;

      const result = await EscrowService.confirmDigitalDelivery(
        sessionId,
        sellerPublicId
      );

      return res.status(200).json({ success: true, data: result });

    } catch (err) {
      return res.status(400).json({ success: false, error: err.message });
    }
  }

  // 📦 Buyer confirms delivery
  static async confirmDelivery(req, res) {
    try {
      const buyerPublicId = req.user.publicId;
      const { sessionId } = req.params;

      const result = await EscrowService.confirmDelivery(
        sessionId,
        buyerPublicId
      );

      return res.status(200).json({ success: true, data: result });

    } catch (err) {
      return res.status(400).json({ success: false, error: err.message });
    }
  }

  // ⚠️ Raise dispute
  static async raiseDispute(req, res) {
    try {
      const userPublicId = req.user.publicId;
      const { sessionId } = req.params;
      const { reason } = req.body;

      const result = await EscrowService.raiseDispute(
        sessionId,
        userPublicId,
        reason
      );

      return res.status(200).json({ success: true, data: result });

    } catch (err) {
      return res.status(400).json({ success: false, error: err.message });
    }
  }

  // 📊 Get escrow details
static async getEscrowDetails(req, res) {
  try {
    const { sessionId } = req.params;

    const { escrow, order } = await EscrowService.getEscrowDetails(sessionId);

    return res.status(200).json({
      success: true,
      escrow,
      order
    });

  } catch (err) {
    return res.status(400).json({
      success: false,
      error: err.message
    });
  }
}

}

module.exports = EscrowController;