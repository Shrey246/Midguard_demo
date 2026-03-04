// backend/routes/auctionroute.js
const authguard = require('../vanguard/authguard');
const express = require('express');
const router = express.Router();

const authGuard = require('../vanguard/authguard');
const AuctionController = require('../controllers/auctioncontroller');

// All auction routes require authentication
router.use(authGuard);

// Seller closes auction for a room
router.post('/close/:roomUid', AuctionController.closeAuction);

// Buyer confirms winning bid
router.post('/confirm/:bidUid', AuctionController.confirmWinningBid);

// Buyer rejects / system expires bid
router.post('/reject/:bidUid', AuctionController.rejectOrExpireBid);

//buyer search for a room and buy it public room
router.post('/rooms/:roomUid/buy',authguard,AuctionController.buyNow);

// Seller releases escrow after order completion
router.post('/escrow/:sessionId/release',authguard,AuctionController.releaseEscrow);


module.exports = router;
