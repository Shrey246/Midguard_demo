// controllers/roomcontroller.js
const RoomService = require('../services/roomservice');

class RoomController {
  // POST /rooms
  static async createRoom(req, res) {
    try {
      const room = await RoomService.createRoom(
        req.body,
        req.user.publicId
      );

      return res.status(201).json({
        success: true,
        data: room,
      });
    } catch (err) {
      return res.status(400).json({
        success: false,
        error: err.message,
      });
    }
  }

  // GET /rooms/:roomUid
  static async getRoom(req, res) {
    try {
      const room = await RoomService.getRoomByUid(req.params.roomUid);

      return res.status(200).json({
        success: true,
        data: room,
      });
    } catch (err) {
      return res.status(404).json({
        success: false,
        error: err.message,
      });
    }
  }

  // GET /rooms
  static async listActiveRooms(req, res) {
    try {
      const rooms = await RoomService.listActiveRooms();

      return res.status(200).json({
        success: true,
        data: rooms,
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        error: 'FAILED_TO_FETCH_ROOMS',
      });
    }
  }

  // POST /rooms/:roomUid/activate
  static async activateRoom(req, res) {
    try {
      const room = await RoomService.activateRoom(
        req.params.roomUid,
        req.user.publicId
      );

      return res.status(200).json({
        success: true,
        data: room,
      });
    } catch (err) {
      return res.status(400).json({
        success: false,
        error: err.message,
      });
    }
  }

  // POST /rooms/:roomUid/cancel
  static async cancelRoom(req, res) {
    try {
      const room = await RoomService.cancelRoom(
        req.params.roomUid,
        req.user.publicId
      );

      return res.status(200).json({
        success: true,
        data: room,
      });
    } catch (err) {
      return res.status(400).json({
        success: false,
        error: err.message,
      });
    }
  }

// POST /rooms/:roomUid/join
static async joinPrivateRoom(req, res) {
  try {
    const session = await RoomService.joinPrivateRoom(
      req.params.roomUid,
      req.user.publicId
    );

    return res.status(200).json({
      success: true,
      data: session
    });

  } catch (err) {
    return res.status(400).json({
      success: false,
      error: err.message
    });
  }
}


}

module.exports = RoomController;
