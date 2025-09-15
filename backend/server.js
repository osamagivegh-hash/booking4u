// server.js
import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 10000;

// Middleware
app.use(express.json());

// ✅ Enable CORS
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"],
    credentials: true,
  })
);

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI, {
    dbName: "booking4u",
  })
  .then(() => {
    console.log("🟢 Mongoose connected to MongoDB");
    console.log("✅ Connected to MongoDB Atlas");
    console.log("📊 Database name: booking4u");
  })
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// API Routes
app.use("/api/auth", (await import("./routes/auth.js")).default);
app.use("/api/bookings", (await import("./routes/bookings.js")).default);
app.use("/api/services", (await import("./routes/services.js")).default);
app.use("/api/businesses", (await import("./routes/businesses.js")).default);
app.use("/api/users", (await import("./routes/users.js")).default);
app.use("/api/messages", (await import("./routes/messages.js")).default);
app.use("/api/reviews", (await import("./routes/reviews.js")).default);
app.use("/api/news", (await import("./routes/news.js")).default);
app.use("/api/notifications", (await import("./routes/notifications.js")).default);

// ✅ Info route (instead of `/`)
app.get("/api/info", (req, res) => {
  res.json({
    message: "Booking4U Backend is running",
    status: "OK",
    deployment: "Blueprint Integrated",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    version: "1.0.0",
    cors: "Same-origin (no CORS issues)",
  });
});

// Serve React frontend (Blueprint Integration)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const frontendPath = path.join(__dirname, "frontend-build");
app.use(express.static(frontendPath));

app.get("*", (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

// Start server
app.listen(PORT, () => {
  console.log(`📡 Server running on port ${PORT}`);
  console.log(`🌐 Frontend available at http://0.0.0.0:${PORT}/`);
  console.log(`🔧 API available at http://0.0.0.0:${PORT}/api`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
  console.log(`🚀 Render Blueprint Integrated: true`);
  console.log(`📊 Health check: http://0.0.0.0:${PORT}/`);
  console.log(`🔧 API health: http://0.0.0.0:${PORT}/api/info`);
});
