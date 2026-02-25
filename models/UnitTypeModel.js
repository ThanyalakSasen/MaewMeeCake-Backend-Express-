const mongoose = require("mongoose");

const UnitTypeSchema = new mongoose.Schema(
  {
    unittypeName: { type: String, required: true, unique: true, trim: true },
    softDelete: { type: Boolean, default: false },
  },
  { timestamps: true },
);

module.exports = mongoose.models.UnitType || mongoose.model("UnitType", UnitTypeSchema);
