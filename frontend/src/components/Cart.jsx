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
  const total = subtotal + deliveryFee;

  if (!validCartItems || validCartItems.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
        <div className="text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaShoppingCart className="text-4xl text-gray-400" />
          </div>
          <p className="text-lg font-semibold text-gray-900 mb-1">Your cart is empty</p>
          <p className="text-sm text-gray-500">
            Add some delicious items to get started!
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
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100">
        <h2 className="text-2xl font-bold text-gray-900">Your Cart</h2>
        <p className="text-sm text-gray-600 mt-0.5">{validCartItems.length} items</p>
      </div>

      {invalidItems.length > 0 && (
        <div className="mx-6 mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
          <div className="flex items-start">
            <FaExclamationTriangle className="text-yellow-500 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <p className="text-yellow-900 font-semibold text-sm">
                Some items are no longer available
              </p>
              <p className="text-yellow-700 text-xs mt-0.5">
                {invalidItems.length} item(s) have been removed from your cart
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="p-6 space-y-4 max-h-96 overflow-y-auto">
        {validCartItems.map((cartItem) => {
          const menuItem = getMenuItem(cartItem.menuItemId);
          if (!menuItem) return null;

          const itemTotal = (menuItem.price || 0) * (cartItem.quantity || 0);
          const itemPrice = menuItem.price || 0;

          return (
            <div
              key={cartItem.menuItemId || cartItem.id || Math.random()}
              className="flex items-center gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors border border-gray-100"
            >
              {/* Item Image */}
              {menuItem.image && (
                <img
                  src={menuItem.image}
                  alt={menuItem.name}
                  className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                />
              )}

              {/* Item Details */}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 truncate">
                  {menuItem.name || "Unnamed Item"}
                </h3>
                <p className="text-sm text-gray-600">${itemPrice.toFixed(2)} each</p>
              </div>

              {/* Quantity Controls */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    if (cartItem.quantity > 1) {
                      onUpdateQuantity(cartItem.menuItemId, cartItem.quantity - 1);
                    }
                  }}
                  className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                >
                  <FaMinus className="w-3 h-3 text-gray-600" />
                </button>
                <span className="text-sm font-bold text-gray-900 min-w-[2rem] text-center">
                  {cartItem.quantity || 0}
                </span>
                <button
                  onClick={() =>
                    onUpdateQuantity(cartItem.menuItemId, cartItem.quantity + 1)
                  }
                  className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                >
                  <FaPlus className="w-3 h-3 text-gray-600" />
                </button>
              </div>

              {/* Item Total & Remove */}
              <div className="flex items-center space-x-3">
                <span className="font-bold text-gray-900 min-w-[4rem] text-right">
                  ${itemTotal.toFixed(2)}
                </span>
                <button
                  onClick={() => onRemoveItem(cartItem.menuItemId)}
                  className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                  title="Remove item"
                >
                  <FaTrash className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Cart Summary */}
      <div className="p-6 border-t border-gray-100 bg-gray-50">
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Subtotal</span>
            <span className="font-semibold text-gray-900">${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Delivery Fee</span>
            <span className="font-semibold text-gray-900">${deliveryFee.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-lg font-bold pt-3 border-t border-gray-200">
            <span className="text-gray-900">Total</span>
            <span className="text-green-600">${total.toFixed(2)}</span>
          </div>
        </div>

        <button
          onClick={onCheckout}
          disabled={validCartItems.length === 0}
          className="w-full mt-4 bg-gradient-to-r from-green-600 to-green-700 text-white py-3.5 px-6 rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-200 font-semibold shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Proceed to Checkout
        </button>
      </div>
    </div>
  );
};

export default Cart;
