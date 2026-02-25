const productController = require('../controllers/ProductController');
const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');

//Public Routes
router.get('/allProduct', productController.getAllProducts);
router.get('/getByIdProduct/:id', productController.getProductById);
//Protected Routes
router.post('/createProduct', protect, productController.createProduct);
router.put('/updateProduct/:id', protect, productController.updateProductById);
router.post('/softDeleteProduct/:id', protect, productController.softDeleteProductById);
router.put('/restoreProduct/:id', protect, productController.restoreProductById);
router.delete('/deleteProduct/:id', protect, productController.deleteProductById);
exports = module.exports = router;