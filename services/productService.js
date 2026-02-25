const Product = require("../models/ProductModel");

// ตรวจสอบว่าสินค้าพร้อมขายหรือไม่
const productIsAvailable = (product) => {
  try {
    // กรณี 1: สินค้าพร้อมขาย
    if (product.availability_type === "ready") {
      return product.stock_quantity > 0; // มีสต็อกเหลือใช่ไหม
    }

    // กรณี 2: สินค้าพรีออเดอร์
    if (product.availability_type === "preorder") {
      const now = new Date();
      // ตรวจสอบว่าวันนี้อยู่ในช่วงเวลาเปิดรับพรีออเดอร์หรือไม่
      const isInTimeRange =
        product.preorder_open_dates &&
        product.preorder_close_dates &&
        now >= product.preorder_open_dates &&
        now <= product.preorder_close_dates;
      return isInTimeRange;
    }

    return false; // ไม่ใช่ประเภทใดเลย
  } catch (error) {
    console.log("เกิดข้อผิดพลาด :", error);
    return false;
  }
};

// ดึงสินค้าทั้งหมด
const getAllProducts = async () => {
  try {
    // 1. ค้นหาสินค้าทั้งหมด พร้อมรายละเอียดอื่นๆ
    const products = await Product.find()
      .populate("productcategories")
      .populate("recipe_id")
      .populate("unit_id");

    // 2. สร้างอาร์เรย์ใหม่พร้อมเพิ่มข้อมูล isAvailable
    const productsWithAvailability = products.map((product) => {
      // แปลง Mongoose document เป็น object ปกติ เพื่อเพิ่มข้อมูลใหม่ เป็น JSON
      const productData = product.toObject();

      // เพิ่มข้อมูล isAvailable เข้าไป
      productData.isAvailable = productIsAvailable(product);

      return productData;
    });

    return productsWithAvailability;
  } catch (error) {
    console.log("เกิดข้อผิดพลาด :", error);
    throw error;
  }
};

const getProductById = async (productId) => {
  try {
    const product = await Product.findById(productId)
      .populate("productcategories")
      .populate("recipe_id")
      .populate("unit_id");
    if (!product) {
      throw new Error("ไม่พบสินค้า");
    }
    const productData = product.toObject();
    productData.isAvailable = productIsAvailable(product);
    return productData;
  } catch (error) {
    console.log("เกิดข้อผิดพลาด :", error);
    throw error;
  }
};

const createProduct = async (productData) => {
  try {
    const newProduct = new Product(productData);
    const savedProduct = await newProduct.save();
    return savedProduct;
  } catch (error) {
    console.log("เกิดข้อผิดพลาด :", error);
    throw error;
  }
};

module.exports = {
  createProduct,
  productIsAvailable,
  getAllProducts,
  getProductById,
};