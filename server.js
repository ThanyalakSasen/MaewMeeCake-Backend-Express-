const app = require("./app");
const connectDB = require("./config/db");

// Port
const PORT = process.env.PORT || 5000;

// Connect MongoDB
connectDB();

// after mongoose.connect(...) and connection established
require('./seeders/seedGrepgraphy');

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({
    message: err.message || "Internal Server Error",
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined
  });
});
// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
