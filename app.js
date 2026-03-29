require('dotenv').config();
const express = require("express");
const mongoose = require('mongoose');
const cors = require("cors");
const cookieParser = require('cookie-parser');
const session = require("express-session");
const passport = require("./config/passport");
const helmet = require("helmet");
const path = require("path"); 

// ===== init =====
require("./models/UsersModel");
require("./models/PositionModel");
require("./models/UnitModel");
require("./models/IngredientModel");
require("./models/IngredientCategoryModel");

const authRoutes = require("./routes/AuthRoutes");
const addressRoutes = require("./routes/AddressRoute");
const emailRoutes = require("./routes/EmailRoutes");
const userRoutes = require("./routes/UserRoutes");
const recipeRoutes = require("./routes/RecipesRoutes");
const ProductCategoryRoutes = require("./routes/ProductCategoryRoutes");
const ingredientRoutes = require("./routes/IngredientRoutes");
const productRoutes = require("./routes/ProductRoutes");
const positionRoutes = require("./routes/PositionRoutes");
const unitRoutes = require("./routes/UnitRoutes");
const promotionRoutes = require("./routes/promotionRoutes");
const bannerRoutes = require("./routes/bannerRoutes");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));
app.use("/uploads", express.static(path.join(__dirname, "uploads"))); // ← serve รูป

// Session for Passport
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));
app.use(passport.initialize());
app.use(passport.session());

app.use(
  helmet({
    crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
    crossOriginEmbedderPolicy: false,
  })
);


// ===== routes =====
app.get("/", (req, res) => {
  res.send("Backend is running");
});

// ดัก chrome devtools error
app.get('/.well-known/appspecific/com.chrome.devtools.json', (req, res) => {
  res.status(204).end();
});

// CORS — อนุญาต frontend เข้าถึง
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173", // URL ของ Vite frontend
  credentials: true,
}));

// Serve static files จาก uploads/
app.use("/uploads", express.static(path.join(__dirname, "uploads")));


app.use("/auth", authRoutes);
app.use("/email", emailRoutes);
app.use("/user", userRoutes);
app.use("/recipe", recipeRoutes);
app.use("/product-category", ProductCategoryRoutes);
app.use("/ingredient", ingredientRoutes);
app.use("/product", productRoutes);
app.use("/position", positionRoutes);
app.use("/promotions", promotionRoutes);
app.use("/address", addressRoutes);
app.use("/unit", unitRoutes);
app.use("/banners", bannerRoutes);


// Global error handling middleware (เก็บไว้เพียงที่เดียว)
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        message: err.message || 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err : {}
    });
});

module.exports = app;