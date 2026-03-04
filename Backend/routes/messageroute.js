const express = require("express");
const router = express.Router();
const MessageController = require("../controllers/messagecontroller");
const authguard = require("../vanguard/authguard");

router.post(
  "/sessions/:sessionUid/messages/text",
  authguard,
  MessageController.sendText
);

router.get(
  "/sessions/:sessionUid/messages",
  authguard,
  MessageController.getMessages
);

module.exports = router;
