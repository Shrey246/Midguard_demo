// controllers/wishlistController.js

const wishlistService = require("../services/wishlistservice");

exports.add = async (req, res) => {
  try {
    const userId = req.user.publicId;
    const { roomUid } = req.params;

    const result = await wishlistService.addToWishlist(userId, roomUid);

    res.json({
      success: true,
      added: true,
      alreadyExisted: !result.created,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const userId = req.user.publicId;
    const { roomUid } = req.params;

    const result = await wishlistService.removeFromWishlist(userId, roomUid);

    res.json({
      success: true,
      removed: result.removed,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.toggle = async (req, res) => {
  try {
    const userId = req.user.publicId;
    const { roomUid } = req.params;

    const result = await wishlistService.toggleWishlist(userId, roomUid);

    res.json({
      success: true,
      added: result.added,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.getWishlist = async (req, res) => {
  try {
    const userId = req.user.publicId;

    const wishlist = await wishlistService.getWishlist(userId);

    // 🔥 ADAPTER LAYER (clean output)
    const formatted = wishlist.map((item) => ({
      room_uid: item.room_uid,
      product_name: item.Room.product_name,
      base_price: item.Room.base_price,
      listing_status: item.Room.listing_status,
      room_type: item.Room.room_type,
      added_at: item.created_at,
    }));

    res.json({
      success: true,
      data: formatted,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.isWishlisted = async (req, res) => {
  try {
    const userId = req.user.publicId;
    const { roomUid } = req.params;

    const isWishlisted = await wishlistService.isWishlisted(userId, roomUid);

    res.json({
      success: true,
      isWishlisted,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};