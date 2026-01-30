const express = require("express");
const cors = require("cors");
const http = require("http");
const socketIo = require("socket.io");
require("dotenv").config();

const menuRoutes = require("./routes/menuRoutes");
const orderRoutes = require("./routes/orderRoutes");
const userRoutes = require("./routes/userRoutes");
const authRoutes = require("./routes/authRoutes");

// Import your DB connection - adjust path to your actual config file
const connectDB = require("./config/db");

const app = express();

// Allowed origins
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:3000",
];

// Add production client URL if it exists
if (process.env.CLIENT_URL) {
  allowedOrigins.push(process.env.CLIENT_URL);
}

// Enable CORS for all routes - PERMISSIVE MODE FOR DEBUGGING
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      // Allow any origin that tries to connect
      return callback(null, true);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/menu", menuRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);

// Test route
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "Server is running" });
});

// WebSocket setup
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*", // Allow all origins for WebSocket as well during debugging
    methods: ["GET", "POST"],
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("New client connected");

  socket.on("subscribeToOrder", (orderId) => {
    socket.join(`order-${orderId}`);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

app.set("io", io);

const PORT = process.env.PORT || 4000;

// Connect to DB first, then start server
connectDB()
  .then(() => {
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`CORS enabled for frontend`);
      console.log(`API URL: http://localhost:${PORT}/api`);
    });
  })
  .catch((error) => {
    console.error("Failed to connect to DB:", error);
  });

// Handle graceful shutdown
process.on("SIGINT", () => {
  console.log("Server shutting down...");
  process.exit(0);
});

module.exports = app;
