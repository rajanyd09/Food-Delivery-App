import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { orderService } from "../services/api";
import toast from "react-hot-toast";
import {
  FaClock,
  FaCheckCircle,
  FaMotorcycle,
  FaShoppingBag,
  FaTimesCircle,
  FaMapMarkerAlt,
  FaChevronRight,
  FaReceipt,
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
      const response = await orderService.getUserOrders({
        params: { page: 1, limit: 20 },
      });

      if (response?.data?.success && Array.isArray(response.data.data.orders)) {
        setOrders(response.data.data.orders);
      } else {
        setOrders([]);
      }
    } catch (error) {
      console.error("Fetch error:", error);
      toast.error("Failed to load orders");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString, showTime = false) => {
    if (!dateString) return;
    const date = new Date(dateString);
    if (showTime) {
      return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });
    }
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getStatusConfig = (status) => {
    switch (status?.toLowerCase()) {
      case "order received":
        return {
          icon: <FaClock />,
          color: "text-blue-600 bg-blue-50",
          label: "Received"
        };
      case "preparing":
        return {
          icon: <FaClock />,
          color: "text-amber-600 bg-amber-50",
          label: "Preparing"
        };
      case "out for delivery":
        return {
          icon: <FaMotorcycle />,
          color: "text-orange-600 bg-orange-50",
          label: "On the Way"
        };
      case "delivered":
        return {
          icon: <FaCheckCircle />,
          color: "text-green-600 bg-green-50",
          label: "Delivered"
        };
      case "cancelled":
        return {
          icon: <FaTimesCircle />,
          color: "text-red-600 bg-red-50",
          label: "Cancelled"
        };
      default:
        return {
          icon: <FaClock />,
          color: "text-gray-600 bg-gray-50",
          label: status
        };
    }
  };

  const handleCancelOrder = async (orderId, e) => {
    e.preventDefault(); // Prevent link navigation
    if (window.confirm("Are you sure you want to cancel this order?")) {
      try {
        await orderService.cancelOrder(orderId);
        toast.success("Order cancelled");
        fetchOrders();
      } catch (error) {
        toast.error("Failed to cancel");
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50/50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      <main className="max-w-4xl mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <FaReceipt className="text-gray-400" />
            Your Orders
          </h1>
          <p className="text-gray-500 text-sm mt-1 ml-9">
            View and track your past orders
          </p>
        </header>

        {!orders || orders.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-300">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaShoppingBag className="text-gray-400 text-2xl" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              No orders yet
            </h2>
            <p className="text-gray-500 mb-6 text-sm">
              Hungry? Place your first order now!
            </p>
            <Link
              to="/menu"
              className="inline-flex items-center px-6 py-2.5 bg-gray-900 text-white rounded-full hover:bg-black transition-colors text-sm font-medium"
            >
              Browse Menu
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const status = getStatusConfig(order.status);
              const isActive = ["order received", "preparing", "out for delivery"].includes(
                order.status?.toLowerCase()
              );

              return (
                <Link
                  to={`/order-status/${order._id}`}
                  key={order._id}
                  className="block bg-white rounded-xl border border-gray-200 hover:border-blue-400 hover:shadow-md transition-all duration-200 overflow-hidden group"
                >
                  <div className="p-5">
                    {/* Header: ID, Date, Status */}
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="flex items-baseline gap-3 mb-1">
                          <h3 className="font-bold text-gray-900">
                            #{order.orderNumber || order._id?.slice(-6).toUpperCase()}
                          </h3>
                          <span className="text-xs text-gray-500">
                            {formatDate(order.createdAt)} • {formatDate(order.createdAt, true)}
                          </span>
                        </div>
                        <div className="flex items-center text-xs text-gray-500 gap-1.5">
                           <FaMapMarkerAlt className="flex-shrink-0" />
                           <span className="truncate max-w-[200px] sm:max-w-xs">
                             {order.customer?.address || "Pickup"}
                           </span>
                        </div>
                      </div>
                      
                      <div className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 ${status.color}`}>
                        {status.icon}
                        {status.label}
                      </div>
                    </div>

                    {/* Content: Items & Price */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-4 border-t border-gray-100 gap-4 sm:gap-0">
                      <div className="text-sm text-gray-600 w-full sm:flex-1 sm:pr-4">
                        <div className="flex items-center gap-2 mb-1 sm:mb-0">
                          <span className="font-medium text-gray-900 shrink-0">
                            {order.items?.length} items
                          </span>
                          <span className="text-gray-300 hidden sm:inline">|</span>
                          <span className="truncate block flex-1">
                            {order.items?.map(i => i.menuItem?.name || i.name).join(", ")}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between sm:justify-end gap-4 sm:pl-4 sm:border-l border-gray-100 w-full sm:w-auto">
                         <span className="text-xs text-gray-500 sm:hidden">Total</span>
                         <div className="flex items-center gap-4">
                           <span className="font-bold text-gray-900 text-lg">
                             ₹{order.totalAmount?.toFixed(2)}
                           </span>
                           <FaChevronRight className="text-gray-300 group-hover:text-blue-500 transition-colors" />
                         </div>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default OrderHistoryPage;
