const addressController = require('../controllers/AddressController');
const express = require('express');
const router = express.Router();

router.post('/addresses', addressController.createAddress);
router.get('/addresses/:id/:user_id', addressController.getUserAddressById);
router.delete('/addresses/:id', addressController.deleteAddress);
router.put('/addresses/:id', addressController.updateAddress);

module.exports = router;