// addressSchema.js
const mongoose = require("mongoose");
const usersModel = require("./UsersModel");
const Schema = mongoose.Schema;

const addressSchema = new Schema(
  {
    user_id: {
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
    sub_district: { type: String, required: true }, // ตำบล
    district: { type: String, required: true }, // อำเภอ
    province: { type: String, required: true }, // จังหวัด
    postal_code: { type: String, required: true }, // รหัสไปรษณีย์
  },
  { timestamps: true }
);

module.exports = mongoose.model("Address", addressSchema);