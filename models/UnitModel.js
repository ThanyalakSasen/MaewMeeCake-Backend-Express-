const mongoose = require("mongoose");

const unitSchema = new mongoose.Schema(
  {
    unit_name: {
      type: String,
      required: true,
    },
    unit_symbol: {
      type: String,
      trim: true,
    },
    unit_type_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UnitType",
      required: true,
    },
    is_active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Unit", unitSchema);
