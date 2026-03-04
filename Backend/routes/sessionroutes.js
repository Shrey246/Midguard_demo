const express = require("express");
const router = express.Router();
const SessionController = require("../controllers/sessioncontroller");
const authguard = require("../vanguard/authguard");

router.post("/", authguard, SessionController.createSession);
router.get("/me", authguard, SessionController.getMySessions);
router.get("/:sessionUid", authguard, SessionController.getSession);
router.patch("/:sessionUid/close", authguard, SessionController.closeSession);

module.exports = router;
