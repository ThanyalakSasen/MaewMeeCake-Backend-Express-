const Ingredient = require("../models/IngredientModel");
const Category = require("../models/CategoryModel");
const Unit = require("../models/UnitModel");

exports.createIngredient = async (req, res, next) => {
  try {
    const ingredient = await Ingredient.create(req.body);
    res.status(201).json(ingredient);
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