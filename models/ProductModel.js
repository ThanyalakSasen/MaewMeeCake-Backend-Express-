const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const productSchema = new Schema(
  {
    product_name_th: { type: String, required: true, trim: true },
    product_name_eng: { type: String, required: true, trim: true },
    productcategories: {
      type: Schema.Types.ObjectId,
      ref: "productcategories",
      required: true,
    },
    product_price: { type: Number, required: true },
    product_img: { type: String, default: null, trim: true },
    product_description: { type: String, default: null },
    preparation_heating: { type: String, default: null },

    //สูตรขนม ที่ใช้ในการผลิตสินค้า
    // 1 product มีได้ 1 สูตร
    recipe_id: {
      type: Schema.Types.ObjectId,
      ref: "Recipes",
      default: null,
    },

    // ข้อมูลการผลิต (Yield)
    yield_per_batch: { type: Number, default: null },
    unit_id: { type: Schema.Types.ObjectId, ref: "Unit", default: null },


    // ประเภทการจำหน่าย
    availability_type: {
      type: String,
      enum: ["ready", "preorder"],
      required: true,
      default: "ready",
    },

    // สินค้าพร้อมขาย
    stock_quantity: { type: Number, default: 0, min: 0 },

    // ข้อมูลพรีออเดอร์ (ถ้าเป็นสินค้าแบบพรีออเดอร์)
    isPreorderProduct: {
      type: Boolean,
      default: function () {
        return this.availability_type === "preorder";
      }
    },
    preorder_open_dates: { // ถ้าต้องการกำหนดช่วงเวลาที่เปิดรับพรีออเดอร์ เช่น เปิดรับพรีออเดอร์ทุกวันจันทร์-ศุกร์ เวลา 9:00-17:00
      type: Date,
      default: null,
      required: function () { return this.availability_type === "preorder"; },
    },
    preorder_close_dates: { // ถ้าต้องการกำหนดช่วงเวลาที่ปิดรับพรีออเดอร์ เช่น ปิดรับพรีออเดอร์ทุกวันเสาร์-อาทิตย์ หรือ ปิดรับพรีออเดอร์ทุกวันเวลา 17:00 เป็นต้น
      type: Date,
      default: null,
      required: function () { return this.availability_type === "preorder"; },
    },
    preorder_min_order_price: { // ถ้าต้องการกำหนดราคาขั้นต่ำสำหรับพรีออเดอร์
      type: Number,
      default: null,
      min: 0,
      required: function () { return this.availability_type === "preorder"; },
    },
    preorder_min_days: { type: Number, default: null }, // ถ้าต้องการกำหนดระยะเวลาล่วงหน้าที่ต้องสั่งซื้อ เช่น ต้องสั่งล่วงหน้าอย่างน้อย 3 วัน
    preorder_max_per_day: { type: Number, default: null }, // ถ้าต้องการจำกัดจำนวนพรีออเดอร์ต่อวัน


    creator_id: { type: Schema.Types.ObjectId, ref: "Users", default: null },
    softDelete: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);