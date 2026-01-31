import React from "react";
import { FaPlus, FaMinus } from "react-icons/fa";

const MenuItemCard = ({ item, quantity = 0, onAdd, onRemove }) => {
  return (
    <div className="group bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 overflow-hidden flex flex-col h-full">
      {/* Image Container - Compact height */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Category Badge - Minimalist */}
        <div className="absolute top-3 left-3">
          <span className="bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wider uppercase text-gray-800 shadow-sm">
            {item.category}
          </span>
        </div>

        {/* Price Badge - Floating */}
        <div className="absolute bottom-3 right-3">
          <span className="bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-lg text-sm font-bold text-gray-900 shadow-lg">
            ₹{item.price.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-gray-900 font-bold text-lg leading-tight group-hover:text-blue-600 transition-colors duration-200">
            {item.name}
          </h3>
        </div>
        
        <p className="text-gray-500 text-sm line-clamp-2 mb-4 leading-relaxed flex-grow">
          {item.description}
        </p>

        {/* Action Area */}
        <div className="mt-auto pt-3 border-t border-gray-50">
          {quantity > 0 ? (
            <div className="flex items-center justify-between bg-gray-50 rounded-lg p-1">
              <button
                onClick={() => onRemove(item._id)}
                className="w-8 h-8 flex items-center justify-center bg-white rounded-md text-red-500 hover:text-red-600 shadow-sm hover:shadow transition-all duration-200 active:scale-95"
              >
                <FaMinus className="w-3 h-3" />
              </button>
              <span className="text-sm font-bold text-gray-900">
                {quantity}
              </span>
              <button
                onClick={() => onAdd(item._id)}
                className="w-8 h-8 flex items-center justify-center bg-white rounded-md text-green-500 hover:text-green-600 shadow-sm hover:shadow transition-all duration-200 active:scale-95"
              >
                <FaPlus className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => onAdd(item._id)}
              className="w-full bg-gray-900 text-white py-2.5 px-4 rounded-lg hover:bg-black transition-all duration-200 shadow-md hover:shadow-lg active:scale-[0.98] flex items-center justify-center space-x-2 group/btn"
            >
              <span className="text-sm font-medium">Add to Cart</span>
              <FaPlus className="w-3 h-3 group-hover/btn:translate-x-0.5 transition-transform" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MenuItemCard;
