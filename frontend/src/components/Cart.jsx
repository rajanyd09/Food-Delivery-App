import React from "react";
import { FaTrash, FaShoppingCart, FaExclamationTriangle, FaPlus, FaMinus } from "react-icons/fa";

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

  const deliveryFee = 2.99;
  const taxRate = 0.08; // 8% tax
  const tax = subtotal * taxRate;
  const total = subtotal + deliveryFee + tax;

  if (!validCartItems || validCartItems.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-10 sticky top-4">
        <div className="text-center">
          <div className="w-24 h-24 bg-gradient-to-br from-gray-50 to-gray-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
            <FaShoppingCart className="text-5xl text-gray-300" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Your cart is empty</h3>
          <p className="text-sm text-gray-500 max-w-xs mx-auto">
            Start adding delicious items from our menu to begin your order!
          </p>
        </div>
      </div>
    );
  }

  const invalidItems =
    cartItems?.filter((cartItem) => {
      const menuItem = getMenuItem(cartItem?.menuItemId);
      return !menuItem;
    }) || [];

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden flex flex-col sticky top-4 max-h-[calc(100vh-2rem)]">
      {/* Header Section */}
      <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center shadow-sm">
              <FaShoppingCart className="text-white text-lg" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Shopping Cart</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                {validCartItems.length} {validCartItems.length === 1 ? 'item' : 'items'}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500 font-medium">Total</p>
            <p className="text-2xl font-bold text-blue-600">
              ${total.toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      {/* Warning Banner */}
      {invalidItems.length > 0 && (
        <div className="mx-6 mt-4 mb-2 p-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl flex-shrink-0">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center flex-shrink-0">
              <FaExclamationTriangle className="text-white text-sm" />
            </div>
            <div>
              <p className="text-amber-900 font-semibold text-sm">
                Item Availability Notice
              </p>
              <p className="text-amber-700 text-xs mt-1">
                {invalidItems.length} item{invalidItems.length > 1 ? 's' : ''} {invalidItems.length > 1 ? 'are' : 'is'} no longer available and {invalidItems.length > 1 ? 'have' : 'has'} been removed from your cart.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Cart Items Scroll Area */}
      <div className="flex-1 overflow-y-auto px-4 lg:px-6 py-4 space-y-3 min-h-0">
        {validCartItems.map((cartItem) => {
          const menuItem = getMenuItem(cartItem.menuItemId);
          if (!menuItem) return null;

          const itemTotal = (menuItem.price || 0) * (cartItem.quantity || 0);
          const itemPrice = menuItem.price || 0;

          return (
            <div
              key={cartItem.menuItemId}
              className="group bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-300 overflow-hidden"
            >
              {/* Unified Card Layout (Works for Sidebar & Mobile) */}
              <div className="p-4">
                {/* Top Section: Image & Details */}
                <div className="flex gap-4 mb-4">
                  {menuItem.image && (
                    <div className="w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100 shadow-sm border border-gray-200">
                      <img
                        src={menuItem.image}
                        alt={menuItem.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 text-base mb-1">
                      {menuItem.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">
                      ${itemPrice.toFixed(2)} each
                    </p>
                    {menuItem.description && (
                      <p className="text-xs text-gray-500 line-clamp-2">
                        {menuItem.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Bottom Section: Controls */}
                <div className="flex flex-wrap items-center justify-between gap-y-3 pt-3 border-t border-gray-100">
                  <div className="inline-flex items-center bg-gray-50 border-2 border-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                    <button
                      onClick={() => {
                        if (cartItem.quantity > 1) {
                          onUpdateQuantity(cartItem.menuItemId, cartItem.quantity - 1);
                        }
                      }}
                      disabled={cartItem.quantity <= 1}
                      className="w-9 h-9 flex items-center justify-center text-gray-600 hover:bg-gray-100 hover:text-blue-600 disabled:opacity-40 transition-all"
                      aria-label="Decrease quantity"
                    >
                      <FaMinus className="w-3 h-3" />
                    </button>
                    <div className="w-10 h-9 flex items-center justify-center border-x-2 border-gray-200 bg-white">
                      <span className="text-sm font-bold text-gray-900">
                        {cartItem.quantity}
                      </span>
                    </div>
                    <button
                      onClick={() =>
                        onUpdateQuantity(cartItem.menuItemId, cartItem.quantity + 1)
                      }
                      className="w-9 h-9 flex items-center justify-center text-gray-600 hover:bg-gray-100 hover:text-blue-600 transition-all"
                      aria-label="Increase quantity"
                    >
                      <FaPlus className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="flex items-center gap-3 ml-auto sm:ml-0">
                    <p className="text-lg font-bold text-gray-900">
                      ${itemTotal.toFixed(2)}
                    </p>
                    <button
                      onClick={() => onRemoveItem(cartItem.menuItemId)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                      title="Remove from cart"
                    >
                      <FaTrash className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Cart Summary Footer */}
      <div className="px-6 py-6 border-t-2 border-gray-200 bg-gradient-to-b from-gray-50 to-white flex-shrink-0">
        {/* Summary Box */}
        <div className="bg-white rounded-xl border-2 border-gray-200 shadow-sm mb-5">
          <div className="p-5 space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600 font-medium">Subtotal</span>
              <span className="font-semibold text-gray-900">${subtotal.toFixed(2)}</span>
            </div>
            
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600 font-medium">Delivery Fee</span>
              <span className="font-semibold text-gray-900">${deliveryFee.toFixed(2)}</span>
            </div>
            
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600 font-medium">Tax (8%)</span>
              <span className="font-semibold text-gray-900">${tax.toFixed(2)}</span>
            </div>
            
            <div className="pt-3 border-t-2 border-dashed border-gray-300"></div>
            
            <div className="flex justify-between items-center pt-1">
              <span className="text-base font-bold text-gray-900">Total Amount</span>
              <span className="text-2xl font-extrabold text-blue-600">
                ${total.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Checkout Button */}
        <button
          onClick={onCheckout}
          disabled={validCartItems.length === 0}
          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-4 px-6 rounded-xl font-bold text-base shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:transform-none flex justify-center items-center gap-3 group"
        >
          <span>Proceed to Checkout</span>
          <div className="bg-white/20 px-3 py-1 rounded-lg text-sm font-bold group-hover:bg-white/30 transition-colors">
            ${total.toFixed(2)}
          </div>
        </button>
        
        <p className="text-center text-xs text-gray-500 mt-3">
          Secure checkout • Free returns within 30 days
        </p>
      </div>
    </div>
  );
};

export default Cart;