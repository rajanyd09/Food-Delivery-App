const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { body, param } = require("express-validator");
const auth = require("../middleware/auth");
const requireRole = require("../middleware/requireRole");

// Validation middleware
const validateProfileUpdate = [
  body("name")
    .optional()
    .isLength({ min: 2 })
    .withMessage("Name must be at least 2 characters"),
  body("email").optional().isEmail().withMessage("Please enter a valid email"),
  body("phone")
    .optional()
    .matches(/^[+]?[\d\s\-()]+$/)
    .withMessage("Please enter a valid phone number"),
  body("profileImage")
    .optional()
    .isURL()
    .withMessage("Please enter a valid URL"),
];

// Public routes
router.post(
  "/request-password-reset",
  body("email").isEmail().withMessage("Please enter a valid email"),
  userController.requestPasswordReset,
);

router.post(
  "/reset-password",
  body("token").notEmpty().withMessage("Token is required"),
  body("newPassword")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
  userController.resetPassword,
);

// Protected routes (require authentication)
router.use(auth);

// User profile routes
router.get("/profile", userController.getProfile);
router.put("/profile", validateProfileUpdate, userController.updateProfile);
router.put("/change-password", userController.changePassword);
router.delete("/account", userController.deleteAccount);

// User orders
router.get("/orders", userController.getUserOrders);

// User favorites
router.get("/favorites", userController.getFavorites);
router.post(
  "/favorites/:menuItemId",
  param("menuItemId").isMongoId().withMessage("Invalid menu item ID"),
  userController.toggleFavorite,
);

// User address
router.put("/address", userController.updateAddress);

// Admin routes (require admin role)
router.use(requireRole("admin"));

router.get("/", userController.getAllUsers);

router.get(
  "/:id",
  param("id").isMongoId().withMessage("Invalid user ID"),
  userController.getUserById,
);

router.put(
  "/:id",
  param("id").isMongoId().withMessage("Invalid user ID"),
  validateProfileUpdate,
  userController.updateUser,
);

router.delete(
  "/:id",
  param("id").isMongoId().withMessage("Invalid user ID"),
  userController.deleteUser,
);

module.exports = router;
