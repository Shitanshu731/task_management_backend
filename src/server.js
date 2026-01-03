const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
require("dotenv").config();

const taskRoutes = require("./routes/taskRoutes");
const pool = require("./config/database");

const app = express();
const server = http.createServer(app);

// CORS configuration for production
const corsOptions = {
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  methods: ["GET", "POST", "PATCH", "DELETE"],
  credentials: true,
};

const io = new Server(server, {
  cors: corsOptions,
});

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Make io accessible in routes
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Routes
app.use("/api", taskRoutes);

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", message: "Server is running" });
});

// Socket.IO connection handling
io.on("connection", (socket) => {
  console.log(`✅ Client connected: ${socket.id}`);

  socket.on("disconnect", () => {
    console.log(`❌ Client disconnected: ${socket.id}`);
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: "Something went wrong! ",
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Route not found",
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
