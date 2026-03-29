const express = require('express');
const router = express.Router();

const RoomController = require('../controllers/roomcontroller');
const authguard = require('../vanguard/authguard');
const AuctionController = require('../controllers/auctioncontroller');


// ================= PUBLIC ROUTE =================

// List all active rooms (filtered by type)
router.get('/', RoomController.listActiveRooms);


// ================= PROTECTED ROUTES =================

// Everything below requires login
router.use(authguard);

// Get room details (PROTECTED now)
router.get('/:roomUid', RoomController.getRoom);

// Create room
router.post('/', RoomController.createRoom);

// Activate room
router.post('/:roomUid/activate', RoomController.activateRoom);

// Cancel room
router.post('/:roomUid/cancel', RoomController.cancelRoom);

// Join private room
router.post('/:roomUid/join', RoomController.joinPrivateRoom);

// Buy Now
router.post('/:roomUid/buy', AuctionController.buyNow);

module.exports = router;