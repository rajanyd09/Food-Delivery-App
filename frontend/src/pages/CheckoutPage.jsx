import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { orderService, authService } from "../services/api";
import toast from "react-hot-toast";
import {
  FaCreditCard,
  FaMoneyBillWave,
  FaMapMarkerAlt,
  FaPhone,
  FaUser,
  FaLock,
  FaExclamationTriangle,
  FaEnvelope,
  FaArrowLeft,
  FaCheckCircle
} from "react-icons/fa";

const CheckoutPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
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
            email: currentUser.email || "",
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
          email: formData.email.trim(),
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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (validCartItems.length === 0 && !isValidating) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center bg-white p-8 rounded-2xl shadow-sm border border-gray-100 max-w-sm w-full">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaExclamationTriangle className="text-xl text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Cart is empty</h3>
            <p className="text-sm text-gray-500 mb-6">
                Your cart is currently empty or contains invalid items.
            </p>
            <button
                onClick={() => navigate("/")}
                className="w-full bg-gray-900 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-gray-800 transition-colors"
            >
                Start Ordering
            </button>
        </div>
      </div>
    );
  }

  const invalidItemsCount = cart.length - validCartItems.length;

  return (
    <div className="min-h-screen bg-gray-50/50 py-2 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
            <button 
                onClick={() => navigate(-1)}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-white border border-gray-200 text-gray-500 hover:text-gray-900 hover:border-gray-300 transition-all shadow-sm"
            >
                <FaArrowLeft className="text-sm" />
            </button>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Checkout</h1>
        </div>

        {/* Warning for invalid items */}
        {invalidItemsCount > 0 && (
          <div className="mb-6 bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
             <FaExclamationTriangle className="text-amber-500 mt-0.5 flex-shrink-0" />
             <p className="text-sm text-amber-800">
               {invalidItemsCount} item(s) were removed because they are no longer available.
             </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT COLUMN: User Info */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Contact Details Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-50">
                <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                    <FaUser className="text-xs" />
                </div>
                <h2 className="text-base font-bold text-gray-900">Contact Information</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="group">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className={`w-full pl-10 pr-4 py-2.5 bg-gray-50 border ${formErrors.name ? 'border-red-300' : 'border-gray-200'} rounded-lg text-sm focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all outline-none`}
                        placeholder="Required"
                    />
                    <FaUser className="absolute left-3.5 top-3 text-gray-400 text-xs" />
                  </div>
                  {formErrors.name && <p className="text-xs text-red-500 mt-1 ml-1">{formErrors.name}</p>}
                </div>

                <div>
                   <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">
                    Phone Number
                  </label>
                  <div className="relative">
                    <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                        className={`w-full pl-10 pr-4 py-2.5 bg-gray-50 border ${formErrors.phone ? 'border-red-300' : 'border-gray-200'} rounded-lg text-sm focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all outline-none`}
                        placeholder="Required"
                    />
                    <FaPhone className="absolute left-3.5 top-3 text-gray-400 text-xs" />
                  </div>
                   {formErrors.phone && <p className="text-xs text-red-500 mt-1 ml-1">{formErrors.phone}</p>}
                </div>

                <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">
                        Email Address
                    </label>
                    <div className="relative">
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            readOnly
                            className="w-full pl-10 pr-4 py-2.5 bg-gray-100 border border-gray-200 rounded-lg text-sm text-gray-500 cursor-not-allowed"
                        />
                        <FaEnvelope className="absolute left-3.5 top-3 text-gray-400 text-xs" />
                    </div>
                </div>
              </div>
            </div>

            {/* Delivery Address Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-50">
                    <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center text-orange-600">
                        <FaMapMarkerAlt className="text-xs" />
                    </div>
                    <h2 className="text-base font-bold text-gray-900">Delivery Address</h2>
                </div>

                <div className="space-y-5">
                    <div>
                        <div className="relative">
                            <textarea
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                required
                                rows="3"
                                className={`w-full pl-10 pr-4 py-3 bg-gray-50 border ${formErrors.address ? 'border-red-300' : 'border-gray-200'} rounded-lg text-sm focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all outline-none resize-none`}
                                placeholder="Enter your full street address..."
                            />
                            <FaMapMarkerAlt className="absolute left-3.5 top-3.5 text-gray-400 text-xs" />
                        </div>
                         {formErrors.address && <p className="text-xs text-red-500 mt-1 ml-1">{formErrors.address}</p>}
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">
                            Instructions (Optional)
                        </label>
                       <textarea
                            name="deliveryInstructions"
                            value={formData.deliveryInstructions}
                            onChange={handleChange}
                            rows="2"
                             className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all outline-none resize-none"
                            placeholder="Gate code, leave at door, etc..."
                        />
                    </div>
                </div>
            </div>

            {/* Payment Method Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                 <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-50">
                    <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                        <FaMoneyBillWave className="text-xs" />
                    </div>
                    <h2 className="text-base font-bold text-gray-900">Payment</h2>
                </div>

                <div className="p-4 border border-emerald-200 bg-emerald-50/50 rounded-xl flex items-center justify-between cursor-pointer ring-1 ring-emerald-500 shadow-sm transition-all">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center border border-emerald-100 shadow-sm">
                            <FaMoneyBillWave className="text-emerald-600" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-gray-900">Cash on Delivery</p>
                            <p className="text-xs text-gray-500">Pay directly to our delivery partner</p>
                        </div>
                    </div>
                    <FaCheckCircle className="text-emerald-500 text-lg" />
                </div>
            </div>

          </div>

          {/* RIGHT COLUMN: Order Summary (Sticky) */}
          <div className="lg:col-span-5">
            <div className="sticky top-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-5 border-b border-gray-100 bg-gray-50/30">
                        <h2 className="text-base font-bold text-gray-900">Order Summary</h2>
                    </div>
                    
                    {/* Item List */}
                    <div className="p-5 max-h-[40vh] overflow-y-auto space-y-4">
                        {validCartItems.map((cartItem) => {
                            const menuItem = getMenuItem(cartItem.menuItemId);
                            if (!menuItem) return null;
                            return (
                                <div key={cartItem.menuItemId} className="flex gap-3">
                                    <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 border border-gray-200">
                                         {menuItem.image && <img src={menuItem.image} alt="" className="w-full h-full object-cover" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start">
                                            <p className="text-sm font-semibold text-gray-900 truncate pr-2">{menuItem.name}</p>
                                            <p className="text-sm font-bold text-gray-900">₹{((menuItem.price || 0) * cartItem.quantity).toFixed(2)}</p>
                                        </div>
                                        <p className="text-xs text-gray-500">Qty: {cartItem.quantity} &times; ₹{menuItem.price?.toFixed(2)}</p>
                                    </div>
                                </div>
                            )
                        })}
                    </div>

                    {/* Totals */}
                    <div className="p-5 bg-gray-50 border-t border-gray-100 space-y-3">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Subtotal</span>
                            <span className="font-medium text-gray-900">₹{subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Delivery Fee</span>
                            <span className="font-medium text-gray-900">₹{deliveryFee.toFixed(2)}</span>
                        </div>
                        <div className="pt-3 mt-1 border-t border-gray-200 flex justify-between items-center">
                            <span className="text-base font-bold text-gray-900">Total</span>
                            <span className="text-xl font-bold text-gray-900">₹{total.toFixed(2)}</span>
                        </div>

                        <div className="pt-4">
                             <button
                                type="submit"
                                disabled={loading || validCartItems.length === 0}
                                className="w-full bg-gray-900 hover:bg-gray-800 text-white py-3.5 rounded-xl text-sm font-bold shadow-lg shadow-gray-200 transition-all transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        <span>Processing...</span>
                                    </>
                                ) : (
                                    <>
                                        <FaLock className="text-xs" />
                                        <span>Place Order</span>
                                    </>
                                )}
                            </button>
                            <p className="text-center text-[10px] uppercase tracking-wider text-gray-400 mt-3 font-medium">
                                Secure Encrypted Checkout
                            </p>
                        </div>
                    </div>
                </div>
            </div>
          </div>
        
        </form>
      </div>
    </div>
  );
};

export default CheckoutPage;
