const AddressService = require('../services/addressservice');

class AddressController {
  static async add(req, res) {
    try {
      const userPublicId = req.user.publicId;
      const address = await AddressService.addAddress(userPublicId, req.body);
      return res.json({ success: true, address });
    } catch (err) {
      return res.status(400).json({ success: false, error: err.message });
    }
  }

  static async snapshot(req, res) {
    try {
      const buyerPublicId = req.user.publicId;
      const { order_uid, address_uid } = req.body;

      const snapshot = await AddressService.snapshotOrderAddress(
        order_uid,
        buyerPublicId,
        address_uid
      );

      return res.json({ success: true, snapshot });
    } catch (err) {
      return res.status(400).json({ success: false, error: err.message });
    }
  }

  static async getAll(req, res) {
  try {
    const userPublicId = req.user.publicId;

    const addresses = await require('../models').UserAddress.findAll({
      where: { user_public_id: userPublicId },
      order: [['created_at', 'DESC']]
    });

    return res.json({ success: true, addresses });
  } catch (err) {
    return res.status(400).json({ success: false, error: err.message });
  }
}

static async delete(req, res) {
  try {
    const userPublicId = req.user.publicId;
    const { address_uid } = req.params;

    await require('../models').UserAddress.destroy({
      where: {
        address_uid,
        user_public_id: userPublicId
      }
    });

    return res.json({ success: true });
  } catch (err) {
    return res.status(400).json({ success: false, error: err.message });
  }
}

static async setDefault(req, res) {
  try {
    const userPublicId = req.user.publicId;
    const { address_uid } = req.body;

    const { UserAddress } = require('../models');

    await UserAddress.update(
      { is_default: false },
      { where: { user_public_id: userPublicId } }
    );

    await UserAddress.update(
      { is_default: true },
      { where: { address_uid, user_public_id: userPublicId } }
    );

    return res.json({ success: true });
  } catch (err) {
    return res.status(400).json({ success: false, error: err.message });
  }
}
}

module.exports = AddressController;
