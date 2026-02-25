const UserModel = require("../models/UsersModel");
const PositionModel = require("../models/PositionModel");
const bcrypt = require("bcryptjs");

// @desc    สร้างผู้ใช้ใหม่ (Employee หรือ Customer) โดย Admin
// @route   POST /api/auth/admin/create-user
// @access  Private (Admin only)
exports.createEmployee = async (req, res) => {
  try {
    const {
      userFullname,
      email,
      password,
      authProvider = "local",
      userPhone,
      userBirthdate,
      role,
      isEmailVerified = true,
      profileCompleted = true,
      empPosition,
      startWorkingDate,
      employmentType,
      empSalary,
      partTimeHours,
      empStatus = "Active",
      softDelete = false,
    } = req.body;

    if (!userFullname || !email || !password || !role) {
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

    const hashedPassword = await bcrypt.hash(password, 10);

    const userData = {
      userFullname,
      email,
      password: hashedPassword,
      authProvider,
      userPhone,
      role,
      isEmailVerified,
      profileCompleted,
      softDelete,
      isActive: true,
    };

    if (userBirthdate) {
      userData.userBirthdate = new Date(userBirthdate);
    }

    if (req.file) {
      userData.userImg = `/uploads/users/${req.file.filename}`;
    }

    if (role === "Employee") {
      if (!empPosition || !startWorkingDate || !employmentType) {
        return res.status(400).json({
          success: false,
          message: "กรุณากรอกข้อมูลพนักงานให้ครบถ้วน",
        });
      }

      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, "0");
      const day = String(now.getDate()).padStart(2, "0");

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

      userData.empPosition = await resolvePositionId(empPosition);
      userData.startWorkingDate = new Date(startWorkingDate);
      userData.employmentType = employmentType;
      userData.empStatus = empStatus;

      console.log("Employee data before create:", {
        empId: userData.empId,
        empPosition: userData.empPosition,
        employmentType: userData.employmentType,
      });

      if (employmentType === "Full-time") {
        if (!empSalary) {
          return res.status(400).json({
            success: false,
            message: "กรุณากรอกเงินเดือน",
          });
        }
        userData.empSalary = Number(empSalary);
      }

      if (employmentType === "Part-time") {
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
      empId: newUser.empId,
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
    console.log("=== GET /api/auth/admin/employees ===");
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
      .populate("empPosition")
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
    if (
      !employee ||
      employee.role !== "Employee" ||
      !employee.isActive ||
      employee.softDelete
    ) {
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
    if (
      !employee ||
      employee.role !== "Employee" ||
      !employee.isActive ||
      employee.softDelete
    ) {
      return res.status(404).json({
        success: false,
        message: "ไม่พบพนักงาน",
      });
    }
    const {
      userFullname,
      email,
      userPhone,
      userBirthdate,
      empPosition,
      startWorkinDate,
      lastWorkingDate = null,
      employmentType,
      empSalary,
      partTimeHours,
      empStatus,
    } = req.body;
    // อัพเดตข้อมูล
    if (userFullname) employee.userFullname = userFullname;
    if (email) employee.email = email;
    if (userPhone) employee.userPhone = userPhone;
    if (userBirthdate) employee.userBirthdate = userBirthdate;
    if (empPosition)
      employee.empPosition = await resolvePositionId(empPosition);
    if (startWorkinDate) employee.startWorkinDate = startWorkinDate;
    if (lastWorkingDate !== undefined)
      employee.lastWorkingDate = lastWorkingDate;
    if (employmentType) employee.employmentType = employmentType;
    if (empStatus) employee.empStatus = empStatus;
    if (employmentType === "Full-time" && empSalary) {
      employee.empSalary = empSalary;
      employee.partTimeHours = undefined; // ล้างชั่วโมงทำงานถ้าเปลี่ยนเป็น Full-time
    }
    if (employmentType === "Part-time" && partTimeHours) {
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

    if (!employee || employee.role !== "Employee" || employee.softDelete) {
      return res.status(404).json({ success: false, message: "ไม่พบพนักงาน" });
    }

    employee.softDelete = true;
    employee.isActive = false; // อาจจะยังคงสถานะ active ไว้เพื่อให้สามารถกู้คืนได้ง่าย
    employee.deletedAt = new Date();

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
    if (!employee || employee.role !== "Employee" || !employee.softDelete) {
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
    if (!employee || employee.role !== "Employee" || !employee.softDelete) {
      return res.status(404).json({
        success: false,
        message: "ไม่พบพนักงานที่ถูกลบ",
      });
    }
    employee.softDelete = false;
    employee.isActive = true;
    employee.deletedAt = undefined;
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
