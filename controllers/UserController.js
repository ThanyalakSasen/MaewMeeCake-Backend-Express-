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
      userFullname,
      email,
      password,
      authProvider = "local",
      userPhone,
      user_phone,
      user_birthdate,
      userBirthdate,
      role,
      isEmailVerified = true,
      profileCompleted = true,
      empPosition,
      emp_position,
      startWorkingDate,
      start_working_date,
      employmentType,
      employment_type,
      empSalary,
      emp_salary,
      partTimeHours,
      empStatus = "Active",
      emp_status,
      softDelete = false,
    } = req.body;

    const normalizedFullname = user_fullname || userFullname;
    const normalizedPhone = userPhone || user_phone;
    const normalizedBirthdate = user_birthdate || userBirthdate;
    const normalizedPosition = empPosition || emp_position;
    const normalizedStartWorkingDate = startWorkingDate || start_working_date;
    const normalizedEmploymentType = employmentType || employment_type;
    const normalizedSalary =
      empSalary !== undefined && empSalary !== null ? empSalary : emp_salary;
    const normalizedEmpStatus = empStatus || emp_status;

    if (!normalizedFullname || !email || !password || !role) {
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
      user_fullname: normalizedFullname,
      email,
      password,
      authProvider,
      userPhone: normalizedPhone,
      role,
      is_email_verified,
      profile_completed,
      softDelete,
      is_active: true,
    };

    if (normalizedBirthdate) {
      userData.user_birthdate = new Date(normalizedBirthdate);
    }

    if (req.file) {
      userData.user_img = `/uploads/users/${req.file.filename}`;
    }

    if (role === "Employee") {
      if (
        !normalizedPosition ||
        !normalizedStartWorkingDate ||
        !normalizedEmploymentType
      ) {
        return res.status(400).json({
          success: false,
          message: "กรุณากรอกข้อมูลพนักงานให้ครบถ้วน",
        });
      }

      userData.emp_id = await buildEmployeeId();

      const yearPrefix = `emp${year}`;
      console.log("Year Prefix:", yearPrefix);

      const count = await UserModel.countDocuments({
        empId: { $regex: `^${yearPrefix}` },
      });
      console.log("Current employee count:", count);

      const sequence = String(count + 1).padStart(3, "0");
      const generatedEmpId = `${yearPrefix}${month}${day}${sequence}`;

      console.log("Generated emp_id:", generatedEmpId);
      userData.empId = generatedEmpId;

      userData.empPosition = await resolvePositionId(normalizedPosition);
      userData.startWorkingDate = new Date(normalizedStartWorkingDate);
      userData.employmentType = normalizedEmploymentType;
      userData.empStatus = normalizedEmpStatus;

      console.log("Employee data before create:", {
        emp_id: userData.emp_id,
        emp_position: userData.emp_position,
        employment_type: userData.employment_type,
      });

      if (normalizedEmploymentType === "Full-time") {
        if (!normalizedSalary) {
          return res.status(400).json({
            success: false,
            message: "กรุณากรอกเงินเดือน",
          });
        }
        userData.empSalary = Number(normalizedSalary);
      }

      if (normalizedEmploymentType === "Part-time") {
        if (!partTimeHours) {
          return res.status(400).json({
            success: false,
            message: "กรุณากรอกชั่วโมงทำงาน",
          });
        }
        userData.partTimeHours = Number(partTimeHours);
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

    if (
      error?.name === "ValidationError" ||
      error?.name === "CastError" ||
      error?.code === 11000
    ) {
      return res.status(400).json({
        success: false,
        message: error.message || "ข้อมูลไม่ถูกต้อง",
      });
    }

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
      userFullname,
      email,
      userPhone,
      user_phone,
      user_birthdate,
      userBirthdate,
      empPosition,
      emp_position,
      startWorkingDate,
      startWorkinDate,
      lastWorkingDate = null,
      employmentType,
      employment_type,
      empSalary,
      emp_salary,
      partTimeHours,
      empStatus,
      emp_status,
    } = req.body;

    const normalizedFullname = user_fullname || userFullname;
    const normalizedPhone = userPhone || user_phone;
    const normalizedBirthdate = user_birthdate || userBirthdate;
    const normalizedPosition = empPosition || emp_position;
    const normalizedStartWorkingDate = startWorkingDate || startWorkinDate;
    const normalizedEmploymentType = employmentType || employment_type;
    const normalizedEmpSalary =
      empSalary !== undefined && empSalary !== null ? empSalary : emp_salary;
    const normalizedEmpStatus = empStatus || emp_status;

    // อัพเดตข้อมูล
    if (normalizedFullname) employee.user_fullname = normalizedFullname;
    if (email) employee.email = email;
    if (normalizedPhone) employee.userPhone = normalizedPhone;
    if (normalizedBirthdate) employee.user_birthdate = normalizedBirthdate;
    if (normalizedPosition)
      employee.empPosition = await resolvePositionId(normalizedPosition);
    if (normalizedStartWorkingDate)
      employee.startWorkingDate = normalizedStartWorkingDate;
    if (lastWorkingDate !== undefined)
      employee.lastWorkingDate = lastWorkingDate;
    if (normalizedEmploymentType) employee.employmentType = normalizedEmploymentType;
    if (normalizedEmpStatus) employee.empStatus = normalizedEmpStatus;
    if (normalizedEmploymentType === "Full-time" && normalizedEmpSalary) {
      employee.empSalary = normalizedEmpSalary;
      employee.partTimeHours = undefined; // ล้างชั่วโมงทำงานถ้าเปลี่ยนเป็น Full-time
    }
    if (normalizedEmploymentType === "Part-time" && partTimeHours) {
      employee.partTimeHours = partTimeHours;
      employee.empSalary = undefined; // ล้างเงินเดือนถ้าเปลี่ยนเป็น Part-time
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
