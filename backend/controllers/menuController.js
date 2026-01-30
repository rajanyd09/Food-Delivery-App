const MenuItem = require("../models/MenuItem");
const { cloudinary } = require("../config/cloudinary");

// Get all menu items
exports.getAllMenuItems = async (req, res) => {
  try {
    const menuItems = await MenuItem.find({});
    res.json(menuItems);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

// Get single menu item
exports.getMenuItemById = async (req, res) => {
  try {
    const menuItem = await MenuItem.findById(req.params.id);
    if (!menuItem) {
      return res.status(404).json({ error: "Menu item not found" });
    }
    res.json(menuItem);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

// Add new menu item (admin)
exports.createMenuItem = async (req, res) => {
  try {
    const { name, description, price, category, available } = req.body;

    // Check if image was uploaded
    if (!req.file) {
      return res.status(400).json({ error: "Image is required" });
    }

    const menuItem = new MenuItem({
      name,
      description,
      price,
      category,
      available: available === "true" || available === true,
      image: req.file.path, // Cloudinary URL
      cloudinaryId: req.file.filename, // Store Cloudinary public ID for deletion
    });

    await menuItem.save();
    res.status(201).json(menuItem);
  } catch (error) {
    console.error("Error creating menu item:", error);
    console.error("Error details:", {
      message: error.message,
      stack: error.stack,
      name: error.name,
    });
    res.status(500).json({ 
      error: error.message || "Failed to create menu item",
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};


// Update menu item (admin)
exports.updateMenuItem = async (req, res) => {
  try {
    const { name, description, price, category, available } = req.body;
    const menuItem = await MenuItem.findById(req.params.id);

    if (!menuItem) {
      return res.status(404).json({ error: "Menu item not found" });
    }

    // Update fields
    menuItem.name = name || menuItem.name;
    menuItem.description = description || menuItem.description;
    menuItem.price = price || menuItem.price;
    menuItem.category = category || menuItem.category;
    menuItem.available =
      available !== undefined
        ? available === "true" || available === true
        : menuItem.available;

    // If new image is uploaded, delete old one from Cloudinary and update
    if (req.file) {
      // Delete old image from Cloudinary
      if (menuItem.cloudinaryId) {
        await cloudinary.uploader.destroy(menuItem.cloudinaryId);
      }
      menuItem.image = req.file.path;
      menuItem.cloudinaryId = req.file.filename;
    }

    await menuItem.save();
    res.json(menuItem);
  } catch (error) {
    console.error("Error updating menu item:", error);
    res.status(400).json({ error: error.message });
  }
};

// Delete menu item (admin)
exports.deleteMenuItem = async (req, res) => {
  try {
    const menuItem = await MenuItem.findById(req.params.id);

    if (!menuItem) {
      return res.status(404).json({ error: "Menu item not found" });
    }

    // Delete image from Cloudinary
    if (menuItem.cloudinaryId) {
      await cloudinary.uploader.destroy(menuItem.cloudinaryId);
    }

    await MenuItem.findByIdAndDelete(req.params.id);
    res.json({ message: "Menu item deleted successfully" });
  } catch (error) {
    console.error("Error deleting menu item:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Toggle availability (admin)
exports.toggleAvailability = async (req, res) => {
  try {
    const menuItem = await MenuItem.findById(req.params.id);

    if (!menuItem) {
      return res.status(404).json({ error: "Menu item not found" });
    }

    menuItem.available = !menuItem.available;
    await menuItem.save();

    res.json(menuItem);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};
