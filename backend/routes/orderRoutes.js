const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");
const adminAuth = require("../middleware/adminAuth"); // Add this

// User routes (no auth required)
router.post("/", orderController.createOrder);
router.get("/", orderController.getAllOrders);
router.get("/:id", orderController.getOrderById);
router.patch("/:id/status", orderController.updateOrderStatus);

router.put("/:id/cancel", orderController.orderCancel);

// ADMIN ROUTES - PROTECTED
router.get("/admin/all", adminAuth, orderController.getAllAdminOrders);
router.get("/admin/stats", adminAuth, orderController.getOrderStats);
router.get("/admin/recent", adminAuth, orderController.getRecentOrders);

module.exports = router;
