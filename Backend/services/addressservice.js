const { UserAddress, OrderAddress } = require('../models');
const { ulid } = require('ulid');

class AddressService {
  static async addAddress(userPublicId, payload) {
    if (payload.is_default) {
      await UserAddress.update(
        { is_default: false },
        { where: { user_public_id: userPublicId } }
      );
    }

    return UserAddress.create({
      address_uid: ulid(),
      user_public_id: userPublicId,
      ...payload,
    });
  }

  static async snapshotOrderAddress(orderUid, buyerPublicId, addressUid, transaction) {
  const address = await UserAddress.findOne({
    where: {
      address_uid: addressUid,
      user_public_id: buyerPublicId,
    },
    transaction
  });

  if (!address) throw new Error('ADDRESS_NOT_FOUND');

  return OrderAddress.create({
    order_uid: orderUid,
    buyer_public_id: buyerPublicId,

    full_name: address.full_name,
    phone_number: address.phone_number,

    address_line1: address.address_line1,
    address_line2: address.address_line2,

    city: address.city,
    state: address.state,
    postal_code: address.postal_code,
    country: address.country

  }, { transaction });
}
}

module.exports = AddressService;
