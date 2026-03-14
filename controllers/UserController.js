const UserModel = require("../models/UsersModel");
const PositionModel = require("../models/PositionModel");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const resolvePositionId = async (emp_position) => {
  if (!emp_position) return undefined;
  if (mongoose.Types.ObjectId.isValid(emp_position)) return emp_position;

  const existingPosition = await PositionModel.findOne({
    position_name: emp_position,
    deletedAt: null,
  });

  if (existingPosition) return existingPosition._id;

  const createdPosition = await PositionModel.create({
    position_name: emp_position,
  });

  return createdPosition._id;
};

const isActiveEmployee = (employee) =>
  employee && employee.role === "Employee" && employee.is_active && !employee.softDelete;

const isSoftDeletedEmployee = (employee) =>
  employee && employee.role === "Employee" && employee.softDelete;

const buildEmployeeId = async () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  const yearPrefix = `emp${year}`;
  const count = await UserModel.countDocuments({
    emp_id: { $regex: `^${yearPrefix}` },
  });

  const sequence = String(count + 1).padStart(3, "0");
  return `${yearPrefix}${month}${day}${sequence}`;
};

const applyEmploymentTypeForCreate = (
  userData,
  employment_type,
  emp_salary,
  part_time_hours,
) => {
  if (employment_type === "Full-time") {
    if (!emp_salary) return "กรุณากรอกเงินเดือน";
    userData.emp_salary = Number(emp_salary);
  }

  if (employment_type === "Part-time") {
    if (!part_time_hours) return "กรุณากรอกชั่วโมงทำงาน";
    userData.part_time_hours = Number(part_time_hours);
  }

  return null;
};

// @desc    สร้างผู้ใช้ใหม่ (Employee หรือ Customer) โดย Admin
// @route   POST /api/auth/admin/create-user
// @access  Private (Admin only)
exports.createEmployee = async (req, res) => {
  try {
    const {
      user_fullname,
      email,
      password,
      auth_provider = "local",
      user_phone,
      user_birthdate,
      role,
      is_email_verified = true,
      profile_completed = true,
      emp_position,
      start_working_date,
      employment_type,
      emp_salary,
      part_time_hours,
      emp_status = "Active",
      softDelete = false,
    } = req.body;

    if (!user_fullname || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: "กรุณากรอกข้อมูลให้ครบถ้วน",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร",
      });
    }

    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "อีเมลนี้ถูกใช้งานแล้ว",
      });
    }

    const userData = {
      user_fullname,
      email,
      password,
      auth_provider,
      user_phone,
      role,
      is_email_verified,
      profile_completed,
      softDelete,
      is_active: true,
    };

    if (user_birthdate) {
      userData.user_birthdate = new Date(user_birthdate);
    }

    if (req.file) {
      userData.user_img = `/uploads/users/${req.file.filename}`;
    }

    if (role === "Employee") {
      if (!emp_position || !start_working_date || !employment_type) {
        return res.status(400).json({
          success: false,
          message: "กรุณากรอกข้อมูลพนักงานให้ครบถ้วน",
        });
      }

      userData.emp_id = await buildEmployeeId();

      userData.emp_position = await resolvePositionId(emp_position);
      userData.start_working_date = new Date(start_working_date);
      userData.employment_type = employment_type;
      userData.emp_status = emp_status;

      console.log("Employee data before create:", {
        emp_id: userData.emp_id,
        emp_position: userData.emp_position,
        employment_type: userData.employment_type,
      });

      const employmentError = applyEmploymentTypeForCreate(
        userData,
        employment_type,
        emp_salary,
        part_time_hours,
      );
      if (employmentError) {
        return res.status(400).json({
          success: false,
          message: employmentError,
        });
      }
    }

    console.log("Final userData before create:", userData);
    const newUser = await UserModel.create(userData);
    console.log("Created user:", {
      id: newUser._id,
      emp_id: newUser.emp_id,
      email: newUser.email,
      role: newUser.role,
    });

    return res.status(201).json({
      success: true,
      message: "สร้างผู้ใช้สำเร็จ",
      data: newUser,
    });
  } catch (error) {
    console.error("Create Employee Error:", error);
    console.error("Error details:", error.message);
    console.error("Error stack:", error.stack);
    return res.status(500).json({
      success: false,
      message: error.message || "เกิดข้อผิดพลาดในระบบ",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// @desc    ดึงข้อมูลพนักงานทั้งหมด
// @route   GET /api/auth/admin/employees
// @access  Private (Admin only)
exports.getEmployees = async (req, res, next) => {
  try {
    console.log("=== GET /auth/admin/employees ===");
    console.log("Fetching employees...");

    const employees = await UserModel.find({
      role: "Employee",
      $or: [
        { softDelete: false },
        { softDelete: { $exists: false } },
        { softDelete: null },
      ],
    })
      .select("-password")
      .populate("emp_position")
      .sort({ createdAt: -1 });

    console.log("Employees found:", employees.length);

    res.status(200).json({
      success: true,
      count: employees.length,
      data: employees,
    });
  } catch (error) {
    console.error("Get Employees Error:", error);
    console.error("Error details:", error.message);
    res.status(500).json({
      success: false,
      message: error.message || "เกิดข้อผิดพลาดในการดึงข้อมูลพนักงาน",
    });
  }
};

// @desc    ดึงข้อมูลพนักงานที่ถูกลบ (Soft deleted)
// @route   GET /api/auth/admin/deleted-employees
// @access  Private (Admin only)
exports.getDeletedEmployees = async (req, res, next) => {
  try {
    const employees = await UserModel.find({
      role: "Employee",
      softDelete: true,
    })
      .select("-password")
      .sort({ deletedAt: -1 });

    res.status(200).json({
      success: true,
      count: employees.length,
      data: employees,
    });
  } catch (error) {
    console.error("Get Deleted Employees Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "เกิดข้อผิดพลาดในการดึงข้อมูลพนักงานที่ถูกลบ",
    });
  }
};

exports.getEmployeeById = async (req, res, next) => {
  try {
    const employee = await UserModel.findById(req.params.id).select(
      "-password",
    );
    if (!isActiveEmployee(employee)) {
      return res.status(404).json({
        success: false,
        message: "ไม่พบพนักงาน",
      });
    }
    res.status(200).json({
      success: true,
      data: employee,
    });
  } catch (error) {
    console.error("Get Employee By ID Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "เกิดข้อผิดพลาดในการดึงข้อมูลพนักงาน",
    });
  }
};

exports.updateEmployee = async (req, res, next) => {
  try {
    const employee = await UserModel.findById(req.params.id);
    if (!isActiveEmployee(employee)) {
      return res.status(404).json({
        success: false,
        message: "ไม่พบพนักงาน",
      });
    }
    const {
      user_fullname,
      email,
      user_phone,
      user_birthdate,
      emp_position,
      start_working_date,
      last_working_date = null,
      employment_type,
      emp_salary,
      part_time_hours,
      emp_status,
    } = req.body;
    // อัพเดตข้อมูล
    if (user_fullname) employee.user_fullname = user_fullname;
    if (email) employee.email = email;
    if (user_phone) employee.user_phone = user_phone;
    if (user_birthdate) employee.user_birthdate = user_birthdate;
    if (emp_position)
      employee.emp_position = await resolvePositionId(emp_position);
    if (start_working_date) employee.start_working_date = start_working_date;
    if (last_working_date !== undefined)
      employee.last_working_date = last_working_date;
    if (employment_type) employee.employment_type = employment_type;
    if (emp_status) employee.emp_status = emp_status;
    if (employment_type === "Full-time" && emp_salary) {
      employee.emp_salary = emp_salary;
      employee.part_time_hours = undefined; // ล้างชั่วโมงทำงานถ้าเปลี่ยนเป็น Full-time
    }
    if (employment_type === "Part-time" && part_time_hours) {
      employee.part_time_hours = part_time_hours;
      employee.emp_salary = undefined; // ล้างเงินเดือนถ้าเปลี่ยนเป็น Part-time
    }
    // บันทึกการเปลี่ยนแปลง
    await employee.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
      message: "อัพเดตข้อมูลพนักงานสำเร็จ",
      data: employee,
    });
  } catch (error) {
    console.error("Update Employee Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "เกิดข้อผิดพลาดในการอัพเดตข้อมูลพนักงาน",
    });
  }
};

