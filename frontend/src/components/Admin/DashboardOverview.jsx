// components/DashboardOverview.jsx
import React from "react";
import {
  FaShoppingCart,
  FaClock,
  FaMotorcycle,
  FaCheckCircle,
  FaTimesCircle,
  FaDollarSign,
  FaChartLine,
} from "react-icons/fa";


const DashboardOverview = ({ stats, recentOrders }) => {
  const statCards = [
    {
      title: "Total Orders",
      value: stats.total || 0,
      icon: <FaShoppingCart className="text-blue-400" size={20} />,
      gradient: "from-blue-500 to-blue-600",
      bgColor: "bg-gray-900",
      iconBg: "bg-blue-900/20",
    },
    {
      title: "Pending",
      value: stats.received || 0,
      icon: <FaClock className="text-yellow-400" size={20} />,
      gradient: "from-yellow-500 to-yellow-600",
      bgColor: "bg-gray-900",
      iconBg: "bg-yellow-900/20",
    },
    {
      title: "In Delivery",
      value: stats.delivery || 0,
      icon: <FaMotorcycle className="text-orange-400" size={20} />,
      gradient: "from-orange-500 to-orange-600",
      bgColor: "bg-gray-900",
      iconBg: "bg-orange-900/20",
    },
    {
      title: "Completed",
      value: stats.delivered || 0,
      icon: <FaCheckCircle className="text-green-400" size={20} />,
      gradient: "from-green-500 to-green-600",
      bgColor: "bg-gray-900",
      iconBg: "bg-green-900/20",
    },
    {
      title: "Cancelled",
      value: stats.cancelled || 0,
      icon: <FaTimesCircle className="text-red-400" size={20} />,
      gradient: "from-red-500 to-red-600",
      bgColor: "bg-gray-900",
      iconBg: "bg-red-900/20",
    },
    {
      title: "Total Revenue",
      value: `₹${(stats.revenue?.totalRevenue || 0).toFixed(2)}`,
      icon: <FaDollarSign className="text-purple-400" size={20} />,
      gradient: "from-purple-500 to-purple-600",
      bgColor: "bg-gray-900",
      iconBg: "bg-purple-900/20",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 rounded-2xl shadow-lg p-6 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full -ml-24 -mb-24"></div>
        <div className="relative z-10 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold mb-1">Welcome back, Admin!</h1>
            <p className="text-blue-100">
              Here's what's happening with your business today.
            </p>
          </div>
          <div className="hidden md:block text-right">
            <p className="text-sm opacity-90 mb-1">Total Revenue</p>
            <p className="text-3xl font-bold">
              ₹{(stats.revenue?.totalRevenue || 0).toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((stat, index) => (
          <div
            key={index}
            className={`${stat.bgColor} rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 p-5 border border-gray-800`}
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
                  {stat.title}
                </p>
                <p className="text-3xl font-bold text-white mb-1">
                  {stat.value}
                </p>
              </div>
              <div
                className={`${stat.iconBg} p-3 rounded-xl shadow-sm`}
              >
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Orders & Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-gray-900 rounded-2xl shadow-sm p-6 border border-gray-800">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-white">Recent Orders</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Order
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Time
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {recentOrders.slice(0, 5).map((order) => (
                  <tr
                    key={order._id}
                    className="hover:bg-gray-800/50 transition-colors"
                  >
                    <td className="px-4 py-3 text-sm font-semibold text-white">
                      #{order.orderNumber || order._id.slice(-6)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-white">
                        {order.customer?.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {order.customer?.phone}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm font-bold text-green-400">
                      ₹{order.totalAmount?.toFixed(2)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {recentOrders.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <FaShoppingCart className="mx-auto text-5xl text-gray-300 mb-3" />
              <p className="font-medium">No recent orders found</p>
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="space-y-4">
          <div className="bg-gray-900 rounded-2xl shadow-sm p-6 border border-gray-800">
            <h3 className="font-bold text-white mb-4 flex items-center">
              <FaChartLine className="mr-2 text-blue-500" />
              Quick Stats
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-gray-800">
                <span className="text-sm text-gray-400">Avg Order Value</span>
                <span className="font-bold text-white">
                  ₹{(stats.revenue?.avgOrderValue || 0).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-800">
                <span className="text-sm text-gray-400">Today's Orders</span>
                <span className="font-bold text-white">
                  {stats.today || 0}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-800">
                <span className="text-sm text-gray-400">This Week</span>
                <span className="font-bold text-white">
                  {stats.thisWeek || 0}
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-gray-400">Completion Rate</span>
                <span className="font-bold text-green-400">
                  {stats.total
                    ? Math.round(((stats.delivered || 0) / stats.total) * 100)
                    : 0}
                  %
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const getStatusColor = (status) => {
  switch (status) {
    case "Order Received":
      return "bg-blue-500/10 text-blue-400 border border-blue-500/20";
    case "Preparing":
      return "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20";
    case "Out for Delivery":
      return "bg-orange-500/10 text-orange-400 border border-orange-500/20";
    case "Delivered":
      return "bg-green-500/10 text-green-400 border border-green-500/20";
    case "Cancelled":
      return "bg-red-500/10 text-red-400 border border-red-500/20";
    default:
      return "bg-gray-800 text-gray-400 border border-gray-700";
  }
};

export default DashboardOverview;
