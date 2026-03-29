// backend/controllers/auctioncontroller.js

const AuctionService = require('../services/auctionservice');
const OrderService = require('../services/orderservice'); // 🔥 NEW
const { Room } = require('../models');
class AuctionController {

  // Seller closes auction
  static async closeAuction(req, res) {
    try {
      const { roomUid } = req.params;

      const room = await Room.findOne({
          where: { room_uid: roomUid }
        });

        if (!room) {
          return res.status(404).json({ error: "ROOM_NOT_FOUND" });
        }

        // 🔒 Only seller can close
        if (room.seller_public_id !== req.user.publicId) {
          return res.status(403).json({ error: "NOT_AUTHORIZED" });
        }

        const result = await AuctionService.closeAuction(roomUid);

      return res.status(200).json({
        success: true,
        data: result
      });
    } catch (err) {
      return res.status(400).json({
        success: false,
        error: err.message
      });
    }
  }

  // Buyer confirms winning bid
  static async confirmWinningBid(req, res) {
    try {
      const { bidUid } = req.params;
      const buyerPublicId = req.user.publicId;

      // 1️⃣ Validate via AuctionService
      const data = await AuctionService.confirmWinningBid(
        bidUid,
        buyerPublicId
      );

      // 2️⃣ Create order via OrderService
      const result = await OrderService.createFromWinningBid({
        ...data,
        buyer_public_id: buyerPublicId,
        address_uid: req.body.address_uid
      });

      return res.status(200).json({
        success: true,
        data: result
      });

    } catch (err) {
      return res.status(400).json({
        success: false,
        error: err.message
      });
    }
  }

  // Buyer rejects or bid expires
  static async rejectOrExpireBid(req, res) {
    try {
      const { bidUid } = req.params;

      const result = await AuctionService.rejectOrExpireBid(bidUid);

      return res.status(200).json({
        success: true,
        data: result
      });
    } catch (err) {
      return res.status(400).json({
        success: false,
        error: err.message
      });
    }
  }

  // Buy Now (fixed price)
  static async buyNow(req, res) {
    try {
      const { roomUid } = req.params;
      const buyerPublicId = req.user.publicId;

      if (!req.body.address_uid) {
        return res.status(400).json({
          success: false,
          error: 'ADDRESS_REQUIRED'
        });
      }

      // 1️⃣ Validate via AuctionService
      const data = await AuctionService.buyNow(
        roomUid,
        buyerPublicId
      );

      // 2️⃣ Create order via OrderService
      const result = await OrderService.createFromBuyNow({
        ...data,
        buyer_public_id: buyerPublicId,
        address_uid: req.body.address_uid
      });

      return res.status(201).json({
        success: true,
        data: result
      });

    } catch (err) {
      return res.status(400).json({
        success: false,
        error: err.message
      });
    }
  }

}

module.exports = AuctionController;