// @desc    ลบพนักงาน (Soft delete)
// @route   DELETE /api/auth/admin/delete-employee/:id
// @access  Private (Admin only)
exports.softDeleteEmployee = async (req, res, next) => {
  try {
    const employee = await UserModel.findById(req.params.id);

    if (!isActiveEmployee(employee)) {
      return res.status(404).json({ success: false, message: "ไม่พบพนักงาน" });
    }

    employee.softDelete = true;
    employee.is_active = false; // อาจจะยังคงสถานะ active ไว้เพื่อให้สามารถกู้คืนได้ง่าย
    employee.deleted_at = new Date();

    await employee.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
      message: "ลบพนักงานสำเร็จ",
    });
  } catch (error) {
    console.error("Delete Employee Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "เกิดข้อผิดพลาดในการลบพนักงาน",
    });
  }
};

exports.hardDeletedEmployee = async (req, res, next) => {
  try {
    const employee = await UserModel.findById(req.params.id);
    if (!isSoftDeletedEmployee(employee)) {
      return res.status(404).json({
        success: false,
        message: "ไม่พบพนักงานที่ถูกลบ",
      });
    }
    await employee.deleteOne();

    res.status(200).json({
      success: true,
      message: "ลบพนักงานถาวรสำเร็จ",
    });
  } catch (error) {
    console.error("Hard Delete Employee Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "เกิดข้อผิดพลาดในการลบพนักงานถาวร",
    });
  }
};

exports.restoreEmployee = async (req, res, next) => {
  try {
    const employee = await UserModel.findById(req.params.id);
    if (!isSoftDeletedEmployee(employee)) {
      return res.status(404).json({
        success: false,
        message: "ไม่พบพนักงานที่ถูกลบ",
      });
    }
    employee.softDelete = false;
    employee.is_active = true;
    employee.deleted_at = undefined;
    await employee.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
      message: "กู้คืนพนักงานสำเร็จ",
    });
  } catch (error) {
    console.error("Restore Employee Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "เกิดข้อผิดพลาดในการกู้คืนพนักงาน",
    });
  }
};
