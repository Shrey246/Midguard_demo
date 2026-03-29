// backend/routes/authRoutes.js

const express = require('express');
const router = express.Router();

const authcontroller = require('../controllers/authcontroller');
const authguard = require('../vanguard/authguard');


/**
 * STEP 1: Register user (basic info)
 */
router.post('/register', authcontroller.register);

/**
 * LOGIN
 */
router.post('/login', authcontroller.login);

/**
 * LOGOUT
 */
router.post('/logout', authguard, authcontroller.logout);

/**
 * STEP 2 / 3: Update profile progressively
 * :publicId comes from the URL
 */
router.put('/profile', authguard, authcontroller.updateProfile);


router.get("/me", authguard, async (req, res) => {
  try {
    const { User } = require("../models");

    const user = await User.findOne({
      where: { publicId: req.user.publicId },
      attributes: { exclude: ["password_hash"] },
    });

    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    return res.json({ success: true, user });

  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

router.patch("/update", authguard, async (req, res) => {
  try {
    const { User } = require("../models");

    const user = await User.findOne({
      where: { publicId: req.user.publicId },
    });

    await user.update(req.body);

    res.json({ success: true, user });

  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

module.exports = router;
