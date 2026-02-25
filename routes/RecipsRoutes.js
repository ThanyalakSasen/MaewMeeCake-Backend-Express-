const recipesController = require('../controllers/RecipsController');
const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');

router.get('/getAllRecipes', protect, recipesController.getAllRecipes);
router.get('/getRecipeById/:id', protect, recipesController.getRecipeById);
//เฉพาะเจ้าของร้านเท่านั้นที่สามารถสร้าง แก้ไข และลบสูตรอาหารได้

router.post('/createRecipe', protect, recipesController.createRecipe);
router.put('/updateRecipe/:id', protect, recipesController.updateRecipe);
router.delete('/softDeleteRecipe/:id', protect, recipesController.softDeleteRecipe);
router.delete('/hardDeleteRecipe/:id', protect, recipesController.hardDeleteRecipe);




module.exports = router;