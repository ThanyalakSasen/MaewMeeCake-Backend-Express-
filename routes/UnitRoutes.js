const express = require("express");
const router = express.Router();
const Unit = require("../models/UnitModel");
const UnitType = require("../models/UnitTypeModel"); // ← import UnitType
const { protect } = require("../middlewares/authMiddleware");

router.get("/allUnit", async (req, res) => {
  try {
    const units = await Unit.find({ is_active: true }).populate("unit_type_id");
    res.json(units);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET all unit types
router.get("/allUnitType", async (req, res) => {
  try {
    const types = await UnitType.find({ softDelete: false });
    res.json(types);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST create unit — ต้องส่ง unit_type_id มาด้วย
router.post("/", protect, async (req, res) => {
  try {
    const { unit_name, unit_symbol, unit_type_id } = req.body;
    if (!unit_name || !unit_type_id) {
      return res.status(400).json({ message: "กรุณาระบุชื่อหน่วยและประเภทหน่วย" });
    }
    const unit = await Unit.create({ unit_name, unit_symbol, unit_type_id });
    res.status(201).json(unit);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

exports = module.exports = router;