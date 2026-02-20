const categoryModel = require("../models/CategoryModel");

exports.createCategory = async (req, res) => {
  try {
    const { name } = req.body;

    const newCategory = new categoryModel({
      category_name: name,
    });
    const savedCategory = await newCategory.save();
    res.status(201).json({
      success: true,
      message: "สร้างหมวดหมู่สำเร็จ",
      data: savedCategory,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการสร้างหมวดหมู่",
      error: error.message,
    });
  }
};

exports.getAllCategories = async (req, res) => {
  try {
    const categories = await categoryModel.find();
    res.status(200).json({
      success: true,
      data: categories,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการดึงข้อมูลหมวดหมู่",
      error: error.message,
    });
  }
};
exports.getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await categoryModel.findById(id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "ไม่พบหมวดหมู่ที่ต้องการ",
      });
    }
    res.status(200).json({
      success: true,
      data: category,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการดึงข้อมูลหมวดหมู่",
      error: error.message,
    });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const updatedCategory = await categoryModel.findByIdAndUpdate(
      id,
      { category_name: name },
      { new: true },
    );
    if (!updatedCategory) {
      return res.status(404).json({
        success: false,
        message: "ไม่พบหมวดหมู่ที่ต้องการอัพเดต",
      });
    }
    res.status(200).json({
      success: true,
      message: "อัพเดตหมวดหมู่สำเร็จ",
      data: updatedCategory,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการอัพเดตหมวดหมู่",
      error: error.message,
    });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedCategory = await categoryModel.findByIdAndDelete(id);
    if (!deletedCategory) {
      return res.status(404).json({
        success: false,
        message: "ไม่พบหมวดหมู่ที่ต้องการลบ",
      });
    }
    res.status(200).json({
      success: true,
      message: "ลบหมวดหมู่สำเร็จ",
      data: deletedCategory,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการลบหมวดหมู่",
      error: error.message,
    });
  }
};
