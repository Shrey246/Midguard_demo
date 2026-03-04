// backend/routes/walletroute.js
const express = require('express');
const router = express.Router();

const WalletController = require('../controllers/walletcontroller');
const authGuard = require('../vanguard/authguard');

// protect all wallet routes
router.use(authGuard);

// get wallet balance
router.get('/', WalletController.getWallet);

// mock top-up (DEV ONLY)
router.post('/topup', WalletController.topUp);

module.exports = router;
