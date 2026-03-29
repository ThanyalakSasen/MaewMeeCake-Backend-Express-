const RecipeComponent = require("../models/RecipesComponent");

exports.createRecipe = async (req, res) => {
  console.log("req.body:", req.body);
  try {
    const {
      component_name,
      yield_amount,
      unit_id,
      ingredients,
      steps
    } = req.body;

    if (!ingredients || ingredients.length === 0) {
      return res.status(400).json({ message: "ต้องมีส่วนผสมอย่างน้อย 1 รายการ" });
    }

    if (!steps || steps.length === 0) {
      return res.status(400).json({ message: "ต้องมีขั้นตอนอย่างน้อย 1 ขั้นตอน" });
    }

    const recipe = await RecipeComponent.create({
      component_name,
      yield_amount,
      unit_id,
      ingredients,
      steps
    });

    res.status(201).json(recipe);
  } catch (err) {
    console.error("❌ createRecipe:", err);
    res.status(500).json({ message: err.message });
  }
};



exports.getAllRecipes = async (req, res) => {
  try {
    const recipes = await RecipeComponent.find({ softDelete: false })
      .populate("unit_id", "unit_name")
      .populate("ingredients.ingredient_id", "ingredient_name")
      .populate("ingredients.unit_id", "unit_name");

    res.status(200).json(recipes);
  } catch (err) {
    res.status(500).json({ message: "โหลดสูตรอาหารไม่สำเร็จ" });
  }
};



exports.getRecipeById = async (req, res) => {
  try {
    const recipe = await RecipeComponent.findById(req.params.id)
      .populate("unit_id")
      .populate("ingredients.ingredient_id")
      .populate("ingredients.unit_id");

    if (!recipe) {
      return res.status(404).json({ message: "ไม่พบข้อมูลสูตร" });
    }

    res.json(recipe);
  } catch (err) {
    res.status(500).json({ message: "โหลดข้อมูลไม่สำเร็จ", error: err.message });
  }
};



exports.updateRecipe = async (req, res) => {
  try {
    const recipe = await RecipeComponent.findByIdAndUpdate(
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

exports.deleteRecipe = async (req, res) => {
  try {
    const recipe = await RecipeComponent.findByIdAndUpdate(
      req.params.id,
      { softDelete: true },
      { new: true }
    );

    if (!recipe) {
      return res.status(404).json({ message: "ไม่พบสูตรอาหาร" });
    }

    res.status(200).json({
      message: "ลบสูตรเรียบร้อย",
      recipe
    });
  } catch (err) {
    res.status(500).json({ message: "ลบสูตรไม่สำเร็จ" });
  }
};




exports.getInactiveRecipes = async (req, res) => {
  try {
    const recipes = await RecipeComponent.find({ softDelete: true })
      .populate("unit_id", "unit_name")
      .populate("ingredients.ingredient_id", "ingredient_name")
      .populate("ingredients.unit_id", "unit_name");

    res.status(200).json(recipes);
  } catch (err) {
    res.status(500).json({ message: "โหลดข้อมูลถังขยะล้มเหลว" });
  }
};


exports.restoreRecipe = async (req, res) => {
  try {
    const recipe = await RecipeComponent.findByIdAndUpdate(
      req.params.id,
      { softDelete: false },
      { new: true }
    );

    if (!recipe) {
      return res.status(404).json({ message: "ไม่พบสูตรอาหาร" });
    }

    res.status(200).json({
      message: "กู้คืนสูตรเรียบร้อย",
      recipe
    });
  } catch (err) {
    res.status(500).json({ message: "กู้คืนสูตรไม่สำเร็จ" });
  }
};

// ฟังก์ชันสำหรับลบออกจาก Database จริงๆ (Hard Delete)
exports.deletePermanent = async (req, res) => {
  try {
    const { id } = req.params;
    const recipe = await RecipeComponent.findByIdAndDelete(id);

    if (!recipe) {
      return res.status(404).json({ message: "ไม่พบสูตรที่ต้องการลบถาวร" });
    }

    res.status(200).json({ message: "ลบสูตรออกจากระบบถาวรเรียบร้อยแล้ว" });
  } catch (err) {
    console.error("❌ deletePermanent Error:", err);
    res.status(500).json({ message: "ลบถาวรไม่สำเร็จ" });
  }
};