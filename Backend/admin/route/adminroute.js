const express = require("express");
const router = express.Router();

const adminAuth = require("../middlewere/adminAuth");
const roleGuard = require("../middlewere/roleGuard");

const AdminController = require("../controller/admincontroller");
const AdminAuthController = require("../controller/adminAuthcontroller");

// ================= AUTH =================

// 🔓 Public
router.post("/auth/login", AdminAuthController.login);
router.post("/auth/logout", adminAuth, AdminAuthController.logout);

// ================= ROOM =================

router.get(
  "/rooms",
  adminAuth,
  roleGuard("VIEW"),
  AdminController.getRooms
);

router.post(
  "/rooms/:roomUid/activate",
  adminAuth,
  roleGuard("MODERATE"),
  AdminController.activateRoom
);

router.post(
  "/rooms/:roomUid/cancel",
  adminAuth,
  roleGuard("MODERATE"),
  AdminController.cancelRoom
);

// ================= ORDER =================

router.get(
  "/orders",
  adminAuth,
  roleGuard("VIEW"),
  AdminController.getOrders
);

// ================= ESCROW =================

router.post(
  "/escrow/:sessionId/release",
  adminAuth,
  roleGuard("FINANCIAL"),
  AdminController.releaseEscrow
);

// ================= WALLET =================

router.post(
  "/wallet/adjust",
  adminAuth,
  roleGuard("FINANCIAL"),
  AdminController.adjustWallet
);

// ================= DISPUTE =================

router.get(
  "/disputes",
  adminAuth,
  roleGuard("VIEW"),
  AdminController.getDisputes // ⚠️ make sure this exists
);

router.post(
  "/disputes/resolve",
  adminAuth,
  roleGuard("MODERATE"),
  AdminController.resolveDispute
);

// ================= ADMIN MANAGEMENT =================

router.post(
  "/admins/create",
  adminAuth,
  roleGuard("ADMIN_MANAGE"),
  AdminController.createAdmin
);

// ================= USERS =================

router.get(
  "/users",
  adminAuth,
  roleGuard("VIEW"),
  AdminController.getUsers
);

router.get(
  "/users/:userId",
  adminAuth,
  roleGuard("VIEW"),
  AdminController.getUser
);

module.exports = router;