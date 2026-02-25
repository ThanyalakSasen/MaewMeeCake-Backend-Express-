const mongoose = require("mongoose");

const ingredientcategorySchema = new mongoose.Schema(
  {
    ingredientcategory_name: {
      type: String,
      required: true,
      unique: true, // ป้องกันการซ้ำกันที่ระดับฐานข้อมูล
      trim: true  // ตัดช่องว่างหน้า-หลังให้อัตโนมัติ
      
    },
    is_active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("IngredientCategory", ingredientcategorySchema);
