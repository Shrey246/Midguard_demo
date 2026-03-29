// backend/app.js
require('dotenv').config();
try {
  require("./workers/auctionworker");
  require("./workers/timeworker");
} catch(e) {
  console.error("Worker failed", e);
}
const express = require('express');
const app = express();
const cors = require("cors");
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true
}));

// ===== Middleware =====
app.use(express.json()); // parse JSON bodies

// ===== Routes =====
const authRoutes = require('./routes/authroute');
app.use('/auth', authRoutes);
const roomRoutes = require('./routes/roomroute');
app.use('/rooms', roomRoutes);
const walletRoutes = require('./routes/walletroute');
app.use('/wallet', walletRoutes);
const bidRoutes = require('./routes/bidroute');
app.use('/bids', bidRoutes);
const auctionRoutes = require('./routes/auctionroute');
app.use('/auction', auctionRoutes);
const messageRoutes = require("./routes/messageroute");
app.use("/sessions", messageRoutes);
const assetRoutes = require('./routes/assetroute');
app.use('/assets', assetRoutes);
const addressRoutes = require('./routes/addressroute');
app.use('/address', addressRoutes);
const digitalRoutes = require("./routes/digitalroute");
app.use("/digital", digitalRoutes);
const disputeRoutes = require("./routes/disputeroute");
app.use("/dispute", disputeRoutes);
const notificationRoutes = require("./routes/notificationroute");
app.use("/notifications", notificationRoutes);
const marketplaceRoutes = require("./routes/marketplaceroute");
app.use("/marketplace", marketplaceRoutes);
const dashboardRoutes = require("./Analytics/dashboard");
app.use("/api/dashboard", dashboardRoutes);
app.use('/uploads', express.static('uploads'));
const orderroutes = require("./routes/orderroute");
app.use("/orders", orderroutes);
const escrowRoutes = require("./routes/escrowroute");
app.use("/escrow", escrowRoutes);
const myOrderRoutes = require("./orders/my");
app.use("/orders", myOrderRoutes);
const wishlistRoutes = require("./routes/wishlistroute");
app.use("/wishlist", wishlistRoutes);
const adminRoutes = require("./admin/route/adminroute");
app.use("/api/admin", adminRoutes);


// ===== Health check =====
app.get('/', (req, res) => {
  res.json({ message: 'Backend is running 🚀' });
});

const { sequelize } = require('./models');

sequelize.sync()
  .then(() => console.log('Models synced ✅'))
  .catch(err => console.error('Sync failed ❌', err));

// ===== Start server =====
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});