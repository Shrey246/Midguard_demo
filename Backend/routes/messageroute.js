const express = require("express");
const router = express.Router();
const MessageController = require("../controllers/messagecontroller");
const authguard = require("../vanguard/authguard");

router.get(
  "/:session_id/messages",
  authguard,
  MessageController.getMessages
);

router.post(
  "/:session_id/messages/text",
  authguard,
  MessageController.sendText
);

module.exports = router;