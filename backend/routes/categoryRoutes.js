const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/categoryController");
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

router.get("/", categoryController.getAllCategories);
router.post("/", adminAuth, upload.single("image"), handleMulterError, categoryController.createCategory);
router.delete("/:id", adminAuth, categoryController.deleteCategory);

module.exports = router;
