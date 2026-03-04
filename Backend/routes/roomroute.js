// routes/roomroute.js
const express = require('express');
const router = express.Router();

const RoomController = require('../controllers/roomcontroller');
const authguard = require('../vanguard/authguard');

// All room routes are protected
router.use(authguard);

// Create room (draft)
router.post('/', RoomController.createRoom);

// List all active rooms (public listings)
router.get('/', RoomController.listActiveRooms);

// Get room details by room UID
router.get('/:roomUid', RoomController.getRoom);

// Activate room (seller only)
router.post('/:roomUid/activate', RoomController.activateRoom);

// Cancel room (seller only)
router.post('/:roomUid/cancel', RoomController.cancelRoom);

// Join private room (buyer only)
router.post('/:roomUid/join',authguard,RoomController.joinPrivateRoom);


module.exports = router;
