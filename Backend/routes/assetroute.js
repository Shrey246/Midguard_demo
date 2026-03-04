const express = require('express');
const router = express.Router();
const AssetController = require('../controllers/assetcontroller');
const authguard = require('../vanguard/authguard');

router.post('/upload', authguard, AssetController.upload);
router.patch('/:assetUid/deactivate', authguard, AssetController.deactivate);
router.get('/', authguard, AssetController.getByContext);

module.exports = router;
