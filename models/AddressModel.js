// addressSchema.js
const mongoose = require("mongoose");
const usersModel = require("./usersModel");
const Schema = mongoose.Schema;

const addressSchema = new Schema(
  {
    users_id: {
      type: Schema.Types.ObjectId,
      ref: "Users",
      required: true,
    },
    label: {
      type: String,
      enum: ["home", "office", "other"],
      default: "home",
    },

    address_line: { type: String, required: true }, // บ้านเลขที่ หมู่ ซอย ถนน

    // เก็บ reference ไปที่ Geography document (ระดับ subdistrict)
    // 1 document ของ Geography มีข้อมูลครบทั้ง จังหวัด/อำเภอ/ตำบล
    geography_id: {
      type: Schema.Types.ObjectId,
      ref: "Geography",
      required: true,
    },

    // snapshot ไว้แสดงผลโดยไม่ต้อง populate ทุกครั้ง
    postal_code: { type: Number, required: true },
    subdistrict_name: { type: String, required: true },
    district_name: { type: String, required: true },
    province_name: { type: String, required: true },

    is_default: { type: Boolean, default: false },
  },
  { _id: true }
);

module.exports = addressSchema;