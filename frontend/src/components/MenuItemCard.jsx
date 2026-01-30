import React from "react";
import { FaPlus, FaMinus } from "react-icons/fa";

const MenuItemCard = ({ item, quantity = 0, onAdd, onRemove }) => {
  return (
    <div className="group bg-white rounded-2xl shadow-sm hover:shadow-xl overflow-hidden transition-all duration-300 border border-gray-100 hover:border-blue-200">
      {/* Image Container */}
      <div className="relative overflow-hidden h-44">
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute top-3 right-3">
          <span className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-bold text-green-600 shadow-lg">
            ₹{item.price.toFixed(2)}
          </span>
        </div>
        {/* Category Badge */}
        <div className="absolute top-3 left-3">
          <span className="bg-blue-600/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-white shadow-lg capitalize">
            {item.category}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-1">
          {item.name}
        </h3>
        <p className="text-sm text-gray-600 mb-4 line-clamp-2 h-10">
          {item.description}
        </p>

        {/* Action Buttons */}
        <div className="flex items-center justify-between">
          {quantity > 0 ? (
            <div className="flex items-center space-x-3 w-full">
              <button
                onClick={() => onRemove(item._id)}
                className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white py-2.5 rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-md hover:shadow-lg font-medium flex items-center justify-center"
              >
                <FaMinus className="w-4 h-4" />
              </button>
              <span className="text-xl font-bold text-gray-900 min-w-[2rem] text-center">
                {quantity}
              </span>
              <button
                onClick={() => onAdd(item._id)}
                className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white py-2.5 rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-md hover:shadow-lg font-medium flex items-center justify-center"
              >
                <FaPlus className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => onAdd(item._id)}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-2.5 px-4 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-md hover:shadow-lg font-semibold flex items-center justify-center space-x-2"
            >
              <FaPlus className="w-4 h-4" />
              <span>Add to Cart</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MenuItemCard;
