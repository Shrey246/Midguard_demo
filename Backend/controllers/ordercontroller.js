// backend/controllers/ordercontroller.js

const OrderService = require('../services/orderservice');

class OrderController {

  /**
   * Create order from winning bid
   */
  static async createFromWinningBid(req, res) {
    try {
      const buyer_public_id = req.user.publicId;

      const {
        room_uid,
        bid_uid,
        amount,
        seller_public_id,
        address_uid
      } = req.body;

      const result = await OrderService.createFromWinningBid({
        room_uid,
        bid_uid,
        amount,
        seller_public_id,
        buyer_public_id,
        address_uid
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

  /**
   * Create order from buy now
   */
  static async createFromBuyNow(req, res) {
    try {
      const buyer_public_id = req.user.publicId;

      const {
        room_uid,
        amount,
        seller_public_id,
        address_uid
      } = req.body;

      const result = await OrderService.createFromBuyNow({
        room_uid,
        amount,
        seller_public_id,
        buyer_public_id,
        address_uid
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

  static async createOrder(req, res) {
  throw new Error("Use /auction or /buy routes");
   }

}

module.exports = OrderController;