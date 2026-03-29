const express = require('express');
const router = express.Router();
const AssetController = require('../controllers/assetcontroller');
const authguard = require('../vanguard/authguard');
const upload = require('../utils/uploads');

router.post('/upload',authguard,upload.single("file"),AssetController.upload);
router.patch('/:assetUid/deactivate', authguard, AssetController.deactivate);
router.get('/', authguard, AssetController.getByContext);

module.exports = router;
