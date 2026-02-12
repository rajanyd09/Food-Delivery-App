import React, { useState, useEffect } from "react";
import { menuService } from "../services/api";
import Cart from "../components/Cart";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";

const CartPage = () => {
  const navigate = useNavigate();
  const [menuItems, setMenuItems] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initData = async () => {
      try {
        setLoading(true);
        const menuRes = await menuService.getAllMenuItems();
        setMenuItems(menuRes.data);
      } catch (error) {
        console.error("Failed to load data:", error);
        toast.error("Failed to load menu data");
      } finally {
        setLoading(false);
      }
    };

    initData();

    // Load cart from localStorage on mount
    const savedCart = JSON.parse(localStorage.getItem("cart") || "[]");
    setCart(savedCart);
  }, []);

  const updateQuantity = (menuItemId, quantity) => {
    if (quantity < 1) {
      removeFromCart(menuItemId);
      return;
    }

    setCart((prevCart) => {
      const updatedCart = prevCart.map((item) =>
        item.menuItemId === menuItemId ? { ...item, quantity } : item,
      );

      localStorage.setItem("cart", JSON.stringify(updatedCart));
      return updatedCart;
    });
  };

  const removeFromCart = (menuItemId) => {
    setCart((prevCart) => {
      const updatedCart = prevCart.filter(
        (item) => item.menuItemId !== menuItemId,
      );

      localStorage.setItem("cart", JSON.stringify(updatedCart));
      return updatedCart;
    });
    toast.success("Removed from cart");
  };

  const handleCheckout = () => {
    if (cart.length === 0) {
      toast.error("Your cart is empty");
      return;
    }
    localStorage.setItem("cart", JSON.stringify(cart));
    navigate("/checkout");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className=" bg-gray-50/80 py-2 px-2 sm:px-3 lg:px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
            <button 
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-gray-500 hover:text-gray-900 font-medium transition-colors text-sm mb-4"
            >
                <FaArrowLeft className="text-xs" /> Back to Menu
            </button>
            
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Your Cart</h1>
        </div>

        <Cart
            cartItems={cart}
            menuItems={menuItems}
            onUpdateQuantity={updateQuantity}
            onRemoveItem={removeFromCart}
            onCheckout={handleCheckout}
        />
      </div>
    </div>
  );
};

export default CartPage;
