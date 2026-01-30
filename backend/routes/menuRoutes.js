const express = require("express");
const router = express.Router();
const menuController = require("../controllers/menuController");
const { upload } = require("../config/cloudinary");

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
router.get("/:id", menuController.getMenuItemById);
router.post("/", upload.single("image"), handleMulterError, menuController.createMenuItem);
router.put("/:id", upload.single("image"), handleMulterError, menuController.updateMenuItem);
router.delete("/:id", menuController.deleteMenuItem);
router.patch("/:id/toggle", menuController.toggleAvailability);

module.exports = router;
