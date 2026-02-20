// 1. เปลี่ยนชื่อ Model เป็นตัวพิมพ์ใหญ่ Unit เพื่อแยกแยะว่าเป็น Model
const Unit = require("../models/unitModel");

exports.getAllUnits = async (req, res) => {
  try {
    // ใช้ Unit.find
    const units = await Unit.find({ is_active: true });
    res.status(200).json(units);
  } catch (err) {
    console.error("❌ getAllUnits error:", err);
    res.status(500).json({ message: "โหลดหน่วยไม่สำเร็จ" });
  }
};

exports.createUnit = async (req, res, next) => {
  try {
    const { unit_name, unit_symbol, unit_type } = req.body; // รับค่าให้ตรงกัน
    
    const newUnit = await Unit.create({
      unit_name,
      unit_symbol,
      unit_type
    });
    
    res.status(201).json(newUnit);
  } catch (err) {
    console.error("❌ createUnit error:", err);
    // ถ้า error เพราะชื่อซ้ำ (Unique) ให้แจ้งผู้ใช้แบบเข้าใจง่าย
    if (err.code === 11000) {
      return res.status(400).json({ message: "ชื่อหน่วยนี้มีอยู่ในระบบแล้ว" });
    }
    res.status(500).json({ message: "บันทึกข้อมูลไม่สำเร็จ" });
  }
};

exports.getDistinctUnitTypes = async (req, res) => {
  try {
    // ใช้คำสั่ง distinct เพื่อดึงค่า unit_type ที่ไม่ซ้ำกันออกมาจาก Collection Unit
    const unitTypes = await Unit.distinct("unit_type");
    res.status(200).json(unitTypes); 
    // ผลลัพธ์จะเป็น Array เช่น ["weight", "volume", "count"]
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateUnit = async (req, res, next) => {
  try {
    // 3. ใช้ Unit.findByIdAndUpdate
    const updatedUnit = await Unit.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
    );
    if (!updatedUnit)
      return res.status(404).json({ message: "Unit not found" });       
    res.json(updatedUnit);
  } catch (err) {
    next(err);
  } 
};

exports.softDeleteUnit = async (req, res, next) => {
  try {
    const deletedUnit = await Unit.findByIdAndUpdate(req.params.id,  
      { is_active: false },
      { new: true }
    );  
    if (!deletedUnit)
      return res.status(404).json({ message: "Unit not found" });
    res.json({ message: "Unit soft-deleted successfully" });
  } catch (err) {
    next(err);
  } 
};