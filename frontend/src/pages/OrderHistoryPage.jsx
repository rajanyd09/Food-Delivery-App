import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { orderService } from "../services/api";
import toast from "react-hot-toast";
import {
  FaClock,
  FaCheckCircle,
  FaMotorcycle,
  FaHome,
  FaTimesCircle,
} from "react-icons/fa";

const OrderHistoryPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      // Fix 1: Pass pagination params and ensure auth headers
      const response = await orderService.getUserOrders({
        params: { page: 1, limit: 20 }, // Match backend expectations
      });

      console.log("Full response:", response); // Debug

      // Fix 2: Simplified parsing - matches EXACT backend structure
      if (response?.data?.success && Array.isArray(response.data.data.orders)) {
        setOrders(response.data.data.orders);
        console.log("✅ Orders loaded:", response.data.data.orders.length);
      } else {
        console.log("❌ No orders found or wrong format");
        setOrders([]);
      }
    } catch (error) {
      console.error("Fetch error:", error.response?.data || error.message);
      toast.error("Failed to load orders");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Unknown date";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      return "Invalid date";
    }
  };

  const getStatusIcon = (status) => {
    if (!status) return <FaClock className="w-5 h-5 text-gray-500" />;

    switch (status.toLowerCase()) {
      case "order received":
        return <FaClock className="w-5 h-5 text-blue-500" />;
      case "preparing":
        return <FaClock className="w-5 h-5 text-yellow-500" />;
      case "out for delivery":
        return <FaMotorcycle className="w-5 h-5 text-orange-500" />;
      case "delivered":
        return <FaCheckCircle className="w-5 h-5 text-green-500" />;
      case "cancelled":
        return <FaTimesCircle className="w-5 h-5 text-red-500" />;
      default:
        return <FaClock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    if (!status) return "bg-gray-100 text-gray-800";

    switch (status.toLowerCase()) {
      case "order received":
        return "bg-blue-100 text-blue-800";
      case "preparing":
        return "bg-yellow-100 text-yellow-800";
      case "out for delivery":
        return "bg-orange-100 text-orange-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (window.confirm("Are you sure you want to cancel this order?")) {
      try {
        await orderService.cancelOrder(orderId);
        toast.success("Order cancelled successfully");
        fetchOrders(); // Refresh the orders list
      } catch (error) {
        console.error("Error cancelling order:", error);
        toast.error("Failed to cancel order");
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading order history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">

      <main className="max-w-7xl mx-auto px-4 py-8">
        {!orders || orders.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FaHome className="w-12 h-12 text-gray-400" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">
              No orders yet
            </h2>
            <p className="text-gray-600 mb-6">
              Start your first food adventure!
            </p>
            <Link
              to="/"
              className="inline-block bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 font-medium"
            >
              Browse Menu
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div
                key={order._id || Math.random()}
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Order #
                        {order.orderNumber ||
                          order._id?.slice(-8)?.toUpperCase() ||
                          "N/A"}
                      </h3>
                      <p className="text-gray-600 text-sm mt-1">
                        {formatDate(order.createdAt || order.orderDate)}
                      </p>
                    </div>
                    <div className="flex items-center space-x-4 mt-4 md:mt-0">
                      <div
                        className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}
                      >
                        <div className="flex items-center">
                          {getStatusIcon(order.status)}
                          <span className="ml-2">
                            {order.status || "Unknown"}
                          </span>
                        </div>
                      </div>
                      <div className="text-xl font-bold text-green-600">
                        ${order.totalAmount?.toFixed(2) || "0.00"}
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div>
                        <h4 className="font-medium text-gray-700 mb-2">
                          Delivery Address
                        </h4>
                        <p className="text-gray-600">
                          {order.customer?.address || "No address provided"}
                        </p>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-700 mb-2">
                          Contact Info
                        </h4>
                        <p className="text-gray-600">
                          {order.customer?.name || "Customer"}
                        </p>
                        <p className="text-gray-600">
                          {order.customer?.phone || "No phone"}
                        </p>
                      </div>
                    </div>

                    <div className="mb-6">
                      <h4 className="font-medium text-gray-700 mb-3">
                        Items Ordered
                      </h4>
                      <div className="space-y-3">
                        {order.items?.map((item, index) => (
                          <div
                            key={item.menuItem?._id || index}
                            className="flex justify-between items-center"
                          >
                            <div className="flex-1">
                              <span className="font-medium text-gray-800">
                                {item.menuItem?.name ||
                                  item.name ||
                                  `Item ${index + 1}`}
                              </span>
                              <span className="text-gray-600 text-sm ml-2">
                                × {item.quantity || 1}
                              </span>
                            </div>
                            <span className="font-medium">
                              $
                              {item.price && item.quantity
                                ? (item.price * item.quantity).toFixed(2)
                                : (item.itemTotal || 0).toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-between items-center border-t pt-4">
                      {order._id && (
                        <Link
                          to={`/order-status/${order._id}`}
                          className="text-blue-600 hover:text-blue-800 font-medium flex items-center"
                        >
                          View Details
                          <svg
                            className="w-4 h-4 ml-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </Link>
                      )}

                      {order._id &&
                      (order.status === "Order Received" ||
                        order.status === "Preparing") ? (
                        <button
                          onClick={() => handleCancelOrder(order._id)}
                          className="text-red-600 hover:text-red-800 font-medium"
                        >
                          Cancel Order
                        </button>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default OrderHistoryPage;
