// server.js
import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { createServer } from "http";
import SocketServer from "./socket/socketServer.js";

dotenv.config();

const app = express();
const server = createServer(app);
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
const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/booking4u';

if (!process.env.MONGODB_URI) {
  console.warn('⚠️  MONGODB_URI environment variable not set, using localhost fallback');
}

mongoose
  .connect(mongoUri, {
    dbName: "booking4u",
  })
  .then(() => {
    if (process.env.NODE_ENV !== 'production') {
      console.log("🟢 Mongoose connected to MongoDB");
      console.log("✅ Connected to MongoDB Atlas");
      console.log("📊 Database name: booking4u");
    }
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    console.error("🔗 Attempted to connect to:", mongoUri ? 'Set' : 'Not set');
  });

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
  const correctJsFile = 'main.36a1ea66.js';
  const correctPath = `/static/js/${correctJsFile}`;
  console.log(`🔄 Redirecting ${req.path} to ${correctPath}`);
  res.redirect(302, correctPath);
});

// Handle specific old JS file requests
app.get('/static/js/main.a432ae18.js', (req, res) => {
  const correctJsFile = 'main.36a1ea66.js';
  const correctPath = `/static/js/${correctJsFile}`;
  console.log(`🔄 Redirecting old JS file ${req.path} to ${correctPath}`);
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

// Initialize Socket.IO server
const socketServer = new SocketServer(server);

// Add Socket.IO stats endpoint
app.get('/api/socket/stats', (req, res) => {
  const stats = socketServer.getConnectionStats();
  res.json({
    success: true,
    data: stats,
    timestamp: new Date().toISOString()
  });
});

// Start server
server.listen(PORT, async () => {
  console.log(`📡 Server running on port ${PORT}`);
  console.log(`🌐 Frontend available at http://0.0.0.0:${PORT}/`);
  console.log(`🔧 API available at http://0.0.0.0:${PORT}/api`);
  console.log(`📱 Socket.IO available at http://0.0.0.0:${PORT}/socket.io/`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
  console.log(`🚀 Render Blueprint Integrated: true`);
  console.log(`📊 Health check: http://0.0.0.0:${PORT}/`);
  console.log(`🔧 API health: http://0.0.0.0:${PORT}/api/info`);
  console.log(`📱 Socket stats: http://0.0.0.0:${PORT}/api/socket/stats`);
  console.log(`📁 Frontend build path: ${frontendPath}`);
  console.log(`📁 Uploads path: ${path.join(__dirname, 'uploads')}`);
  
  // Log available static files for debugging
  try {
    const fs = await import('fs');
    const staticFiles = fs.readdirSync(path.join(frontendPath, 'static', 'js'));
    console.log(`📄 Available JS files: ${staticFiles.join(', ')}`);
    
    // Check if the expected main.js file exists
    const expectedMainJs = 'main.36a1ea66.js';
    const mainJsPath = path.join(frontendPath, 'static', 'js', expectedMainJs);
    const mainJsExists = fs.existsSync(mainJsPath);
    console.log(`📄 Expected main.js (${expectedMainJs}) exists: ${mainJsExists}`);
    
    // List all main.*.js files
    const mainJsFiles = staticFiles.filter(file => file.startsWith('main.') && file.endsWith('.js'));
    console.log(`📄 All main.*.js files: ${mainJsFiles.join(', ')}`);
  } catch (err) {
    console.log(`❌ Error reading static files: ${err.message}`);
  }
});
