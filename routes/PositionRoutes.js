const positionController = require('../controllers/PositionController');
const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');

// Public routes
router.post('/createPosition', protect, positionController.createPosition);
router.put('/updatePosition/:id', protect, positionController.updatePosition);
router.post('/softDeletePosition/:id', protect, positionController.deletePosition);
router.get('/allPosition', positionController.getAllPositions);

module.exports = router;