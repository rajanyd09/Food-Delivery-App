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
import CategoryManagement from "./CategoryManagement";
import { FaTags } from "react-icons/fa";

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
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-400">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white font-sans">
      {/* Main Layout */}
      <div className="flex h-screen  overflow-hidden bg-gray-950">
        {/* Sidebar */}
        <div
          className={`${sidebarOpen ? "w-72" : "w-[88px]"} bg-gray-900 border-r border-gray-800 transition-all duration-300 flex flex-col flex-shrink-0 z-50`}
        >
          {/* Sidebar Header */}
          <div className="h-20 flex items-center justify-between px-6 border-b border-gray-800">
            <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-blue-400 flex items-center justify-center shadow-lg shadow-blue-500/20 flex-shrink-0">
                    <img 
                      src="/food-delivery_2947553.png" 
                      alt="Logo" 
                      className="w-6 h-6 object-contain brightness-0 invert"
                    />
                </div>
                {sidebarOpen && (
                    <span className="font-bold text-lg text-white whitespace-nowrap tracking-wide">
                        FoodExpress
                        <span className="text-blue-400">.</span>
                    </span>
                )}
            </div>
            {sidebarOpen && (
                 <button
                    onClick={() => setSidebarOpen(false)}
                    className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
                  >
                    <FaTimes size={14} />
                  </button>
            )}
          </div>

          {/* Navigation */}
          <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1 custom-scrollbar">
            {!sidebarOpen && (
                <div className="flex justify-center mb-6">
                     <button
                        onClick={() => setSidebarOpen(true)}
                        className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
                      >
                        <FaBars size={18} />
                      </button>
                </div>
            )}
          
            {[
                { id: "dashboard", label: "Dashboard", icon: FaHome },
                { id: "orders", label: "Orders", icon: FaShoppingCart, badge: stats.received },
                { id: "menu", label: "Menu Items", icon: FaUtensils },
                { id: "categories", label: "Categories", icon: FaTags },
            ].map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                
                return (
                    <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 group relative
                            ${isActive 
                                ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" 
                                : "text-gray-400 hover:bg-gray-800 hover:text-white"
                            }
                        `}
                    >
                        <Icon className={`text-lg transition-transform group-hover:scale-110 ${isActive ? 'text-white' : 'text-gray-500 group-hover:text-white'}`} />
                        
                        {sidebarOpen && (
                            <span className="font-medium text-sm">{item.label}</span>
                        )}

                        {!sidebarOpen && isActive && (
                            <div className="absolute left-full ml-4 px-2 py-1 bg-gray-800 text-white text-xs rounded shadow-xl whitespace-nowrap z-50">
                                {item.label}
                            </div>
                        )}
                        
                        {item.badge > 0 && (
                            <span className={`absolute ${sidebarOpen ? 'right-4' : 'top-2 right-2'} flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[10px] font-bold ${isActive ? 'bg-white text-blue-600' : 'bg-red-500 text-white'}`}>
                                {item.badge}
                            </span>
                        )}
                    </button>
                );
            })}
          </div>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-gray-800 bg-gray-900/50">
            <button
              onClick={handleLogout}
              className={`w-full flex items-center ${sidebarOpen ? 'gap-3 px-4' : 'justify-center'} py-3 text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-xl transition-all`}
            >
              <FaSignOutAlt className="text-lg" />
              {sidebarOpen && <span className="font-medium text-sm">Sign Out</span>}
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-gray-950">
          {/* Top Bar */}
          <header className="h-20 bg-gray-900/80 backdrop-blur-xl border-b border-gray-800 px-8 flex items-center justify-between sticky top-0 z-30">
             <div>
                <h1 className="text-2xl font-bold text-white tracking-tight">
                    {activeTab === "dashboard" && "Dashboard Overview"}
                    {activeTab === "orders" && "Order Management"}
                    {activeTab === "menu" && "Menu Management"}
                    {activeTab === "categories" && "Category Management"}
                </h1>
                <p className="text-sm text-gray-500 mt-1">Welcome back, {user?.name}</p>
             </div>

             <div className="flex items-center gap-4">
                 <button className="relative w-10 h-10 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center text-gray-400 hover:text-white hover:border-gray-600 transition-all">
                    <FaBell />
                    {stats.received > 0 && <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-gray-800"></span>}
                 </button>
                 <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-600 to-blue-600 p-0.5">
                    <div className="w-full h-full rounded-full bg-gray-900 flex items-center justify-center text-white font-bold text-sm">
                        {user?.name?.charAt(0) || 'A'}
                    </div>
                 </div>
             </div>
          </header>

          {/* Content Area */}
          <main className="flex-1 overflow-y-auto p-8 custom-scrollbar">
            <div className="max-w-7xl mx-auto">
                {activeTab === "dashboard" && (
                <DashboardOverview stats={stats} recentOrders={recentOrders} />
                )}
                {activeTab === "orders" && (
                <OrderManagement orders={orders} onRefresh={fetchDashboardData} />
                )}
                {activeTab === "menu" && <MenuItemManagement />}
                {activeTab === "categories" && <CategoryManagement />}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
