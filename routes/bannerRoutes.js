const express = require("express");
const router = express.Router();
const bannerCtrl = require("../controllers/bannerController");

const multer = require("multer");
const upload = multer({ dest: "uploads/" });

router.get("/", bannerCtrl.getAllBanners);
router.post("/", upload.single("image"), bannerCtrl.createBanner);
router.put("/:id", upload.single("image"), bannerCtrl.updateBanner);
router.put("/:id/soft-delete", bannerCtrl.softDeleteBanner);

router.put("/:id/select", bannerCtrl.toggleSelectBanner);
router.get("/preview", bannerCtrl.previewBanners);
router.get("/inactive", bannerCtrl.getInactiveBanners);
router.put("/restore/:id", bannerCtrl.restoreBanner);
router.delete("/:id", bannerCtrl.deletePermanent);

module.exports = router;