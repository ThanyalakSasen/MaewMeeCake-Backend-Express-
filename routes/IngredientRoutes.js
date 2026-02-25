const ingredientController = require('../controllers/IngredientsController');
const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');

// Public routes
router.post('/', protect, ingredientController.createIngredient);
router.put('/updateIngredient/:id', protect, ingredientController.updateIngredient);
router.delete('/softDeleteIngredient/:id', protect, ingredientController.softDeleteIngredient);
router.get('/allIngredient', ingredientController.getAllIngredient);
router.get('/getByIdIngredient/:id', ingredientController.getIngredientById);

exports = module.exports = router;