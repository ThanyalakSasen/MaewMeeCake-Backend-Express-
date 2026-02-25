const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const orderSchema = new Schema(
  {
    // ข้อมูลผู้สั่ง
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "Users",
      required: true,
    },

    // ประเภทออเดอร์
    order_type: {
      type: String,
      enum: ["ready", "preorder", "custom_cake"],
      required: true,
    },

    // รายการสินค้า
    products: [
      {
        product_id: {
          type: Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        // Snapshot ณ วันที่สั่ง (ป้องกันราคาเปลี่ยนในภายหลัง)
        product_name_th: {
          type: String,
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        unit_price: {
          type: Number,
          required: true,
        },
        subtotal: {
          type: Number,
          required: true, // quantity * unit_price
        },

        // สำหรับเค้ก custom
        customization: {
          cake_size: {
            type: String,
            default: null, // เช่น 6", 8", 10"
          },
          cake_flavor: {
            type: String,
            default: null, // เช่น ช็อกโกแลต, วานิลลา
          },
          frosting_type: {
            type: String,
            default: null, // เช่น บัตเตอร์ครีม, วิปครีม
          },
          decoration_text: {
            type: String,
            default: null, // ข้อความบนเค้ก
          },
          decoration_note: {
            type: String,
            default: null, // หมายเหตุพิเศษ
          },
          reference_img: {
            type: String,
            default: null, // URL รูปอ้างอิง
          },
        },
      },
    ],

    // ราคาและการชำระเงิน
    subtotal_amount: {
      type: Number,
      required: true, // ราคารวมก่อนหักส่วนลด
    },
    discount_amount: {
      type: Number,
      default: 0,
    },
    delivery_fee: {
      type: Number,
      default: 0,
    },
    total_amount: {
      type: Number,
      required: true, // subtotal - discount + delivery_fee
    },

    order_date: {
      type: Date,
      default: Date.now,
    },
    pickup_delivery_date: {
      type: Date,
      default: null, // วันนัดรับหรือจัดส่ง
    },

    // พรีออเดอร์
    preorder_open_date: {
      type: Date,
      default: null, // วันที่เปิดรับพรีออเดอร์
      required: function () {
        return this.order_type === "preorder";
      },
    },
    preorder_close_date: {
      type: Date,
      default: null, // วันที่ปิดรับพรีออเดอร์
      required: function () {
        return this.order_type === "preorder";
      },
    },
    preorder_min_order_price: {
      type: Number,
      default: null, // ราคาขั้นต่ำสำหรับพรีออเดอร์
      min: 0,
    },

    // ช่องทางรับสินค้า
    fulfillment_type: {
      type: String,
      enum: ["pickup", "delivery"],
      required: true,
    },
    shipping_address: {
      recipient_name: { type: String, default: null },
      phone: { type: String, default: null },
      address_line1: { type: String, default: null },
      address_line2: { type: String, default: null },
      district: { type: String, default: null },
      province: { type: String, default: null },
      postal_code: { type: String, default: null },
    },

    // สถานะออเดอร์
    status: {
      type: String,
      enum: [
        "pending",      // รอยืนยัน
        "confirmed",    // ยืนยันแล้ว
        "in_progress",  // กำลังทำ
        "ready",        // พร้อมส่ง/รับ
        "delivered",    // ส่ง/รับแล้ว
        "cancelled",    // ยกเลิก
      ],
      default: "pending",
    },
    cancel_reason: {
      type: String,
      default: null,
    },

    // การชำระเงิน
    payment_method: {
      type: String,
      enum: ["cash", "bank_transfer", "promptpay", "credit_card"],
      required: true,
    },
    payment_status: {
      type: String,
      enum: [
        "unpaid",           // ยังไม่ชำระ
        "pending_verify",   // รอเจ้าของร้านตรวจสอบสลิป
        "paid",             // ชำระแล้ว
        "refunded",         // คืนเงินแล้ว
      ],
      default: "unpaid",
    },
    payment_slip_img: {
      type: String,
      default: null, // URL สลิปโอนเงิน
    },
    payment_date: {
      type: Date,
      default: null, // วันที่ยืนยันการชำระเงิน
    },

    // พนักงาน/เจ้าของที่จัดการออเดอร์
    received_by: {
      type: Schema.Types.ObjectId,
      ref: "Users",
      default: null, // null = ลูกค้าสั่งเอง online
    },
    note_from_staff: {
      type: String,
      default: null,
    },

    // หมายเหตุจากลูกค้า
    customer_note: {
      type: String,
      default: null,
    },

    softDelete: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

// Virtuals

// เช็คว่าออเดอร์ถูกยกเลิกหรือยัง
orderSchema.virtual("isCancelled").get(function () {
  return this.status === "cancelled";
});

// เช็คว่าชำระเงินแล้วหรือยัง
orderSchema.virtual("isPaid").get(function () {
  return this.payment_status === "paid";
});

// เช็คว่าช่วงพรีออเดอร์เปิดอยู่ไหมตอนนี้
orderSchema.virtual("isPreorderOpen").get(function () {
  if (this.order_type !== "preorder") return false;
  const now = new Date();
  return now >= this.preorder_open_date && now <= this.preorder_close_date;
});

// Indexes (เพิ่ม performance ในการ query)
// 1 = เรียงจากน้อยไปมาก (Ascending)
// -1 = เรียงจากมากไปน้อย (Descending)

orderSchema.index({ user_id: 1 }).sort({ order_date: -1 }); // ค้นหาออเดอร์ของลูกค้า และเรียงออเดอร์จากใหม่สุดไปเก่าสุด
orderSchema.index({ status: 1 }); // ค้นหาออเดอร์ตามสถานะ (เช่น pending, confirmed)
orderSchema.index({ payment_status: 1 }); // ค้นหาออเดอร์ตามสถานะการชำระเงิน (เช่น unpaid, paid)
orderSchema.index({ order_type: 1 }); // ค้นหาออเดอร์ตามประเภท (เช่น ready, preorder)
orderSchema.index({ order_date: -1 }); // ค้นหาออเดอร์ใหม่ๆ ก่อน
orderSchema.index({ received_by: 1 }); // ค้นหาออเดอร์ที่พนักงานรับผิดชอบ

module.exports = mongoose.model("Order", orderSchema);