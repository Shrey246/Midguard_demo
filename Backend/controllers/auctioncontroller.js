// backend/controllers/auctioncontroller.js

const AuctionService = require('../services/auctionservice');

class AuctionController {

  // Seller closes auction
  static async closeAuction(req, res) {
    try {
      const { roomUid } = req.params;

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

      const result = await AuctionService.confirmWinningBid(
        bidUid,
        req.user.publicId,
        req.body.address_uid
      );

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

    // POST /rooms/:roomUid/buy
  static async buyNow(req, res) {
    try {
      const { roomUid } = req.params;
      const buyerPublicId = req.user.publicId;
      const { address_uid } = req.body;

      if (!address_uid) {
        return res.status(400).json({
          success: false,
          error: 'ADDRESS_REQUIRED'
        });
      }

      const result = await AuctionService.buyNow(
        roomUid,
        buyerPublicId,
        address_uid
      );

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

    // POST /escrow/:sessionId/release
  static async releaseEscrow(req, res) {
    try {
      const { sessionId } = req.params;
      const buyerPublicId = req.user.publicId;

      const result = await AuctionService.releaseEscrow(
        sessionId,
        buyerPublicId
      );

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


}

module.exports = AuctionController;
