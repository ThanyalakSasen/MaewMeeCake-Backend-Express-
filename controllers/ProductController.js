const productModel = require("../models/ProductModel");
const recipeModel = require("../models/RecipesModel");
const ProductCategoryModel = require("../models/ProductCategoryModel");
const fs = require("fs");
const path = require("path");

const normalizeProductResponse = (productDoc) => {
  if (!productDoc) return productDoc;

  const product = typeof productDoc.toObject === "function"
    ? productDoc.toObject()
    : { ...productDoc };

  const category = product.productcategories;
  const categoryName =
    category && typeof category === "object"
      ? category.productcategoriesName ||
        category.category_name ||
        category.productCategory_name ||
        ""
      : "";

  return {
    ...product,
    product_type: product.product_type || categoryName || product.productcategories,
  };
};

// สร้างโฟลเดอร์ uploads/products ถ้ายังไม่มี
const uploadDir = path.join(__dirname, "../uploads/products");
//__dirname เป็น path ของโฟลเดอร์ที่ไฟล์ปัจจุบันอยู่ โดย Node.js จะกำหนดให้อัตโนมัติ
// เป็นเหมือน การระบุว่าตอนนี้อยู่ในโฟลเดอร์ controllers 
// ดังนั้น ../uploads/products จะหมายถึง โฟลเดอร์ uploads/products ที่อยู่ข้างนอก controllers
// ตัวอย่างเช่น ถ้าโครงสร้างโปรเจคเป็นแบบนี้:
// - controllers/
//   - ProductController.js  <-- __dirname จะเป็น path ของโฟลเดอร์นี้
// - uploads/
//   - products/           <-- ../uploads/products จะหมายถึงโฟลเดอร์นี้
console.log(__dirname);
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log("📁 Created directory:", uploadDir);
}
// Create a new product
exports.createProduct = async (req, res) => {
  try {
    console.log("=== Create Product Request ===");
    console.log("Body:", req.body);
    console.log("File:", req.file);

    const {
      product_name_th,
      product_name_eng,
      productcategories,
      product_type,
      product_description,
      preparation_heating,
      recipe_id,
    } = req.body;

    const normalizedCategoryId = productcategories || product_type;

    // Parse numeric values from FormData
    const product_price = parseFloat(req.body.product_price);

    // Get image path if uploaded
    const product_img = req.file ? `/uploads/products/${req.file.filename}` : null;

    console.log("Parsed values:", {
      product_name_th,
      product_name_eng,
      productcategories: normalizedCategoryId,
      product_price,
      product_img,
      recipe_id
    });

    if (
      !product_name_th ||
      !product_name_eng ||
      !normalizedCategoryId ||
      isNaN(product_price)
    ) {
      return res.status(400).json({ message: "กรุณากรอกข้อมูลให้ครบถ้วน" });
    }

    const categoryExists = await ProductCategoryModel.findById(normalizedCategoryId);
    if (!categoryExists) {
      return res.status(400).json({ message: "ไม่พบประเภทสินค้าที่ระบุ" });
    }

    if (recipe_id && !(await recipeModel.findById(recipe_id))) {
      return res.status(400).json({ message: "ไม่พบสูตรอาหารที่ระบุ" });
    }

    if (product_price < 0) {
      return res
        .status(400)
        .json({ message: "ราคาสินค้าต้องไม่เป็นค่าลบ" });
    }

    const existingProduct = await productModel.findOne({ product_name_th });
    if (existingProduct) {
      return res.status(409).json({ message: `มีสินค้าชื่อ "${product_name_th}" อยู่ในระบบแล้ว กรุณาใช้ชื่ออื่น` });
    }

    const newProduct = new productModel({
      product_name_th,
      product_name_eng,
      productcategories: normalizedCategoryId,
      product_price,
      product_img,
      product_description,
      preparation_heating,
      recipe_id: recipe_id && recipe_id !== "" ? recipe_id : null,
    });
    
    console.log("Creating product:", newProduct);
    const savedProduct = await newProduct.save();
    const populatedProduct = await productModel
      .findById(savedProduct._id)
      .populate("recipe_id")
      .populate("productcategories");
    console.log("Product saved successfully:", savedProduct._id);
    
    res.status(201).json({ success: true, data: normalizeProductResponse(populatedProduct) });
  } catch (error) {
    console.error("Create Product Error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Get all products
exports.getAllProducts = async (req, res) => {
  try {
    const products = await productModel
      .find({ $or: [{ softDelete: false }, { softDelete: { $exists: false } }] })
      .populate("recipe_id")
      .populate("productcategories");

    res.status(200).json(products.map(normalizeProductResponse));
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

// Get all soft-deleted products
exports.getDeletedProducts = async (req, res) => {
  try {
    const products = await productModel
      .find({ softDelete: true })
      .populate("recipe_id");

    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};
// Get a product by ID
exports.getProductById = async (req, res) => {
  try {
    const product = await productModel
      .findById(req.params.id)
      .populate("recipe_id")
      .populate("productcategories");
    if (!product) {
      return res.status(404).json({ message: "ไม่พบสินค้าที่ระบุ" });
    }
    res.status(200).json(normalizeProductResponse(product));
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

// Update a product by ID
exports.updateProductById = async (req, res) => {
  try {
    const {
      product_name_th,
      product_name_eng,
      productcategories,
      product_type,
      product_price,
      product_img,
      product_description,
      preparation_heating,
      recipe_id,
    } = req.body;

    const normalizedCategoryId = productcategories || product_type;
    const updateData = {};

    if (product_name_th !== undefined) updateData.product_name_th = product_name_th;
    if (product_name_eng !== undefined) updateData.product_name_eng = product_name_eng;
    if (normalizedCategoryId !== undefined) updateData.productcategories = normalizedCategoryId;
    if (product_price !== undefined) updateData.product_price = parseFloat(product_price);
    if (product_description !== undefined) updateData.product_description = product_description;
    if (preparation_heating !== undefined) updateData.preparation_heating = preparation_heating;


    if (normalizedCategoryId !== undefined) {
      const categoryExists = await ProductCategoryModel.findById(normalizedCategoryId);
      if (!categoryExists) {
        return res.status(400).json({ message: "ไม่พบประเภทสินค้าที่ระบุ" });
      }
      updateData.productcategories = normalizedCategoryId;
    }

    if (req.body.product_price !== undefined) {
      const numericPrice = parseFloat(req.body.product_price);
      if (isNaN(numericPrice) || numericPrice < 0) {
        return res.status(400).json({ message: "ราคาสินค้าไม่ถูกต้อง" });
      }
      updateData.product_price = numericPrice;
    }

    if (recipe_id !== undefined) {
      if (recipe_id && !(await recipeModel.findById(recipe_id))) {
        return res.status(400).json({ message: "ไม่พบสูตรอาหารที่ระบุ" });
      }
      updateData.recipe_id = recipe_id || null;
    }

    if (req.file) {
      updateData.product_img = `/uploads/products/${req.file.filename}`;
    } else if (product_img !== undefined) {
      updateData.product_img = product_img;
    }

    const updatedProduct = await productModel.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true },
    );
    if (!updatedProduct) {
      return res.status(404).json({ message: "ไม่พบสินค้าที่ระบุ" });
    }
    const populatedProduct = await productModel
      .findById(updatedProduct._id)
      .populate("recipe_id")
      .populate("productcategories");

    res.status(200).json(normalizeProductResponse(populatedProduct));
  } catch (error) {
    console.error("updateProductById error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
// Soft delete a product by ID
exports.softDeleteProductById = async (req, res) => {
  try {
    const deletedProduct = await productModel.findByIdAndUpdate(
      req.params.id,
      { softDelete: true },
      { new: true },
    );
    if (!deletedProduct) {
      return res.status(404).json({ message: "ไม่พบสินค้าที่ระบุ" });
    }
    res.status(200).json({ message: "ลบสินค้าสำเร็จ", deletedProduct });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

// Restore a soft-deleted product by ID
exports.restoreProductById = async (req, res) => {
  try {
    const restoredProduct = await productModel.findByIdAndUpdate(
      req.params.id,
      { softDelete: false },
      { new: true },
    );
    if (!restoredProduct) {
      return res.status(404).json({ message: "ไม่พบสินค้าที่ระบุ" });
    }
    res.status(200).json({ message: "กู้คืนสินค้าสำเร็จ", restoredProduct });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

exports.deleteProductById = async (req, res) => {
  try {
    const deletedProduct = await productModel.findByIdAndDelete(req.params.id);
    if (!deletedProduct) {
      return res.status(404).json({ message: "ไม่พบสินค้าที่ระบุ" });
    }
    res.status(200).json({ message: "ลบสินค้าสำเร็จ", deletedProduct });
  }
    catch (error) { 
    res.status(500).json({ message: "Server Error", error });
  }
};