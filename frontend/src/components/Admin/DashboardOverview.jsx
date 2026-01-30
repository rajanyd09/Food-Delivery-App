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
      icon: <FaShoppingCart className="text-blue-600" size={20} />,
      gradient: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      iconBg: "bg-blue-100",
    },
    {
      title: "Pending",
      value: stats.received || 0,
      icon: <FaClock className="text-yellow-600" size={20} />,
      gradient: "from-yellow-500 to-yellow-600",
      bgColor: "bg-yellow-50",
      iconBg: "bg-yellow-100",
    },
    {
      title: "In Delivery",
      value: stats.delivery || 0,
      icon: <FaMotorcycle className="text-orange-600" size={20} />,
      gradient: "from-orange-500 to-orange-600",
      bgColor: "bg-orange-50",
      iconBg: "bg-orange-100",
    },
    {
      title: "Completed",
      value: stats.delivered || 0,
      icon: <FaCheckCircle className="text-green-600" size={20} />,
      gradient: "from-green-500 to-green-600",
      bgColor: "bg-green-50",
      iconBg: "bg-green-100",
    },
    {
      title: "Cancelled",
      value: stats.cancelled || 0,
      icon: <FaTimesCircle className="text-red-600" size={20} />,
      gradient: "from-red-500 to-red-600",
      bgColor: "bg-red-50",
      iconBg: "bg-red-100",
    },
    {
      title: "Total Revenue",
      value: `$${(stats.revenue?.totalRevenue || 0).toFixed(2)}`,
      icon: <FaDollarSign className="text-purple-600" size={20} />,
      gradient: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50",
      iconBg: "bg-purple-100",
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
              ${(stats.revenue?.totalRevenue || 0).toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((stat, index) => (
          <div
            key={index}
            className={`${stat.bgColor} rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 p-5 border border-gray-100`}
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <p className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-2">
                  {stat.title}
                </p>
                <p className="text-3xl font-bold text-gray-900 mb-1">
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
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">Recent Orders</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Order
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Time
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentOrders.slice(0, 5).map((order) => (
                  <tr
                    key={order._id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                      #{order.orderNumber || order._id.slice(-6)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-gray-900">
                        {order.customer?.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {order.customer?.phone}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm font-bold text-green-600">
                      ${order.totalAmount?.toFixed(2)}
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
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center">
              <FaChartLine className="mr-2 text-blue-600" />
              Quick Stats
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">Avg Order Value</span>
                <span className="font-bold text-gray-900">
                  ${(stats.revenue?.avgOrderValue || 0).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">Today's Orders</span>
                <span className="font-bold text-gray-900">
                  {stats.today || 0}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">This Week</span>
                <span className="font-bold text-gray-900">
                  {stats.thisWeek || 0}
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-gray-600">Completion Rate</span>
                <span className="font-bold text-green-600">
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
      return "bg-blue-100 text-blue-700";
    case "Preparing":
      return "bg-yellow-100 text-yellow-700";
    case "Out for Delivery":
      return "bg-orange-100 text-orange-700";
    case "Delivered":
      return "bg-green-100 text-green-700";
    case "Cancelled":
      return "bg-red-100 text-red-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
};

export default DashboardOverview;
