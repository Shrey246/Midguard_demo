const express = require("express");
const router = express.Router();

const digitalController = require("../controllers/digitalcontroller");
const vanguard = require("../vanguard/authguard");

// seller uploads digital product
router.post(
  "/upload",
  vanguard,
  digitalController.uploadDigitalProduct
);

// buyer downloads digital product
router.get(
  "/download/:sessionId",
  vanguard,
  digitalController.downloadDigitalProduct
);

// buyer confirms delivery
router.post(
  "/confirm",
  vanguard,
  digitalController.confirmDelivery
);

module.exports = router;