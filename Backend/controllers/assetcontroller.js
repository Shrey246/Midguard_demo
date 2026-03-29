const AssetService = require('../services/assetservice');

class AssetController {
  static async upload(req, res) {
    try {
      const uploaderPublicId = req.user.publicId;

      const asset = await AssetService.createAsset({
        uploaderPublicId,
        contextType: req.body.context_type,
        contextId: req.body.context_id,
        purpose: req.body.purpose,
        fileUrl: `http://localhost:5000/uploads/${req.file.filename}`,
        fileType: req.file.mimetype,
        fileSize: req.file.size,
        isPrimary: req.body.is_primary || false,
      });

      return res.json({ success: true, asset });
    } catch (err) {
      return res.status(400).json({ success: false, error: err.message });
    }
  }

  static async deactivate(req, res) {
    try {
      const asset = await AssetService.deactivateAsset(req.params.assetUid);
      return res.json({ success: true, asset });
    } catch (err) {
      return res.status(400).json({ success: false, error: err.message });
    }
  }

  static async getByContext(req, res) {
  try {
    const userPublicId = req.user?.publicId || null;
    const { context_type, context_id } = req.query;

    const assets = await AssetService.getAssetsForContext(
      userPublicId,
      context_type,
      context_id
    );

    return res.json({ success: true, assets });
  } catch (err) {
    return res.status(403).json({
      success: false,
      error: err.message
    });
  }
}

}

module.exports = AssetController;
