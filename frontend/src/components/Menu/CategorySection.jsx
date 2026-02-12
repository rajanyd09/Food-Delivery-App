import React from "react";
import MenuItemCard from "../MenuItemCard";
import { FaUtensils } from "react-icons/fa";

const CategorySection = ({ title, items, cart, onAdd, onRemove }) => {
  if (!items || items.length === 0) return null;

  return (
    <div className="mb-12 scroll-mt-24" id={`category-${title}`}>
      <div className="flex items-center gap-3 mb-6">
        <h2 className="text-2xl font-bold text-gray-800 capitalize">
          {title}
        </h2>
        <div className="h-0.5 bg-gray-200 flex-grow"></div>
        <span className="text-sm font-medium text-gray-400 bg-gray-50 px-3 py-1 rounded-full">
          {items.length} items
        </span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {items.map((item) => (
          <MenuItemCard
            key={item._id}
            item={item}
            quantity={
              cart.find((cartItem) => cartItem.menuItemId === item._id)
                ?.quantity || 0
            }
            onAdd={onAdd}
            onRemove={onRemove}
          />
        ))}
      </div>
    </div>
  );
};

export default CategorySection;
