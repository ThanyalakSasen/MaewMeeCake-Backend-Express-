const recipesController = require('../controllers/RecipsController');
const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
// Public routes
router.get('/allRecipes', recipesController.getAllRecipes);
router.get('/getByIdRecipe/:id', recipesController.getRecipeById);
// Protected routes
router.post('/createRecipe', protect, recipesController.createRecipe);
router.put('/updateRecipe/:id', protect, recipesController.updateRecipe);
router.post('/softDeleteRecipe/:id', protect, recipesController.softDeleteRecipe);
router.put('/restoreRecipe/:id', protect, recipesController.restoreRecipe);


module.exports = router;