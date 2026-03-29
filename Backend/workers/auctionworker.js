const { Room, Op } = require('../models');
const AuctionService = require('../services/auctionservice');

function startAuctionWorker() {
  console.log("🚀 Auction Worker Started");

  setInterval(async () => {
    const now = new Date();

    try {
      const rooms = await Room.findAll({
        where: {
          listing_status: 'active',
          end_time: {
            [Op.lte]: now
          }
        }
      });

      if (!rooms.length) return;

      console.log(`⏳ Closing ${rooms.length} expired rooms`);

      await Promise.all(
        rooms.map(async (room) => {
          try {
            // 🔒 SAFE GUARD (DOUBLE CHECK)
            if (room.listing_status !== 'active') return;

            await AuctionService.closeAuction(room.room_uid);

            console.log("✅ Closed:", room.room_uid);

          } catch (err) {
            // ⚠️ Ignore expected errors (important)
            if (err.message === 'ROOM_NOT_ACTIVE') return;
            if (err.message === 'NO_BIDS_AVAILABLE') return;

            console.error("❌ Close failed:", room.room_uid, err.message);
          }
        })
      );

    } catch (err) {
      console.error("❌ Worker error:", err.message);
    }

  }, 10000); // every 10 sec
}

module.exports = startAuctionWorker;