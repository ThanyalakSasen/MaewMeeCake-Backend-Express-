const Address = require('../models/AddressModel');

// @desc    สร้างที่อยู่ใหม่
// @route   POST /api/address
// @access  Private
exports.createAddress = async (req, res, next) => {
  try {
    const { label, address_line, sub_district, district, province, postal_code } = req.body;
    const user_id = req.user._id;

    const newAddress = new Address({
      user_id,
      label,
      address_line,
      sub_district,
      district,
      province,
      postal_code
    });

    const savedAddress = await newAddress.save();
    res.status(201).json(savedAddress);
  } catch (error) {
    next(error);
  }
};

// @desc    ดึงที่อยู่ทั้งหมดของผู้ใช้
// @route   GET /api/address
// @access  Private
exports.getAllAddressesByUserId = async (req, res, next) => {
    try {
        const user_id = req.user._id;
        const addresses = await Address.find({ user_id });
        res.json(addresses);
    } catch (error) { 
       next(error);
    }
};

// @desc    ดึงที่อยู่ตาม ID
// @route   GET /api/address/:id
// @access  Private
exports.getAddressById = async (req, res, next) => {
    try {
        const address = await Address.findById(req.params.id);
        if (!address) {
            return res.status(404).json({ message: 'Address not found' });
        }
        res.json(address);
    }
    catch (error) {
        next(error);
    }
};

// @desc    อัพเดตที่อยู่ตาม ID
// @route   PUT /api/address/:id
// @access  Private
exports.updateAddress = async (req, res, next) => {
    try {
        const updatedAddress = await Address.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedAddress) {
            return res.status(404).json({ message: 'Address not found' });
        }
        res.json(updatedAddress);
    } catch (error) {
        next(error);
    }
};

// @desc    ลบที่อยู่ตาม ID
// @route   DELETE /api/address/:id
// @access  Private
exports.deleteAddress = async (req, res, next) => {
    try {
        const deletedAddress = await Address.findByIdAndDelete(req.params.id);
        if (!deletedAddress) {
            return res.status(404).json({ message: 'Address not found' });
        }
        res.json({ message: 'Address deleted successfully' });
    } catch (error) {
        next(error);
    }
};