import React from "react";
import { FaShoppingCart, FaArrowRight } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const CartBottomBar = ({ cart, menuItems }) => {
  const navigate = useNavigate();

  if (!cart || cart.length === 0) return null;

  const validCartItems = cart.filter((cartItem) => {
      const item = menuItems.find((m) => m._id === cartItem.menuItemId);
      return item && cartItem.quantity > 0;
  });

  if (validCartItems.length === 0) return null;

  const itemCount = validCartItems.reduce((acc, item) => acc + item.quantity, 0);
  const totalPrice = validCartItems.reduce((acc, item) => {
      const menuItem = menuItems.find((m) => m._id === item.menuItemId);
      return acc + (menuItem?.price || 0) * item.quantity;
  }, 0);

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-50 px-4 py-4 md:hidden">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex flex-col">
           <span className="text-xs text-gray-500 font-medium uppercase tracking-wide">{itemCount} items</span>
           <span className="text-xl font-bold text-gray-900">₹{totalPrice.toFixed(2)}</span>
        </div>
        
        <button 
            onClick={() => navigate("/cart")}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-md active:scale-95"
        >
            <span>View Cart</span>
            <FaArrowRight className="text-sm" />
        </button>
      </div>
    </div>
  );
};
// Desktop version can be similar or integrated into nav
// For now making a robust one that works on desktop too if sidebar is gone
// Updating to be responsive:

const ResponsiveCartBar = ({ cart, menuItems }) => {
    const navigate = useNavigate();
  
    if (!cart || cart.length === 0) return null;
  
    const validCartItems = cart.filter((cartItem) => {
        const item = menuItems.find((m) => m._id === cartItem.menuItemId);
        return item && cartItem.quantity > 0;
    });
  
    if (validCartItems.length === 0) return null;
  
    const itemCount = validCartItems.reduce((acc, item) => acc + item.quantity, 0);
    const totalPrice = validCartItems.reduce((acc, item) => {
        const menuItem = menuItems.find((m) => m._id === item.menuItemId);
        return acc + (menuItem?.price || 0) * item.quantity;
    }, 0);
  
    return (
      <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-8 md:w-96">
        <div className="bg-gray-900/90 backdrop-blur-md text-white rounded-2xl shadow-2xl p-4 flex items-center justify-between border border-gray-700/50 hover:bg-gray-900 transition-all cursor-pointer group"
             onClick={() => navigate("/cart")}
        >
          <div className="flex items-center gap-4">
             <div className="bg-white/10 w-10 h-10 rounded-full flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform">
                <span className="font-bold text-sm">{itemCount}</span>
             </div>
             <div className="flex flex-col">
                 <span className="text-xs text-gray-400 font-medium">Total</span>
                 <span className="font-bold text-lg">₹{totalPrice.toFixed(2)}</span>
             </div>
          </div>
          
          <div className="flex items-center gap-2 pr-2 text-blue-400 font-semibold group-hover:text-blue-300">
              <span>View Cart</span>
              <FaArrowRight />
          </div>
        </div>
      </div>
    );
  };

export default ResponsiveCartBar;
