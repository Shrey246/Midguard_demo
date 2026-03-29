const express = require('express');
const router = express.Router();

const authGuard = require('../vanguard/authguard');
const AuctionController = require('../controllers/auctioncontroller');

// Protect all routes
router.use(authGuard);

// Seller closes auction
router.post('/close/:roomUid', AuctionController.closeAuction);

// Buyer confirms winning bid
router.post('/confirm/:bidUid', AuctionController.confirmWinningBid);

// Buyer rejects or expires bid
router.post('/reject/:bidUid', AuctionController.rejectOrExpireBid);

module.exports = router;