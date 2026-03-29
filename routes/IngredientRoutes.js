const ingredientController = require('../controllers/IngredientsController');
const { checkIngredientName } = require('../middlewares/CheckDuplicate'); // ← import จาก middleware
const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');

router.get('/allIngredient', ingredientController.getAllIngredient);
router.get('/check-name', checkIngredientName);                           // ← ใช้จาก middleware
router.get('/inactive', ingredientController.getInactiveIngredient);
router.get('/categories/all', ingredientController.getAllIngredientCategory);
router.get('/getByIdIngredient/:id', ingredientController.getIngredientById);

router.post('/', protect, ingredientController.createIngredient);
router.post('/categories', protect, ingredientController.createIngredientCategory);

router.put('/updateIngredient/:id', protect, ingredientController.updateIngredient);
router.put('/restore/:id', protect, ingredientController.restoreIngredient);
router.put('/categories/:id', protect, ingredientController.updateIngredientCategory);

router.delete('/softDeleteIngredient/:id', protect, ingredientController.softDeleteIngredient);
router.delete('/categories/:id/soft-delete', protect, ingredientController.softDeleteIngredientCategory);

exports = module.exports = router;