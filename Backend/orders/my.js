const express = require("express");
const router = express.Router();

const { Order, Room } = require("../models");
const authguard = require("../vanguard/authguard");
const { Op } = require("sequelize");

// =======================
// MY ORDERS
// =======================
router.get("/my", authguard, async (req, res) => {
  try {
    const userId = req.user.publicId;

    const orders = await Order.findAll({
      where: {
        [Op.or]: [
          { buyer_public_id: userId },
          { seller_public_id: userId },
        ],
      },
      include: [
        {
          model: Room,
          attributes: ["room_uid", "product_name", "room_type"],
        },
      ],
      order: [["created_at", "DESC"]],
    });

    const formatted = orders.map((order) => {
      const data = order.toJSON();

      return {
        ...data,
        role:
          data.buyer_public_id === userId ? "buyer" : "seller",
      };
    });

    res.status(200).json({
      success: true,
      orders: formatted,
    });

  } catch (error) {
    console.error("❌ MY ORDERS ERROR:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// =======================
// SELLER ORDERS
// =======================
router.get("/seller", authguard, async (req, res) => {
  try {
    const userId = req.user.publicId;

    const orders = await Order.findAll({
      where: {
        seller_public_id: userId,
      },
      include: [
        {
          model: Room,
          attributes: ["room_uid", "product_name", "room_type"],
        },
      ],
      order: [["created_at", "DESC"]],
    });

    res.status(200).json({
      success: true,
      orders,
    });

  } catch (error) {
    console.error("❌ SELLER ORDERS ERROR:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;