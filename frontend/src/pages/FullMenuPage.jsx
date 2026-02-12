import React, { useState, useEffect } from "react";
import { menuService, categoryService } from "../services/api";
import LandingMenu from "../components/Menu/LandingMenu";
import CartBottomBar from "../components/CartBottomBar";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const FullMenuPage = () => {
  const navigate = useNavigate();
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initData = async () => {
      try {
        setLoading(true);
        const [menuRes, catRes] = await Promise.all([
          menuService.getAllMenuItems(),
          categoryService.getAllCategories(),
        ]);
        
        setMenuItems(menuRes.data);
        setCategories(catRes.data);
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

  const addToCart = (menuItemId) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find(
        (item) => item.menuItemId === menuItemId,
      );
      let updatedCart;

      if (existingItem) {
        updatedCart = prevCart.map((item) =>
          item.menuItemId === menuItemId
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      } else {
        updatedCart = [...prevCart, { menuItemId, quantity: 1 }];
      }

      localStorage.setItem("cart", JSON.stringify(updatedCart));
      return updatedCart;
    });
    toast.success("Added to cart");
  };

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


  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      <main className="max-w-7xl mx-auto px-2 sm:px-3 lg:px-4 py-8">
        <LandingMenu
            categories={categories}
            menuItems={menuItems}
            cart={cart}
            onAdd={addToCart}
            onRemove={(id) =>
                updateQuantity(
                    id,
                    cart.find((c) => c.menuItemId === id)?.quantity - 1,
                )
            }
        />
        <CartBottomBar cart={cart} menuItems={menuItems} />
      </main>
    </div>
  );
};

export default FullMenuPage;
