import React, { useState, useEffect } from "react";
import { categoryService } from "../../services/api";
import { FaTrash, FaPlus, FaImage, FaSpinner } from "react-icons/fa";
import toast from "react-hot-toast";

const CategoryManagement = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryImage, setNewCategoryImage] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await categoryService.getAllCategories();
      setCategories(response.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewCategoryImage(file);
    }
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!newCategoryName || !newCategoryImage) {
      toast.error("Please provide both name and image");
      return;
    }

    setSubmitting(true);
    const formData = new FormData();
    formData.append("name", newCategoryName);
    formData.append("image", newCategoryImage);

    try {
      await categoryService.createCategory(formData);
      toast.success("Category created successfully");
      setNewCategoryName("");
      setNewCategoryImage(null);
      // Reset file input
      document.getElementById("category-image-input").value = "";
      fetchCategories();
    } catch (error) {
      console.error("Error creating category:", error);
      toast.error(error.response?.data?.message || "Failed to create category");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm("Are you sure you want to delete this category?")) {
      return;
    }

    try {
      await categoryService.deleteCategory(id);
      toast.success("Category deleted successfully");
      fetchCategories();
    } catch (error) {
      console.error("Error deleting category:", error);
      toast.error("Failed to delete category");
    }
  };

  if (loading) {
    return <div className="p-8 text-center"><FaSpinner className="animate-spin text-4xl mx-auto text-blue-600" /></div>;
  }

  return (
    <div className="bg-gray-900 rounded-xl shadow-lg border border-gray-800 overflow-hidden">
      <div className="p-6 border-b border-gray-800 bg-gray-900">
        <h2 className="text-xl font-bold text-white">Category Management</h2>
        <p className="text-gray-400 text-sm mt-1">Manage food categories for the menu</p>
      </div>

      <div className="p-6 bg-gray-900">
        {/* Create New Category Form */}
        <form onSubmit={handleCreateCategory} className="mb-8 bg-gray-800/50 p-6 rounded-xl border border-gray-700">
          <h3 className="text-lg font-semibold mb-4 text-white flex items-center gap-2">
            <FaPlus className="text-blue-500" /> Add New Category
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
            <div className="md:col-span-5">
              <label className="block text-sm font-medium text-gray-400 mb-1">Category Name</label>
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="e.g. Pizza, Burger"
                className="w-full px-4 py-2 rounded-lg bg-gray-900 border border-gray-700 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder-gray-600"
              />
            </div>
            <div className="md:col-span-5">
              <label className="block text-sm font-medium text-gray-400 mb-1">Category Image</label>
              <div className="relative">
                <input
                  id="category-image-input"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                <label
                  htmlFor="category-image-input"
                  className="flex items-center justify-center w-full px-4 py-2 border border-gray-700 border-dashed rounded-lg cursor-pointer hover:bg-gray-800 transition-colors bg-gray-900 text-gray-400 font-medium"
                >
                  <FaImage className="mr-2" />
                  {newCategoryImage ? newCategoryImage.name : "Choose Image"}
                </label>
              </div>
            </div>
            <div className="md:col-span-2">
              <button
                type="submit"
                disabled={submitting}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium h-[42px]"
              >
                {submitting ? "Adding..." : "Add"}
              </button>
            </div>
          </div>
        </form>

        {/* Categories List */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {categories.map((category) => (
            <div key={category._id} className="group relative bg-gray-800 border border-gray-700 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all">
              <div className="aspect-w-16 aspect-h-9 h-32 overflow-hidden bg-gray-900">
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-between p-3">
                  <span className="text-white font-medium text-sm drop-shadow-md">{category.name}</span>
                  <button
                    onClick={() => handleDeleteCategory(category._id)}
                    className="p-1.5 bg-red-500/80 text-white rounded-full hover:bg-red-600 transition-colors transform hover:scale-110 backdrop-blur-sm"
                    title="Delete Category"
                  >
                    <FaTrash size={12} />
                  </button>
                </div>
              </div>
              <div className="p-3 bg-gray-800 border-t border-gray-700">
                <h4 className="font-semibold text-gray-200 text-center">{category.name}</h4>
              </div>
            </div>
          ))}
          
          {categories.length === 0 && (
            <div className="col-span-full py-12 text-center text-gray-500 bg-gray-800/50 rounded-xl border border-dashed border-gray-700">
              No categories found. Add your first category above!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CategoryManagement;
