import React, { useState, useEffect } from "react";
import MenuItemCard from "../MenuItemCard";
import CategorySection from "./CategorySection";
import { FaChevronRight } from "react-icons/fa";
import { useLocation } from "react-router-dom";

const LandingMenu = ({ categories, menuItems, cart, onAdd, onRemove }) => {
  const [activeSection, setActiveSection] = useState("");
  const location = useLocation();

  const scrollToSection = (categoryName) => {
    const element = document.getElementById(`category-${categoryName}`);
    if (element) {
      // Offset for sticky header/nav
      const headerOffset = 180; 
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
      setActiveSection(categoryName);
    }
  };

  // Handle initial scroll from navigation state
  useEffect(() => {
    if (categories.length > 0 && location.state?.scrollTo) {
        // slight delay to ensure DOM is ready
        setTimeout(() => {
            scrollToSection(location.state.scrollTo);
            // Clear state to prevent re-scrolling on re-renders (optional but tricky with history)
            // ideally we just rely on the fact that this runs once per category load or location change
        }, 100);
    }
  }, [categories, location.state]);

  // Optional: Update active section on scroll
  useEffect(() => {
    const handleScroll = () => {
      // Simple logic to find which section is in view
      // This can be refined
      for (const category of categories) {
        const element = document.getElementById(`category-${category.name}`);
        if (element) {
            const rect = element.getBoundingClientRect();
            if (rect.top >= 0 && rect.top <= 300) {
                setActiveSection(category.name);
                break;
            }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [categories]);

  return (
    <div className="w-full">
        {/* Sticky Breadcrumb-style Navigation */}
            <div className="max-w-7xl mx-auto flex items-center space-x-2 overflow-x-auto no-scrollbar pb-1 mb-5">
                <span className="text-gray-400 text-sm font-medium whitespace-nowrap">Menu</span>
                <FaChevronRight className="text-gray-300 text-xs" />
                
                <div className="flex items-center space-x-1">
                    {categories.map((category) => (
                        <button
                            key={category._id}
                            onClick={() => scrollToSection(category.name)}
                            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                                activeSection === category.name
                                    ? "bg-blue-600 text-white shadow-md"
                                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                            }`}
                        >
                            {category.name}
                        </button>
                    ))}
                </div>
            </div>

      {categories.map((category) => {
        const categoryItems = menuItems.filter(
          (item) => item.category === category.name
        );

        if (categoryItems.length === 0) return null;

        return (
          <CategorySection
            key={category._id}
            title={category.name}
            items={categoryItems}
            cart={cart}
            onAdd={onAdd}
            onRemove={onRemove}
          />
        );
      })}
    </div>
  );
};

export default LandingMenu;
