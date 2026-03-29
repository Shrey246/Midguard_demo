// services/wishlistService.js

const { Wishlist, Room } = require("../models");

class WishlistService {
  // ✅ Add (idempotent)
  async addToWishlist(userPublicId, roomUid) {
    const [entry, created] = await Wishlist.findOrCreate({
      where: {
        user_public_id: userPublicId,
        room_uid: roomUid,
      },
    });

    return { entry, created };
  }

  // ✅ Remove
  async removeFromWishlist(userPublicId, roomUid) {
    const deleted = await Wishlist.destroy({
      where: {
        user_public_id: userPublicId,
        room_uid: roomUid,
      },
    });

    return { removed: !!deleted };
  }

  // ✅ Toggle (BEST UX)
  async toggleWishlist(userPublicId, roomUid) {
    const existing = await Wishlist.findOne({
      where: {
        user_public_id: userPublicId,
        room_uid: roomUid,
      },
    });

    if (existing) {
      await existing.destroy();
      return { added: false };
    }

    await Wishlist.create({
      user_public_id: userPublicId,
      room_uid: roomUid,
    });

    return { added: true };
  }

  // ✅ Get full wishlist
  async getWishlist(userPublicId) {
    return await Wishlist.findAll({
      where: { user_public_id: userPublicId },
      include: [
        {
          model: Room,
          required: true, // removes broken/deleted rooms
        },
      ],
      order: [["created_at", "DESC"]],
    });
  }

  // ✅ Check single
  async isWishlisted(userPublicId, roomUid) {
    const exists = await Wishlist.findOne({
      where: {
        user_public_id: userPublicId,
        room_uid: roomUid,
      },
    });

    return !!exists;
  }
}

module.exports = new WishlistService();