const cron = require("node-cron");
const { Op } = require("sequelize");

const { Order } = require("../models");

// runs every 5 minutes
cron.schedule("*/5 * * * *", async () => {

  try {

    const now = new Date();

    // find trades waiting for buyer approval for too long
    const approvalTimeout = new Date(now.getTime() - (24 * 60 * 60 * 1000));

    const staleTrades = await Order.findAll({
      where: {
        trade_status: "awaiting_buyer_approval",
        created_at: {
          [Op.lt]: approvalTimeout
        }
      }
    });

    for (const order of staleTrades) {

      console.log(`Cancelling inactive trade ${order.order_uid}`);

    }

  } catch (error) {

    console.error("Trade timeout worker error:", error);

  }

});