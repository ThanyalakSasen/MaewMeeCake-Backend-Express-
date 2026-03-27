const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Sub-schema: ส่วนผสม
const recipeIngredientSchema = new Schema(
  {
    ingredient_id: {
      type: Schema.Types.ObjectId,
      ref: "Ingredient",
      required: true,
    },
    // snapshot ชื่อ กันกระทบเมื่อแก้ชื่อวัตถุดิบ
    ingredient_name: {
      type: String,
      default: null,
    },
    quantity: {
      type: Number,
      required: true,
      min: 0,
    },
    unit_id: {
      type: Schema.Types.ObjectId,
      ref: "Unit",
      required: true,
    },
    // หมายเหตุเพิ่มเติม เช่น "ร่อนก่อนใช้", "ละลายให้เข้ากัน"
    note: {
      type: String,
      default: null,
    },
  },
  { _id: false },
);

// Sub-schema: ขั้นตอนการทำ
const recipeStepSchema = new Schema(
  {
    step_number: {
      type: Number,
      required: true,
    },
    title: {
      type: String,
      required: true, // เช่น "ผสมแป้ง", "อบ"
    },
    description: {
      type: String,
      default: null,
    },
    duration_minutes: {
      type: Number,
      default: null, // เวลาที่ใช้ในขั้นตอนนี้
    },
    temperature_celsius: {
      type: Number,
      default: null, // อุณหภูมิ เช่น 180 องศา
    },
    substeps: [
      {
        substep_number: { type: Number },
        description: { type: String },
        _id: false,
      },
    ],
  },
  { _id: false },
);

// Main Schema: สูตรขนม
const recipesSchema = new Schema(
  {
    recipe_name: {
      type: String,
      required: true,
      trim: true,
    },

    product_id: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      default: null,
    },

    // Component ที่ใช้ในสูตรนี้ เช่น ครีมชีส, สปันจ์เค้ก
    components: [
      {
        component_id: {
          type: Schema.Types.ObjectId,
          ref: "recipecomponents",
          required: true, // ต้องมี component จริง
        },
        component_name: { type: String, default: null }, // snapshot ยังคง optional
        quantity_used: { type: Number, required: true, min: 0 },
        unit_id: {
          type: Schema.Types.ObjectId,
          ref: "Unit",
          required: true,
        },
        _id: false,
      },
    ],
    // จำนวนที่ได้ต่อ batch
    yield_per_batch: {
      type: Number,
      default: null,
    },
    yield_unit_id: {
      type: Schema.Types.ObjectId,
      ref: "Unit",
      default: null, // หน่วยของ yield เช่น ชิ้น, โหล, กก.
    },


    // หมวดหมู่
    productcategories: {
      type: Schema.Types.ObjectId,
      ref: "ProductCategory",
      required: true,
    },

    // ส่วนผสม (วัตถุดิบตรงๆ ไม่ผ่าน component)
    ingredients: {
      type: [recipeIngredientSchema], // ต้องมีอย่างน้อย 1 รายการ หรือ มี component อย่างน้อย 1 รายการ
      validate: {
        validator: function (v) {
          // ต้องมีอย่างน้อย ingredients หรือ components อย่างใดอย่างหนึ่ง
          return v.length > 0 || this.components?.length > 0;
        },
        message: "ต้องมีส่วนผสมหรือ component อย่างน้อย 1 รายการ",
      },
      default: [],
    },

    // วิธีทำ
    steps: {
      type: [recipeStepSchema],
      validate: {
        validator: (v) => v.length > 0,
        message: "ต้องมีขั้นตอนการทำอย่างน้อย 1 ขั้นตอน",
      },
    },

    // หมายเหตุ/เคล็ดลับ
    recipe_note: {
      type: String,
      default: null,
    },

    // รูปสูตร
    recipe_img: {
      type: String,
      default: null,
    },

    // ผู้สร้าง
    creator_id: {
      type: Schema.Types.ObjectId,
      ref: "Users",
      default: null,
    },

    // ต้นทุนโดยประมาณต่อ batch (คำนวณแล้วเก็บไว้)
    estimated_cost_per_batch: {
      type: Number,
      default: null,
    },
    recipe_status: { // สถานะของสูตร เช่น draft(ร่างสูตรอยู่), published(), archived()
      type: String,
      enum: ["draft", "published", "archived"],
      default: "draft",
    },
  },
  { timestamps: true },
);

module.exports =
  mongoose.models.Recipes || mongoose.model("Recipes", recipesSchema);
