const Ingredient = require("../models/ingredientModel");
const IngredientCategory = require("../models/ingredientcategoryModel");

exports.createIngredient = async (req, res, next) => {
  try {
    const ingredient = await Ingredient.create(req.body);
    res.status(201).json(ingredient);
  } catch (err) {
    console.error(err);
    next(err); 
  }
};

exports.createIngredientCategory = async (req, res, next) => {
  try {
    const category = await IngredientCategory.create(req.body);
    res.status(201).json(category);
  } catch (err) {
    console.error(err);
    next(err); 
  }
};

exports.getAllIngredient = async (req, res, next) => {
  try {
    const ingredients = await Ingredient.find({ softDeleted: false })
      .populate("category_id", "category_name ")
      .populate("unit_id", "unit_name unit_symbol unit_type");

    res.status(200).json(ingredients); 
  } catch (err) {
    next(err);
  }
};
exports.getAllIngredientCategory = async (req, res, next) => {
  try {
    const categories = await IngredientCategory.find({ is_active: true });
    res.status(200).json(categories);
  } catch (err) {
    next(err);
  }
};


exports.getIngredientById = async (req, res) => {
  try {
    const ingredient = await Ingredient.findById(req.params.id)
      .populate("category_id", "category_name")
      .populate("unit_id", "unit_name unit_symbol unit_type");

    if (!ingredient)
      return res.status(404).json({ message: "ไม่พบวัตถุดิบ" });

    res.json(ingredient);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};



exports.updateIngredient = async (req, res, next) => {
  try {
    const ingredient = await Ingredient.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!ingredient)
      return res.status(404).json({ message: "Ingredient not found" });

    res.json(ingredient);
  } catch (err) {
    next(err);
  }
};
exports.updateIngredientCategory = async (req, res, next) => {
  try {
    const category = await IngredientCategory.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!category)
      return res.status(404).json({ message: "Category not found" });

    res.json(category);
  }
    catch (err) {
    next(err);
  }
};

exports.softDeleteIngredient = async (req, res, next) => {
  try {
    const ingredient = await Ingredient.findByIdAndUpdate(req.params.id,
      { softDeleted: true },
      { new: true }
    );

    if (!ingredient)
      return res.status(404).json({ message: "Ingredient not found" });

    res.json({ message: "Ingredient soft deleted", ingredient });
  } catch (err) {
    next(err);
  }
};
exports.softDeleteIngredientCategory = async (req, res, next) => {
  try {
    const category = await IngredientCategory.findByIdAndUpdate(req.params.id,
      { is_active: false },
      { new: true }
    );

    if (!category)      return res.status(404).json({ message: "Category not found" });

    res.json({ message: "Category soft deleted", category });
  } catch (err) {
    next(err);
  }   
};

exports.getInactiveIngredient = async (req, res, next) => {
  try {
    
    const ingredient = await Ingredient.find({ softDeleted: true }) 
      .populate("ingredientcategory_id", "ingredientcategory_name")
      .populate("unit_id", "unit_name unit_symbol unit_type");

    res.status(200).json(ingredient);
  } catch (err) {
    console.error("❌ getInactiveIngredient Error:", err);
    res.status(500).json({ message: "โหลดข้อมูลถังขยะล้มเหลว: " + err.message });
  }
};

exports.restoreIngredient = async (req, res, next) => {
  try {
    const ingredient = await Ingredient.findByIdAndUpdate(
      req.params.id,
      { softDeleted: false },
      { new: true }
    );

    if (!ingredient)
      return res.status(404).json({ message: "Ingredient not found" });

    res.json({ message: "Ingredient restored", ingredient });
  } catch (err) {
    next(err);
  }
};