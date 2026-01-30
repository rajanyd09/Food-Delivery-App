import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { orderService } from "../services/api";
import socketService from "../services/socket";
import OrderStatus from "../components/OrderStatus";
import { FaSpinner, FaExclamationTriangle } from "react-icons/fa";
import toast from "react-hot-toast";

const OrderStatusPage = () => {
  const { orderId } = useParams();
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
    
    // Listen for order updates
    socketService.socket.on('orderUpdated', (data) => {
      if (data._id === orderId || data.orderId === orderId) {
        setOrder(data);
        toast.success(`Order status updated to: ${data.status || data.newStatus}`);
      }
    });
  };

  const handleCancelOrder = async () => {
    if (window.confirm("Are you sure you want to cancel this order?")) {
      try {
        await orderService.cancelOrder(orderId);
        toast.success("Order cancelled successfully");
        fetchOrder(); // Refresh order data
      } catch (error) {
        toast.error(error.response?.data?.error || "Failed to cancel order");
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FaExclamationTriangle className="text-4xl text-red-500 mx-auto mb-4" />
          <p className="text-gray-600">{error || "Order not found"}</p>
          <button
            onClick={() => window.history.back()}
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const canCancel =
    order.status === "Order Received" || order.status === "Preparing";

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Order Status</h1>
              <p className="text-gray-600">Order #{order._id.slice(-8)}</p>
            </div>
            {canCancel && (
              <button
                onClick={handleCancelOrder}
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
              >
                Cancel Order
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <OrderStatus orderId={order._id} currentStatus={order.status} />

            <div className="mt-8 bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-4 text-gray-800">
                Order Details
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">
                    Customer Information
                  </h3>
                  <div className="space-y-2">
                    <p>
                      <span className="font-medium">Name:</span>{" "}
                      {order.customer.name}
                    </p>
                    <p>
                      <span className="font-medium">Email:</span>{" "}
                      {order.customer.email}
                    </p>
                    <p>
                      <span className="font-medium">Phone:</span>{" "}
                      {order.customer.phone}
                    </p>
                    <p>
                      <span className="font-medium">Address:</span>{" "}
                      {order.customer.address}
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">
                    Order Summary
                  </h3>
                  <div className="space-y-2">
                    <p>
                      <span className="font-medium">Order Date:</span>{" "}
                      {new Date(order.orderDate).toLocaleString()}
                    </p>
                    <p>
                      <span className="font-medium">Payment Method:</span>{" "}
                      {order.paymentMethod}
                    </p>
                    <p>
                      <span className="font-medium">Payment Status:</span>{" "}
                      {order.paymentStatus}
                    </p>
                    {order.estimatedDeliveryTime && (
                      <p>
                        <span className="font-medium">Estimated Delivery:</span>{" "}
                        {new Date(
                          order.estimatedDeliveryTime,
                        ).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {order.deliveryInstructions && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                  <h4 className="font-semibold text-yellow-800">
                    Delivery Instructions
                  </h4>
                  <p className="text-yellow-700">
                    {order.deliveryInstructions}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-4 text-gray-800">
                Order Items
              </h2>

              <div className="space-y-4">
                {order.items.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-start space-x-3 pb-4 border-b"
                  >
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800">
                        {item.menuItem?.name || "Item"}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Qty: {item.quantity}
                      </p>
                      {item.specialInstructions && (
                        <p className="text-sm text-gray-500">
                          Note: {item.specialInstructions}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-800">
                        ₹{(item.price * item.quantity).toFixed(2)}
                      </p>
                      <p className="text-sm text-gray-600">
                        ₹{item.price.toFixed(2)} each
                      </p>
                    </div>
                  </div>
                ))}

                <div className="pt-4 border-t">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-700">Subtotal</span>
                    <span className="font-medium">
                      ₹{order.subtotal?.toFixed(2) || '0.00'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-700">Delivery Fee</span>
                    <span className="font-medium">
                      ₹{order.deliveryFee?.toFixed(2) || '0.00'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-lg font-bold">
                    <span className="text-gray-900">Total</span>
                    <span className="text-green-600">
                      ₹{order.totalAmount?.toFixed(2) || '0.00'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold text-blue-800 mb-2">Need Help?</h3>
                <p className="text-blue-600 text-sm">
                  If you have any questions about your order, please contact our
                  customer support.
                </p>
                <button className="mt-2 text-blue-600 hover:text-blue-800 text-sm font-medium">
                  Contact Support →
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default OrderStatusPage;
