// backend/app.js
require('dotenv').config();
const express = require('express');
const app = express();

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
const sessionRoutes = require("./routes/sessionroutes");
app.use("/sessions", sessionRoutes);
const messageRoutes = require("./routes/messageroute");
app.use("/", messageRoutes);
const assetRoutes = require('./routes/assetroute');
app.use('/assets', assetRoutes);
const addressRoutes = require('./routes/addressroute');
app.use('/addresses', addressRoutes);


// ===== Health check =====
app.get('/', (req, res) => {
  res.json({ message: 'Backend is running 🚀' });
});

const { sequelize } = require('./models');

sequelize.sync({ alter: true })
  .then(() => console.log('Models synced ✅'))
  .catch(err => console.error('Sync failed ❌', err));

// ===== Start server =====
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});