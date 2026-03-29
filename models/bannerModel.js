const mongoose = require("mongoose");

const bannerSchema = new mongoose.Schema(
  {
    
    image_url: {
      type: String,
      required: false,
    },
    start_date: {
      type: Date,
      required: false,
    },
    end_date: {
      type: Date,
      required: false,
    },
    is_selected: {
      type: Boolean,
      default: false,
    },
    is_softdeleted: {
      type: Boolean,
      default: false,
    },
    
  },
  { timestamps: true },
);

module.exports = mongoose.model("Banner", bannerSchema);
