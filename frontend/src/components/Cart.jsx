import React from "react";
import { FaTrash, FaShoppingCart, FaExclamationTriangle, FaPlus, FaMinus, FaArrowRight } from "react-icons/fa";

const Cart = ({
  cartItems,
  menuItems,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
}) => {
  const getMenuItem = (id) => {
    if (!id) return null;
    return menuItems?.find((item) => item?._id === id) || null;
  };

  const validCartItems =
    cartItems?.filter((cartItem) => {
      const menuItem = getMenuItem(cartItem?.menuItemId);
      return menuItem && cartItem?.quantity > 0;
    }) || [];

  const subtotal = validCartItems.reduce((sum, cartItem) => {
    const menuItem = getMenuItem(cartItem.menuItemId);
    return sum + (menuItem?.price || 0) * (cartItem?.quantity || 0);
  }, 0);

  const deliveryFee = validCartItems.length > 0 ? 2.99 : 0;
  const taxRate = 0.08; // 8% tax
  const tax = subtotal * taxRate;
  const total = subtotal + deliveryFee + tax;

  if (!validCartItems || validCartItems.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center max-w-lg mx-auto">
        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <FaShoppingCart className="text-3xl text-gray-300" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Cart is empty</h3>
        <p className="text-sm text-gray-500 mb-8 max-w-xs mx-auto">
          Explore our menu and add some delicious items to your cart.
        </p>
      </div>
    );
  }

  const invalidItems =
    cartItems?.filter((cartItem) => {
      const menuItem = getMenuItem(cartItem?.menuItemId);
      return !menuItem;
    }) || [];

  return (
    <div className="flex flex-col lg:flex-row gap-8 items-start max-w-6xl mx-auto">
      {/* Main Cart Section */}
      <div className="flex-1 w-full bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-white">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            Shopping Cart
            <span className="text-xs font-normal text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
              {validCartItems.length} items
            </span>
          </h2>
        </div>

        {/* Warning for Invalid Items */}
        {invalidItems.length > 0 && (
          <div className="px-6 py-3 bg-amber-50 border-b border-amber-100 flex items-start gap-3">
             <FaExclamationTriangle className="text-amber-500 text-sm mt-0.5" />
             <p className="text-xs text-amber-700">
                {invalidItems.length} item{invalidItems.length > 1 ? 's' : ''} removed due to unavailability.
             </p>
          </div>
        )}

        {/* Items List */}
        <div className="divide-y divide-gray-50 overflow-y-auto max-h-[60vh]">
          {validCartItems.map((cartItem) => {
            const menuItem = getMenuItem(cartItem.menuItemId);
            if (!menuItem) return null;

            const itemTotal = (menuItem.price || 0) * (cartItem.quantity || 0);

            return (
              <div 
                key={cartItem.menuItemId} 
                className="p-4 sm:p-6 group hover:bg-gray-50 transition-colors duration-200"
              >
                <div className="flex gap-4 items-center">
                  {/* Item Image */}
                  {menuItem.image && (
                    <div className="w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                      <img
                        src={menuItem.image}
                        alt={menuItem.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  {/* Item Details */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">
                      {menuItem.name}
                    </h3>
                    <p className="text-xs text-gray-500 mb-2 truncate">
                      {menuItem.description}
                    </p>
                    <div className="text-sm font-medium text-gray-900">
                      ₹{menuItem.price?.toFixed(2)}
                    </div>
                  </div>

                  {/* Quantity & Actions */}
                  <div className="flex flex-col items-end gap-3">
                     <div className="text-sm font-bold text-gray-900">
                        ₹{itemTotal.toFixed(2)}
                     </div>

                     <div className="flex items-center gap-3">
                        {/* Quantity Controls */}
                        <div className="flex items-center bg-white border border-gray-200 rounded-lg shadow-sm h-8">
                          <button
                            onClick={() => {
                              if (cartItem.quantity > 1) {
                                onUpdateQuantity(cartItem.menuItemId, cartItem.quantity - 1);
                              } else {
                                onRemoveItem(cartItem.menuItemId);
                              }
                            }}
                            className="w-8 h-full flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-l-lg transition-colors"
                          >
                             {cartItem.quantity === 1 ? <FaTrash size={10} /> : <FaMinus size={9} />}
                          </button>
                          <div className="w-8 flex items-center justify-center text-xs font-semibold text-gray-900 border-x border-gray-100 h-full">
                            {cartItem.quantity}
                          </div>
                          <button
                            onClick={() => onUpdateQuantity(cartItem.menuItemId, cartItem.quantity + 1)}
                            className="w-8 h-full flex items-center justify-center text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-r-lg transition-colors"
                          >
                            <FaPlus size={9} />
                          </button>
                        </div>
                     </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Summary Section (Sidebar on Desktop) */}
      <div className="w-full lg:w-80 flex-shrink-0">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-6">
          <h3 className="text-base font-bold text-gray-900 mb-4">Order Summary</h3>
          
          <div className="space-y-3 mb-6">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Subtotal</span>
              <span className="text-gray-900 font-medium">₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Delivery Fee</span>
              <span className="text-gray-900 font-medium">₹{deliveryFee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Tax (8%)</span>
              <span className="text-gray-900 font-medium">₹{tax.toFixed(2)}</span>
            </div>
            
            <div className="border-t border-gray-100 pt-3 flex justify-between items-center">
              <span className="text-base font-bold text-gray-900">Total</span>
              <span className="text-xl font-bold text-blue-600">₹{total.toFixed(2)}</span>
            </div>
          </div>

          <button
            onClick={onCheckout}
            className="w-full bg-gray-900 hover:bg-gray-800 text-white py-3.5 px-4 rounded-xl font-semibold text-sm shadow-lg shadow-gray-200 transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2 group"
          >
            <span>Proceed to Checkout</span>
            <FaArrowRight className="group-hover:translate-x-1 transition-transform duration-200 text-xs" />
          </button>

          <p className="text-center text-xs text-gray-400 mt-4">
            Secure Checkout
          </p>
        </div>
      </div>
    </div>
  );
};

export default Cart;