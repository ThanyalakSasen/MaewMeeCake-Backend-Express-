const mongoose = require('mongoose')
const Schema = mongoose.Schema

const ingredientSchema = new mongoose.Schema(
  {
    ingredient_name: {
      type: String,
      required: true,
      trim: true
    },

    category_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category", 
      default: null,
      validate: {
        validator: function (v) {
          return v === null || mongoose.Types.ObjectId.isValid(v);
        },
        message: props => `${props.value} ไม่ใช่ ObjectId ที่ถูกต้อง`
      }
    },

    unit_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Unit",
      required: true
    },

    stock_quantity: {
      type: Number,
      required: true,
      default: 0
    },

    price_per_unit: {
  type: Number,
  required: false,
  default: 0
 },
    reorder_level: {
      type: Number,
      default: 0
    },
    softDeleted: {
      type: Boolean,
      default: false
    },

    in_status: {
      type: String,
      enum: [
        "IN_STOCK",
        "LOW_STOCK",
        "OUT_OF_STOCK",
        "EXPIRED",
        "DISCONTINUED"
      ],
      default: "IN_STOCK"
    }
  },{ timestamps: true })

module.exports = mongoose.model("Ingredient", ingredientSchema);