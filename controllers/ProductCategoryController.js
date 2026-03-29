const ProductCategoryModel = require("../models/ProductCategoryModel");

const normalizeCategoryResponse = (categoryDoc) => {
  if (!categoryDoc) return categoryDoc;

  const category = typeof categoryDoc.toObject === "function"
    ? categoryDoc.toObject()
    : { ...categoryDoc };

  const normalizedName =
    category.productcategoriesName ||
    category.category_name ||
    category.productCategory_name ||
    "";

  return {
    ...category,
    productcategoriesName: normalizedName,
    category_name: normalizedName,
    productCategory_name: normalizedName,
  };
};

exports.createProductCategory = async (req, res) => {
  try {
    const { name, category_name, productCategory_name, productcategoriesName } = req.body;
    const normalizedName =
      productcategoriesName || category_name || productCategory_name || name;

    if (!normalizedName) {
      return res.status(400).json({
        success: false,
        message: "กรุณาระบุชื่อหมวดหมู่",
      });
    }

    const newCategory = new ProductCategoryModel({
      productcategoriesName: normalizedName,
    });
    const savedCategory = await newCategory.save();
    res.status(201).json({
      success: true,
      message: "สร้างหมวดหมู่สำเร็จ",
      data: normalizeCategoryResponse(savedCategory),
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
    const ProductCategories = await ProductCategoryModel.find({
      $or: [{ softDelete: false }, { softDelete: { $exists: false } }],
    });
    res.status(200).json({
      success: true,
      data: ProductCategories.map(normalizeCategoryResponse),
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
      data: normalizeCategoryResponse(ProductCategory),
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
    const { name, category_name, productCategory_name, productcategoriesName } = req.body;
    const normalizedName =
      productcategoriesName || category_name || productCategory_name || name;

    if (!normalizedName) {
      return res.status(400).json({
        success: false,
        message: "กรุณาระบุชื่อหมวดหมู่",
      });
    }

    const updatedProductCategory = await ProductCategoryModel.findByIdAndUpdate(
      id,
      { productcategoriesName: normalizedName },
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
      data: normalizeCategoryResponse(updatedProductCategory),
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
