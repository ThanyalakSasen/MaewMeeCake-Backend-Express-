const recipesController = require('../controllers/RecipesController');
const recipeComponentController = require('../controllers/RecipesComponentController');
const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');

router.get('/getAllRecipes', protect, recipesController.getAllRecipes);
router.get('/getRecipeById/:id', protect, recipesController.getRecipeById);
router.get('/getAllRecipeComponents', protect, recipeComponentController.getAllRecipes);
router.get('/getRecipeComponentById/:id', protect, recipeComponentController.getRecipeById);
//เฉพาะเจ้าของร้านเท่านั้นที่สามารถสร้าง แก้ไข และลบสูตรอาหารได้

router.post('/createRecipe', protect, recipesController.createRecipe);
router.put('/updateRecipe/:id', protect, recipesController.updateRecipe);
router.delete('/softDeleteRecipe/:id', protect, recipesController.softDeleteRecipe);
router.put('/restoreRecipe/:id', protect, recipesController.restoreRecipe);
router.delete('/hardDeleteRecipe/:id', protect, recipesController.hardDeleteRecipe);

router.post('/createRecipeComponent', protect, recipeComponentController.createRecipe);
router.put('/updateRecipeComponent/:id', protect, recipeComponentController.updateRecipe);
router.delete('/softDeleteRecipeComponent/:id', protect, recipeComponentController.deleteRecipe);
router.put('/restoreRecipeComponent/:id', protect, recipeComponentController.restoreRecipe);
router.get('/getDeletedRecipeComponents', protect, recipeComponentController.getInactiveRecipes);
router.delete('/hardDeleteRecipeComponent/:id', protect, recipeComponentController.deletePermanent);


module.exports = router;