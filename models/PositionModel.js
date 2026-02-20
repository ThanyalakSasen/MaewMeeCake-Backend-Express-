const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const PositionSchema = new Schema(
  {
    position_name: {
      type: String,
      required: true,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model('Position', PositionSchema)