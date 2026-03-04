// backend/controllers/bidcontroller.js

const BidService = require('../services/bidservice');
const { Bid } = require('../models');

class BidController {

  // POST /bids
  static async placeBid(req, res) {
    try {
      const { room_uid, bid_amount } = req.body;

      if (!room_uid || !bid_amount) {
        return res.status(400).json({
          success: false,
          error: 'ROOM_UID_AND_BID_AMOUNT_REQUIRED'
        });
      }

      const bid = await BidService.placeBid({
        roomUid: room_uid,
        bidderPublicId: req.user.publicId,
        bidAmount: Number(bid_amount)
      });

      return res.status(201).json({
        success: true,
        data: bid
      });

    } catch (err) {
      return res.status(400).json({
        success: false,
        error: err.message
      });
    }
  }

  // GET /rooms/:roomUid/bids
  static async getRoomBids(req, res) {
    try {
      const { roomUid } = req.params;

      const bids = await Bid.findAll({
        where: { room_uid: roomUid },
        order: [
          ['bid_amount', 'DESC'],
          ['created_at', 'ASC']
        ],
        attributes: [
          'bid_uid',
          'bid_amount',
          'bid_status',
          'bid_rank',
          'bidder_public_id',
          'created_at'
        ]
      });

      return res.status(200).json({
        success: true,
        data: bids
      });

    } catch (err) {
      return res.status(500).json({
        success: false,
        error: 'FAILED_TO_FETCH_BIDS'
      });
    }
  }

}

module.exports = BidController;
