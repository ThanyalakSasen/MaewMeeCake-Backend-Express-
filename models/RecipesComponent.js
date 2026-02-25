const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// สูตรส่วนประกอบ (Component) สำหรับใช้ในสูตรหลัก (Recipe)
const RecipeComponentSchema = new Schema(
  {
    component_name: {
      type: String,
      required: true,
      trim: true,
      unique: true, // เช่น "บัตเตอร์ครีมวานิลลา", "สปันจ์เค้กช็อกโกแลต"
    },

    // คำอธิบาย component นี้คืออะไร
    component_description: {
      type: String,
      default: null,
    },

    // ได้ผลผลิตกี่หน่วยต่อครั้ง
    yield_amount: {
      type: Number,
      required: true,
      min: 0,
    },
    yield_unit_id: {
      type: Schema.Types.ObjectId,
      ref: "Unit",
      required: true,
    },

    // ส่วนผสม 
    ingredients: [
      {
        ingredient_id: {
          type: Schema.Types.ObjectId,
          ref: "Ingredient",
          required: true,
        },
        // snapshot ชื่อ
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
        // หมายเหตุ เช่น "อุณหภูมิห้อง", "ละลายแล้ว"
        note: {
          type: String,
          default: null,
        },
        _id: false,
      },
    ],

    // วิธีทำ
    steps: [
      {
        step_number: {
          type: Number,
          required: true,
        },
        title: {
          type: String,
          required: true,
        },
        description: {
          type: String,
          default: null,
        },
        duration_minutes: {
          type: Number,
          default: null,
        },
        temperature_celsius: {
          type: Number,
          default: null,
        },
        substeps: [
          {
            substep_number: { type: Number },
            description: { type: String },
            _id: false,
          },
        ],
        _id: false,
      },
    ],

    // ต้นทุนโดยประมาณต่อ batch ของ component นี้
    estimated_cost: {
      type: Number,
      default: null,
    },

    // เวลาที่ใช้โดยประมาณ
    total_time_minutes: {
      type: Number,
      default: null,
    },

    softDelete: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);


RecipeComponentSchema.index({ component_name: "text" });
RecipeComponentSchema.index({ softDelete: 1 });

module.exports =
  mongoose.models.RecipeComponent ||
  mongoose.model("recipecomponents", RecipeComponentSchema);