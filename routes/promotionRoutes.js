const express = require("express");
const router = express.Router();
const promoCtrl = require("../controllers/promotionController");

// specific routes ต้องอยู่เหนือ dynamic routes
router.get("/restore", promoCtrl.getrestore);
router.post("/apply", promoCtrl.applyPromotion);
router.post("/", promoCtrl.createPromotion);
router.get("/", promoCtrl.getAllPromotions);
router.get("/:id", promoCtrl.getPromotionById);
router.put("/:id/soft-delete", promoCtrl.softDeletePromotion);
router.put("/:id/restore", promoCtrl.restorePromotion);
router.put("/:id", promoCtrl.updatePromotion);

module.exports = router;