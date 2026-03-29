// backend/routes/escrowroute.js

const express = require("express");
const router = express.Router();

const EscrowController = require("../controllers/escrowcontroller");
const authGuard = require("../vanguard/authguard");

// 🔐 All escrow routes are protected
router.use(authGuard);

// 📦 Seller ships product
router.post("/:sessionId/ship", EscrowController.confirmShipment);

// 💻 Seller delivers digital product
router.post("/:sessionId/digital-delivery", EscrowController.confirmDigitalDelivery);

// 📦 Buyer confirms delivery (releases funds)
router.post("/:sessionId/confirm", EscrowController.confirmDelivery);

// ⚠️ Raise dispute
router.post("/:sessionId/dispute", EscrowController.raiseDispute);

// 📊 Get escrow details
router.get("/:sessionId", EscrowController.getEscrowDetails);

module.exports = router;