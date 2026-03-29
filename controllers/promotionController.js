const promotionModel = require("../models/PromotionModel");
const { applyPromotion } = require("../middlewares/checkpromotiom");


exports.getAllPromotions = async (req, res) => {
  try {
    const filter = req.query.showAll === "true" ? {} : { is_softdeleted: false };
    const promotions = await promotionModel
      .find(filter)
      .populate("applicableProducts", "product_name_th product_name_eng product_price")
    res.status(200).json(promotions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "โหลดโปรโมชั่นไม่สำเร็จ" });
  }
};

exports.createPromotion = async (req, res) => {
  try {
    const {
      promotion_name, typePromotion, value,
      start_date, end_date, code, description,
      minSpend, usage_limit, applicableProducts,
    } = req.body;

    if (!promotion_name || !typePromotion || !value) {
      return res.status(400).json({
        message: "promotion_name, typePromotion, value จำเป็นต้องมี",
      });
    }

    if (!start_date) {
      return res.status(400).json({ message: "start_date จำเป็นต้องมี" });
    }

    const newPromotion = new promotionModel({
      promotion_name,
      typePromotion,
      value,
      start_date: new Date(start_date),
      end_date: end_date || null,
      code: code ? code.toUpperCase() : null,
      description,
      minSpend,
      usage_limit,
      applicableProducts: applicableProducts || [],
    });

    await newPromotion.save();
    res.status(201).json(newPromotion);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: "รหัสโปรโมชั่น (code) นี้มีอยู่แล้ว" });
    }
    res.status(500).json({ message: "สร้างโปรโมชั่นไม่สำเร็จ" });
  }
};

exports.updatePromotion = async (req, res) => {
  try {
    const promotion = await promotionModel.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!promotion) {
      return res.status(404).json({ message: "ไม่พบโปรโมชั่น" });
    }
    res.json(promotion);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: "รหัสโปรโมชั่น (code) นี้มีอยู่แล้ว" });
    }
    res.status(500).json({ message: "อัปเดตโปรโมชั่นไม่สำเร็จ" });
  }
};

exports.softDeletePromotion = async (req, res) => {
  try {
    const promotion = await promotionModel.findByIdAndUpdate(
      req.params.id,
      { is_softdeleted: true },
      { new: true }
    );
    if (!promotion) {
      return res.status(404).json({ message: "ไม่พบโปรโมชั่น" });
    }
    res.json({ message: "ลบโปรโมชั่นสำเร็จ" });
  } catch (err) {
    res.status(500).json({ message: "ลบโปรโมชั่นไม่สำเร็จ" });
  }
};

exports.getPromotionById = async (req, res) => {
  try {
    const promotion = await promotionModel.findById(req.params.id).populate(
      "applicableProducts", "product_name_th product_name_eng product_price"
    );  
    if (!promotion) {
      return res.status(404).json({ message: "ไม่พบโปรโมชั่น" });
    }
    res.json(promotion);
  } catch (err) {
    res.status(500).json({ message: "โหลดโปรโมชั่นไม่สำเร็จ" });
  } 
};

exports.getrestore = async (req, res) => {
  try {
    // แก้ไข Filter ให้ดึงเฉพาะรายการที่เป็น true (ถูกลบแบบ Soft Delete)
    const filter = { is_softdeleted: true }; 
    
    const promotions = await promotionModel
      .find(filter)
      .populate("applicableProducts", "product_name_th product_name_eng product_price");

    res.status(200).json(promotions);
  } catch (err) {
    console.error("Error in getrestore:", err);
    res.status(500).json({ message: "โหลดรายการที่ถูกลบไม่สำเร็จ" });
  }
};

exports.restorePromotion = async (req, res) => {
  try {
    const { id } = req.params;
    // แก้จาก Promotion เป็น promotionModel
    const restored = await promotionModel.findByIdAndUpdate(
      id, 
      { is_softdeleted: false }, 
      { new: true }
    );
    
    if (!restored) return res.status(404).json({ message: "ไม่พบข้อมูล" });
    res.status(200).json(restored);
  } catch (error) {
    console.error("Error at restorePromotion:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};


exports.applyPromotion = applyPromotion;

