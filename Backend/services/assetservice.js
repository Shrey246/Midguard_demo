const { Asset } = require('../models');
const { ulid } = require('ulid');

class AssetService {
  static async createAsset({
    uploaderPublicId,
    contextType,
    contextId,
    purpose,
    fileUrl,
    fileType,
    fileSize,
    isPrimary = false,
  }) {
    // 1️⃣ Determine immutability
    const immutablePurposes = ['shipment_proof', 'invoice', 'chat_attachment'];
    const immutable = immutablePurposes.includes(purpose);

    // 2️⃣ Avatar rule: only one active
    if (purpose === 'profile_avatar') {
      await Asset.update(
        { is_active: false },
        {
          where: {
            uploader_public_id: uploaderPublicId,
            purpose: 'profile_avatar',
            is_active: true,
          },
        }
      );
    }

    // 3️⃣ Create asset
    return Asset.create({
      asset_uid: ulid(),
      uploader_public_id: uploaderPublicId,
      context_type: contextType,
      context_id: contextId,
      purpose,
      file_url: fileUrl,
      file_type: fileType,
      file_size: fileSize,
      is_primary: isPrimary,
      immutable,
    });
  }

  static async deactivateAsset(assetUid) {
    const asset = await Asset.findOne({ where: { asset_uid: assetUid } });

    if (!asset) throw new Error('Asset not found');
    if (asset.immutable) throw new Error('Immutable asset cannot be modified');

    asset.is_active = false;
    await asset.save();

    return asset;
  }

  static async getAssetsForContext(userPublicId, contextType, contextId) {

  const where = {
    context_type: contextType,
    context_id: contextId,
    is_active: true
  };

  // 🔓 PUBLIC CONTEXTS
  if (contextType === 'room' || contextType === 'profile') {
    return Asset.findAll({ where });
  }

  // 🔐 CHAT CONTEXT — only participants
  if (contextType === 'chat') {
    const { SessionParticipant } = require('../models');

    const participant = await SessionParticipant.findOne({
      where: {
        session_uid: contextId,
        user_public_id: userPublicId
      }
    });

    if (!participant) {
      throw new Error('NOT_CHAT_PARTICIPANT');
    }

    return Asset.findAll({ where });
  }

  // 🔐 ESCROW CONTEXT — buyer / seller only
  if (contextType === 'escrow') {
    const { Order } = require('../models');

    const order = await Order.findOne({
      where: { session_id: contextId }
    });

    if (
      !order ||
      (order.buyer_public_id !== userPublicId &&
       order.seller_public_id !== userPublicId)
    ) {
      throw new Error('NOT_ESCROW_PARTY');
    }

    return Asset.findAll({ where });
  }

  throw new Error('INVALID_ASSET_CONTEXT');
}

}

module.exports = AssetService;
