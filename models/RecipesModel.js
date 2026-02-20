const mongoose = require("mongoose");

/* ===============================
   Sub Schema : Ingredient
================================ */
const recipeIngredientSchema = new mongoose.Schema(
  {
    ingredient_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ingredient",
      default: null
    },
    ingredient_name: {
      type: String,
      required: true,
      trim: true
    },
    quantity: {
      type: Number,
      required: true
    },
    unit: {
      type: String,
      required: true
    }
  },
  { _id: false }
);

/* ===============================
   Sub Schema : Sub Step
================================ */
const recipeSubStepSchema = new mongoose.Schema(
  {
    substep_number: {
      type: String, // เช่น 1.1, 1.2
      required: true
    },
    description: {
      type: String,
      required: true
    }
  },
  { _id: false }
);

/* ===============================
   Sub Schema : Step
================================ */
const recipeStepSchema = new mongoose.Schema(
  {
    step_number: {
      type: Number,
      required: true
    },
    title: {
      type: String,
      required: true
    },
    substeps: [recipeSubStepSchema]
  },
  { _id: false }
);

/* ===============================
   Main Schema : Recipe
================================ */
const recipesSchema = new mongoose.Schema(
  {
    recipe_name: {
      type: String,
      required: true,
      trim: true
    },


    /* จำนวนที่ได้ */
    yield_per_batch: {
      type: Number,
      default: null
    },

    /* ประเภทสูตร */
    typerecipes: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TypeRecipe",
      required: true
    },

    /* หมวดหมู่ */
    productcategories: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProductCategory",
      required: true
    },

    /* ส่วนผสม */
    ingredients: {
      type: [recipeIngredientSchema],
      validate: v => v.length > 0
    },

    /* วิธีทำ */
    steps: {
      type: [recipeStepSchema],
      validate: v => v.length > 0
    },

    /* ผู้สร้าง */
    creator_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },

    /* สถานะ (Soft Delete) */
    recipe_status: {
      type: String,
      enum: ["active", "inactive", "deleted", "draft"],
      default: "active"
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.models.Recipes || mongoose.model("Recipes", recipesSchema);
