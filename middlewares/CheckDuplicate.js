// middleware/checkDuplicate.js
const Recipe = require("../models/recipecomponentsModel");
const Ingredient = require("../models/ingredientModel");

// สำหรับเช็คชื่อสูตรอาหาร
const checkRecipeName = async (req, res) => {
  try {
    
    const { name } = req.query; 

    if (!name) return res.status(400).json({ message: "โปรดระบุชื่อ" });

    // สร้างเงื่อนไขการค้นหา
    const query = {
      component_name: name.trim(),
      softDelete: false
    };

    const existingRecipe = await Recipe.findOne(query)
      .collation({ locale: "en", strength: 2 });

    res.json({ exists: !!existingRecipe });
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

// ✅ เพิ่มฟังก์ชันนี้สำหรับหน้า AddIngredientPage
const checkIngredientName = async (req, res) => {
  try {
    const { name } = req.query;
    if (!name) return res.status(400).json({ message: "โปรดระบุชื่อวัตถุดิบ" });

    // ค้นหาใน Model Ingredient
    const existingIngredient = await Ingredient.findOne({
      ingredient_name: name.trim()
    }).collation({ locale: "en", strength: 2 });

    res.json({ exists: !!existingIngredient });
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

module.exports = { checkRecipeName, checkIngredientName };