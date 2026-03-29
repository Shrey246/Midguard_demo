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

// get wallet ledger
router.get("/ledger", WalletController.getLedger);


module.exports = router;
