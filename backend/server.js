const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();

const { testConnection } = require("./config/database");
const googleSheetsService = require("./services/googleSheetsService");
const emailConfig = require("./config/email");

const feedbackRoutes = require("./routes/feedbackRoutes");
const {
  router: feedbackRoutesNew,
  adminRouter,
} = require("./routes/feedbackRoutesNew");
const orderRoutes = require("./routes/orderRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

const corsOptions = {
  origin: [
    process.env.FRONTEND_URL || "http://localhost:3000",
    "http://192.168.29.195:3000",
    "http://localhost:5000",
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/feedback", feedbackRoutesNew);
app.use("/api/admin", adminRouter);
app.use("/api/orders", orderRoutes);

// Legacy routes (backward compatibility)
app.use("/api/legacy/feedback", feedbackRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

app.use((err, req, res, next) => {
  console.error("Server Error:", err);
  res.status(500).json({
    success: false,
    message: "Internal server error",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

const startServer = async () => {
  try {
    const dbConnected = await testConnection();
    if (!dbConnected) {
      console.error(
        "Failed to connect to database. Please check your configuration.",
      );
      process.exit(1);
    }

    await googleSheetsService.initialize();
    console.log("Google Sheets service initialized");

    if (process.env.EMAIL_PROVIDER === "gmail") {
      await emailConfig.verifyConnection();
    }

    app.listen(PORT, "0.0.0.0", () => {
      console.log("==================================================");
      console.log("📦 Feedback System Backend Server Started");
      console.log("==================================================");
      console.log(`🚀 Local: http://localhost:${PORT}`);
      console.log(`🌐 Network: http://192.168.29.195:${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV || "development"}`);
      console.log(`💾 Database: ${process.env.DB_NAME}`);
      console.log(`📧 Email: ${process.env.EMAIL_PROVIDER || "gmail"}`);
      console.log("==================================================");
      console.log("\n📋 Available Endpoints (Task.md Compliant):");
      console.log("  Health Check:        GET  /health");
      console.log("  Complete Order:      POST /api/orders/complete");
      console.log("  Validate Token:      GET  /api/feedback/validate/:token");
      console.log("  Submit Feedback:     POST /api/feedback/submit");
      console.log("  Get All Feedback:    GET  /api/admin/feedback");
      console.log("  Get Statistics:      GET  /api/admin/statistics");
      console.log("  Legacy Submit:       POST /api/legacy/feedback/submit");
      console.log("==================================================\n");
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
  process.exit(1);
});

process.on("unhandledRejection", (error) => {
  console.error("Unhandled Rejection:", error);
  process.exit(1);
});

process.on("SIGTERM", () => {
  console.log("SIGTERM signal received. Closing server gracefully...");
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("SIGINT signal received. Closing server gracefully...");
  process.exit(0);
});

startServer();

module.exports = app;
