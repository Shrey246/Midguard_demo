const express = require('express');
const router = express.Router();
const AddressController = require('../controllers/addresscontroller');
const authguard = require('../vanguard/authguard');

router.post('/', authguard, AddressController.add);
router.post('/snapshot', authguard, AddressController.snapshot);
router.get('/', authguard, AddressController.getAll);
router.delete('/:address_uid', authguard, AddressController.delete);
router.post('/default', authguard, AddressController.setDefault);

module.exports = router;
