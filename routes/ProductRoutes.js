const productController = require('../controllers/ProductController');
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { protect } = require('../middlewares/authMiddleware');

const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, productUploadDir);
	},
	filename: (req, file, cb) => {
		const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
		cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
	},
});

const upload = multer({ storage });

//Public Routes
router.get('/allProduct', productController.getAllProducts);
router.get('/deletedProducts', productController.getDeletedProducts);
router.get('/getByIdProduct/:id', productController.getProductById);
//Protected Routes
router.post('/createProduct', protect, upload.single('product_img'), productController.createProduct);
router.put('/updateProduct/:id', protect, upload.single('product_img'), productController.updateProductById);
router.post('/softDeleteProduct/:id', protect, productController.softDeleteProductById);
router.put('/restoreProduct/:id', protect, productController.restoreProductById);
router.delete('/deleteProduct/:id', protect, productController.deleteProductById);
exports = module.exports = router;