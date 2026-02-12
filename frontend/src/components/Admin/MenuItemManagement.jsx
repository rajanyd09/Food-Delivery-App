import React, { useState, useEffect } from "react";
import { menuService, categoryService } from "../../services/api";
import toast from "react-hot-toast";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaSearch,
  FaSave,
  FaTimes,
  FaEye,
  FaUpload,
  FaImage,
  FaCheck,
  FaUtensils,
} from "react-icons/fa";

const MenuItemManagement = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    image: "",
    category: "",
    available: true,
  });
  const [imagePreview, setImagePreview] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    available: 0,
    unavailable: 0,
  });
  const [categories, setCategories] = useState([]);

  // Fetch menu items and categories
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [menuRes, catRes] = await Promise.all([
        menuService.getAllMenuItems(),
        categoryService.getAllCategories(),
      ]);
      setMenuItems(menuRes.data || []);
      setCategories(catRes.data || []);
      calculateStats(menuRes.data || []);
      
      // Set default category if available
      if (catRes.data && catRes.data.length > 0) {
        setFormData(prev => ({ ...prev, category: catRes.data[0].name }));
      }
    } catch (error) {
      toast.error("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  const fetchMenuItems = async () => {
    // legacy support if needed, but fetchData handles init
    try {
        const response = await menuService.getAllMenuItems();
        setMenuItems(response.data || []);
        calculateStats(response.data || []);
    } catch (error) {
        console.error("Error refreshing items", error);
    }
  };

  const calculateStats = (items) => {
    const total = items.length;
    const available = items.filter((item) => item.available).length;
    setStats({ total, available, unavailable: total - available });
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      image: "",
      category: "pizza",
      available: true,
    });
    setImagePreview("");
    setImageFile(null);
    setEditingItem(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Create FormData for file upload
      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("price", formData.price);
      formDataToSend.append("category", formData.category);
      formDataToSend.append("available", formData.available);

      // Add image file if selected
      if (imageFile) {
        formDataToSend.append("image", imageFile);
      } else if (!editingItem) {
        // Image is required for new items
        toast.error("Please select an image");
        return;
      }

      let response;
      if (editingItem) {
        // Update existing item
        response = await menuService.updateMenuItem(
          editingItem._id,
          formDataToSend,
        );
      } else {
        // Create new item
        response = await menuService.createMenuItem(formDataToSend);
      }

      toast.success(
        editingItem ? "Menu item updated!" : "Menu item created!",
      );
      setShowAddModal(false);
      resetForm();
      fetchMenuItems();
    } catch (error) {
      console.error("Error saving menu item:", error);
      toast.error(
        error.response?.data?.error ||
          error.message ||
          "Failed to save menu item",
      );
    }
  };


  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this menu item?")) {
      try {
        await menuService.deleteMenuItem(id);
        toast.success("Menu item deleted!");
        fetchMenuItems();
      } catch (error) {
        console.error("Error deleting menu item:", error);
        toast.error(
          error.response?.data?.error || "Failed to delete menu item",
        );
      }
    }
  };


  const filteredItems = menuItems.filter(
    (item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase()),
  );


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">
            Menu Management
          </h1>
          <p className="text-gray-400 mt-1">
            Add, edit, and manage your restaurant menu items
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 shadow-lg font-medium"
          >
            <FaPlus className="mr-2" />
            Add New Item
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-900 p-6 rounded-xl shadow-sm border border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400 uppercase tracking-wide">
                Total Items
              </p>
              <p className="text-3xl font-bold text-white mt-1">
                {stats.total}
              </p>
            </div>
            <div className="p-3 bg-gray-800 rounded-xl">
              <FaUtensils className="text-2xl text-gray-400" />
            </div>
          </div>
        </div>
        <div className="bg-gray-900 p-6 rounded-xl shadow-sm border border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400 uppercase tracking-wide">
                Available
              </p>
              <p className="text-3xl font-bold text-green-400 mt-1">
                {stats.available}
              </p>
            </div>
            <div className="p-3 bg-green-900/20 rounded-xl">
              <FaCheck className="text-2xl text-green-400" />
            </div>
          </div>
        </div>
        <div className="bg-gray-900 p-6 rounded-xl shadow-sm border border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400 uppercase tracking-wide">
                Unavailable
              </p>
              <p className="text-3xl font-bold text-red-400 mt-1">
                {stats.unavailable}
              </p>
            </div>
            <div className="p-3 bg-red-900/20 rounded-xl">
              <FaTimes className="text-2xl text-red-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-gray-900 rounded-xl shadow-sm border border-gray-800 p-6">
        <div className="relative">
          <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Search menu items by name or category..."
            className="w-full pl-12 pr-4 py-3 bg-gray-950 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Menu Items Grid */}
      <div className="bg-gray-900 rounded-xl shadow-sm border border-gray-800 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading menu items...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="p-16 text-center">
            <FaUtensils className="w-20 h-20 text-gray-700 mx-auto mb-6" />
            <h3 className="text-xl font-semibold text-white mb-2">
              No menu items found
            </h3>
            <p className="text-gray-400 mb-6">
              Try adjusting your search or add new items
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
            >
              Add First Menu Item
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-800">
              <thead className="bg-gray-900/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Image
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-gray-900 divide-y divide-gray-800">
                {filteredItems.map((item) => (
                  <tr key={item._id} className="hover:bg-gray-800/50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-white">
                        {item.name}
                      </div>
                      <div className="text-sm text-gray-400 truncate max-w-xs">
                        {item.description}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          item.category === "pizza"
                            ? "bg-red-500/10 text-red-400 border border-red-500/20"
                            : item.category === "burger"
                              ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
                              : item.category === "pasta"
                                ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                                : item.category === "drinks"
                                  ? "bg-green-500/10 text-green-400 border border-green-500/20"
                                  : "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                        }`}
                      >
                        {item.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-2xl font-bold text-white">
                        ₹{item.price}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          item.available
                            ? "bg-green-500/10 text-green-400 border border-green-500/20"
                            : "bg-red-500/10 text-red-400 border border-red-500/20"
                        }`}
                      >
                        {item.available ? "Available" : "Unavailable"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => {
                          setEditingItem(item);
                          setFormData(item);
                          setShowAddModal(true);
                          setImagePreview(item.image);
                        }}
                        className="text-blue-400 hover:text-blue-300 p-1"
                        title="Edit"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDelete(item._id)}
                        className="text-red-400 hover:text-red-300 p-1"
                        title="Delete"
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-800">
            <div className="p-8 border-b border-gray-800 bg-gray-900 sticky top-0 z-10">
              <h2 className="text-2xl font-bold text-white">
                {editingItem ? "Edit Menu Item" : "Add New Menu Item"}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Item Name *
                  </label>
                  <input
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-gray-950 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-600"
                    placeholder="e.g. Margherita Pizza"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Category *
                  </label>
                  <select
                    name="category"
                    required
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-gray-950 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white appearance-none"
                  >
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat.name}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Price (₹)*
                  </label>
                  <input
                    name="price"
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={formData.price}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-gray-950 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-600"
                    placeholder="12.99"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Available
                  </label>
                  <label className="flex items-center space-x-2 p-3 border border-gray-700 rounded-xl bg-gray-950">
                    <input
                      name="available"
                      type="checkbox"
                      checked={formData.available}
                      onChange={handleInputChange}
                      className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-600 rounded bg-gray-900"
                    />
                    <span className="text-sm text-gray-300">Show in menu</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Description *
                </label>
                <textarea
                  name="description"
                  required
                  rows={4}
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-950 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical text-white placeholder-gray-600"
                  placeholder="Delicious thin crust pizza topped with fresh mozzarella, basil, and tomato sauce."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Image{" "}
                  {imageFile && (
                    <span className="text-green-400 font-normal ml-2 text-xs">(Updated)</span>
                  )}
                </label>
                <div className="flex items-center space-x-4">
                  <div className="flex-1 relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div className="w-full px-4 py-3 border border-gray-700 rounded-xl bg-gray-950 flex items-center justify-between text-gray-400 hover:bg-gray-800 transition-colors">
                      <span className="truncate">{imageFile ? imageFile.name : "Choose an image file..."}</span>
                      <FaUpload className="text-gray-500 ml-2" />
                    </div>
                  </div>
                </div>

                {imagePreview && (
                  <div className="mt-4 p-4 border border-dashed border-gray-700 rounded-xl text-center bg-gray-950/50">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-32 h-32 object-cover rounded-lg mx-auto mb-2 border border-gray-700"
                    />
                    <p className="text-sm text-gray-500">
                      {imageFile ? imageFile.name : "Current image"}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-800">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    resetForm();
                  }}
                  className="px-6 py-3 border border-gray-700 text-gray-300 rounded-xl hover:bg-gray-800 hover:text-white transition-colors font-medium"
                >
                  <FaTimes className="mr-2 inline" />
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium shadow-lg flex items-center"
                >
                  <FaSave className="mr-2" />
                  {editingItem ? "Update Item" : "Create Item"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MenuItemManagement;
