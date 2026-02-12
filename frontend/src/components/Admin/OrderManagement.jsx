// components/OrderManagement.jsx
import React, { useState, useEffect, useCallback } from "react";
import { orderService } from "../../services/api";
import socketService from "../../services/socket";
import toast from "react-hot-toast";
import {
  FaSearch,
  FaFilter,
  FaSort,
  FaEye,
  FaEdit,
  FaTimes,
  FaCheck,
  FaMotorcycle,
  FaPrint,
  FaDownload,
  FaSync,
  FaClock,
  FaUtensils,
  FaExclamationTriangle,
  FaReceipt,
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
  FaUser,
  FaShoppingCart,
  FaCreditCard,
  FaMoneyBill,
  FaTruck,
  FaHome,
  FaCalendarAlt,
  FaChevronDown,
} from "react-icons/fa";

const OrderManagement = ({ orders: initialOrders, onRefresh }) => {
  const [orders, setOrders] = useState(initialOrders || []);
  const [filteredOrders, setFilteredOrders] = useState(initialOrders || []);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    preparing: 0,
    outForDelivery: 0,
    delivered: 0,
    cancelled: 0,
  });

  // Initialize WebSocket and fetch initial data
  useEffect(() => {
    setupWebSocket();
    refreshOrders();

    // Cleanup WebSocket connection
    return () => {
      if (socketService.socket) {
        socketService.socket.off("newOrder");
        socketService.socket.off("orderUpdated");
      }
    };
  }, []);

  useEffect(() => {
    setOrders(initialOrders || []);
    setFilteredOrders(initialOrders || []);
  }, [initialOrders]);

  useEffect(() => {
    filterAndSortOrders();
    calculateStats();
  }, [orders, searchTerm, statusFilter, dateFilter, sortBy, sortOrder]);

  const setupWebSocket = () => {
    socketService.connect();
    socketService.joinAdminRoom();

    socketService.socket.on("connect", () => {
      console.log("Connected to WebSocket for real-time orders");
      socketService.joinAdminRoom();
    });

    socketService.socket.on("newOrder", (data) => {
      toast.success(`📦 New order received: #${data.orderNumber}`, {
        duration: 4000,
        icon: "🎉",
      });
      refreshOrders();
    });

    socketService.socket.on("orderUpdated", (data) => {
      toast.info(`🔄 Order #${data.orderNumber} updated to ${data.newStatus}`, {
        duration: 3000,
      });
      refreshOrders();
    });

    socketService.socket.on("disconnect", () => {
      toast.error("Disconnected from real-time updates", {
        duration: 3000,
      });
    });
  };

  const refreshOrders = useCallback(async () => {
    try {
      setLoading(true);
      const response = await orderService.getAllOrders();
      const ordersData = response.data.data.orders || [];
      setOrders(ordersData);
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error("Error refreshing orders:", error);
      toast.error("Failed to refresh orders. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [onRefresh]);

  const calculateStats = () => {
    const statsData = {
      total: orders.length,
      pending: orders.filter((order) => order.status === "Order Received")
        .length,
      preparing: orders.filter((order) => order.status === "Preparing").length,
      outForDelivery: orders.filter(
        (order) => order.status === "Out for Delivery",
      ).length,
      delivered: orders.filter((order) => order.status === "Delivered").length,
      cancelled: orders.filter((order) => order.status === "Cancelled").length,
    };
    setStats(statsData);
  };

  const filterAndSortOrders = () => {
    let filtered = [...orders];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (order) =>
          order.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.customer?.name
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          order.customer?.phone?.includes(searchTerm) ||
          order.customer?.email
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()),
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((order) => order.status === statusFilter);
    }

    // Apply date filter
    if (dateFilter !== "all") {
      const now = new Date();
      let startDate = new Date();

      switch (dateFilter) {
        case "today":
          startDate.setHours(0, 0, 0, 0);
          filtered = filtered.filter(
            (order) => new Date(order.createdAt) >= startDate,
          );
          break;
        case "yesterday":
          startDate.setDate(startDate.getDate() - 1);
          startDate.setHours(0, 0, 0, 0);
          const yesterdayEnd = new Date(startDate);
          yesterdayEnd.setDate(yesterdayEnd.getDate() + 1);
          filtered = filtered.filter((order) => {
            const orderDate = new Date(order.createdAt);
            return orderDate >= startDate && orderDate < yesterdayEnd;
          });
          break;
        case "week":
          startDate.setDate(startDate.getDate() - 7);
          filtered = filtered.filter(
            (order) => new Date(order.createdAt) >= startDate,
          );
          break;
        case "month":
          startDate.setMonth(startDate.getMonth() - 1);
          filtered = filtered.filter(
            (order) => new Date(order.createdAt) >= startDate,
          );
          break;
        case "custom":
          // Implement custom date range if needed
          break;
      }
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case "totalAmount":
          aValue = a.totalAmount || 0;
          bValue = b.totalAmount || 0;
          break;
        case "customer":
          aValue = a.customer?.name?.toLowerCase() || "";
          bValue = b.customer?.name?.toLowerCase() || "";
          break;
        case "status":
          aValue = a.status || "";
          bValue = b.status || "";
          break;
        default:
          aValue = new Date(a.createdAt || a.orderDate);
          bValue = new Date(b.createdAt || b.orderDate);
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredOrders(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      setLoading(true);
      await orderService.updateOrderStatus(orderId, newStatus);
      toast.success(`✅ Order status updated to ${newStatus}`);
      refreshOrders();
      setShowModal(false);
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update order status");
    } finally {
      setLoading(false);
    }
  };

  const getNextStatusOptions = (currentStatus) => {
    const statusFlow = {
      "Order Received": ["Preparing", "Cancelled"],
      Preparing: ["Out for Delivery", "Cancelled"],
      "Out for Delivery": ["Delivered", "Cancelled"],
      Delivered: [],
      Cancelled: [],
    };
    return statusFlow[currentStatus] || [];
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Order Received":
        return <FaClock className="text-blue-500" />;
      case "Preparing":
        return <FaUtensils className="text-yellow-500" />;
      case "Out for Delivery":
        return <FaMotorcycle className="text-orange-500" />;
      case "Delivered":
        return <FaCheck className="text-green-500" />;
      case "Cancelled":
        return <FaTimes className="text-red-500" />;
      default:
        return <FaClock className="text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Order Received":
        return "bg-blue-100 text-blue-800";
      case "Preparing":
        return "bg-yellow-100 text-yellow-800";
      case "Out for Delivery":
        return "bg-orange-100 text-orange-800";
      case "Delivered":
        return "bg-green-100 text-green-800";
      case "Cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const calculateTimeSince = (dateString) => {
    const orderDate = new Date(dateString);
    const now = new Date();
    const diffMs = now - orderDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `${diffDays}d ago`;
    if (diffHours > 0) return `${diffHours}h ago`;
    if (diffMins > 0) return `${diffMins}m ago`;
    return "Just now";
  };

  const handleEditOrder = (order) => {
    toast.success("Edit functionality coming soon!");
    // Implement edit order logic here
  };

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setShowModal(true);
  };

  const handlePrintOrder = (order) => {
    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Order #${order.orderNumber}</title>
          <style>
            body { 
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
              padding: 20px; 
              max-width: 800px; 
              margin: 0 auto; 
              color: #333;
            }
            .header { 
              text-align: center; 
              margin-bottom: 30px; 
              border-bottom: 2px solid #333; 
              padding-bottom: 20px;
            }
            .header h1 { 
              margin: 0; 
              color: #2d3748;
              font-size: 24px;
            }
            .info-grid { 
              display: grid; 
              grid-template-columns: 1fr 1fr; 
              gap: 20px; 
              margin-bottom: 30px;
            }
            .section { 
              margin-bottom: 25px; 
              background: #f8f9fa; 
              padding: 15px; 
              border-radius: 8px;
            }
            .section h3 { 
              border-bottom: 1px solid #ddd; 
              padding-bottom: 8px; 
              margin-top: 0;
              color: #4a5568;
            }
            table { 
              width: 100%; 
              border-collapse: collapse; 
              margin: 10px 0;
            }
            th, td { 
              border: 1px solid #ddd; 
              padding: 10px; 
              text-align: left; 
              font-size: 13px;
            }
            th { 
              background-color: #edf2f7; 
              font-weight: 600;
            }
            .total-row { 
              font-weight: bold; 
              font-size: 14px;
            }
            .status-badge {
              display: inline-block;
              padding: 4px 12px;
              border-radius: 20px;
              font-weight: 600;
              font-size: 12px;
            }
            .summary {
              background: #fff;
              border: 2px solid #e2e8f0;
              padding: 20px;
              border-radius: 8px;
              margin-top: 20px;
            }
            .summary-row {
              display: flex;
              justify-content: space-between;
              padding: 8px 0;
              border-bottom: 1px solid #e2e8f0;
            }
            .summary-total {
              font-weight: bold;
              font-size: 18px;
              border-top: 2px solid #4a5568;
              margin-top: 10px;
              padding-top: 10px;
            }
            @media print {
              body { padding: 0; }
              .no-print { display: none; }
            }
            .footer {
              text-align: center;
              margin-top: 40px;
              padding-top: 20px;
              border-top: 1px solid #ddd;
              font-size: 12px;
              color: #718096;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>RESTAURANT RECEIPT</h1>
            <p style="font-size: 14px; color: #718096;">Order #${order.orderNumber}</p>
            <p style="font-size: 13px;">${new Date(order.createdAt).toLocaleString()}</p>
          </div>
          
          <div class="info-grid">
            <div class="section">
              <h3>Customer Information</h3>
              <p><strong>Name:</strong> ${order.customer?.name || "Guest"}</p>
              <p><strong>Phone:</strong> ${order.customer?.phone || "N/A"}</p>
              <p><strong>Email:</strong> ${order.customer?.email || "N/A"}</p>
              <p><strong>Address:</strong> ${order.customer?.address || "N/A"}</p>
            </div>
            
            <div class="section">
              <h3>Order Details</h3>
              <p><strong>Status:</strong> 
                <span class="status-badge" style="background: ${
                  order.status === "Delivered"
                    ? "#c6f6d5"
                    : order.status === "Cancelled"
                      ? "#fed7d7"
                      : order.status === "Preparing"
                        ? "#feebc8"
                        : order.status === "Out for Delivery"
                          ? "#fed7d7"
                          : "#bee3f8"
                }; color: ${
                  order.status === "Delivered"
                    ? "#22543d"
                    : order.status === "Cancelled"
                      ? "#742a2a"
                      : order.status === "Preparing"
                        ? "#744210"
                        : order.status === "Out for Delivery"
                          ? "#7b341e"
                          : "#2a4365"
                };">
                  ${order.status}
                </span>
              </p>
              <p><strong>Payment Method:</strong> ${order.paymentMethod}</p>
              <p><strong>Payment Status:</strong> ${order.paymentStatus || "Pending"}</p>
              ${order.deliveryInstructions ? `<p><strong>Instructions:</strong> ${order.deliveryInstructions}</p>` : ""}
            </div>
          </div>
          
          <div class="section">
            <h3>Order Items</h3>
            <table>
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Qty</th>
                  <th>Unit Price</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                ${order.items
                  ?.map(
                    (item) => `
                  <tr>
                    <td>
                      <div><strong>${item.menuItem?.name || item.name}</strong></div>
                      ${item.specialInstructions ? `<div style="font-size: 11px; color: #718096;">Note: ${item.specialInstructions}</div>` : ""}
                    </td>
                    <td>${item.quantity}</td>
                    <td>₹${item.price?.toFixed(2)}</td>
                    <td>₹${((item.price || 0) * (item.quantity || 1)).toFixed(2)}</td>
                  </tr>
                `,
                  )
                  .join("")}
              </tbody>
            </table>
          </div>
          
          <div class="summary">
            <h3 style="margin-top: 0;">Order Summary</h3>
            <div class="summary-row">
              <span>Subtotal</span>
              <span>₹${order.subtotal?.toFixed(2) || "0.00"}</span>
            </div>
            <div class="summary-row">
              <span>Delivery Fee</span>
              <span>₹${order.deliveryFee?.toFixed(2) || "0.00"}</span>
            </div>
            ${
              order.taxAmount > 0
                ? `
              <div class="summary-row">
                <span>Tax (${order.taxRate || "0"}%)</span>
                <span>₹${order.taxAmount?.toFixed(2) || "0.00"}</span>
              </div>
            `
                : ""
            }
            ${
              order.discountAmount > 0
                ? `
              <div class="summary-row">
                <span>Discount</span>
                <span>-₹${order.discountAmount?.toFixed(2) || "0.00"}</span>
              </div>
            `
                : ""
            }
            <div class="summary-row summary-total">
              <span>TOTAL</span>
              <span>₹${order.totalAmount?.toFixed(2)}</span>
            </div>
          </div>
          
          <div class="footer">
            <p>Thank you for your order!</p>
            <p>For any inquiries, please contact us at (123) 456-7890</p>
            <p>Generated on ${new Date().toLocaleString()}</p>
          </div>
          
          <div class="no-print" style="text-align: center; margin-top: 30px;">
            <button onclick="window.print()" style="padding: 10px 20px; background: #3182ce; color: white; border: none; border-radius: 5px; cursor: pointer;">
              Print Receipt
            </button>
            <button onclick="window.close()" style="padding: 10px 20px; background: #718096; color: white; border: none; border-radius: 5px; cursor: pointer; margin-left: 10px;">
              Close
            </button>
          </div>
        </body>
      </html>
    `;

    const printWindow = window.open("", "_blank", "width=900,height=700");
    printWindow.document.write(printContent);
    printWindow.document.close();
  };

  const handleExportOrders = () => {
    try {
      const csvContent = [
        [
          "Order ID",
          "Order Number",
          "Customer Name",
          "Phone",
          "Email",
          "Address",
          "Status",
          "Total Amount",
          "Payment Method",
          "Payment Status",
          "Created At",
          "Items",
        ],
        ...filteredOrders.map((order) => [
          order._id,
          order.orderNumber,
          order.customer?.name || "",
          order.customer?.phone || "",
          order.customer?.email || "",
          order.customer?.address || "",
          order.status,
          order.totalAmount,
          order.paymentMethod,
          order.paymentStatus || "Pending",
          new Date(order.createdAt).toISOString(),
          order.items
            ?.map(
              (item) => `${item.quantity}x ${item.menuItem?.name || item.name}`,
            )
            .join("; "),
        ]),
      ]
        .map((row) =>
          row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","),
        )
        .join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `orders_${new Date().toISOString().split("T")[0]}.csv`,
      );
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("Orders exported successfully!");
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export orders");
    }
  };

  // Pagination calculations
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);

  const goToPage = (pageNumber) => {
    setCurrentPage(Math.max(1, Math.min(pageNumber, totalPages)));
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">
            Order Management
          </h1>
          <p className="text-gray-400 mt-1">
            Manage and track all customer orders in real-time
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleExportOrders}
            className="flex items-center px-4 py-2.5 bg-green-600/90 text-white rounded-lg hover:bg-green-600 transition-colors duration-200 shadow-sm backdrop-blur-sm"
          >
            <FaDownload className="mr-2" />
            Export CSV
          </button>
          <button
            onClick={refreshOrders}
            disabled={loading}
            className="flex items-center px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FaSync className={`mr-2 ${loading ? "animate-spin" : ""}`} />
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3 md:gap-4">
        <div className="bg-gray-900 p-4 rounded-xl shadow-lg border border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 font-medium">Total</p>
              <p className="text-2xl font-bold text-white">{stats.total}</p>
            </div>
            <div className="p-3 bg-blue-500/10 rounded-lg">
              <FaReceipt className="text-blue-500 text-xl" />
            </div>
          </div>
        </div>

        <div className="bg-gray-900 p-4 rounded-xl shadow-lg border border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 font-medium">Pending</p>
              <p className="text-2xl font-bold text-blue-500">
                {stats.pending}
              </p>
            </div>
            <div className="p-3 bg-blue-500/10 rounded-lg">
              <FaClock className="text-blue-500 text-xl" />
            </div>
          </div>
        </div>

        <div className="bg-gray-900 p-4 rounded-xl shadow-lg border border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 font-medium">Preparing</p>
              <p className="text-2xl font-bold text-yellow-500">
                {stats.preparing}
              </p>
            </div>
            <div className="p-3 bg-yellow-500/10 rounded-lg">
              <FaUtensils className="text-yellow-500 text-xl" />
            </div>
          </div>
        </div>

        <div className="bg-gray-900 p-4 rounded-xl shadow-lg border border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 font-medium">Delivery</p>
              <p className="text-2xl font-bold text-orange-500">
                {stats.outForDelivery}
              </p>
            </div>
            <div className="p-3 bg-orange-500/10 rounded-lg">
              <FaMotorcycle className="text-orange-500 text-xl" />
            </div>
          </div>
        </div>

        <div className="bg-gray-900 p-4 rounded-xl shadow-lg border border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 font-medium">Delivered</p>
              <p className="text-2xl font-bold text-green-500">
                {stats.delivered}
              </p>
            </div>
            <div className="p-3 bg-green-500/10 rounded-lg">
              <FaCheck className="text-green-500 text-xl" />
            </div>
          </div>
        </div>

        <div className="bg-gray-900 p-4 rounded-xl shadow-lg border border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 font-medium">Cancelled</p>
              <p className="text-2xl font-bold text-red-500">
                {stats.cancelled}
              </p>
            </div>
            <div className="p-3 bg-red-500/10 rounded-lg">
              <FaTimes className="text-red-500 text-xl" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters & Search Section */}
      <div className="bg-gray-900 rounded-xl shadow-lg border border-gray-800 p-5 md:p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
          {/* Search Input */}
          <div className="relative flex-1 md:mr-4">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="text-gray-500" />
            </div>
            <input
              type="text"
              placeholder="Search orders..."
              className="pl-10 w-full px-4 py-3 bg-gray-950 border border-gray-700/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Filter Toggle Button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center px-4 py-3 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 hover:text-white transition-colors duration-200 border border-gray-700"
          >
            <FaFilter className="mr-2" />
            {showFilters ? "Hide Filters" : "Show Filters"}
          </button>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="mt-6 pt-6 border-t border-gray-800">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Status Filter
                </label>
                <select
                  className="w-full px-3 py-2.5 bg-gray-950 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Statuses</option>
                  <option value="Order Received">Order Received</option>
                  <option value="Preparing">Preparing</option>
                  <option value="Out for Delivery">Out for Delivery</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              {/* Date Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Date Range
                </label>
                <select
                  className="w-full px-3 py-2.5 bg-gray-950 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                >
                  <option value="all">All Dates</option>
                  <option value="today">Today</option>
                  <option value="yesterday">Yesterday</option>
                  <option value="week">Last 7 Days</option>
                  <option value="month">Last 30 Days</option>
                </select>
              </div>

              {/* Sort By */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Sort By
                </label>
                <select
                  className="w-full px-3 py-2.5 bg-gray-950 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="createdAt">Order Date</option>
                  <option value="totalAmount">Total Amount</option>
                  <option value="customer">Customer Name</option>
                  <option value="status">Status</option>
                </select>
              </div>

              {/* Sort Order & Items Per Page */}
              <div className="flex space-x-2">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Order
                  </label>
                  <button
                    onClick={() =>
                      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                    }
                    className="w-full flex items-center justify-center px-3 py-2.5 bg-gray-950 border border-gray-700 text-white rounded-lg hover:bg-gray-800 transition-colors duration-200"
                  >
                    <FaSort className="mr-2" />
                    {sortOrder === "asc" ? "Ascending" : "Descending"}
                  </button>
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Items/Page
                  </label>
                  <select
                    className="w-full px-3 py-2.5 bg-gray-950 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                    value={itemsPerPage}
                    onChange={(e) => setItemsPerPage(Number(e.target.value))}
                  >
                    <option value="5">5</option>
                    <option value="10">10</option>
                    <option value="20">20</option>
                    <option value="50">50</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Active Filters Summary */}
            <div className="mt-4 flex flex-wrap gap-2">
              {searchTerm && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                  Search: "{searchTerm}"
                  <button onClick={() => setSearchTerm("")} className="ml-2">
                    <FaTimes className="text-xs" />
                  </button>
                </span>
              )}
              {statusFilter !== "all" && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800">
                  Status: {statusFilter}
                  <button
                    onClick={() => setStatusFilter("all")}
                    className="ml-2"
                  >
                    <FaTimes className="text-xs" />
                  </button>
                </span>
              )}
              {dateFilter !== "all" && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
                  Date: {dateFilter}
                  <button onClick={() => setDateFilter("all")} className="ml-2">
                    <FaTimes className="text-xs" />
                  </button>
                </span>
              )}
              {(searchTerm ||
                statusFilter !== "all" ||
                dateFilter !== "all") && (
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setStatusFilter("all");
                    setDateFilter("all");
                  }}
                  className="text-sm text-gray-600 hover:text-gray-800"
                >
                  Clear all filters
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Orders Table */}
      <div className="bg-gray-900 rounded-xl shadow-lg border border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-800">
            <thead className="bg-gray-900/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date & Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Items
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-gray-900 divide-y divide-gray-800">
              {loading && currentOrders.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                    <p className="mt-3 text-gray-500">Loading orders...</p>
                  </td>
                </tr>
              ) : currentOrders.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-16 text-center">
                    <div className="text-gray-400 mb-4">
                      <FaSearch className="w-16 h-16 mx-auto opacity-50" />
                    </div>
                    <p className="text-gray-500 text-lg font-medium">
                      No orders found
                    </p>
                    <p className="text-gray-400 mt-1">
                      Try adjusting your search or filters
                    </p>
                    {(searchTerm ||
                      statusFilter !== "all" ||
                      dateFilter !== "all") && (
                      <button
                        onClick={() => {
                          setSearchTerm("");
                          setStatusFilter("all");
                          setDateFilter("all");
                        }}
                        className="mt-4 px-4 py-2 text-sm text-blue-600 hover:text-blue-800"
                      >
                        Clear all filters
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                currentOrders.map((order) => (
                  <tr
                    key={order._id}
                    className="hover:bg-gray-800/50 transition-colors duration-150"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-semibold text-white text-sm">
                        #{order.orderNumber}
                      </div>
                      <div className="text-xs text-gray-500 mt-1 flex items-center">
                        <FaClock className="mr-1 text-xs" />
                        {calculateTimeSince(order.createdAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-white text-sm">
                        {order.customer?.name || "Guest"}
                      </div>
                      <div className="text-xs text-gray-500 mt-1 flex items-center">
                        <FaPhone className="mr-1 text-xs" />
                        {order.customer?.phone || "No phone"}
                      </div>
                      <div className="text-xs text-gray-500 truncate max-w-xs flex items-center mt-1">
                        <FaMapMarkerAlt className="mr-1 text-xs" />
                        {order.customer?.address || "No address"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-300">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(order.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-300 flex items-center">
                        <FaShoppingCart className="mr-2 text-gray-500" />
                        {order.items?.reduce(
                          (sum, item) => sum + (item.quantity || 1),
                          0,
                        )}{" "}
                        items
                      </div>
                      <div className="text-xs text-gray-500 mt-1 truncate max-w-xs">
                        {order.items
                          ?.slice(0, 2)
                          .map(
                            (item) =>
                              `${item.quantity}x ${item.menuItem?.name || item.name}`,
                          )
                          .join(", ")}
                        {order.items?.length > 2 && "..."}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-semibold text-white">
                        ₹{order.totalAmount?.toFixed(2)}
                      </div>
                      {order.deliveryFee > 0 && (
                        <div className="text-xs text-gray-500">
                          +₹{order.deliveryFee?.toFixed(2)} delivery
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center mb-2">
                        {getStatusIcon(order.status)}
                        <span className="ml-2 text-sm font-medium text-white">
                          {order.status}
                        </span>
                      </div>
                      {getNextStatusOptions(order.status).length > 0 && (
                        <div className="relative">
                          <select
                            value=""
                            onChange={(e) =>
                              updateOrderStatus(order._id, e.target.value)
                            }
                            className="block w-full pl-3 pr-8 py-1.5 text-xs bg-gray-800 border border-gray-700 text-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 appearance-none cursor-pointer hover:bg-gray-750 transition-colors"
                          >
                            <option value="" disabled>
                              Update Status
                            </option>
                            {getNextStatusOptions(order.status).map(
                              (status) => (
                                <option key={status} value={status}>
                                  Mark as {status}
                                </option>
                              ),
                            )}
                          </select>
                          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                            <FaChevronDown className="h-3 w-3" />
                          </div>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {order.paymentMethod === "Credit Card" ? (
                          <FaCreditCard className="text-green-500 mr-2" />
                        ) : order.paymentMethod === "Cash on Delivery" ? (
                          <FaMoneyBill className="text-yellow-500 mr-2" />
                        ) : (
                          <FaCreditCard className="text-gray-400 mr-2" />
                        )}
                        <div>
                          <span
                            className={`px-2 py-1 text-xs rounded-full ${getStatusColor(order.paymentStatus || "Pending")}`}
                          >
                            {order.paymentMethod}
                          </span>
                          <div className="text-xs text-gray-500 mt-1">
                            {order.paymentStatus === "Paid"
                              ? "✓ Paid"
                              : "Pending"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-1">
                        <button
                          onClick={() => handleViewOrder(order)}
                          className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors duration-150"
                          title="View Details"
                        >
                          <FaEye />
                        </button>
                        <button
                          onClick={() => handlePrintOrder(order)}
                          className="p-2 text-gray-400 hover:bg-gray-700/50 rounded-lg transition-colors duration-150"
                          title="Print Receipt"
                        >
                          <FaPrint />
                        </button>
                        <button
                          onClick={() => handleEditOrder(order)}
                          className="p-2 text-green-400 hover:bg-green-500/10 rounded-lg transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Edit Order"
                          disabled={
                            order.status === "Delivered" ||
                            order.status === "Cancelled"
                          }
                        >
                          <FaEdit />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredOrders.length > itemsPerPage && (
          <div className="px-6 py-4 border-t border-gray-800 bg-gray-900">
            <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
              <div className="text-sm text-gray-400">
                Showing{" "}
                <span className="font-semibold text-white">{indexOfFirstItem + 1}</span> to{" "}
                <span className="font-semibold text-white">
                  {Math.min(indexOfLastItem, filteredOrders.length)}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-white">{filteredOrders.length}</span>{" "}
                orders
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-2 text-sm border border-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-800 text-gray-300 transition-colors duration-150"
                >
                  Previous
                </button>

                <div className="flex space-x-1">
                  {(() => {
                    const pages = [];
                    const maxVisiblePages = 5;
                    let startPage = Math.max(
                      1,
                      currentPage - Math.floor(maxVisiblePages / 2),
                    );
                    let endPage = Math.min(
                      totalPages,
                      startPage + maxVisiblePages - 1,
                    );

                    if (endPage - startPage + 1 < maxVisiblePages) {
                      startPage = Math.max(1, endPage - maxVisiblePages + 1);
                    }

                    for (let i = startPage; i <= endPage; i++) {
                      pages.push(
                        <button
                          key={i}
                          onClick={() => goToPage(i)}
                          className={`px-3 py-2 text-sm rounded-lg transition-colors duration-150 ${
                            currentPage === i
                              ? "bg-blue-600 text-white"
                              : "border border-gray-700 text-gray-400 hover:bg-gray-800"
                          }`}
                        >
                          {i}
                        </button>,
                      );
                    }
                    return pages;
                  })()}
                </div>

                <button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 text-sm border border-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-800 text-gray-300 transition-colors duration-150"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {showModal && selectedOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
            {/* Background overlay */}
            <div
              className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity"
              aria-hidden="true"
              onClick={() => setShowModal(false)}
            ></div>

            {/* Modal container */}
            <div className="relative inline-block bg-gray-900 rounded-2xl text-left overflow-hidden shadow-2xl transition-all sm:my-8 sm:max-w-5xl sm:w-full border border-gray-800">
              {/* Modal header */}
              <div className="bg-gradient-to-r from-blue-900 to-blue-800 px-6 py-4 sm:px-8 sm:py-6 border-b border-gray-800">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-2xl font-bold text-white">
                      Order #{selectedOrder.orderNumber}
                    </h3>
                    <p className="text-blue-200 mt-1">
                      <FaCalendarAlt className="inline mr-2" />
                      {new Date(selectedOrder.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => handlePrintOrder(selectedOrder)}
                      className="p-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors duration-150"
                      title="Print Receipt"
                    >
                      <FaPrint />
                    </button>
                    <button
                      onClick={() => setShowModal(false)}
                      className="p-2 text-gray-400 hover:text-white"
                    >
                      <FaTimes className="text-xl" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Modal body */}
              <div className="px-6 py-6 sm:px-8 sm:py-8 max-h-[70vh] overflow-y-auto bg-gray-900">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Left column - Customer & Delivery */}
                  <div className="lg:col-span-2 space-y-6">
                    {/* Customer Information */}
                    <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700/50">
                      <h4 className="font-semibold text-white text-lg mb-4 flex items-center">
                        <FaUser className="mr-2 text-blue-400" />
                        Customer Information
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <div>
                            <p className="text-sm text-gray-400">Full Name</p>
                            <p className="font-medium text-white">
                              {selectedOrder.customer?.name}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-400">
                              Phone Number
                            </p>
                            <p className="font-medium text-white flex items-center">
                              <FaPhone className="mr-2 text-gray-500" />
                              {selectedOrder.customer?.phone}
                            </p>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div>
                            <p className="text-sm text-gray-400">
                              Email Address
                            </p>
                            <p className="font-medium text-white flex items-center">
                              <FaEnvelope className="mr-2 text-gray-500" />
                              {selectedOrder.customer?.email || "N/A"}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-400">
                              Delivery Address
                            </p>
                            <p className="font-medium text-white flex items-start">
                              <FaHome className="mr-2 text-gray-500 mt-1 flex-shrink-0" />
                              <span>{selectedOrder.customer?.address}</span>
                            </p>
                          </div>
                        </div>
                      </div>
                      {selectedOrder.deliveryInstructions && (
                        <div className="mt-6 pt-6 border-t border-gray-700">
                          <p className="text-sm text-gray-400 mb-2">
                            Delivery Instructions
                          </p>
                          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                            <p className="text-yellow-400 flex items-start">
                              <FaExclamationTriangle className="mr-2 mt-1 flex-shrink-0" />
                              {selectedOrder.deliveryInstructions}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Order Items */}
                    <div>
                      <h4 className="font-semibold text-white text-lg mb-4 flex items-center">
                        <FaShoppingCart className="mr-2 text-green-400" />
                        Order Items ({selectedOrder.items?.length || 0})
                      </h4>
                      <div className="overflow-hidden border border-gray-700 rounded-xl">
                        <table className="min-w-full divide-y divide-gray-700">
                          <thead className="bg-gray-800">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                Item
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                Quantity
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                Unit Price
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                Total
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-gray-900 divide-y divide-gray-800">
                            {selectedOrder.items?.map((item, index) => (
                              <tr key={index} className="hover:bg-gray-800/50">
                                <td className="px-6 py-4">
                                  <div className="font-medium text-white">
                                    {item.menuItem?.name || item.name}
                                  </div>
                                  {item.specialInstructions && (
                                    <div className="text-sm text-gray-400 mt-1 bg-gray-800 p-2 rounded border border-gray-700">
                                      <span className="font-medium text-gray-300">Note:</span>{" "}
                                      {item.specialInstructions}
                                    </div>
                                  )}
                                </td>
                                <td className="px-6 py-4">
                                  <span className="inline-flex items-center justify-center w-8 h-8 bg-blue-500/10 text-blue-400 rounded-full font-medium border border-blue-500/20">
                                    {item.quantity}
                                  </span>
                                </td>
                                <td className="px-6 py-4 text-gray-300">
                                  ₹{item.price?.toFixed(2)}
                                </td>
                                <td className="px-6 py-4 font-semibold text-white">
                                  ₹
                                  {(
                                    (item.price || 0) * (item.quantity || 1)
                                  ).toFixed(2)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>

                  {/* Right column - Order Summary & Actions */}
                  <div className="space-y-6">
                    {/* Order Status Card */}
                    <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700/50">
                      <h4 className="font-semibold text-white text-lg mb-4 flex items-center">
                        {getStatusIcon(selectedOrder.status)}
                        <span className="ml-2">Order Status</span>
                      </h4>
                      <div
                        className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(selectedOrder.status)} mb-6`}
                      >
                        {selectedOrder.status}
                      </div>

                      <div className="space-y-3">
                        <p className="text-sm text-gray-400">Update Status:</p>
                        {getNextStatusOptions(selectedOrder.status).length >
                        0 ? (
                          <div className="relative">
                            <select
                              value=""
                              onChange={(e) =>
                                updateOrderStatus(
                                  selectedOrder._id,
                                  e.target.value,
                                )
                              }
                              className="block w-full pl-4 pr-10 py-3 text-sm bg-gray-900 border border-gray-700 text-white rounded-lg focus:ring-blue-500 focus:border-blue-500 appearance-none cursor-pointer hover:border-gray-600 transition-colors"
                            >
                              <option value="" disabled>
                                Select New Status...
                              </option>
                              {getNextStatusOptions(selectedOrder.status).map(
                                (status) => (
                                  <option key={status} value={status}>
                                    Mark as {status}
                                  </option>
                                ),
                              )}
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400">
                              <FaChevronDown className="h-4 w-4" />
                            </div>
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500 italic">
                            No further status updates available
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Order Summary */}
                    <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700/50">
                      <h4 className="font-semibold text-white text-lg mb-4">
                        Order Summary
                      </h4>
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Subtotal</span>
                          <span className="text-white">₹{selectedOrder.subtotal?.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Delivery Fee</span>
                          <span className="text-white">₹{selectedOrder.deliveryFee?.toFixed(2)}</span>
                        </div>
                        {selectedOrder.taxAmount > 0 && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Tax</span>
                            <span className="text-white">₹{selectedOrder.taxAmount?.toFixed(2)}</span>
                          </div>
                        )}
                        {selectedOrder.discountAmount > 0 && (
                          <div className="flex justify-between text-sm text-green-400">
                            <span>Discount</span>
                            <span>
                              -₹{selectedOrder.discountAmount?.toFixed(2)}
                            </span>
                          </div>
                        )}
                        <div className="pt-3 border-t border-gray-700">
                          <div className="flex justify-between font-semibold text-lg">
                            <span className="text-white">Total Amount</span>
                            <span className="text-blue-400">
                              ₹{selectedOrder.totalAmount?.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Payment Information */}
                    <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700/50">
                      <h4 className="font-semibold text-white text-lg mb-4 flex items-center">
                        <FaCreditCard className="mr-2 text-purple-400" />
                        Payment Information
                      </h4>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-400">Method</span>
                          <span className="font-medium text-white">
                            {selectedOrder.paymentMethod}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-400">Status</span>
                          <span
                            className={`font-medium ${
                              selectedOrder.paymentStatus === "Paid"
                                ? "text-green-400"
                                : "text-yellow-400"
                            }`}
                          >
                            {selectedOrder.paymentStatus || "Pending"}
                          </span>
                        </div>
                        {selectedOrder.transactionId && (
                          <div className="pt-3 border-t border-gray-700">
                            <p className="text-sm text-gray-400 mb-1">
                              Transaction ID
                            </p>
                            <p className="font-mono text-xs bg-gray-900 p-2 rounded break-all text-gray-300 border border-gray-700">
                              {selectedOrder.transactionId}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal footer */}
              <div className="bg-gray-900 px-6 py-4 sm:px-8 sm:py-6 border-t border-gray-800">
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-5 py-2.5 border border-gray-700 text-gray-300 rounded-lg hover:bg-gray-800 hover:text-white transition-colors duration-150 font-medium"
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      handlePrintOrder(selectedOrder);
                      setShowModal(false);
                    }}
                    className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-150 font-medium"
                  >
                    Print Receipt
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderManagement;
