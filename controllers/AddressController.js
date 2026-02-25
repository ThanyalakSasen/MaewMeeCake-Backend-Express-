const addressModel = require('../models/AddressModel');

exports.createAddress = async (req, res) => {
    try {
        const { user_id, label, address_line, geography_id, is_default } = req.body;
        const newAddress = new addressModel({

            user_id,
            label,
            address_line,
            geography_id,
            is_default,
        });
        await newAddress.save();
        res.status(201).json({ message: 'Address created successfully', address: newAddress });
    } catch (error) {
        console.error('Error creating address:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.getUserAddressById = async (req, res) => {
    try {
        const { id, user_id } = req.params;

        const address = await addressModel.findOne({
            _id: id,
            user_id: user_id
        });

        if (!address) {
            return res.status(404).json({ message: 'ไม่พบที่อยู่ที่ระบุ' });
        }
        res.status(200).json(address);
    } catch (error) {
        console.error('Error fetching address:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.deleteAddress = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedAddress = await addressModel.findByIdAndDelete(id);
        if (!deletedAddress) {
            return res.status(404).json({ message: 'ไม่พบที่อยู่ที่ระบุ' });
        }
        res.status(200).json({ message: 'Address deleted successfully' });
    } catch (error) {
        console.error('Error deleting address:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.updateAddress = async (req, res) => {
    try {
        const { id } = req.params;
        const { label, address_line, geography_id, is_default } = req.body;
        const updatedAddress = await addressModel.findByIdAndUpdate(
            id, 
            { label, address_line, geography_id, is_default },
            { new: true }
        );
        if (!updatedAddress) {
            return res.status(404).json({ message: 'ไม่พบที่อยู่ที่ระบุ' });
        }
        res.status(200).json({ message: 'Address updated successfully', address: updatedAddress });
    } catch (error) {
        console.error('Error updating address:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};