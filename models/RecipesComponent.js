const mongoose = require("mongoose");

const RecipeComponentSchema = new mongoose.Schema(
  {
    component_name: { 
      type: String, 
      required: true, 
      trim: true,
      unique: true,
    },
    
    yield_amount: { 
      type: Number, 
      required: true 
    },
    unit_id: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Unit", 
      required: true
    },
    ingredients: [
  {
    

    ingredient_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ingredient",
      default: null
    },

    
    quantity: {
      type: Number,
      required: true
    },

    unit_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Unit",
      required: true
    }
  }
],

    
    steps: [
      {
        step_number: Number,
        title: String,
        substeps: [
          {
            substep_number: String,
            description: String
          }
        ]
      }
    ],
    softDelete: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("recipecomponents", RecipeComponentSchema);