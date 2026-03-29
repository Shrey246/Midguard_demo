const { Room } = require('../models');
const { ulid } = require('ulid');
const bcrypt = require("bcrypt");
const notificationService = require("./notificationservice");

const ALLOWED_ROOM_TYPES = ['auction', 'public', 'private', 'digital'];

class RoomService {

  // =========================
  // 1️⃣ CREATE ROOM (DRAFT)
  // =========================
  static async createRoom(data, sellerPublicId) {

    const roomType = data.room_type || 'public';

    if (!ALLOWED_ROOM_TYPES.includes(roomType)) {
      throw new Error('INVALID_ROOM_TYPE');
    }

    // 🔒 BASIC VALIDATIONS
    if (!data.product_name || data.product_name.trim().length === 0) {
      throw new Error("PRODUCT_NAME_REQUIRED");
    }

    if (!data.base_price || Number(data.base_price) <= 0) {
      throw new Error("INVALID_BASE_PRICE");
    }

    let passwordHash = null;
    let duration = null;

    // 🔒 PRIVATE ROOM
    if (roomType === "private") {
      if (!data.room_password || data.room_password.trim().length === 0) {
        throw new Error("PASSWORD_REQUIRED");
      }

      passwordHash = await bcrypt.hash(data.room_password, 10);
    }

    // ⏱ AUCTION ROOM
    if (roomType === "auction") {
      if (!data.auction_duration) {
        throw new Error("AUCTION_DURATION_REQUIRED");
      }

      const parsed = parseInt(data.auction_duration);

      if (![1, 2, 3].includes(parsed)) {
        throw new Error("INVALID_AUCTION_DURATION");
      }

      duration = parsed;
    }

    const room = await Room.create({
      room_uid: ulid(),
      seller_public_id: sellerPublicId,

      product_name: data.product_name,
      description: data.description,
      base_price: Number(data.base_price),

      used_duration: data.used_duration,
      warranty_remaining: data.warranty_remaining,

      original_box_available: data.original_box_available,
      invoice_available: data.invoice_available,

      room_type: roomType,
      listing_status: 'draft',

      auction_duration_hours: duration,
      room_password_hash: passwordHash,
    });

    return room;
  }

  // =========================
  // 2️⃣ GET ROOM
  // =========================
  static async getRoomByUid(roomUid) {
    const room = await Room.findOne({ where: { room_uid: roomUid } });

    if (!room) throw new Error('ROOM_NOT_FOUND');

    return room;
  }

  // =========================
  // 3️⃣ LIST ACTIVE ROOMS
  // =========================
  static async listActiveRooms(type) {

    const where = { listing_status: 'active' };

    if (type) {
      if (!ALLOWED_ROOM_TYPES.includes(type)) {
        throw new Error("INVALID_ROOM_TYPE_FILTER");
      }
      where.room_type = type;
    }

    return Room.findAll({
      where,
      order: [['created_at', 'DESC']],
    });
  }

  // =========================
  // 4️⃣ ACTIVATE ROOM
  // =========================
  static async activateRoom(roomUid, sellerPublicId) {

    const room = await this.getRoomByUid(roomUid);

    if (room.seller_public_id !== sellerPublicId) {
      throw new Error('NOT_ROOM_OWNER');
    }

    if (room.listing_status !== 'draft') {
      throw new Error('INVALID_STATE_TRANSITION');
    }

    let durationMs;

    // ⏱ AUCTION ROOM
    if (room.room_type === "auction") {
      if (!room.auction_duration_hours) {
        throw new Error("MISSING_AUCTION_DURATION");
      }

      durationMs = room.auction_duration_hours * 60 * 60 * 1000;
    } else {
      durationMs = 24 * 60 * 60 * 1000;
    }

    room.listing_status = 'active';
    room.end_time = new Date(Date.now() + durationMs);

    await room.save();

    await notificationService.createNotification(
      sellerPublicId,
      "room_activated",
      "Room Activated",
      "Your listing is now live and visible to buyers.",
      "room",
      roomUid
    );

    return room;
  }

  // =========================
  // 5️⃣ CANCEL ROOM
  // =========================
  static async cancelRoom(roomUid, sellerPublicId) {

    const room = await this.getRoomByUid(roomUid);

    if (room.seller_public_id !== sellerPublicId) {
      throw new Error('NOT_ROOM_OWNER');
    }

    if (!['draft', 'active'].includes(room.listing_status)) {
      throw new Error('INVALID_STATE_TRANSITION');
    }

    room.listing_status = 'cancelled';
    await room.save();

    await notificationService.createNotification(
      sellerPublicId,
      "room_cancelled",
      "Room Cancelled",
      "Your listing has been cancelled.",
      "room",
      roomUid
    );

    return room;
  }

  // =========================
  // 6️⃣ JOIN PRIVATE ROOM
  // =========================
  static async joinPrivateRoom(roomUid, userPublicId, password) {

    const room = await this.getRoomByUid(roomUid);

    if (room.room_type !== "private") {
      throw new Error("NOT_PRIVATE_ROOM");
    }

    if (!password || password.trim().length === 0) {
      throw new Error("PASSWORD_REQUIRED");
    }

    const isValid = await bcrypt.compare(password, room.room_password_hash);

    if (!isValid) {
      throw new Error("INVALID_PASSWORD");
    }

    return { message: "ACCESS_GRANTED" };
  }
}

module.exports = RoomService;