const express = require('express');
const router = express.Router();
const AddressController = require('../controllers/addresscontroller');
const authguard = require('../vanguard/authguard');

router.post('/', authguard, AddressController.add);
router.post('/snapshot', authguard, AddressController.snapshot);

module.exports = router;
