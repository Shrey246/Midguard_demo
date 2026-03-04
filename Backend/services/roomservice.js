// services/room.service.js
const { Room } = require('../models');
console.log('DEBUG Room =', Room);
const { ulid } = require('ulid');
const ALLOWED_ROOM_TYPES = ['auction', 'public', 'private', 'digital'];
const { Session, SessionParticipant, sequelize } = require('../models');



  class RoomService {
    // 1️⃣ Create room (DRAFT)
  static async createRoom(data, sellerPublicId) {
    const roomType = data.room_type || 'auction';

     if (!ALLOWED_ROOM_TYPES.includes(roomType)) {
     throw new Error('INVALID_ROOM_TYPE');
     }

    
    const room = await Room.create({
      room_uid: ulid(),
      seller_public_id: sellerPublicId,

      product_name: data.product_name,
      description: data.description,
      base_price: data.base_price,

      used_duration: data.used_duration,
      warranty_remaining: data.warranty_remaining,

      original_box_available: data.original_box_available,
      invoice_available: data.invoice_available,
      room_type: roomType,
      listing_status: 'draft',
    });

    return room;
  }

  // 2️⃣ Get room by UID
  static async getRoomByUid(roomUid) {
    const room = await Room.findOne({ where: { room_uid: roomUid } });
    if (!room) throw new Error('ROOM_NOT_FOUND');
    return room;
  }

  // 3️⃣ List active rooms (public)
  static async listActiveRooms() {
    return Room.findAll({
      where: { listing_status: 'active' },
      order: [['created_at', 'DESC']],
    });
  }

  // 4️⃣ Activate room
  static async activateRoom(roomUid, sellerPublicId) {
    const room = await this.getRoomByUid(roomUid);

    if (room.seller_public_id !== sellerPublicId) {
      throw new Error('NOT_ROOM_OWNER');
    }

    if (room.listing_status !== 'draft') {
      throw new Error('INVALID_STATE_TRANSITION');
    }

    room.listing_status = 'active';
    await room.save();

    return room;
  }

  // 5️⃣ Cancel room
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

    return room;
  }

static async joinPrivateRoom(roomUid, buyerPublicId) {
  return sequelize.transaction(async (t) => {

    // 1️⃣ Find room
    const room = await Room.findOne({
      where: { room_uid: roomUid },
      transaction: t,
      lock: t.LOCK.UPDATE
    });

    if (!room) {
      throw new Error('ROOM_NOT_FOUND');
    }

    if (room.room_type !== 'private') {
      throw new Error('NOT_PRIVATE_ROOM');
    }

    if (room.listing_status !== 'active') {
      throw new Error('ROOM_NOT_ACTIVE');
    }

    if (room.seller_public_id === buyerPublicId) {
      throw new Error('SELLER_CANNOT_JOIN_AS_BUYER');
    }

    // 2️⃣ Check existing session
    const existingSession = await Session.findOne({
      where: { room_uid: roomUid },
      transaction: t
    });

    if (existingSession) {
      return existingSession;
    }

    // 3️⃣ Create session
    const sessionId = ulid();

    const session = await Session.create(
      {
        session_uid: sessionId,
        room_uid: roomUid,
        session_type: 'private_room',
        created_by: room.seller_public_id
      },
      { transaction: t }
    );

    // 4️⃣ Add seller participant
    await SessionParticipant.create(
      {
        session_uid: sessionId,
        user_public_id: room.seller_public_id,
        role: 'seller'
      },
      { transaction: t }
    );

    // 5️⃣ Add buyer participant
    await SessionParticipant.create(
      {
        session_uid: sessionId,
        user_public_id: buyerPublicId,
        role: 'buyer'
      },
      { transaction: t }
    );

    return session;
  });
}


}

module.exports = RoomService;
