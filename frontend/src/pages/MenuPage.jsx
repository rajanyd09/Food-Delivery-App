import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { menuService } from "../services/api";
import MenuItemCard from "../components/MenuItemCard";
import Cart from "../components/Cart";
import toast from "react-hot-toast";
import { FaUtensils } from "react-icons/fa";

const MenuPage = () => {
  const navigate = useNavigate();
  const [menuItems, setMenuItems] = useState(() => {
    // Initialize from localStorage if available
    const saved = localStorage.getItem("menuItems");
    try {
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });
  const [filteredItems, setFilteredItems] = useState([]);
  const [activeCategory, setActiveCategory] = useState("all");
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(!menuItems.length);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMenuItems();

    // Load cart from localStorage on mount
    const savedCart = JSON.parse(localStorage.getItem("cart") || "[]");
    setCart(savedCart);
  }, []);

  useEffect(() => {
    if (activeCategory === "all") {
      setFilteredItems(menuItems);
    } else {
      setFilteredItems(
        menuItems.filter((item) => item.category === activeCategory),
      );
    }
  }, [activeCategory, menuItems]);

  const fetchMenuItems = async () => {
    setError(null);
    // Only show full loading spinner if we have no items to show
    if (menuItems.length === 0) {
      setLoading(true);
    }

    try {
      const response = await menuService.getAllMenuItems();
      setMenuItems(response.data);
    } catch (error) {
      console.error("Failed to fetch menu:", error);
      toast.error("Could not load latest menu items");
      setError("Failed to load menu. Please try again.");
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

  // Get unique categories
  const categories = ["all", ...new Set(menuItems.map((item) => item.category))];

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-gray-900 mx-auto mb-6"></div>
          <p className="text-gray-500 font-medium tracking-wide animate-pulse">
            PREPARING MENU...
          </p>
        </div>
      </div>
    );
  }

  if (error && menuItems.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-center">
          <p className="text-red-600 text-lg mb-4">{error}</p>
          <button
            onClick={fetchMenuItems}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      <main className="max-w-7xl mx-auto px-2 sm:px-3 lg:px-4 ">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">
              Our Menu
            </h1>
            <p className="text-gray-500 text-lg">
              Curated dishes for your dining pleasure
            </p>
          </div>
          
          {/* Category Filter */}
          <div className="flex overflow-x-auto pb-2 md:pb-0 gap-2 no-scrollbar w-full md:w-auto">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 whitespace-nowrap ${
                  activeCategory === category
                    ? "bg-gray-900 text-white shadow-lg shadow-gray-900/20 transform scale-105"
                    : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
                }`}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Menu Items Section */}
          <div className={`${cart.length > 0 ? 'lg:col-span-8 xl:col-span-9' : 'lg:col-span-12'}`}>
            <div className={`grid grid-cols-1 md:grid-cols-2 ${cart.length > 0 ? 'xl:grid-cols-3' : 'lg:grid-cols-3 xl:grid-cols-4'} gap-6`}>
              {filteredItems.length > 0 ? (
                filteredItems.map((item) => (
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
                ))
              ) : (
                <div className="col-span-full py-20 text-center bg-white rounded-2xl border border-dashed border-gray-300">
                  <FaUtensils className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                  <p className="text-gray-500 text-lg">
                    No items found in this category
                  </p>
                  <button 
                    onClick={() => setActiveCategory("all")}
                    className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
                  >
                    View all items
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Cart Section - Sticky Sidebar */}
          {cart.length > 0 && (
            <div className="lg:col-span-4 xl:col-span-3 lg:sticky lg:top-8 transition-all duration-300 ease-in-out">
              <Cart
                cartItems={cart}
                menuItems={menuItems}
                onUpdateQuantity={updateQuantity}
                onRemoveItem={removeFromCart}
                onCheckout={handleCheckout}
              />
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default MenuPage;