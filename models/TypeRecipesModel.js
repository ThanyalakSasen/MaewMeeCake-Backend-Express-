const mongoose = require("mongoose");

const TypeRecipeSchema = new mongoose.Schema(
  {
    typerecipeName: {
      type: String,
      required: true,
      
    },
    softDelete: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("typerecipes", TypeRecipeSchema);
