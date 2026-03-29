const Recipe = require("../models/RecipesModel");
const Product = require("../models/ProductModel");
const TypeRecipe = require("../models/TypeRecipesModel");

exports.checkRecipeName = async (req, res) => {
  try {
    const { name } = req.query;

    if (!name) return res.status(400).json({ message: "โปรดระบุชื่อสูตร" });

    const existingRecipe = await Recipe.findOne({
      recipe_name: name.trim(),
      softDelete: false
    }).collation({ locale: "en", strength: 2 });

    res.json({ exists: !!existingRecipe });
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

exports.createRecipe = async (req, res) => {
  try {
    const {
      recipe_name,
      product_id,
      yield_per_batch,
      typerecipes,
      productcategories,
      ingredients = [],
      components = [],
      steps = [],
      recipe_note = null,
      recipe_img = null,
    } = req.body;

    if (!recipe_name || String(recipe_name).trim() === "") {
      return res.status(400).json({ message: "กรุณาระบุชื่อสูตร" });
    }

    // Check for duplicate recipe name
    const existingRecipe = await Recipe.findOne({
      recipe_name: String(recipe_name).trim(),
      softDelete: false
    }).collation({ locale: "en", strength: 2 });

    if (existingRecipe) {
      return res.status(400).json({ message: "ชื่อสูตรนี้มีอยู่แล้ว กรุณาใช้ชื่ออื่น" });
    }

    let resolvedProductCategory = productcategories;
    if (!resolvedProductCategory && product_id) {
      const product = await Product.findById(product_id).select("productcategories");
      resolvedProductCategory = product?.productcategories || null;
    }
    if (!resolvedProductCategory) {
      return res.status(400).json({ message: "กรุณาเลือกหมวดหมู่สินค้า" });
    }

    let resolvedTypeRecipe = typerecipes;
    if (!resolvedTypeRecipe) {
      let defaultTypeRecipe = await TypeRecipe.findOne({ softDelete: false }).select("_id");

      // Bootstrap default TypeRecipe for environments where seed data is missing.
      if (!defaultTypeRecipe) {
        defaultTypeRecipe = await TypeRecipe.create({
          typerecipeName: "สูตรทั่วไป",
          softDelete: false,
        });
      }

      resolvedTypeRecipe = defaultTypeRecipe?._id || null;
    }
    if (!resolvedTypeRecipe) {
      return res.status(400).json({ message: "ไม่พบข้อมูล TypeRecipe" });
    }

    const normalizedIngredients = Array.isArray(ingredients)
      ? ingredients
          .filter((item) => item?.ingredient_id && item?.unit_id && item?.quantity !== undefined)
          .map((item) => ({
            ingredient_id: item.ingredient_id,
            ingredient_name: item.ingredient_name || null,
            quantity: Number(item.quantity),
            unit_id: item.unit_id,
            note: item.note || null,
          }))
      : [];

    const normalizedSteps = Array.isArray(steps)
      ? steps
          .filter((step) => step?.title && String(step.title).trim() !== "")
          .map((step, index) => ({
            step_number: step.step_number || index + 1,
            title: String(step.title).trim(),
            description: step.description || null,
            duration_minutes: step.duration_minutes ?? null,
            temperature_celsius: step.temperature_celsius ?? null,
            substeps: Array.isArray(step.substeps)
              ? step.substeps
                  .filter((sub) => sub?.description && String(sub.description).trim() !== "")
                  .map((sub, subIndex) => ({
                    substep_number: sub.substep_number || subIndex + 1,
                    description: String(sub.description).trim(),
                  }))
              : [],
          }))
      : [];

    if (
      normalizedIngredients.length === 0 &&
      (!Array.isArray(components) || components.length === 0)
    ) {
      return res.status(400).json({ message: "ต้องมีส่วนผสมหรือ component อย่างน้อย 1 รายการ" });
    }

    if (normalizedSteps.length === 0) {
      return res.status(400).json({ message: "ต้องมีขั้นตอนการทำอย่างน้อย 1 ขั้นตอน" });
    }

    const recipe = await Recipe.create({
      recipe_name: String(recipe_name).trim(),
      product_id: product_id || null,
      yield_per_batch:
        yield_per_batch !== undefined &&
        yield_per_batch !== null &&
        yield_per_batch !== ""
          ? Number(yield_per_batch)
          : null,
      typerecipes: resolvedTypeRecipe,
      productcategories: resolvedProductCategory,
      ingredients: normalizedIngredients,
      components: Array.isArray(components) ? components : [],
      steps: normalizedSteps,
      recipe_note,
      recipe_img,
    });

    res.status(201).json({ success: true, data: recipe });
  } catch (err) {
    console.error("createRecipe error:", err);
    res
      .status(500)
      .json({ message: "สร้างสูตรอาหารไม่สำเร็จ", error: err.message });
  }
};

exports.getAllRecipes = async (req, res) => {
  try {
    const recipes = await Recipe.find().populate("components"); // ใช้ populate เพื่อดึงข้อมูลส่วนประกอบสูตรอาหารที่เกี่ยวข้องมาแสดงด้วย
    res.json(recipes);
  } catch (err) {
    res
      .status(500)
      .json({ message: "โหลดข้อมูลสูตรอาหารไม่สำเร็จ", error: err.message });
  }
};

exports.getRecipeById = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id).populate("components");
    res.json(recipe);
  } catch (err) {
    res
      .status(500)
      .json({ message: "โหลดข้อมูลสูตรอาหารไม่สำเร็จ", error: err.message });
  }
};

exports.updateRecipe = async (req, res) => {
  try {
    const recipe = await Recipe.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.json(recipe);
  } catch (err) {
    res
      .status(500)
      .json({ message: "อัปเดตสูตรอาหารไม่สำเร็จ", error: err.message });
  }
};

exports.softDeleteRecipe = async (req, res) => {
  try {
    const recipe = await Recipe.findByIdAndUpdate(
      req.params.id,
      { isDeleted: true },
      { new: true },
    );
    res.json(recipe);
  } catch (err) {
    res
      .status(500)
      .json({ message: "ลบสูตรอาหารไม่สำเร็จ", error: err.message });
  }
};

exports.restoreRecipe = async (req, res) => {
  try {
    const recipe = await Recipe.findByIdAndUpdate(
      req.params.id,
      { isDeleted: false },
      { new: true },
    );
    res.json(recipe);
  } catch (err) {
    res
      .status(500)
      .json({ message: "กู้คืนสูตรอาหารไม่สำเร็จ", error: err.message });
  }
};

exports.hardDeleteRecipe = async (req, res) => {
  try {
    await Recipe.findByIdAndDelete(req.params.id);
    res.json({ message: "ลบสูตรอาหารถาวรสำเร็จ" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "ลบสูตรอาหารถาวรไม่สำเร็จ", error: err.message });
  }
};
