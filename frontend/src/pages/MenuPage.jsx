import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // ADD THIS
import { menuService } from "../services/api";
import MenuItemCard from "../components/MenuItemCard";
import Cart from "../components/Cart";
import toast from "react-hot-toast";

const MenuPage = () => {
  const navigate = useNavigate(); // ADD THIS
  const [menuItems, setMenuItems] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMenuItems();

    // Load cart from localStorage on mount
    const savedCart = JSON.parse(localStorage.getItem("cart") || "[]");
    setCart(savedCart);
  }, []);

  const fetchMenuItems = async () => {
    try {
      const response = await menuService.getAllMenuItems();
      setMenuItems(response.data);
    } catch (error) {
      toast.error("Failed to load menu items");
    } finally {
      setLoading(false);
    }
  };

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

      // Save to localStorage
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

      // Save to localStorage
      localStorage.setItem("cart", JSON.stringify(updatedCart));
      return updatedCart;
    });
  };

  const removeFromCart = (menuItemId) => {
    setCart((prevCart) => {
      const updatedCart = prevCart.filter(
        (item) => item.menuItemId !== menuItemId,
      );

      // Save to localStorage
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

    // Save cart to localStorage before navigating
    localStorage.setItem("cart", JSON.stringify(cart));

    // Use React Router navigation instead of window.location
    navigate("/checkout");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className=" bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 py-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4 text-gray-800">
                Our Menu
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {menuItems.map((item) => (
                  <MenuItemCard
                    key={item._id}
                    item={item}
                    quantity={
                      cart.find((cartItem) => cartItem.menuItemId === item._id)
                        ?.quantity || 0
                    }
                    onAdd={addToCart}
                    onRemove={(id) =>
                      updateQuantity(
                        id,
                        cart.find((c) => c.menuItemId === id)?.quantity - 1,
                      )
                    }
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <Cart
              cartItems={cart}
              menuItems={menuItems}
              onUpdateQuantity={updateQuantity}
              onRemoveItem={removeFromCart}
              onCheckout={handleCheckout}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default MenuPage;
