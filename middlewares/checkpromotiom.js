const promotionModel = require("../models/PromotionModel");

const applyPromotion = async (req, res) => {
  try {
    const { code, cartItems } = req.body;

    if (!code || !cartItems) {
      return res.status(400).json({ message: "กรุณาระบุรหัสโปรโมชั่นและสินค้าในตะกร้า" });
    }

    const promotion = await promotionModel.findOne({
      code: code.trim(),
      is_softdeleted: false,
    });

    if (!promotion) {
      return res.status(404).json({ message: "ไม่พบโปรโมชั่นนี้" });
    }

    const now = new Date();

    if (promotion.is_softdeleted) {
      return res.status(400).json({ message: "โปรโมชั่นถูกปิดใช้งานแล้ว" });
    }

    if (now < promotion.start_date || (promotion.end_date && now > promotion.end_date)) {
      return res.status(400).json({ message: "โปรโมชั่นยังไม่เริ่มหรือหมดอายุแล้ว" });
    }

    if (
      promotion.usage_limit &&
      promotion.used_count >= promotion.usage_limit
    ) {
      return res.status(400).json({
        message: "โปรโมชั่นนี้ถูกใช้ครบจำนวนครั้งที่กำหนดแล้ว",
      });
    }

    const totalpromotion = cartItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    if (totalpromotion < promotion.minSpend) {
      return res.status(400).json({
        message: `ยอดซื้อขั้นต่ำสำหรับโปรโมชั่นนี้คือ ${promotion.minSpend} บาท`,
      });
    }

    let discount = 0;

    if (promotion.typePromotion === "PERCENTAGE") {
      discount = totalpromotion * (promotion.value / 100);
    } else if (promotion.typePromotion === "FIXED_AMOUNT") {
      discount = promotion.value;
    }

    if (discount > totalpromotion) {
      discount = totalpromotion;
    }

    const finalPrice = totalpromotion - discount;

    // เพิ่มจำนวนการใช้
    promotion.used_count += 1;
    await promotion.save();

    return res.json({
      total: totalpromotion,
      discount,
      finalPrice,
    });
  } catch (err) {
    res.status(500).json({ message: "Apply promotion failed" });
  }
};

module.exports = {  applyPromotion };