const Order = require("../models/Order");
const MenuItem = require("../models/MenuItem");

// Helper to calculate time estimates
const calculateTimeEstimates = (order) => {
  if (order.status === "Delivered" || order.status === "Cancelled") {
    return null;
  }

  const orderTime = new Date(order.createdAt).getTime();
  const now = Date.now();
  const elapsed = (now - orderTime) / 1000 / 60; // in minutes

  // Base prep time: 20 mins, Delivery: 25 mins
  let remaining = 45 - elapsed;

  if (remaining < 5) remaining = 5; // Minimum 5 mins
  if (remaining > 60) remaining = 60; // Cap at 60 mins

  return {
    min: Math.floor(remaining),
    max: Math.floor(remaining + 10),
    unit: "mins",
  };
};

// Create new order
exports.createOrder = async (req, res) => {
  try {
    const {
      customer,
      items,
      deliveryInstructions,
      paymentMethod,
      deliveryFee,
      totalAmount,
    } = req.body;

    // Validate required fields
    if (!customer || !customer.name || !customer.address || !customer.phone) {
      return res.status(400).json({
        success: false,
        error: "Customer name, address, and phone are required",
      });
    }

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Order must contain at least one item",
      });
    }

    // Calculate subtotal from items only (without delivery fee)
    let calculatedSubtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const menuItem = await MenuItem.findById(item.menuItemId);

      if (!menuItem) {
        return res.status(400).json({
          success: false,
          error: `Menu item with ID ${item.menuItemId} not found`,
        });
      }

      if (!menuItem.available) {
        return res.status(400).json({
          success: false,
          error: `Item "${menuItem.name}" is currently unavailable`,
        });
      }

      if (!item.quantity || item.quantity < 1) {
        return res.status(400).json({
          success: false,
          error: `Invalid quantity for item "${menuItem.name}"`,
        });
      }

      const itemTotal = menuItem.price * item.quantity;
      calculatedSubtotal += itemTotal;

      orderItems.push({
        menuItem: item.menuItemId,
        name: menuItem.name,
        quantity: item.quantity,
        price: menuItem.price,
        itemTotal: itemTotal,
      });
    }

    // Use provided delivery fee or default to 0
    const finalDeliveryFee = deliveryFee || 0;

    // Calculate total: subtotal + delivery fee
    const calculatedTotal = calculatedSubtotal + finalDeliveryFee;

    // Validate total amount matches (with tolerance for floating point errors)
    if (totalAmount && Math.abs(totalAmount - calculatedTotal) > 0.01) {
      return res.status(400).json({
        success: false,
        error: `Total amount mismatch. Calculated: ${calculatedTotal.toFixed(2)} (Subtotal: ${calculatedSubtotal.toFixed(2)} + Delivery: ${finalDeliveryFee.toFixed(2)}), Provided: ${totalAmount}`,
      });
    }

    // Create the order
    const orderData = {
      customer: {
        name: customer.name.trim(),
        address: customer.address.trim(),
        phone: customer.phone.trim(),
        email: customer.email || "N/A",
      },
      items: orderItems,
      subtotal: calculatedSubtotal,
      deliveryFee: finalDeliveryFee,
      totalAmount: calculatedTotal,
      status: "Order Received",
      orderDate: new Date(),
      orderNumber: `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      paymentMethod: paymentMethod || "cash",
      deliveryInstructions: deliveryInstructions || "",
    };

    const order = new Order(orderData);
    await order.save();

    // Populate the order to send complete data via WebSocket
    const populatedOrder = await Order.findById(order._id).populate(
      "items.menuItem",
      "name price image category"
    );

    // Get IO instance and emit event
    const io = req.app.get("io");
    if (io) {
      io.to("admin").emit("newOrder", populatedOrder);
    }

    // Return success response
    res.status(201).json({
      success: true,
      message: "Order created successfully",
      data: {
        _id: order._id,
        orderNumber: order.orderNumber,
        customer: order.customer,
        items: order.items,
        subtotal: order.subtotal,
        deliveryFee: order.deliveryFee,
        totalAmount: order.totalAmount,
        status: order.status,
        orderDate: order.orderDate,
        paymentMethod: order.paymentMethod,
        deliveryInstructions: order.deliveryInstructions,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
      },
    });
  } catch (error) {
    console.error("Order creation error:", error);

    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        error: "Validation failed",
        errors: errors,
      });
    }

    res.status(500).json({
      success: false,
      error: "Internal server error",
      message: error.message,
    });
  }
};
// Get all orders
exports.getAllOrders = async (req, res) => {
  try {
    const {
      status,
      limit = 50,
      page = 1,
      sort = "createdAt",
      order = "desc",
    } = req.query;
    const skip = (page - 1) * limit;

    const query = {};
    if (status && status !== "all") {
      query.status = status;
    }

    const sortOption = { [sort]: order === "asc" ? 1 : -1 };

    const orders = await Order.find(query)
      .populate({
        path: "items.menuItem",
        select: "name price image category",
      })
      .sort(sortOption)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const totalOrders = await Order.countDocuments(query);

    // Add estimated times
    const ordersWithEstimates = orders.map((order) => {
      const estimates = calculateTimeEstimates(order);
      return { ...order, estimates };
    });

    res.json({
      success: true,
      data: {
        orders: ordersWithEstimates,
        pagination: {
          total: totalOrders,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(totalOrders / limit),
        },
        stats: {
          received: await Order.countDocuments({ status: "Order Received" }),
          preparing: await Order.countDocuments({ status: "Preparing" }),
          delivery: await Order.countDocuments({ status: "Out for Delivery" }),
          delivered: await Order.countDocuments({ status: "Delivered" }),
          cancelled: await Order.countDocuments({ status: "Cancelled" }),
        },
      },
    });
  } catch (error) {
    console.error("Error fetching all orders:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch orders",
    });
  }
};


// Get order by ID
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate(
      "items.menuItem",
    );
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

// Update order status
exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params; // ✅ FIXED: Use `id` not `orderId`
    const { status } = req.body;

    console.log(`🔥 Updating order ${id} to status: ${status}`); // Debug

    // Validate status
    const validStatuses = [
      "Order Received",
      "Preparing",
      "Out for Delivery",
      "Delivered",
      "Cancelled",
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: "Invalid status. Must be one of: " + validStatuses.join(", "),
      });
    }

    // Prepare update data
    const updateData = {
      status,
      updatedAt: new Date(),
    };

    if (status === "Delivered") {
      updateData.deliveredAt = new Date();
      updateData.paymentStatus = "Paid";
    }

    if (status === "Cancelled") {
      updateData.cancelledAt = new Date();
    }

    // Find and update order
    const order = await Order.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true },
    ).populate("items.menuItem", "name price image");

    if (!order) {
      return res.status(404).json({
        success: false,
        error: "Order not found",
      });
    }

    // Emit WebSocket event
    const io = req.app.get("io");
    if (io) {
      // Notify the specific order room (for the user tracking page)
      io.to(`order-${id}`).emit("orderStatusUpdated", {
        orderId: id,
        status: status,
        updatedOrder: order,
      });

      // Notify the admin room (for the dashboard)
      io.to("admin").emit("orderUpdated", order); 
    }

    res.json({
      success: true,
      message: `Order status updated to ${status}`,
      data: order,
    });
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update order status",
      message: error.message,
    });
  }
};

exports.orderCancel = async (req, res) => {
  try {
    const orderId = req.params.id;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    if (order.status === "Cancelled") {
      return res.status(400).json({ error: "Order is already cancelled" });
    }

    order.status = "Cancelled";
    await order.save();

    res.json({
      success: true,
      message: "Order cancelled successfully",
      data: order,
    });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

// ADMIN: Get all orders for admin dashboard (with pagination)
exports.getAllAdminOrders = async (req, res) => {
  try {
    const { status = "all", page = 1, limit = 50 } = req.query;
    const skip = (page - 1) * parseInt(limit);

    const query = status === "all" ? {} : { status };

    const orders = await Order.find(query)
      .populate({
        path: "items.menuItem",
        select: "name price image category",
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const totalOrders = await Order.countDocuments(query);

    const ordersWithEstimates = orders.map((order) => {
      const estimates = calculateTimeEstimates(order);
      return { ...order, estimates };
    });

    res.json({
      success: true,
      data: {
        orders: ordersWithEstimates,
        pagination: {
          total: totalOrders,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(totalOrders / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    console.error("Error fetching admin orders:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch admin orders",
    });
  }
};

// ADMIN: Get order statistics for dashboard
exports.getOrderStats = async (req, res) => {
  try {
    // Get counts by status
    const received = await Order.countDocuments({ status: "Order Received" });
    const preparing = await Order.countDocuments({ status: "Preparing" });
    const delivery = await Order.countDocuments({ status: "Out for Delivery" });
    const delivered = await Order.countDocuments({ status: "Delivered" });
    const cancelled = await Order.countDocuments({ status: "Cancelled" });
    const total = await Order.countDocuments();

    // Calculate revenue (only from delivered orders)
    const revenueData = await Order.aggregate([
      { $match: { status: "Delivered" } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalAmount" },
          avgOrderValue: { $avg: "$totalAmount" },
          orderCount: { $sum: 1 },
        },
      },
    ]);

    const revenue = revenueData[0] || {
      totalRevenue: 0,
      avgOrderValue: 0,
      orderCount: 0,
    };

    // Get today's orders
    const today = await Order.countDocuments({
      createdAt: {
        $gte: new Date(new Date().setHours(0, 0, 0, 0)),
      },
    });

    // Get this week's orders
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const thisWeek = await Order.countDocuments({
      createdAt: { $gte: startOfWeek },
    });

    res.json({
      success: true,
      data: {
        total,
        received,
        preparing,
        delivery,
        delivered,
        cancelled,
        revenue,
        today,
        thisWeek,
      },
    });
  } catch (error) {
    console.error("Error fetching order stats:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch order stats",
    });
  }
};


// ADMIN: Get recent orders for dashboard
exports.getRecentOrders = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const recentOrders = await Order.find()
      .populate({
        path: "items.menuItem",
        select: "name price image",
      })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .lean();

    const ordersWithEstimates = recentOrders.map((order) => ({
      ...order,
      estimates: calculateTimeEstimates(order),
    }));

    res.json({
      success: true,
      data: ordersWithEstimates,
    });
  } catch (error) {
    console.error("Error fetching recent orders:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch recent orders",
    });
  }
};
