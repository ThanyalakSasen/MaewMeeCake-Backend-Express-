const addressController = require('../controllers/AddressController');
const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');

// Protected routes - ต้อง login ก่อน
router.post('/createAddress', protect, addressController.createAddress);
router.get('/AllAddressesByUserId', protect, addressController.getAllAddressesByUserId);
router.get('/AllAddressesBy/:id', protect, addressController.getAddressById);
router.put('/updateAddress/:id', protect, addressController.updateAddress);
router.delete('/deleteAddress/:id', protect, addressController.deleteAddress);

module.exports = router;