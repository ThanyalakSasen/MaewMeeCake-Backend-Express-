const ProductcategoryController = require("../controllers/ProductCategoryController");
const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/authMiddleware");

// Public routes
router.post("/", protect, ProductcategoryController.createProductCategory);
router.put("/updateCategory/:id", protect, ProductcategoryController.updateProductCategory);
router.delete("/deleteCategory/:id", protect, ProductcategoryController.deleteProductCategory);
router.get("/allCategory", ProductcategoryController.getAllProductCategories);
router.get("/getByIdCategory/:id", ProductcategoryController.getProductCategoryById);

exports = module.exports = router;