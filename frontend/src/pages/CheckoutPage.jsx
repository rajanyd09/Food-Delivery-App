import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { orderService } from "../services/api";
import { authService } from "../services/api";
import toast from "react-hot-toast";
import {
  FaCreditCard,
  FaMoneyBillWave,
  FaMapMarkerAlt,
  FaPhone,
  FaUser,
  FaLock,
  FaExclamationTriangle,
} from "react-icons/fa";

const CheckoutPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    phone: "",
    deliveryInstructions: "",
    paymentMethod: "cash",
  });
  const [formErrors, setFormErrors] = useState({});
  const [cart, setCart] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [isValidating, setIsValidating] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsValidating(true);

      // Load menu items
      const savedMenuItems = JSON.parse(
        localStorage.getItem("menuItems") || "[]",
      );
      setMenuItems(Array.isArray(savedMenuItems) ? savedMenuItems : []);

      // Load and validate cart
      const savedCart = JSON.parse(localStorage.getItem("cart") || "[]");
      const validCart = Array.isArray(savedCart)
        ? savedCart.filter(
            (item) =>
              item &&
              item.menuItemId &&
              typeof item.menuItemId === "string" &&
              item.quantity > 0,
          )
        : [];
      setCart(validCart);

      // Save validated cart back
      if (validCart.length !== savedCart.length) {
        localStorage.setItem("cart", JSON.stringify(validCart));
      }

      // Load user data
      try {
        const currentUser = authService.getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
          setFormData((prev) => ({
            ...prev,
            name: currentUser.name || "",
            phone: currentUser.phone || "",
            address: currentUser.address?.street || currentUser.address || "",
          }));
        } else {
          toast.error("Please login to continue");
          navigate("/login", { state: { from: "/checkout" } });
          return;
        }
      } catch (userError) {
        console.error("Error loading user:", userError);
        toast.error("Please login to continue");
        navigate("/login", { state: { from: "/checkout" } });
        return;
      }
    } catch (error) {
      console.error("Error loading checkout data:", error);
      toast.error("Failed to load checkout data");
    } finally {
      setIsValidating(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.name?.trim()) {
      errors.name = "Name is required";
    }

    if (!formData.phone?.trim()) {
      errors.phone = "Phone number is required";
    } else if (!/^[+]?[\d\s\-()]+$/.test(formData.phone)) {
      errors.phone = "Please enter a valid phone number";
    }

    if (!formData.address?.trim()) {
      errors.address = "Delivery address is required";
    } else if (formData.address.trim().length < 10) {
      errors.address = "Please enter a complete address";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const getMenuItem = (id) => {
    if (!id) return null;
    return menuItems.find((item) => item?._id === id);
  };

  const calculateSubtotal = () => {
    if (!cart || !Array.isArray(cart)) return 0;

    return cart.reduce((total, cartItem) => {
      if (!cartItem?.menuItemId || !cartItem?.quantity) return total;

      const menuItem = getMenuItem(cartItem.menuItemId);
      return total + (menuItem?.price || 0) * (cartItem.quantity || 0);
    }, 0);
  };

  const deliveryFee = 2.99;
  const subtotal = calculateSubtotal();
  const total = subtotal + deliveryFee;

  // Filter invalid cart items
  const validCartItems = cart.filter((cartItem) => {
    if (!cartItem?.menuItemId || !cartItem?.quantity) return false;
    const menuItem = getMenuItem(cartItem.menuItemId);
    return menuItem && cartItem.quantity > 0;
  });

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (validCartItems.length === 0 || !validateForm()) {
      toast.error(
        validCartItems.length === 0 ? "Cart empty" : "Fix form errors",
      );
      return;
    }

    setLoading(true);
    try {
      const userId = user?.id || localStorage.getItem("userId");
      if (!userId) {
        toast.error("Please login first");
        return;
      }

      const orderItems = validCartItems.map((cartItem) => ({
        menuItemId: cartItem.menuItemId,
        quantity: cartItem.quantity,
        price: getMenuItem(cartItem.menuItemId)?.price || 0,
      }));

      // ✅ Backend calculates subtotal from items
      const orderData = {
        user: userId,
        customer: {
          name: formData.name.trim(),
          address: formData.address.trim(),
          phone: formData.phone.trim(),
        },
        items: orderItems,
        totalAmount: total,
        deliveryFee: 2.99,
      };

      console.log("✅ Submitting:", orderData);

      const response = await orderService.createOrder(orderData);

      if (response.data?.success) {
        localStorage.removeItem("cart");
        setCart([]);
        toast.success("🎉 Order placed successfully!");
        navigate(`/order-status/${response.data.data._id}`);
      }
    } catch (error) {
      console.error("Order error:", error);
      toast.error(error.response?.data?.error || "Order failed");
    } finally {
      setLoading(false);
    }
  };

  if (isValidating) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading checkout...</p>
        </div>
      </div>
    );
  }

  if (validCartItems.length === 0 && !isValidating) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto">
          <div className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-12 h-12 text-yellow-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {cart.length > 0 ? "Cart Items Invalid" : "Your cart is empty"}
          </h1>
          <p className="text-gray-600 mb-8">
            {cart.length > 0
              ? "Some items in your cart are no longer available. Please add new items."
              : "Add some delicious food to your cart first!"}
          </p>
          <button
            onClick={() => navigate("/")}
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
            Browse Menu
          </button>
        </div>
      </div>
    );
  }

  const invalidItemsCount = cart.length - validCartItems.length;

  return (
    <div className="min-h-screen bg-gray-50">
      

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Warning for invalid items */}
        {invalidItemsCount > 0 && (
          <div className="mb-6 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
            <div className="flex">
              <div className="flex-shrink-0">
                <FaExclamationTriangle className="h-5 w-5 text-yellow-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  {invalidItemsCount} item(s) in your cart are no longer
                  available and have been removed.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Wrap entire content in a form */}
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        >
          {/* Left Column - Delivery & Payment Info */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                  <FaMapMarkerAlt className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Delivery Information
                  </h2>
                  <p className="text-gray-600">
                    Where should we deliver your order?
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <div className="flex items-center">
                        <FaUser className="w-4 h-4 text-gray-400 mr-2" />
                        Full Name *
                      </div>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className={`w-full px-4 py-3 border ${
                        formErrors.name ? "border-red-300" : "border-gray-300"
                      } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                      placeholder="John Doe"
                    />
                    {formErrors.name && (
                      <p className="mt-1 text-sm text-red-600">
                        {formErrors.name}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <div className="flex items-center">
                        <FaPhone className="w-4 h-4 text-gray-400 mr-2" />
                        Phone Number *
                      </div>
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      className={`w-full px-4 py-3 border ${
                        formErrors.phone ? "border-red-300" : "border-gray-300"
                      } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                      placeholder="+1 (555) 123-4567"
                    />
                    {formErrors.phone && (
                      <p className="mt-1 text-sm text-red-600">
                        {formErrors.phone}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <div className="flex items-center">
                      <FaMapMarkerAlt className="w-4 h-4 text-gray-400 mr-2" />
                      Delivery Address *
                    </div>
                  </label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    required
                    rows="3"
                    className={`w-full px-4 py-3 border ${
                      formErrors.address ? "border-red-300" : "border-gray-300"
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    placeholder="123 Main Street, Apartment 4B, New York, NY 10001"
                  />
                  {formErrors.address && (
                    <p className="mt-1 text-sm text-red-600">
                      {formErrors.address}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Delivery Instructions (Optional)
                  </label>
                  <textarea
                    name="deliveryInstructions"
                    value={formData.deliveryInstructions}
                    onChange={handleChange}
                    rows="2"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Leave at door, ring bell, call before delivery, etc."
                  />
                </div>

                {/* Payment Method */}
                <div className="pt-6 border-t">
                  <div className="flex items-center mb-6">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                      <FaMoneyBillWave className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">
                        Payment Method
                      </h2>
                      <p className="text-gray-600">
                        Cash on Delivery
                      </p>
                    </div>
                  </div>

                  <div className="p-4 border-2 border-green-200 bg-green-50 rounded-lg">
                    <div className="flex items-center">
                      <FaMoneyBillWave className="w-6 h-6 text-green-600 mr-3" />
                      <div>
                        <p className="font-medium text-green-900">Cash on Delivery</p>
                        <p className="text-sm text-green-700">
                          Pay when you receive your order
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md p-6 sticky top-8">
              <h2 className="text-xl font-bold mb-6 text-gray-900">
                Order Summary
              </h2>

              <div className="space-y-4 mb-6 max-h-80 overflow-y-auto pr-2">
                {validCartItems.map((cartItem) => {
                  const menuItem = getMenuItem(cartItem.menuItemId);
                  if (!menuItem) return null;

                  return (
                    <div
                      key={cartItem.menuItemId}
                      className="flex items-start space-x-3 pb-4 border-b"
                    >
                      <div className="flex-shrink-0 w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
                        {menuItem.image ? (
                          <img
                            src={menuItem.image}
                            alt={menuItem.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.style.display = "none";
                              e.target.parentElement.innerHTML = `
                                <div class="w-full h-full flex items-center justify-center text-gray-400">
                                  <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                </div>
                              `;
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <svg
                              className="w-8 h-8"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                              />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 truncate">
                          {menuItem.name || "Unknown Item"}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Qty: {cartItem.quantity}
                        </p>
                        <p className="text-sm text-gray-500">
                          ${(menuItem.price || 0).toFixed(2)} each
                        </p>
                      </div>
                      <div className="font-semibold text-gray-900">
                        $
                        {((menuItem.price || 0) * cartItem.quantity).toFixed(2)}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="space-y-3 pt-4 border-t">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Delivery Fee</span>
                  <span className="font-medium">${deliveryFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-3 border-t">
                  <span>Total</span>
                  <span className="text-green-600">${total.toFixed(2)}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || validCartItems.length === 0}
                className="w-full mt-8 bg-green-600 text-white py-4 px-6 rounded-lg hover:bg-green-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Placing Order...
                  </>
                ) : (
                  <>
                    <FaLock className="w-5 h-5 mr-2" />
                    Place Order • ${total.toFixed(2)}
                  </>
                )}
              </button>

              <p className="text-xs text-gray-500 mt-4 text-center">
                By placing your order, you agree to our Terms of Service and
                Privacy Policy
              </p>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold text-blue-800 mb-2 flex items-center">
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Estimated Delivery
                </h3>
                <p className="text-blue-600">30-45 minutes</p>
              </div>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
};

export default CheckoutPage;
