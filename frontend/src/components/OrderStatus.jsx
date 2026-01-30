import React, { useEffect, useState } from "react";
import {
  FaCheckCircle,
  FaUtensils,
  FaMotorcycle,
  FaHome,
} from "react-icons/fa";
import socketService from "../services/socket";

const statusSteps = [
  { status: "Order Received", icon: FaCheckCircle, color: "text-blue-500" },
  { status: "Preparing", icon: FaUtensils, color: "text-yellow-500" },
  { status: "Out for Delivery", icon: FaMotorcycle, color: "text-orange-500" },
  { status: "Delivered", icon: FaHome, color: "text-green-500" },
];

const OrderStatus = ({ orderId, currentStatus }) => {
  const [status, setStatus] = useState(currentStatus);

  useEffect(() => {
    if (!orderId) return;
    
    socketService.connect();
    
    // Listen for order updates
    const handleOrderUpdate = (data) => {
      if (data._id === orderId || data.orderId === orderId) {
        setStatus(data.status || data.newStatus);
      }
    };
    
    socketService.socket.on('orderUpdated', handleOrderUpdate);

    return () => {
      if (socketService.socket) {
        socketService.socket.off('orderUpdated', handleOrderUpdate);
      }
    };
  }, [orderId]);

  const currentIndex = statusSteps.findIndex((step) => step.status === status);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Order Status</h2>

      <div className="relative">
        <div className="absolute left-0 top-6 h-1 bg-gray-200 w-full"></div>
        <div
          className="absolute left-0 top-6 h-1 bg-green-500 transition-all duration-500"
          style={{
            width: `${(currentIndex / (statusSteps.length - 1)) * 100}%`,
          }}
        ></div>

        <div className="flex justify-between">
          {statusSteps.map((step, index) => {
            const Icon = step.icon;
            const isCompleted = index <= currentIndex;
            const isCurrent = index === currentIndex;

            return (
              <div key={step.status} className="relative z-10 text-center">
                <div
                  className={`
                  w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2
                  ${isCompleted ? "bg-green-500" : "bg-gray-200"}
                  ${isCurrent ? "ring-4 ring-green-200" : ""}
                `}
                >
                  <Icon
                    className={`text-xl ${isCompleted ? "text-white" : "text-gray-400"}`}
                  />
                </div>
                <span
                  className={`
                  text-sm font-medium
                  ${isCompleted ? "text-green-600" : "text-gray-400"}
                `}
                >
                  {step.status}
                </span>
                {isCurrent && (
                  <p className="text-xs text-gray-500 mt-1">Current Status</p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold text-blue-800 mb-2">Order Details</h3>
        <p className="text-blue-600">
          Your order is currently: <span className="font-bold">{status}</span>
        </p>
        <p className="text-sm text-blue-500 mt-2">
          Status updates in real-time. This page will update automatically.
        </p>
      </div>
    </div>
  );
};

export default OrderStatus;
