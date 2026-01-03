const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
require("dotenv").config();

const taskRoutes = require("./src/routes/taskRoutes");
const pool = require("./src/config/database");

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

// Store connected users
const connectedUsers = new Map();

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Make io and connectedUsers accessible in routes
app.use((req, res, next) => {
  req.io = io;
  req.connectedUsers = connectedUsers;
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

  // Handle user identification
  socket.on("user:identify", (userData) => {
    const user = {
      socketId: socket.id,
      username: userData.username || `User-${socket.id.substring(0, 6)}`,
      color: userData.color || generateRandomColor(),
      connectedAt: new Date().toISOString(),
    };

    connectedUsers.set(socket.id, user);

    // Broadcast updated user list to all clients
    io.emit("users:list", Array.from(connectedUsers.values()));

    // Notify others about new user
    socket.broadcast.emit("user:connected", user);

    console.log(`👤 User identified: ${user.username}`);
  });

  socket.on("disconnect", () => {
    const user = connectedUsers.get(socket.id);
    if (user) {
      connectedUsers.delete(socket.id);

      // Broadcast updated user list
      io.emit("users:list", Array.from(connectedUsers.values()));

      // Notify others about disconnection
      socket.broadcast.emit("user:disconnected", user);

      console.log(`❌ User disconnected: ${user.username}`);
    } else {
      console.log(`❌ Client disconnected: ${socket.id}`);
    }
  });
});

// Generate random color for user avatar
function generateRandomColor() {
  const colors = [
    "#6366f1",
    "#ec4899",
    "#10b981",
    "#f59e0b",
    "#ef4444",
    "#8b5cf6",
    "#14b8a6",
    "#f97316",
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: "Something went wrong!",
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
