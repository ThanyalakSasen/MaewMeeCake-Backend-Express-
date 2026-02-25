const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // โฟลเดอร์ที่เก็บไฟล์ที่อัพโหลด
    },
    filename: function (req, file, cb) {    
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname)); // ตั้งชื่อไฟล์ใหม่ด้วย unique suffix และนามสกุลเดิม
  }
});
const upload = multer({ storage: storage });

const userCtrl = require("../controllers/UserController");
const { protect } = require("../middlewares/authMiddleware");
// Admin routes (Protected)
router.post('/admin/create-user', protect, upload.single('user_img'), userCtrl.createEmployee);
router.get('/admin/employees', protect, userCtrl.getEmployees);
router.get('/admin/deleted-employees', protect, userCtrl.getDeletedEmployees);
router.get('/admin/employee/:id', protect, userCtrl.getEmployeeById);
router.put('/admin/update-info-employee-for-admin/:id', protect, upload.single('user_img'), userCtrl.updateEmployee);
router.delete('/admin/employees/:id/softDeleted', protect, userCtrl.softDeleteEmployee);
router.put('/admin/employees/:id/restore', protect, userCtrl.restoreEmployee);
router.delete('/admin/employees/:id/hardDeleted', protect, userCtrl.hardDeletedEmployee);

exports = module.exports = router;