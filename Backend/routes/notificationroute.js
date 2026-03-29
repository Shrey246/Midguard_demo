const express = require("express");
const router = express.Router();

const notificationController = require("../controllers/notificationcontroller");
const vanguard = require("../vanguard/authguard");

router.get(
  "/",
  vanguard,
  notificationController.getNotifications
);

router.post(
  "/read",
  vanguard,
  notificationController.markAsRead
);

module.exports = router;