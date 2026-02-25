const ProductCategoryModel = require("../models/ProductCategoryModel");

exports.createProductCategory = async (req, res) => {
  try {
    const { name } = req.body;

    const newCategory = new ProductCategoryModel({
      productCategory_name: name,
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

exports.getAllProductCategories = async (req, res) => {
  try {
    const ProductCategories = await ProductCategoryModel.find();
    res.status(200).json({
      success: true,
      data: ProductCategories,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการดึงข้อมูลหมวดหมู่",
      error: error.message,
    });
  }
};
exports.getProductCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const ProductCategory = await ProductCategoryModel.findById(id);
    if (!ProductCategory) {
      return res.status(404).json({
        success: false,
        message: "ไม่พบหมวดหมู่ที่ต้องการ",
      });
    }
    res.status(200).json({
      success: true,
      data: ProductCategory,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการดึงข้อมูลหมวดหมู่",
      error: error.message,
    });
  }
};

exports.updateProductCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const updatedProductCategory = await ProductCategoryModel.findByIdAndUpdate(
      id,
      { productCategory_name: name },
      { new: true },
    );
    if (!updatedProductCategory) {
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

exports.deleteProductCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedProductCategory = await ProductCategoryModel.findByIdAndDelete(id);
    if (!deletedProductCategory) {
      return res.status(404).json({
        success: false,
        message: "ไม่พบหมวดหมู่ที่ต้องการลบ",
      });
    }
    res.status(200).json({
      success: true,
      message: "ลบหมวดหมู่สำเร็จ",
      data: deletedProductCategory,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการลบหมวดหมู่",
      error: error.message,
    });
  }
};
