// services/socketService.js
import { io } from "socket.io-client";

class SocketService {
  constructor() {
    this.socket = null;
    this.connected = false;
  }

  connect() {
    if (this.connected) return this.socket;

    this.socket = io(import.meta.env.VITE_API_URL || "http://localhost:4000", {
      transports: ["websocket", "polling"],
      withCredentials: true,
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
