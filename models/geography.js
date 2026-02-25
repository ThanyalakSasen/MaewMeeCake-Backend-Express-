// GeographyModel.js
const mongoose = require("mongoose");

const geographySchema = new mongoose.Schema({
  // ── จังหวัด ───────────────────────────────
  provinceCode: { type: Number, required: true },
  provinceNameEn: { type: String, required: true, trim: true },
  provinceNameTh: { type: String, required: true, trim: true },

  // ── อำเภอ/เขต ─────────────────────────────
  districtCode: { type: Number, required: true },
  districtNameEn: { type: String, required: true, trim: true },
  districtNameTh: { type: String, required: true, trim: true },

  // ── ตำบล/แขวง ─────────────────────────────
  subdistrictCode: { type: Number, required: true, unique: true },
  subdistrictNameEn: { type: String, required: true, trim: true },
  subdistrictNameTh: { type: String, required: true, trim: true },

  postalCode: { type: Number, required: true },
});

// ── Indexes ────────────────────────────────
geographySchema.index({ provinceCode: 1 });
geographySchema.index({ districtCode: 1 });
geographySchema.index({ subdistrictCode: 1 });
geographySchema.index({ postalCode: 1 });
// ค้นหาชื่อแบบ text (ใช้ตอน search กรอกที่อยู่)
geographySchema.index({
  provinceNameTh: "text",
  districtNameTh: "text",
  subdistrictNameTh: "text",
});

module.exports =
  mongoose.models.Geography || mongoose.model("Geography", geographySchema);