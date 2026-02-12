const express = require("express");
const router = express.Router();
const menuController = require("../controllers/menuController");
const { upload } = require("../config/cloudinary");
const adminAuth = require("../middleware/adminAuth");

// Multer error handling middleware
const handleMulterError = (err, req, res, next) => {
  if (err) {
    console.error("Multer/Cloudinary error:", err);
    return res.status(400).json({ 
      error: err.message || "File upload failed",
      details: err.toString()
    });
  }
  next();
};

router.get("/", menuController.getAllMenuItems);
router.get("/new", menuController.getNewMenuItems);
router.get("/:id", menuController.getMenuItemById);
router.post("/", adminAuth, upload.single("image"), handleMulterError, menuController.createMenuItem);
router.put("/:id", adminAuth, upload.single("image"), handleMulterError, menuController.updateMenuItem);
router.delete("/:id", adminAuth, menuController.deleteMenuItem);
router.patch("/:id/toggle", adminAuth, menuController.toggleAvailability);

module.exports = router;
