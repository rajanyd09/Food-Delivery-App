// components/AdminDashboard.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { orderService, authService } from "../../services/api";
import socketService from "../../services/socket";
import toast from "react-hot-toast";
import {
  FaHome,
  FaShoppingCart,
  FaUtensils,
  FaBell,
  FaSignOutAlt,
  FaBars,
  FaTimes,
} from "react-icons/fa";
import DashboardOverview from "./DashboardOverview";
import OrderManagement from "./OrderManagement";
import MenuItemManagement from "./MenuItemManagement";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({});
  const [recentOrders, setRecentOrders] = useState([]);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    checkAdminAccess();
    fetchDashboardData();
    setupWebSocket();

    return () => {
      socketService.disconnect();
    };
  }, []);

  const checkAdminAccess = async () => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      toast.error("Please login first");
      navigate("/login");
      return;
    }

    try {
      await authService.getProfile();
      if (currentUser.role !== "admin") {
        toast.error("Admin privileges required");
        navigate("/");
      } else {
        setUser(currentUser);
      }
    } catch (error) {
      console.log("Token invalid, redirecting to login");
      localStorage.clear();
      navigate("/login");
    }
  };

  const setupWebSocket = () => {
    socketService.connect();

    socketService.socket.on("newOrder", (data) => {
      toast.success(`New order #${data.orderNumber} received!`);
      fetchDashboardData();
    });

    socketService.socket.on("orderUpdated", (data) => {
      toast.info(`Order #${data.orderNumber} updated to ${data.newStatus}`);
      fetchDashboardData();
    });
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const [ordersRes, statsRes, recentRes] = await Promise.all([
        orderService.getAllOrders(),
        orderService.getOrderStats(),
        orderService.getRecentOrders(),
      ]);

      setOrders(ordersRes.data.data.orders || []);
      setStats(statsRes.data.data || {});
      setRecentOrders(recentRes.data.data || []);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    authService.logout();
    navigate("/login");
  };

  if (loading && activeTab === "dashboard") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Layout */}
      <div className="flex h-screen bg-gray-50">
        {/* Sidebar */}
        <div
          className={`${sidebarOpen ? "w-64" : "w-20"} bg-white border-r border-gray-200 transition-all duration-300 flex flex-col shadow-sm`}
        >
          {/* Sidebar Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              {sidebarOpen && (
                <div className="flex items-center space-x-2">
                  <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-md">
                    <FaUtensils className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                    Admin Panel
                  </span>
                </div>
              )}
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                {sidebarOpen ? (
                  <FaTimes className="w-4 h-4 text-gray-600" />
                ) : (
                  <FaBars className="w-4 h-4 text-gray-600" />
                )}
              </button>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex-1 p-3 overflow-y-auto">
            <nav className="space-y-1">
              {[
                { id: "dashboard", label: "Dashboard", icon: <FaHome /> },
                {
                  id: "orders",
                  label: "Orders",
                  icon: <FaShoppingCart />,
                  badge: stats.received,
                },
                { id: "menu", label: "Menu Items", icon: <FaUtensils /> },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 ${
                    activeTab === item.id
                      ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <div className="flex items-center">
                    <span className={`${sidebarOpen ? "mr-3" : ""}`}>
                      {item.icon}
                    </span>
                    {sidebarOpen && (
                      <span className="font-medium text-sm">{item.label}</span>
                    )}
                  </div>
                  {item.badge > 0 && sidebarOpen && (
                    <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-semibold">
                      {item.badge}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>

          {/* Sidebar Footer */}
          <div className="p-3 border-t border-gray-200">
            <button
              onClick={handleLogout}
              className="w-full flex items-center px-3 py-2.5 text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200"
            >
              <FaSignOutAlt className={`${sidebarOpen ? "mr-3" : ""}`} />
              {sidebarOpen && <span className="font-medium text-sm">Logout</span>}
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          {/* Top Bar */}
          <div className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-40 shadow-sm">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {activeTab === "dashboard" && "Dashboard"}
                  {activeTab === "orders" && "Order Management"}
                  {activeTab === "menu" && "Menu Management"}
                </h1>
                <p className="text-sm text-gray-600 mt-0.5">
                  {user?.name} • Admin
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <button className="relative p-2.5 rounded-xl hover:bg-gray-100 transition-all">
                  <FaBell className="w-5 h-5 text-gray-600" />
                  {stats.received > 0 && (
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="p-6">
            {activeTab === "dashboard" && (
              <DashboardOverview stats={stats} recentOrders={recentOrders} />
            )}
            {activeTab === "orders" && (
              <OrderManagement orders={orders} onRefresh={fetchDashboardData} />
            )}
            {activeTab === "menu" && <MenuItemManagement />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
