const categoryController = require("../controllers/CategoryController");
const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/authMiddleware");

// Public routes
router.post("/", protect, categoryController.createCategory);
router.put("/updateCategory/:id", protect, categoryController.updateCategory);
router.delete("/deleteCategory/:id", protect, categoryController.deleteCategory);
router.get("/allCategory", categoryController.getAllCategories);
router.get("/getByIdCategory/:id", categoryController.getCategoryById);

exports = module.exports = router;