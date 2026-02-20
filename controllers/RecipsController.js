const Recipes = require("../models/RecipesModel");
const Ingredient = require("../models/IngredientModel");
const TypeRecipe = require("../models/TypeRecipesModel");
const ProductCategory = require("../models/CategoryModel");
const Unit = require("../models/UnitModel");

exports.createRecipe = async (req, res) => {
  try {
    const {
      recipe_name,
      ingredients,
      steps,
      typerecipes,
      productcategories,
      recipe_status,
      yield_per_batch
    } = req.body;

    if (!ingredients || ingredients.length === 0) {
      return res.status(400).json({ message: "ต้องมีส่วนผสมอย่างน้อย 1 รายการ" });
    }

    for (const item of ingredients) {

      /* 🔒 เช็ค item_type */
      if (!item.item_type) {
        return res.status(400).json({
          message: "item_type is required (ingredient | recipe)"
        });
      }

      /* 🔹 วัตถุดิบ */
      if (item.item_type === "ingredient") {
        if (!item.ingredient_id) {
          return res.status(400).json({
            message: `กรุณาเลือกวัตถุดิบ: ${item.name}`
          });
        }

        const exists = await Ingredient.exists({ _id: item.ingredient_id });
        if (!exists) {
          return res.status(400).json({
            message: `วัตถุดิบ "${item.name}" ไม่มีในระบบ`
          });
        }

        if (!item.unit_id) {
          return res.status(400).json({
            message: `กรุณาระบุหน่วยของ "${item.name}"`
          });
        }
        
        // ✅ FIX #3: ตรวจสอบว่าหน่วยมีอยู่จริงในระบบ
        const unitExists = await Unit.exists({ _id: item.unit_id });
        if (!unitExists) {
          return res.status(400).json({
            message: `หน่วย "${item.unit_id}" ไม่มีในระบบ`
          });
        }
      }

      /* 🔹 สูตรซ้อนสูตร */
      if (item.item_type === "recipe") {
        if (!item.recipe_id) {
          return res.status(400).json({
            message: `กรุณาเลือกสูตรย่อย: ${item.name}`
          });
        }

        const exists = await Recipes.exists({ _id: item.recipe_id });
        if (!exists) {
          return res.status(400).json({
            message: `สูตร "${item.name}" ไม่มีในระบบ`
          });
        }
      }

      if (!item.name) {
        return res.status(400).json({
          message: "กรุณาระบุชื่อรายการส่วนผสม"
        });
      }
      
      // ✅ FIX #2: ตรวจสอบ quantity
      if (!item.quantity || item.quantity <= 0) {
        return res.status(400).json({
          message: `กรุณาระบุปริมาณที่ถูกต้องสำหรับ "${item.name}"`
        });
      }
    }

    const recipe = await Recipes.create({
      recipe_name,
      yield_per_batch,
      ingredients,
      steps,
      typerecipes,
      productcategories,
      recipe_status,
      creator_id: req.user?._id || null
    });

    res.status(201).json(recipe);
  } catch (err) {
    console.error("❌ createRecipe:", err);
    res.status(500).json({ message: err.message || "สร้างสูตรอาหารไม่สำเร็จ" });
  }
};

exports.getAllRecipes = async (req, res) => {
  try {
    const recipes = await Recipes.find({
      recipe_status: { $ne: "inactive" }   
    })
        .populate("productcategories") 
        .populate("typerecipes");
    res.status(200).json(recipes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "โหลดสูตรอาหารไม่สำเร็จ" });
  }
};


exports.getRecipeById = async (req, res) => {
  try {
    const recipe = await Recipes.findById(req.params.id)
      .populate("ingredients.ingredient_id", "ingredient_name")
      .populate("ingredients.recipe_id", "recipe_name")
      .populate("ingredients.unit_id", "unit_name")
      .populate("typerecipes", "type_name")
      .populate("productcategories", "category_name");

    if (!recipe) {
      return res.status(404).json({ message: "ไม่พบสูตรอาหาร" });
    }

    res.status(200).json(recipe);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "โหลดสูตรอาหารไม่สำเร็จ" });
  }
};


exports.createTypeRecipe = async (req, res) => {
  try {
    const { typerecipeName } = req.body;

    const exists = await TypeRecipe.findOne({ typerecipeName });
    if (exists) {
      return res.status(400).json({ message: "ประเภทนี้มีอยู่แล้ว" });
    }

    const typeRecipe = await TypeRecipe.create({ typerecipeName });
    res.status(201).json(typeRecipe);
  } catch (err) {
    res.status(500).json({ message: "เพิ่มประเภทสูตรอาหารไม่สำเร็จ" });
  }
};

exports.getAllTypeRecipes = async (req, res) => {
  const types = await TypeRecipe.find({ softDelete: false })
    .sort({ typerecipeName: 1 });
  res.json(types);
};



exports.createProductCategory = async (req, res) => {
  try {
    const { productcategoriesName } = req.body;

    const exists = await ProductCategory.findOne({ productcategoriesName });
    if (exists) {
      return res.status(400).json({ message: "หมวดหมู่นี้มีอยู่แล้ว" });
    }

    const category = await ProductCategory.create({ productcategoriesName });
    res.status(201).json(category);
  } catch (err) {
    res.status(500).json({ message: "เพิ่มหมวดหมู่ไม่สำเร็จ" });
  }
};

exports.getAllProductCategories = async (req, res) => {
  const categories = await ProductCategory.find({ softDelete: false })
    .sort({ productcategoriesName: 1 });
  res.json(categories);
};


exports.updateRecipe = async (req, res) => {
  try {
    const recipe = await Recipes.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!recipe) {
      return res.status(404).json({ message: "ไม่พบสูตรอาหาร" });
    }

    res.status(200).json(recipe);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "อัปเดตสูตรอาหารไม่สำเร็จ" });
  }
};

exports.softDeleteRecipe = async (req, res) => {
  try {
    const recipe = await Recipes.findByIdAndUpdate(
      req.params.id,
      { recipe_status: "inactive" },
      { new: true }
    );

    if (!recipe) {
      return res.status(404).json({ message: "ไม่พบสูตรอาหาร" });
    }

    res.status(200).json({
      message: "ลบสูตรอาหารเรียบร้อย (Soft Delete)",
      recipe
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "ลบสูตรอาหารไม่สำเร็จ" });
  }
};

exports.restoreRecipe = async (req, res) => {
  try {
    const recipe = await Recipes.findByIdAndUpdate(
      req.params.id,
      { recipe_status: "active" },
      { new: true }
    );

    if (!recipe) {
      return res.status(404).json({ message: "ไม่พบสูตรอาหาร" });
    }

    res.status(200).json({
      message: "กู้คืนสูตรอาหารเรียบร้อย",
      recipe
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "กู้คืนสูตรอาหารไม่สำเร็จ" });
  }
};