import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { orderService } from "../services/api";
import socketService from "../services/socket";
import OrderStatus from "../components/OrderStatus";
import { FaSpinner, FaExclamationTriangle, FaArrowLeft, FaPhone, FaMapMarkerAlt, FaEnvelope } from "react-icons/fa";
import toast from "react-hot-toast";

const OrderStatusPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!orderId) return;
    
    fetchOrder();
    connectWebSocket();

    return () => {
      socketService.disconnect();
    };
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const response = await orderService.getOrder(orderId);
      setOrder(response.data);
      setError(null);
    } catch (error) {
      setError("Failed to load order details");
      toast.error("Failed to load order details");
    } finally {
      setLoading(false);
    }
  };

  const connectWebSocket = () => {
    socketService.connect();
    
    if (orderId) {
      socketService.joinOrderRoom(orderId);
    }
    
    socketService.socket.on('connect', () => {
       if (orderId) {
         socketService.joinOrderRoom(orderId);
       }
    });
    
    socketService.socket.on('orderStatusUpdated', (data) => {
      if (data.orderId === orderId || data._id === orderId) {
        setOrder(prevOrder => ({
          ...prevOrder, 
          status: data.status,
          ...data.updatedOrder
        }));
        toast.success(`Order status updated: ${data.status}`);
      }
    });
  };

  const handleCancelOrder = async () => {
    if (window.confirm("Are you sure you want to cancel this order?")) {
      try {
        await orderService.cancelOrder(orderId);
        toast.success("Order cancelled");
        fetchOrder();
      } catch (error) {
        toast.error(error.response?.data?.error || "Failed to cancel");
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center bg-white p-8 rounded-xl shadow-sm border border-gray-100 max-w-sm w-full">
          <FaExclamationTriangle className="text-3xl text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-900 mb-2">Order Not Found</h3>
          <p className="text-sm text-gray-500 mb-6">{error || "The requested order could not be found."}</p>
          <button
            onClick={() => navigate('/')}
            className="w-full bg-gray-900 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-gray-800 transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  const canCancel = order.status === "Order Received" || order.status === "Preparing";

  return (
    <div className=" bg-gray-50/50 py-2 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-4">
                 <button 
                    onClick={() => navigate('/')}
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-white border border-gray-200 text-gray-500 hover:text-gray-900 hover:border-gray-300 transition-all shadow-sm"
                >
                    <FaArrowLeft className="text-sm" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Order Updates</h1>
                    <p className="text-sm text-gray-500">Order ID: <span className="font-mono text-gray-700">#{order._id.slice(-6).toUpperCase()}</span></p>
                </div>
            </div>

            {canCancel && (
              <button
                onClick={handleCancelOrder}
                className="px-4 py-2 bg-white border border-red-200 text-red-600 text-sm font-semibold rounded-lg hover:bg-red-50 transition-colors"
              >
                Cancel Order
              </button>
            )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Status & Details */}
            <div className="lg:col-span-2 space-y-6">
                <OrderStatus orderId={order._id} currentStatus={order.status} />

                {/* Delivery Information */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h3 className="text-base font-bold text-gray-900 mb-4 border-b border-gray-50 pb-2">
                        Delivery Details
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                <div className="mt-1 w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 flex-shrink-0">
                                    <FaMapMarkerAlt className="text-xs" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-0.5">Address</p>
                                    <p className="text-sm text-gray-900">{order.customer.address}</p>
                                    {order.deliveryInstructions && (
                                        <p className="text-xs text-amber-600 mt-1 bg-amber-50 p-1.5 rounded border border-amber-100 italic">
                                            " {order.deliveryInstructions} "
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                 <div className="mt-1 w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center text-purple-600 flex-shrink-0">
                                    <FaEnvelope className="text-xs" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-0.5">Contact</p>
                                    <p className="text-sm text-gray-900 font-medium">{order.customer.name}</p>
                                    <p className="text-sm text-gray-600">{order.customer.phone}</p>
                                    <p className="text-xs text-gray-400">{order.customer.email}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Column: Order Summary */}
            <div className="lg:col-span-1">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden sticky top-6">
                    <h3 className="text-base font-bold text-gray-900 p-5 border-b border-gray-50 bg-gray-50/50">
                        Order Summary
                    </h3>
                    
                    <div className="p-5 max-h-[50vh] overflow-y-auto space-y-4">
                        {order.items.map((item, index) => (
                            <div key={index} className="flex gap-3 items-start">
                                <div className="w-10 h-10 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-400 font-bold text-xs flex-shrink-0 overflow-hidden">
                                     {/* Fallback if no image available, or could fetch menu details */}
                                     {item.menuItem?.image ? (
                                         <img src={item.menuItem.image} alt="" className="w-full h-full object-cover"/>
                                     ) : (
                                         <span>x{item.quantity}</span>
                                     )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start">
                                        <p className="text-sm font-semibold text-gray-900 truncate pr-2">
                                            {item.menuItem?.name || "Unknown Item"}
                                        </p>
                                        <p className="text-sm font-bold text-gray-900">
                                            ₹{(item.price * item.quantity).toFixed(2)}
                                        </p>
                                    </div>
                                    <p className="text-xs text-gray-500">
                                        Single: ₹{item.price.toFixed(2)}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="p-5 bg-gray-50 border-t border-gray-100 space-y-2">
                         <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Subtotal</span>
                            <span className="font-medium text-gray-900">₹{order.subtotal?.toFixed(2)}</span>
                        </div>
                         <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Delivery</span>
                            <span className="font-medium text-gray-900">₹{order.deliveryFee?.toFixed(2)}</span>
                        </div>
                         <div className="pt-3 mt-1 border-t border-gray-200 flex justify-between items-center">
                            <span className="text-base font-bold text-gray-900">Total Paid</span>
                            <span className="text-xl font-bold text-green-600">₹{order.totalAmount?.toFixed(2)}</span>
                        </div>
                         <div className="mt-3 text-center">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                {order.paymentMethod} • {order.paymentStatus}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default OrderStatusPage;
