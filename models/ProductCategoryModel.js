const mongoose = require("mongoose");

const ProductCategorySchema = new mongoose.Schema(
  {
    productcategoriesName: {
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

module.exports = mongoose.model("productcategories", ProductCategorySchema);
