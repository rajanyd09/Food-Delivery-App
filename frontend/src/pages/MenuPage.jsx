import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { menuService, categoryService } from "../services/api";
import MenuItemCard from "../components/MenuItemCard";
import CartBottomBar from "../components/CartBottomBar";
import toast from "react-hot-toast";
import { FaUtensils } from "react-icons/fa";

const MenuPage = () => {
  const navigate = useNavigate();
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [newItems, setNewItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [activeCategory, setActiveCategory] = useState("all");
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initData = async () => {
      try {
        setLoading(true);
        const [menuRes, catRes, newRes] = await Promise.all([
          menuService.getAllMenuItems(),
          categoryService.getAllCategories(),
          menuService.getNewMenuItems(),
        ]);
        
        setMenuItems(menuRes.data);
        setCategories(catRes.data);
        setNewItems(newRes.data);
      } catch (error) {
        console.error("Failed to load data:", error);
        setError("Failed to load menu data");
      } finally {
        setLoading(false);
      }
    };

    initData();

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
            onClick={() => window.location.reload()}
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
        

        {/* Page Header & Categories */}
        <div className="flex flex-col mb-8 gap-6">
          <div>
            
            <p className="text-gray-500 text-lg">
              Choose from our delicious categories
            </p>
          </div>
          
          {/* Categories */}
          <div className="flex overflow-x-auto pb-4 gap-6 no-scrollbar">
            <button
              onClick={() => navigate("/menu")}
              className="flex-shrink-0 flex flex-col items-center gap-2 group"
            >
              <div className={`w-24 h-24 rounded-full flex items-center justify-center text-2xl transition-all duration-200 hover:scale-105 bg-gray-100 text-gray-400 group-hover:bg-gray-200`}>
                <FaUtensils />
              </div>
              <span className="font-semibold text-sm text-gray-500">Full Menu</span>
            </button>
            
            {categories.map((category) => (
              <button
                key={category._id}
                onClick={() => navigate("/menu", { state: { scrollTo: category.name } })}
                className="flex-shrink-0 flex flex-col items-center gap-2"
              >
                <div className={`w-24 h-24 rounded-full overflow-hidden transition-all duration-200 hover:scale-105 ${
                  activeCategory === category.name 
                    ? "ring-2 ring-blue-600 ring-offset-2" 
                    : ""
                }`}>
                  <img src={category.image} alt={category.name} className="w-full h-full object-cover" />
                </div>
                <span className={`font-semibold text-sm ${activeCategory === category.name ? "text-blue-600" : "text-gray-500"}`}>{category.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* What's New Section */}
        {newItems.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <span className="bg-orange-100 text-orange-600 p-2 rounded-lg text-xl">🔥</span>
              What's New
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {newItems.map((item) => (
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
        )}

        
        <CartBottomBar cart={cart} menuItems={menuItems} />
      </main>
    </div>
  );
};

export default MenuPage;