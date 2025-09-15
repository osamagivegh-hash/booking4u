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

// Serve uploads folder as static files
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve uploads folder as static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve React frontend (Blueprint Integration)
const frontendPath = path.join(__dirname, "frontend-build");

// Serve static files with proper headers and caching
app.use(express.static(frontendPath, {
  maxAge: '1d', // Cache static files for 1 day
  etag: true,
  lastModified: true,
  setHeaders: (res, path) => {
    // Set proper MIME types
    if (path.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript');
    } else if (path.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css');
    }
  }
}));

// Handle missing JS files - redirect to the correct file
app.get('/static/js/main.*.js', (req, res) => {
  const correctJsFile = 'main.a432ae18.js';
  const correctPath = `/static/js/${correctJsFile}`;
  console.log(`🔄 Redirecting ${req.path} to ${correctPath}`);
  res.redirect(302, correctPath);
});

// Catch-all handler: send back React's index.html file for any non-API routes
app.get("*", (req, res) => {
  // Don't serve index.html for API routes
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ message: 'API endpoint not found' });
  }
  
  res.sendFile(path.join(frontendPath, "index.html"), (err) => {
    if (err) {
      console.error('Error serving index.html:', err);
      res.status(500).send('Error loading application');
    }
  });
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
  console.log(`📁 Frontend build path: ${frontendPath}`);
  console.log(`📁 Uploads path: ${path.join(__dirname, 'uploads')}`);
  
  // Log available static files for debugging
  try {
    const fs = await import('fs');
    const staticFiles = fs.readdirSync(path.join(frontendPath, 'static', 'js'));
    console.log(`📄 Available JS files: ${staticFiles.join(', ')}`);
  } catch (err) {
    console.log(`❌ Error reading static files: ${err.message}`);
  }
});
