const UserModel = require("../models/UsersModel");
const PositionModel = require("../models/PositionModel");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const sendVerifyEmail = require("../utils/sendVerifyEmail");
const passport = require("passport");
const AddressModel = require("../models/AddressModel");

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

// สร้าง JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

// ส่ง token พร้อม cookie
const sendTokenResponse = (user, statusCode, res) => {
  const token = generateToken(user._id);
  
  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  };
  
  res.status(statusCode).cookie('token', token, options).json({
    success: true,
    token,
    user: {
      id: user._id,
      email: user.email,
      name: user.user_fullname,
      role: user.role,
      isVerified: user.is_email_verified
    }
  });
};

// @desc    ลงทะเบียน
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const {
      user_fullname,
      email,
      password,
      user_phone,
      user_birthdate,
      user_allergies,
      googleId,
      houseNumber,
      address,
      address_line,
      address_line1,
      sub_district,
      district,
      province,
      postal_code,
    } = req.body;
    
    // Validation
    if (!user_fullname || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'กรุณากรอกข้อมูลให้ครบถ้วน'
      });
    }
    
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร'
      });
    }
    
    // ตรวจสอบว่ามี email นี้แล้วหรือยัง
    const normalizedEmail = email.toLowerCase();
    const existingUser = await UserModel.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'อีเมลนี้ถูกใช้งานแล้ว'
      });
    }
    const token = crypto.randomBytes(32).toString("hex");

    const hashedToken = crypto
            .createHash("sha256")
            .update(token)
            .digest("hex");
    // สร้าง user ใหม่
    const user = await UserModel.create({
      user_fullname,
      email: normalizedEmail,
      password,
      user_phone,
      user_birthdate,
      user_allergies: user_allergies || [],
      googleId: googleId || null,
      auth_provider: googleId ? 'google' : 'local',
      role: 'Customer',
      is_email_verified: false,
      profile_completed: true,
      email_verify_token: hashedToken,
      verification_token_expiry: Date.now() + 24 * 60 * 60 * 1000,
      is_active: true
    });

    const addressPayload = {
      address_line:
        address_line ||
        address_line1 ||
        houseNumber ||
        address?.address_line ||
        address?.address_line1 ||
        address?.addressLine ||
        "",
      sub_district:
        sub_district ||
        address?.sub_district ||
        address?.subdistrictNameTh ||
        address?.subDistrict ||
        address?.tambon ||
        "",
      district:
        district ||
        address?.district ||
        address?.districtNameTh ||
        address?.amphoe ||
        "",
      province:
        province ||
        address?.provinceNameTh ||
        address?.province ||
        "",
      postal_code:
        postal_code ||
        address?.postal_code ||
        address?.postalCode ||
        address?.zipcode ||
        "",
    };

    if (
      addressPayload.address_line &&
      addressPayload.sub_district &&
      addressPayload.district &&
      addressPayload.province &&
      addressPayload.postal_code
    ) {
      await AddressModel.create({
        user_id: user._id,
        label: "home",
        ...addressPayload,
      });
    }
    
    
    // ส่งอีเมลยืนยัน
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${token}`;
    
    const message = `
      <!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { 
      margin: 0; 
      padding: 0; 
      background-color: #FFFDF5; 
      font-family: 'Segoe UI', 'Kanit', Tahoma, sans-serif; 
    }
    .container { 
      max-width: 500px; 
      margin: 40px auto; 
      background: #ffffff; 
      border-radius: 30px; 
      overflow: hidden;
      box-shadow: 0 10px 25px rgba(245, 224, 150, 0.3);
      border: 1px solid #FDF2D2;
    }
    .header { 
      background-color: #FFD95A; 
      padding: 40px 20px; 
      text-align: center; 
    }
    .header h1 { 
      margin: 0; 
      color: #5D4037; 
      font-size: 26px;
      letter-spacing: 1px;
    }
    .content { 
      padding: 40px 30px; 
      color: #5D4037;
      line-height: 1.6;
      text-align: center;
    }
    .user-name {
      color: #8D6E63;
      font-size: 20px;
      display: block;
      margin-bottom: 10px;
    }
    .button { 
      display: inline-block; 
      padding: 16px 40px; 
      background-color: #FFD95A; 
      color: #5D4037 !important; 
      text-decoration: none; 
      border-radius: 50px; 
      margin: 30px 0; 
      font-weight: bold; 
      box-shadow: 0 4px 0 #F4B400;
      transition: all 0.2s;
    }
    .footer { 
      text-align: center; 
      padding: 25px; 
      background-color: #FFFEFA;
      color: #A1887F; 
      font-size: 13px;
      border-top: 1px dashed #FDF2D2;
    }
    .cat-icon {
      font-size: 45px;
      margin-bottom: 10px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="cat-icon">🐾</div>
      <h1>เหมียวมี เค้ก</h1>
      <p style="margin: 5px 0 0; color: #8D6E63; font-size: 14px;">Happiness is Homemade</p>
    </div>
    
    <div class="content">
      <span class="user-name">สวัสดีคุณ <strong>${user_fullname}</strong> 🐱</span>
      <p>ยินดีต้อนรับสู่ครอบครัวเหมียวมีนะคะ!<br>
      กรุณากดปุ่มด้านล่างเพื่อยืนยันอีเมลและเริ่มสั่งขนมได้เลยค่ะ</p>
      
      <a href="${verificationUrl}" class="button">ยืนยันอีเมลตรงนี้เมี๊ยว~</a>
      
      <div style="margin-top: 20px;">
        <p style="color: #A1887F; font-size: 13px; margin-bottom: 5px;">* ลิงก์นี้จะหมดอายุใน 24 ชั่วโมงเพื่อความปลอดภัย</p>
        <p style="color: #A1887F; font-size: 13px; margin: 0;">หากคุณไม่ได้สมัครสมาชิก สามารถลบอีเมลนี้ทิ้งได้เลยค่ะ</p>
      </div>
    </div>
    
    <div class="footer">
      <p><strong>MeawMee Cake & Bakery</strong></p>
      <p style="margin-top: 10px; opacity: 0.7;">© 2026 MeawMee Cake. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
    `;
    
    try {
      await sendVerifyEmail({
        email: user.email,
        subject: '✉️ ยืนยันอีเมลของคุณ - ร้านเบเกอร์รี่',
        html: message
      });
      
      res.status(201).json({
        success: true,
        //message: 'ลงทะเบียนสำเร็จ! กรุณาตรวจสอบอีเมลเพื่อยืนยันบัญชี',
        user: {
          id: user._id,
          email: user.email,
          name: user.user_fullname,
          isVerified: false
        }
      });
    } catch (err) {
      console.error('Email Error:', err);
      user.email_verify_token = undefined;
      user.verification_token_expiry = undefined;
      await user.save({ validateBeforeSave: false });
      
      return res.status(500).json({
        success: false,
        message: 'ไม่สามารถส่งอีเมลยืนยันได้ กรุณาลองใหม่อีกครั้ง'
      });
    }
  } catch (error) {
    console.error('Register Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'เกิดข้อผิดพลาดในการลงทะเบียน'
    });
  }
};

// @desc    เข้าสู่ระบบ
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  
  try {
    const { email, password } = req.body;
    
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'กรุณากรอกอีเมลและรหัสผ่าน'
      });
    }
    
    // หา user และดึง password มาด้วย
    const user = await UserModel.findOne({ 
  email: email.toLowerCase(),
  softDelete: false, 
      is_active: true 
}).select('+password');
    
    if (!user) {
      console.log("Login Debug: User not found for email:", email);
      return res.status(401).json({
        success: false,
        message: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง'
      });
    }

    console.log("Login Debug: User found, hashing comparison starts...");
    
    // ตรวจสอบว่าเป็น local account หรือไม่
    if (user.auth_provider !== 'local' || !user.password) {
      return res.status(401).json({
        success: false,
        message: 'บัญชีนี้ลงทะเบียนผ่าน Google กรุณาใช้ Sign in with Google'
      });
    }
    
    // ตรวจสอบรหัสผ่าน
    const isMatch = await user.matchPassword(password);
    console.log("Login Debug: Is Password Match? ->", isMatch);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง'
      });
    }
    
    // เตือนถ้ายังไม่ verify email
    if (!user.is_email_verified) {
      return res.status(403).json({
        success: false,
        message: 'กรุณายืนยันอีเมลก่อนเข้าสู่ระบบ',
        needVerification: true,
        email: user.email
      });
    }
    
    sendTokenResponse(user, 200, res);
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ'
    });
  }
};

// @desc    ยืนยันอีเมล
// @route   GET /api/auth/verify-email/:token
// @access  Public
exports.verifyEmail = async (req, res) => {
  try {
    
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    
    const user = await UserModel.findOne({
      email_verify_token: hashedToken,
      verification_token_expiry: { $gt: Date.now() }
    });
    
    if (!user) {
     
      console.log("Verify Failed: Token invalid or expired");
      return res.status(400).json({
        success: false,
        message: 'ลิงก์ยืนยันไม่ถูกต้องหรือหมดอายุแล้ว'
      });
    }
    
    user.is_email_verified = true;
    user.email_verify_token = undefined;
    user.verification_token_expiry = undefined;
    
    // สำคัญ: ใส่ validateBeforeSave เพื่อไม่ให้กระทบ Password
    await user.save({ validateBeforeSave: false });
    
    // ส่ง success กลับไปให้ Frontend
    return res.status(200).json({
      success: true,
      message: 'ยืนยันอีเมลสำเร็จ!'
    });

  } catch (error) {
    console.error('Verify Email Error:', error);
    // ถ้า error ต้อง return 500
    return res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการยืนยันอีเมล'
    });
  }
};

// @desc    ส่งอีเมลยืนยันใหม่
// @route   POST /api/auth/resend-verification
// @access  Public
exports.resendVerification = async (req, res, next) => {
  try {
    const { email } = req.body;
    
    const user = await UserModel.findOne({ email: email.toLowerCase(), is_active: true });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบอีเมลนี้ในระบบ'
      });
    }
    
    if (user.is_email_verified) {
      return res.status(400).json({
        success: false,
        message: 'อีเมลนี้ได้รับการยืนยันแล้ว'
      });
    }
    
    const verificationToken = user.createVerificationToken();
    await user.save({ validateBeforeSave: false });
    
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;
    
    const message = `
      <!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { 
      margin: 0; 
      padding: 0; 
      background-color: #FFFDF5; 
      font-family: 'Segoe UI', 'Kanit', Tahoma, sans-serif; 
    }
    .container { 
      max-width: 500px; 
      margin: 40px auto; 
      background: #ffffff; 
      border-radius: 30px; 
      overflow: hidden;
      box-shadow: 0 10px 25px rgba(245, 224, 150, 0.3);
      border: 1px solid #FDF2D2;
    }
    .header { 
      background-color: #FFD95A; 
      padding: 40px 20px; 
      text-align: center; 
    }
    .header h1 { 
      margin: 0; 
      color: #5D4037; 
      font-size: 26px;
      letter-spacing: 1px;
    }
    .content { 
      padding: 40px 30px; 
      color: #5D4037;
      line-height: 1.6;
      text-align: center;
    }
    .user-name {
      color: #8D6E63;
      font-size: 20px;
      display: block;
      margin-bottom: 10px;
    }
    .button { 
      display: inline-block; 
      padding: 16px 40px; 
      background-color: #FFD95A; 
      color: #5D4037 !important; 
      text-decoration: none; 
      border-radius: 50px; 
      margin: 30px 0; 
      font-weight: bold; 
      box-shadow: 0 4px 0 #F4B400;
      transition: all 0.2s;
    }
    .footer { 
      text-align: center; 
      padding: 25px; 
      background-color: #FFFEFA;
      color: #A1887F; 
      font-size: 13px;
      border-top: 1px dashed #FDF2D2;
    }
    .cat-icon {
      font-size: 45px;
      margin-bottom: 10px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="cat-icon">🐾</div>
      <h1>เหมียวมี เค้ก</h1>
      <p style="margin: 5px 0 0; color: #8D6E63; font-size: 14px;">Happiness is Homemade</p>
    </div>
    
    <div class="content">
      <span class="user-name">สวัสดีคุณ <strong>${user.user_fullname}</strong> 🐱</span>
      <p>ยินดีต้อนรับสู่ครอบครัวเหมียวมีนะคะ!<br>
      กรุณากดปุ่มด้านล่างเพื่อยืนยันอีเมลและเริ่มสั่งขนมได้เลยค่ะ</p>
      
      <a href="${verificationUrl}" class="button">ยืนยันอีเมลตรงนี้เมี๊ยว~</a>
      
      <div style="margin-top: 20px;">
        <p style="color: #A1887F; font-size: 13px; margin-bottom: 5px;">* ลิงก์นี้จะหมดอายุใน 24 ชั่วโมงเพื่อความปลอดภัย</p>
        <p style="color: #A1887F; font-size: 13px; margin: 0;">หากคุณไม่ได้สมัครสมาชิก สามารถลบอีเมลนี้ทิ้งได้เลยค่ะ</p>
      </div>
    </div>
    
    <div class="footer">
      <p><strong>MeawMee Cake & Bakery</strong>
      
      <p style="margin-top: 10px; opacity: 0.7;">© 2026 MeawMee Cake. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
    `;
    
    await sendVerifyEmail({
      email: user.email,
      subject: 'ยืนยันอีเมลของคุณ - ร้านเบเกอร์รี่',
      html: message
    });
    
    res.status(200).json({
      success: true,
      message: 'ส่งอีเมลยืนยันใหม่แล้ว กรุณาตรวจสอบอีเมลของคุณ'
    });
  } catch (error) {
    console.error('Resend Verification Error:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการส่งอีเมล'
    });
  }
};

// @desc    ขอรีเซ็ตรหัสผ่าน
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await UserModel.findOne({ email: email.toLowerCase(), is_active: true });
    if (!user) {
      return res.status(404).json({ message: "ไม่พบอีเมลนี้ในระบบ" });
    }

    if (user.auth_provider !== "local") {
      return res.status(400).json({
        message: "บัญชีนี้เข้าสู่ระบบด้วย Google",
      });
    }

    const resetToken = user.createResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    const html = `
      <!DOCTYPE html>
<html>
<head>
  <style>
    .email-container {
      max-width: 450px;
      margin: 20px auto;
      padding: 30px;
      background-color: #ffffff;
      border: 1px solid #fdf2d2;
      border-radius: 24px;
      text-align: center;
      box-shadow: 0 4px 15px rgba(245, 224, 150, 0.2);
    }
    .header-icon {
      font-size: 40px;
      margin-bottom: 10px;
    }
    h2 {
      color: #8d6e63; /* สีน้ำตาลอบอุ่นเหมือนขนมปัง */
      margin-top: 0;
      font-size: 24px;
    }
    p {
      color: #5d4037;
      line-height: 1.6;
      font-size: 16px;
    }
    .reset-button {
      display: inline-block;
      padding: 14px 32px;
      margin: 20px 0;
      background-color: #ffecb3; /* สีเหลืองนวล */
      color: #5d4037 !important;
      text-decoration: none;
      font-weight: bold;
      border-radius: 50px;
      transition: background-color 0.3s;
    }
    .footer-text {
      font-size: 13px;
      color: #a1887f;
      margin-top: 25px;
      border-top: 1px dashed #fdf2d2;
      padding-top: 20px;
    }
  </style>
</head>
<body style="font-family: 'Kanit', Arial, sans-serif; background-color: #fffdf7; padding: 20px;">

  <div class="email-container">
    <div class="header-icon">🥐</div>
    <h2>รีเซ็ตรหัสผ่าน</h2>
    
    <p>สวัสดีคุณ <strong>${user.user_fullname}</strong></p>
    <p>เราได้รับคำขอเปลี่ยนรหัสผ่านสำหรับบัญชีของคุณ<br>คุณสามารถกดปุ่มด้านล่างเพื่อดำเนินการต่อได้เลยค่ะ</p>
    
    <a href="${resetUrl}" class="reset-button">ตั้งรหัสผ่านใหม่</a>
    
    <p class="footer-text">
      * ลิงก์นี้จะหมดอายุภายใน 1 ชั่วโมง เพื่อความปลอดภัย<br>
      หากคุณไม่ได้เป็นผู้ส่งคำขอนี้ สามารถเพิกเฉยต่ออีเมลฉบับนี้ได้ทันที
    </p>
  </div>

</body>
</html>
    `;

    await sendVerifyEmail({
      email: user.email,
      subject: "รีเซ็ตรหัสผ่าน",
      html,
    });

    // ✅ ส่งสำเร็จแล้ว → frontend จะพาไป login
    res.json({ message: "ส่งลิงก์รีเซ็ตรหัสผ่านไปยังอีเมลแล้ว" });
  } catch (err) {
    res.status(500).json({ message: "เกิดข้อผิดพลาด" });
  }
};

// @desc    รีเซ็ตรหัสผ่าน
// @route   POST /api/auth/reset-password/:token
// @access  Public
exports.resetPassword = async (req, res) => {
  try {
    const hashedToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    const user = await UserModel.findOne({
      reset_password_token: hashedToken,
      reset_password_token_expiry: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        message: "ลิงก์ไม่ถูกต้องหรือหมดอายุแล้ว",
      });
    }

    const { password } = req.body;
    if (!password || password.length < 6) {
      return res.status(400).json({
        message: "รหัสผ่านต้องอย่างน้อย 6 ตัวอักษร",
      });
    }

    user.password = password;
    user.reset_password_token = undefined;
    user.reset_password_token_expiry = undefined;
    await user.save();

    res.json({ message: "รีเซ็ตรหัสผ่านสำเร็จ" });
  } catch (err) {
    res.status(500).json({ message: "เกิดข้อผิดพลาด" });
  }
};


exports.verifyResetToken = async (req, res) => {
  try {
    const hashedToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    const user = await UserModel.findOne({
      reset_password_token: hashedToken,
      reset_password_token_expiry: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(401).json({ valid: false });
    }

    return res.json({ valid: true });
  } catch (err) {
    return res.status(500).json({ valid: false });
  }
};


// @desc    ข้อมูลผู้ใช้ปัจจุบัน
// @route   GET /api/auth/me
// @access  Private
// @desc    ข้อมูลผู้ใช้ปัจจุบัน
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await UserModel.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบผู้ใช้'
      });
    }
    
    console.log('=== GET /auth/me ===');
    console.log('User ID:', user._id);
    console.log('Email:', user.email);
    console.log('profileCompleted:', user.profile_completed);
    console.log('========================');
    
    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        user_fullname: user.user_fullname,  // ใช้ชื่อเดียวกับ DB
        role: user.role,
        user_phone: user.user_phone,
        user_birthdate: user.user_birthdate,
        user_allergies: user.user_allergies,
        user_img: user.user_img,
        isEmailVerified: user.is_email_verified,
        authProvider: user.auth_provider,
        profileCompleted: user.profile_completed
      }
    });
  } catch (error) {
    console.error('Get Me Error:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาด'
    });
  }
};


// @desc    ออกจากระบบ
// @route   POST /api/auth/logout
// @access  Private
exports.logout = async (req, res, next) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });
  
  res.status(200).json({
    success: true,
    message: 'ออกจากระบบสำเร็จ'
  });
};

// @desc    Google OAuth
// @route   GET /api/auth/google
// @access  Public
exports.googleAuth = passport.authenticate('google', {
  scope: ['profile', 'email']
});

// @desc    Google OAuth Callback
// @route   GET /api/auth/google/callback
// @access  Public
exports.googleAuthCallback = (req, res, next) => {
  passport.authenticate('google', { session: false }, async (err, user) => {

    // console.log("🔥 GOOGLE CALLBACK USER:");
    // console.log("ID:", user?._id);
    // console.log("Email:", user?.email);
    // console.log("profileCompleted:", user?.profileCompleted);

    if (err || !user) {
      console.log("❌ GOOGLE AUTH FAILED");
      return res.redirect(
        `${process.env.FRONTEND_URL}/login?error=google_failed`
      );
    }

    const token = generateToken(user._id);
    console.log("🔑 GENERATED TOKEN:", token);

    
    const redirectUrl = `${process.env.FRONTEND_URL}/auth/callback?token=${token}&profileCompleted=${user.profile_completed}`;


    console.log("➡️ REDIRECT TO:", redirectUrl);

    return res.redirect(redirectUrl);
  })(req, res, next);
};


exports.completeProfile = async (req, res, next) => {
  try {
    const { user_phone, user_birthdate, user_allergies } = req.body;
    
    const user = await UserModel.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบผู้ใช้'
      });
    }
    
    // ตรวจสอบว่ากรอกข้อมูลครบหรือไม่
    if (!user_phone || !user_birthdate) {
      return res.status(400).json({
        success: false,
        message: 'กรุณากรอกข้อมูลให้ครบถ้วน'
      });
    }
    
    // อัพเดตข้อมูล
    user.user_phone = user_phone;
    user.user_birthdate = user_birthdate;
    user.user_allergies = user_allergies || [];
    user.profile_completed = true;
    
    await user.save({ validateBeforeSave: false });
    
    res.status(200).json({
      success: true,
      message: 'บันทึกข้อมูลสำเร็จ',
      user: {
        id: user._id,
        email: user.email,
        name: user.user_fullname,
        phone: user.user_phone,
        birthDate: user.user_birthdate,
        allergies: user.user_allergies,
        profileCompleted: user.profile_completed
      }
    });
  } catch (error) {
    console.error('Complete Profile Error:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาด'
    });
  }
};

// @desc    อัพเดตข้อมูลผู้ใช้ (สำหรับ Google Login)
// @route   PUT /api/auth/update-profile
// @access  Private
exports.updateProfileCustomer = async (req, res, next) => {
  try {
    const { user_phone, user_birthdate, user_allergies } = req.body;
    
    const user = await UserModel.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบผู้ใช้'
      });
    }
    
    // อัพเดตเฉพาะข้อมูลที่ส่งมา
    if (user_phone) user.user_phone = user_phone;
    if (user_birthdate) user.user_birthdate = user_birthdate;
    if (user_allergies !== undefined) user.user_allergies = user_allergies;
    
    await user.save({ validateBeforeSave: false });
    
    res.status(200).json({
      success: true,
      message: 'อัพเดตข้อมูลสำเร็จ',
      user: {
        id: user._id,
        email: user.email,
        name: user.user_fullname,
        phone: user.user_phone,
        birthDate: user.user_birthdate,
        allergies: user.user_allergies,
      },
    });
  } catch (error) {
    console.error("Update Profile Error:", error);
    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาด",
    });
  }
};

// Backward-compatible alias for route handler naming
exports.updateProfile = exports.updateProfileCustomer;

