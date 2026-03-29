const {
  Room,
  Order,
  Admin
} = require("../../models");

const RoomService = require("../../services/roomservice");
const EscrowService = require("../../services/escrowservice");
const WalletService = require("../../services/walletservice");
const DisputeService = require("../../services/disputeservice");

const { logAdminAction } = require("../utils/adminLogger");

// ================= ROLE PERMISSIONS =================
const ROLE_PERMISSIONS = {
  support: ["VIEW"],
  operations: ["VIEW", "MODERATE"],
  super: ["VIEW", "MODERATE", "FINANCIAL"]
};

const ALLOWED_CREATION = {
  superadmin: ["support", "operations", "super", "superadmin"],
  super: ["support", "operations"],
};

class AdminService {

  // ================= GUARD =================
  static async validateAdmin(adminId) {
    const admin = await Admin.findByPk(adminId);

    if (!admin) throw new Error("ADMIN_NOT_FOUND");
    if (!admin.is_active) throw new Error("ADMIN_DISABLED");

    if (admin.locked_until && new Date() < admin.locked_until) {
      throw new Error("ADMIN_ACCOUNT_LOCKED");
    }

    return admin;
  }

  static checkPermission(admin, actionType) {
    const permissions = ROLE_PERMISSIONS[admin.role] || [];

    if (!permissions.includes(actionType)) {
      throw new Error("INSUFFICIENT_PERMISSIONS");
    }
  }

  static async safeLog(payload, metadata = {}) {
    try {
      await logAdminAction({
        ...payload,
        ip_address: metadata?.ip,
        user_agent: metadata?.userAgent
      });
    } catch (err) {
      console.error("🚨 ADMIN LOG FAILURE:", err.message);
    }
  }

  // =========================
  // 🏠 ROOM
  // =========================

  static async getAllRooms(adminId, filters = {}, metadata = {}) {
    const admin = await this.validateAdmin(adminId);
    this.checkPermission(admin, "VIEW");

    const where = {};
    if (filters.status) where.listing_status = filters.status;
    if (filters.type) where.room_type = filters.type;

    const rooms = await Room.findAll({
      where,
      order: [["created_at", "DESC"]],
    });

    await this.safeLog({
      admin_id: adminId,
      action_type: "VIEW_ROOMS",
      target_type: "room",
      target_id: "bulk",
      metadata: { ...filters, ...metadata },
    }, metadata);

    return rooms;
  }

  static async forceActivateRoom(adminId, roomUid, metadata = {}) {
    const admin = await this.validateAdmin(adminId);
    this.checkPermission(admin, "MODERATE");

    if (!roomUid) throw new Error("MISSING_ROOM_UID");

    const room = await RoomService.getRoomByUid(roomUid);
    if (!room) throw new Error("ROOM_NOT_FOUND");

    const before = { ...room.get() };

    if (room.listing_status !== "draft") {
      throw new Error("ONLY_DRAFT_CAN_BE_ACTIVATED");
    }

    let durationMs =
      room.room_type === "auction"
        ? room.auction_duration_hours * 3600000
        : 24 * 3600000;

    room.listing_status = "active";
    room.end_time = new Date(Date.now() + durationMs);

    await room.save();

    const after = { ...room.get() };

    await this.safeLog({
      admin_id: adminId,
      action_type: "FORCE_ACTIVATE_ROOM",
      target_type: "room",
      target_id: roomUid,
      before_state: before,
      after_state: after,
      metadata,
    }, metadata);

    return room;
  }

  static async forceCancelRoom(adminId, roomUid, metadata = {}) {
    const admin = await this.validateAdmin(adminId);
    this.checkPermission(admin, "MODERATE");

    const room = await RoomService.getRoomByUid(roomUid);
    if (!room) throw new Error("ROOM_NOT_FOUND");

    const before = { ...room.get() };

    if (!["draft", "active"].includes(room.listing_status)) {
      throw new Error("INVALID_STATE_FOR_CANCEL");
    }

    room.listing_status = "cancelled";
    await room.save();

    const after = { ...room.get() };

    await this.safeLog({
      admin_id: adminId,
      action_type: "FORCE_CANCEL_ROOM",
      target_type: "room",
      target_id: roomUid,
      before_state: before,
      after_state: after,
      metadata,
    }, metadata);

    return { success: true };
  }

  // =========================
  // 📦 ORDER
  // =========================

  static async getAllOrders(adminId, filters = {}, metadata = {}) {
    const admin = await this.validateAdmin(adminId);
    this.checkPermission(admin, "VIEW");

    const where = {};
    if (filters.status) where.order_status = filters.status;
    if (filters.payment_status) where.payment_status = filters.payment_status;

    const orders = await Order.findAll({
      where,
      order: [["created_at", "DESC"]],
    });

    await this.safeLog({
      admin_id: adminId,
      action_type: "VIEW_ORDERS",
      target_type: "order",
      target_id: "bulk",
      metadata: { ...filters, ...metadata },
    }, metadata);

    return orders;
  }

