// services/socketService.js
import { io } from "socket.io-client";

class SocketService {
  constructor() {
    this.socket = null;
    this.connected = false;
  }

  connect() {
    if (this.socket && this.socket.connected) return this.socket;

    // Handle URL: Ensure we connect to base URL (port 4000) not /api
    let rawUrl = import.meta.env.VITE_API_URL || "http://localhost:4000";
    let socketUrl = rawUrl;
    
    // If URL contains /api, strip it to get base root
    try {
      const urlObj = new URL(rawUrl);
      socketUrl = `${urlObj.protocol}//${urlObj.host}`;
    } catch (e) {
      console.error("Invalid Socket URL:", rawUrl);
    }

    console.log("Connecting to Socket.io at:", socketUrl);

    this.socket = io(socketUrl, {
      transports: ["polling", "websocket"], // Try polling first (more robust), then upgrade
      withCredentials: true,
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    this.socket.on("connect", () => {
      console.log("✅ Connected to WebSocket server");
      this.connected = true;
    });

    this.socket.on("disconnect", () => {
      console.log("❌ Disconnected from WebSocket server");
      this.connected = false;
    });

    this.socket.on("connect_error", (error) => {
      console.error("WebSocket connection error:", error);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
    }
  }

  // Join specific order room
  joinOrderRoom(orderId) {
    if (this.socket) {
      this.socket.emit("subscribeToOrder", orderId);
    }
  }

  // Join admin room
  joinAdminRoom() {
    if (this.socket) {
      this.socket.emit("joinAdminRoom");
    }
  }

  // Event listeners
  onNewOrder(callback) {
    if (this.socket) {
      this.socket.on("newOrder", callback);
    }
  }

  onOrderUpdated(callback) {
    if (this.socket) {
      this.socket.on("orderUpdated", callback);
    }
  }

  onOrderStatusUpdated(callback) {
    if (this.socket) {
      this.socket.on("orderStatusUpdated", callback);
    }
  }

  removeAllListeners() {
    if (this.socket) {
      this.socket.removeAllListeners();
    }
  }
}

export default new SocketService();
