import React, { useEffect, useState } from "react";
import {
  FaCheck,
  FaUtensils,
  FaMotorcycle,
  FaMapMarkerAlt,
  FaClock
} from "react-icons/fa";
import socketService from "../services/socket";

const statusSteps = [
  { status: "Order Received", icon: FaCheck, label: "Received" },
  { status: "Preparing", icon: FaUtensils, label: "Preparing" },
  { status: "Out for Delivery", icon: FaMotorcycle, label: "On the way" },
  { status: "Delivered", icon: FaMapMarkerAlt, label: "Delivered" },
];

const OrderStatus = ({ orderId, currentStatus }) => {
  const [status, setStatus] = useState(currentStatus);

  useEffect(() => {
    if (!orderId) return;
    
    socketService.connect();
    
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
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
            <h2 className="text-lg font-bold text-gray-900">Track Order</h2>
            <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
                <FaClock className="text-gray-400" />
                <span className="font-medium">Real-time updates</span>
            </p>
        </div>
        <div className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-bold uppercase tracking-wider">
            {status}
        </div>
      </div>

      <div className="relative">
        {/* Progress Bar Background */}
        <div className="absolute left-[20px] top-[24px] right-[20px] h-0.5 bg-gray-100 -z-10 hidden sm:block"></div>
        
        {/* Active Progress Bar */}
        <div 
            className="absolute left-[20px] top-[24px] h-0.5 bg-green-500 transition-all duration-700 ease-out -z-10 hidden sm:block"
            style={{ width: `calc(${Math.min((currentIndex / (statusSteps.length - 1)) * 100, 100)}% - 40px)` }}
        ></div>

        <div className="flex flex-col sm:flex-row justify-between gap-6 sm:gap-0">
          {statusSteps.map((step, index) => {
            const Icon = step.icon;
            const isCompleted = index <= currentIndex;
            const isCurrent = index === currentIndex;

            return (
              <div key={step.status} className="flex sm:flex-col items-center gap-4 sm:gap-3 group">
                <div
                  className={`
                  w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 relative
                  ${isCompleted ? "bg-green-600 text-white shadow-lg shadow-green-200" : "bg-white border-2 border-gray-200 text-gray-300"}
                  ${isCurrent ? "scale-110 ring-4 ring-green-50" : ""}
                `}
                >
                  <Icon className="text-sm" />
                  {isCurrent && (
                     <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-ping"></span>
                  )}
                </div>
                
                <div className="text-left sm:text-center">
                    <p className={`text-sm font-bold transition-colors ${isCompleted ? 'text-gray-900' : 'text-gray-400'}`}>
                        {step.label}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5 sm:hidden lg:block">
                        {step.status}
                    </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default OrderStatus;
