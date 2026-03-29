const Banner = require("../models/bannerModel");

// =============================
// CREATE
// =============================
exports.createBanner = async (req, res, next) => {
  try {
    const { image_url, end_date, is_selected ,is_softdeleted } = req.body;

    let finalImageUrl = image_url ;

    if (req.file) {
      finalImageUrl = `http://localhost:3000/uploads/${req.file.filename}`;
    }

    const newBanner = await Banner.create({
      image_url: finalImageUrl,
      start_date: new Date(), // ✅ ตั้งอัตโนมัติ
      end_date: end_date || null,
      is_selected: is_selected !== false,
      is_softdeleted: is_softdeleted == true,
    });

    res.status(201).json(newBanner);
  } catch (err) {
    next(err);
  }
};

// =============================
// GET ALL (เฉพาะ active)
// =============================
exports.getAllBanners = async (req, res, next) => {
  try {
    const banners = await Banner.find({ is_softdeleted: false })
      .sort({ order: 1 }); 
    res.status(200).json(banners);
  } catch (err) {
    next(err);
  }
};

// =============================
// UPDATE
// =============================
exports.updateBanner = async (req, res, next) => {
  try {
    const { image_url, start_date, end_date,  is_selected } = req.body;

    let updateData = {};

    if (start_date) updateData.start_date = start_date;
    if (end_date) updateData.end_date = end_date;
    if (is_selected !== undefined) updateData.is_selected = is_selected;

    if (req.file) {
      updateData.image_url = `http://localhost:3000/uploads/${req.file.filename}`;
    } else if (image_url) {
      updateData.image_url = image_url;
    }

    const updatedBanner = await Banner.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!updatedBanner) {
      return res.status(404).json({ message: "Banner not found" });
    }

    res.json(updatedBanner);
  } catch (err) {
    next(err);
  }
};

// =============================
// SOFT DELETE
// =============================
exports.softDeleteBanner = async (req, res, next) => {
  try {
    const updatedBanner = await Banner.findByIdAndUpdate(
      req.params.id,
      { is_softdeleted: true },
      { new:  false }
    );

    if (!updatedBanner)
      return res.status(404).json({ message: "Banner not found" });

    res.json({ message: "Banner soft-deleted successfully" });
  } catch (err) {
    next(err);
  }
};

exports.toggleSelectBanner = async (req, res, next) => {
  try {
    const { is_selected } = req.body;

    const updated = await Banner.findByIdAndUpdate(
      req.params.id,
      { is_selected },
      { new: true }
    );

    res.json(updated);
  } catch (err) {
    next(err);
  }
};

exports.previewBanners = async (req, res, next) => {
  try {
    const banners = await Banner.find({
      is_selected: true,
      is_softdeleted: false
    }).sort({ order: 1 });

    res.json(banners);
  } catch (err) {
    next(err);
  }
};

exports.getInactiveBanners = async (req, res, next) => {
  try {
    const banners = await Banner.find({ is_softdeleted: true }).sort({ order: 1 });
    res.json(banners);
  } catch (err) {
    next(err);
  }
};

exports.restoreBanner = async (req, res, next) => {
  try {
    const updatedBanner = await Banner.findByIdAndUpdate(
      req.params.id,
      { is_softdeleted: false },
      { new: true }
    );

    if (!updatedBanner)
      return res.status(404).json({ message: "Banner not found" });

    res.json(updatedBanner);
  } catch (err) {
    next(err);
  }
};

exports.deletePermanent = async (req, res, next) => {
  try {
    await Banner.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted permanently" });
  } catch (err) {
    next(err);
  }
};