// backend/routes/order.routes.js

const express = require('express');
const router = express.Router();
const OrderController = require('../controllers/ordercontroller');
const vanguard = require('../vanguard/authguard');

// 🔐 Protected routes

router.post(
  '/auction',
  vanguard,
  OrderController.createFromWinningBid
);

router.post(
  '/buy',
  vanguard,
  OrderController.createFromBuyNow
);

router.post('/rooms/:roomUid/buy', vanguard, OrderController.createOrder);

module.exports = router;