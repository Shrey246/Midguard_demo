const express = require("express");
const router = express.Router();
const authGuard = require("../vanguard/authguard");

const { Room, User, Escrow } = require("../models");

router.get("/stats", authGuard, async (req, res) => {
  try {
    const [
      activeRooms,
      totalUsers,
      successfulEscrows,
    ] = await Promise.all([

      // ✅ Active Rooms
      Room.count({
        where: { listing_status: "active" }
      }),

      // ✅ Total Users
      User.count(),

      // ✅ Successful Escrows (REAL SUCCESS STATE)
      Escrow.count({
        where: { escrow_status: "released" }
      }),

    ]);

    res.json({
      success: true,
      data: {
        rooms: activeRooms,
        users: totalUsers,

        // Same metric (your system design)
        transactions: successfulEscrows,
        escrow: successfulEscrows,
      },
    });

  } catch (err) {
    console.error("Dashboard Stats Error:", err);
    res.status(500).json({ success: false });
  }
});

module.exports = router;