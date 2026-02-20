const positionController = require('../controllers/ProductController');
const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');

//Public Routes
router.get('/allProduct', positionController.getAllProducts);
router.get('/getByIdProduct/:id', positionController.getProductById);
//Protected Routes
router.post('/createProduct', protect, positionController.createProduct);
router.put('/updateProduct/:id', protect, positionController.updateProductById);
router.post('/softDeleteProduct/:id', protect, positionController.softDeleteProductById);
router.put('/restoreProduct/:id', protect, positionController.restoreProductById);
router.delete('/deleteProduct/:id', protect, positionController.deleteProductById);
exports = module.exports = router;