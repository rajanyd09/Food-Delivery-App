import React from "react";
import CategorySection from "./CategorySection";

const MenuSections = ({ categories, menuItems, cart, onAdd, onRemove }) => {
  return (
    <div className="space-y-4">
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

export default MenuSections;
