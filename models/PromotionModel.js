const mongoose = require("mongoose");

const promotionSchema = new mongoose.Schema(
  {
    promotion_name: {
      type: String,
      required: true,
    }, //ชื่อโปรโมชั่น
    description: {
      type: String,
      required: false,
    }, //คำอธิบายเพิ่มเติมเกี่ยวกับโปรโมชั่น
    code: {
      type: String,
      unique: true,
      required: false,
    }, //รหัสโปรโมชั่นที่ไม่ซ้ำกัน
    typePromotion: {
      type: String,
      enum: ["PERCENTAGE", "FIXED_AMOUNT"],
      required: true,
    }, //ประเภทของโปรโมชั่น เช่น ส่วนลดเป็นเปอร์เซ็นต์หรือจำนวนเงินคงที่
    value: {
      type: Number,
      required: true,
    }, //ค่าของโปรโมชั่น เช่น 10% หรือ 100 บาท
    minSpend: {
      type: Number,
      default: 0,
    }, //ขั้นต่ำในการใช้โปรโมชั่น
    start_date: {
      type: Date,
      required: true,
    }, //วันที่เริ่มต้นของโปรโมชั่น
    end_date: {
      type: Date,
      default: null,
    }, //วันที่สิ้นสุดของโปรโมชั่น
    usage_limit: {
      type: Number,
      default: null,
    }, //จำนวนครั้งที่โปรโมชั่นนี้สามารถใช้ได้ (null หมายถึงไม่จำกัด)
    used_count: {
      type: Number,
      default: 0,
    }, //จำนวนครั้งที่โปรโมชั่นนี้ถูกใช้ไปแล้ว
    is_softdeleted: {
      type: Boolean,
      default: false,
    },
    applicableProducts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
    // หากใช้แบบด้านบน เวลาส่งข้อมูลจาก Frontend ต้องส่งเป็น [{type: "ID"}]
    // แต่ถ้าอยากส่งเป็น ["ID", "ID"] ให้แก้เป็น:
    applicableProducts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
  },
  { timestamps: true },
);

module.exports = mongoose.model("Promotion", promotionSchema);
