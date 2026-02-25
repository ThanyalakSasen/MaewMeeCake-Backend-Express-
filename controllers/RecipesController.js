const Recipe = require("../models/RecipesModel");

exports.createRecipe = async (req, res) => {
  try {
    //...req.body คือการกระจายข้อมูลจาก req.body ไปยัง JSON object ใหม่ที่เราสร้างขึ้น โดยจะมีการเพิ่ม property components ที่เป็น array ของ ObjectId ที่อ้างอิงถึงส่วนประกอบสูตรอาหารที่เราเพิ่งสร้างขึ้นมา
    const recipe = await Recipe.create({
      ...req.body,
      components: componentIds,
    });
    res.status(201).json(recipe);
  } catch (err) {
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
    r;
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
