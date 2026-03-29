// controllers/roomcontroller.js

const RoomService = require('../services/roomservice');

class RoomController {

  // 1️⃣ CREATE ROOM
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

  // 2️⃣ GET ROOM
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

  // 3️⃣ LIST ACTIVE ROOMS
  static async listActiveRooms(req, res) {
    try {
      const { type } = req.query;

      const rooms = await RoomService.listActiveRooms(type);

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

  // 4️⃣ ACTIVATE ROOM
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

  // 5️⃣ CANCEL ROOM
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

  // 6️⃣ JOIN PRIVATE ROOM (FIXED ✅)
  static async joinPrivateRoom(req, res) {
    try {
      const { password } = req.body;

      const session = await RoomService.joinPrivateRoom(
        req.params.roomUid,
        req.user.publicId,
        password
      );

      return res.status(200).json({
        success: true,
        data: session,
      });

    } catch (err) {
      return res.status(400).json({
        success: false,
        error: err.message,
      });
    }
  }

}

module.exports = RoomController;