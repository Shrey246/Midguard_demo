// backend/routes/authRoutes.js

const express = require('express');
const router = express.Router();

const authcontroller = require('../controllers/authcontroller');
const authGuard = require('../vanguard/authguard');


/**
 * STEP 1: Register user (basic info)
 */
router.post('/register', authcontroller.register);

/**
 * LOGIN
 */
router.post('/login', authcontroller.login);

/**
 * STEP 2 / 3: Update profile progressively
 * :publicId comes from the URL
 */
router.put('/profile', authGuard, authcontroller.updateProfile);


module.exports = router;
