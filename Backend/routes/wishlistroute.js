// routes/wishlistRoutes.js

const express = require("express");
const router = express.Router();

const wishlistController = require("../controllers/wishlistcontroller");
const vanguard = require("../vanguard/authguard"); // 🔒 auth middleware

// 🔒 all routes protected
router.use(vanguard);

// ✅ toggle (recommended primary)
router.post("/toggle/:roomUid", wishlistController.toggle);

// optional explicit APIs
router.post("/add/:roomUid", wishlistController.add);
router.delete("/remove/:roomUid", wishlistController.remove);

// fetch all
router.get("/", wishlistController.getWishlist);

// check single
router.get("/check/:roomUid", wishlistController.isWishlisted);

module.exports = router;