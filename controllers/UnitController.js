const Unit = require("../models/unitModel");
const UnitType = require("../models/unittypeModel");

// ---จัดการประเภทหน่วย (UnitType)---
exports.getAllUnitTypes = async (req, res) => {
  try {
    const types = await UnitType.find({ softDelete: false });
    res.json(types);
  } catch (err) {
    res.status(500).json({ message: "Error fetching types" });
  }
};

exports.createUnitType = async (req, res) => {
  try {
    const newType = await UnitType.create(req.body);
    res.status(201).json(newType);
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ message: "ชื่อประเภทนี้มีอยู่แล้ว" });
    res.status(500).json({ message: err.message });
  }
};

// ---จัดการหน่วย (Unit)---
exports.getAllUnits = async (req, res) => {
  try {
    const units = await Unit.find({ is_active: true }).populate("unit_type");
    res.json(units);
  } catch (err) {
    res.status(500).json({ message: "Error fetching units" });
  }
};

exports.createUnit = async (req, res) => {
  try {
    const newUnit = await Unit.create(req.body);
    const populatedUnit = await newUnit.populate("unit_type");
    res.status(201).json(populatedUnit);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateUnit = async (req, res) => {
  try {
    const updatedUnit = await Unit.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate("unit_type");
    if (!updatedUnit) return res.status(404).json({ message: "ไม่พบหน่วย" });
    res.json(updatedUnit);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }   
};

exports.softDeleteUnit = async (req, res) => {
  try {
    const deletedUnit = await Unit.findByIdAndUpdate(req.params.id, { is_active: false }, { new: true });
    if (!deletedUnit) return res.status(404).json({ message: "ไม่พบหน่วย" });
    res.json({ message: "ลบหน่วยเรียบร้อยแล้ว" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.restoreUnit = async (req, res) => {
  try {
    const restoredUnit = await Unit.findByIdAndUpdate(req.params.id, { is_active: true }, { new: true });
    if (!restoredUnit) return res.status(404).json({ message: "ไม่พบหน่วย" });
    res.json({ message: "กู้คืนหน่วยเรียบร้อยแล้ว" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  } 
};

exports.getUnitById = async (req, res) => {
  try {
    const unit = await Unit.findById(req.params.id)
      .populate("unit_type", "typeunitName")
      .populate("recipes", "recipe_name");
    if (!unit) return res.status(404).json({ message: "ไม่พบหน่วย" });
    res.json(unit);
  } catch (err) {
    res.status(500).json({ message: err.message });
  } 
};

