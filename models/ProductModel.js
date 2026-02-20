const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const productSchema = new Schema(
  {
    product_name_th: {
      type: String,
      required: true,
    },
    product_name_eng: {
      type: String,
      required: true,
    },
    product_type: {
      type: String,
      required: true,
    },
    product_price: {
      type: Number,
      required: true,
    },
    product_img: {
      type: String,
      default: null,
    },
    product_description: {
      type: String,
      default: null,
    },
    preparation_heating: {
      type: String,
      default: null,
    },
    recipe_id: {
      type: Schema.Types.ObjectId,
      ref: "Recipes",
      required: false,
      default: null,
    },
    softDelete: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Product", productSchema);