  // =========================
  // 💰 ESCROW
  // =========================

  static async forceReleaseEscrow(adminId, sessionId, metadata = {}) {
    const admin = await this.validateAdmin(adminId);
    this.checkPermission(admin, "FINANCIAL");

    const before = await EscrowService.getEscrowDetails(sessionId);

    await EscrowService.confirmDelivery(sessionId, "ADMIN_OVERRIDE");

    const after = await EscrowService.getEscrowDetails(sessionId);

    await this.safeLog({
      admin_id: adminId,
      action_type: "FORCE_RELEASE_ESCROW",
      target_type: "escrow",
      target_id: sessionId,
      before_state: before,
      after_state: after,
      metadata,
    }, metadata);

    return { success: true };
  }

  static async adjustWallet(adminId, userPublicId, amount, type, metadata = {}) {
    const admin = await this.validateAdmin(adminId);
    this.checkPermission(admin, "FINANCIAL");

    if (!["credit", "debit"].includes(type)) {
      throw new Error("INVALID_TYPE");
    }

    const before = await WalletService.getWallet(userPublicId);

    if (type === "credit") {
      await WalletService.topUpWallet(userPublicId, amount);
    } else {
      await WalletService.adminDebitWallet(userPublicId, amount);
    }

    const after = await WalletService.getWallet(userPublicId);

    await this.safeLog({
      admin_id: adminId,
      action_type: "WALLET_ADJUSTMENT",
      target_type: "wallet",
      target_id: userPublicId,
      before_state: before,
      after_state: after,
      metadata: { amount, type, ...metadata },
    }, metadata);

    return { success: true };
  }

  // =========================
  // ⚖️ DISPUTE
  // =========================

  static async resolveDispute(adminId, disputeId, decision, metadata = {}) {
    const admin = await this.validateAdmin(adminId);
    this.checkPermission(admin, "MODERATE");

    const before = await DisputeService.getDisputeById(disputeId);

    const result = await DisputeService.resolveDispute(
      disputeId,
      decision,
      adminId
    );

    const after = await DisputeService.getDisputeById(disputeId);

    await this.safeLog({
      admin_id: adminId,
      action_type: "RESOLVE_DISPUTE",
      target_type: "dispute",
      target_id: disputeId,
      before_state: before,
      after_state: after,
      metadata: { decision, ...metadata },
    }, metadata);

    return result;
  }

  // =========================
// 👑 ADMIN MANAGEMENT
// =========================

static async createAdmin(adminId, payload, metadata = {}) {
  const admin = await this.validateAdmin(adminId);

  this.checkPermission(admin, "ADMIN_MANAGE");

  const { email, password, role } = payload;

  if (!email || !password || !role) {
    throw new Error("MISSING_FIELDS");
  }

  // 🔐 Check role hierarchy
  const allowedRoles = ALLOWED_CREATION[admin.role] || [];

  if (!allowedRoles.includes(role)) {
    throw new Error("ROLE_NOT_ALLOWED");
  }

  const existing = await Admin.findOne({ where: { email } });
  if (existing) throw new Error("ADMIN_ALREADY_EXISTS");

  const bcrypt = require("bcrypt");
  const hashed = await bcrypt.hash(password, 10);

  const newAdmin = await Admin.create({
    email,
    password_hash: hashed,
    role,
    created_by: adminId,
    is_active: true,
    failed_attempts: 0
  });

  await this.safeLog({
    admin_id: adminId,
    action_type: "CREATE_ADMIN",
    target_type: "admin",
    target_id: newAdmin.admin_id,
    metadata: { email, role, ...metadata }
  }, metadata);

  return newAdmin;
}

// =========================
// 👤 USERS
// =========================

static async getAllUsers(adminId, metadata = {}) {
  const admin = await this.validateAdmin(adminId);
  this.checkPermission(admin, "VIEW");

  const { User } = require("../../models");

  const users = await User.findAll({
    attributes: [
      "publicId",
      "email",
      "createdAt"
    ],
    order: [["createdAt", "DESC"]],
  });

  await this.safeLog({
    admin_id: adminId,
    action_type: "VIEW_USERS",
    target_type: "user",
    target_id: "bulk",
    metadata,
  }, metadata);

  return users;
}

static async getUserById(adminId, userPublicId, metadata = {}) {
  const admin = await this.validateAdmin(adminId);
  this.checkPermission(admin, "VIEW");

  const { User } = require("../../models");

  const user = await User.findOne({
    where: { publicId: userPublicId }
  });

  if (!user) throw new Error("USER_NOT_FOUND");

  await this.safeLog({
    admin_id: adminId,
    action_type: "VIEW_USER",
    target_type: "user",
    target_id: userPublicId,
    metadata,
  }, metadata);

  return user;
}

}

module.exports = AdminService;