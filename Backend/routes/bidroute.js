// backend/routes/bidroute.js

const express = require('express');
const router = express.Router();

const BidController = require('../controllers/bidcontroller');
const authGuard = require('../vanguard/authguard');

// all bid routes require auth
router.use(authGuard);

// place a bid
router.post('/', BidController.placeBid);

// list bids for a room
router.get('/room/:roomUid', BidController.getRoomBids);

module.exports = router;
