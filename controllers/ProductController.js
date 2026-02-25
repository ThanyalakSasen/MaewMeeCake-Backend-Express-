const productModel = require("../models/ProductModel");
const recipeModel = require("../models/RecipesModel");
const fs = require("fs");
const path = require("path");

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
      product_type,
      product_description,
      preparation_heating,
      recipe_id,
    } = req.body;

    // Parse numeric values from FormData
    const product_price = parseFloat(req.body.product_price);

    // Get image path if uploaded
    const product_img = req.file ? `/uploads/products/${req.file.filename}` : null;

    console.log("Parsed values:", {
      product_name_th,
      product_name_eng,
      product_type,
      product_price,
      product_img,
      recipe_id
    });

    if (
      !product_name_th ||
      !product_name_eng ||
      !product_type ||
      isNaN(product_price)
    ) {
      return res.status(400).json({ message: "กรุณากรอกข้อมูลให้ครบถ้วน" });
    }
    if (product_price < 0) {
      return res
        .status(400)
        .json({ message: "ราคาสินค้าต้องไม่เป็นค่าลบ" });
    }
    const newProduct = new productModel({
      product_name_th,
      product_name_eng,
      product_type,
      product_price,
      product_img,
      product_description,
      preparation_heating,
      recipe_id: recipe_id && recipe_id !== "" ? recipe_id : null,
    });
    
    console.log("Creating product:", newProduct);
    const savedProduct = await newProduct.save();
    console.log("Product saved successfully:", savedProduct._id);
    
    res.status(201).json({ success: true, data: savedProduct });
  } catch (error) {
    console.error("Create Product Error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Get all products
exports.getAllProducts = async (req, res) => {
  try {
    const products = await productModel
      .find({ softDelete: false })
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
      .populate("recipe_id");
    if (!product) {
      return res.status(404).json({ message: "ไม่พบสินค้าที่ระบุ" });
    }
    res.status(200).json(product);
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
      product_type,
      product_price,

      product_img,
      product_description,
      preparation_heating,
      recipe_id,
    } = req.body;
    if (recipe_id && !(await recipeModel.findById(recipe_id)))
      return res.status(400).json({ message: "ไม่พบสูตรอาหารที่ระบุ" });
    const updatedProduct = await productModel.findByIdAndUpdate(
      req.params.id,
      {
        product_name_th,
        product_name_eng,
        product_type,
        product_price,

        product_img,
        product_description,
        preparation_heating,
        recipe_id,
      },
      { new: true },
    );
    if (!updatedProduct) {
      return res.status(404).json({ message: "ไม่พบสินค้าที่ระบุ" });
    }
    res.status(200).json(updatedProduct);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
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