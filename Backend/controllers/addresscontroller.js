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
}

module.exports = AddressController;
