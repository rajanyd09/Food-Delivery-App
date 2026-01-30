const User = require("../models/User");
const Order = require("../models/Order");
const MenuItem = require("../models/MenuItem");
const { validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/sendEmail");

// Get current user profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId)
      .select("-password -__v")
      .populate({
        path: "orders",
        options: { sort: { createdAt: -1 }, limit: 10 },
        select: "_id totalAmount status orderDate items",
      })
      .populate({
        path: "favorites",
        select: "_id name description price image category",
      });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Server error",
    });
  }
};

// Update user profile
exports.updateProfile = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const updates = req.body;
    const allowedUpdates = ["name", "phone", "address", "profileImage"];
    const updateData = {};

    // Filter allowed updates
    allowedUpdates.forEach((field) => {
      if (updates[field] !== undefined) {
        updateData[field] = updates[field];
      }
    });

    // If updating email, need to verify it
    if (updates.email && updates.email !== req.user.email) {
      updateData.email = updates.email;
      updateData.isEmailVerified = false;
      // Would send verification email here
    }

    const user = await User.findByIdAndUpdate(req.userId, updateData, {
      new: true,
      runValidators: true,
    }).select("-password -__v");

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    res.json({
      success: true,
      message: "Profile updated successfully",
      data: user,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: "Email already exists",
      });
    }
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

// Change password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        error: "Current password and new password are required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        error: "New password must be at least 6 characters long",
      });
    }

    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    // Verify current password
    const isPasswordValid = await user.comparePassword(currentPassword);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: "Current password is incorrect",
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

// Get user orders
exports.getUserOrders = async (req, res) => {
  try {
    const { status, limit = 20, page = 1 } = req.query;
    const skip = (page - 1) * parseInt(limit);

    // ✅ FIX: Query by customer.phone OR add user field to schema
    const query = {
      "customer.phone": req.user.phone || req.user.phoneNumber, // Match your auth user
    };

    if (status) query.status = status;

    console.log("🔍 Query:", query); // Debug

    const orders = await Order.find(query)
      .populate("items.menuItem", "name price image")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalOrders = await Order.countDocuments(query);

    res.json({
      success: true,
      data: {
        orders,
        pagination: {
          total: totalOrders,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(totalOrders / limit),
        },
      },
    });
  } catch (error) {
    console.error("Orders error:", error);
    res.status(500).json({ success: false, error: "Server error" });
  }
};

// Toggle favorite menu item
exports.toggleFavorite = async (req, res) => {
  try {
    const { menuItemId } = req.params;

    // Check if menu item exists
    const menuItem = await MenuItem.findById(menuItemId);
    if (!menuItem) {
      return res.status(404).json({
        success: false,
        error: "Menu item not found",
      });
    }

    const user = await User.findById(req.userId);
    const isFavorite = user.isFavorite(menuItemId);

    await user.toggleFavorite(menuItemId);

    res.json({
      success: true,
      message: isFavorite ? "Removed from favorites" : "Added to favorites",
      data: {
        isFavorite: !isFavorite,
      },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

// Get user favorites
exports.getFavorites = async (req, res) => {
  try {
    const user = await User.findById(req.userId).populate({
      path: "favorites",
      select: "_id name description price image category available",
    });

    res.json({
      success: true,
      data: user.favorites,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Server error",
    });
  }
};

// Update user address
exports.updateAddress = async (req, res) => {
  try {
    const { street, city, state, zipCode, country } = req.body;

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    user.address = {
      street: street || user.address.street,
      city: city || user.address.city,
      state: state || user.address.state,
      zipCode: zipCode || user.address.zipCode,
      country: country || user.address.country,
    };

    await user.save();

    res.json({
      success: true,
      message: "Address updated successfully",
      data: user.address,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

// Request password reset
exports.requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User with this email not found",
      });
    }

    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    // Send email
    const message = `
      <h1>Password Reset Request</h1>
      <p>You requested a password reset. Please use the following OTP (One-Time Password) to reset your password:</p>
      <h2 style="font-size: 24px; font-weight: bold; color: #4F46E5; letter-spacing: 5px;">${resetToken}</h2>
      <p>This code will expire in 10 minutes.</p>
      <p>If you did not request this, please ignore this email.</p>
    `;

    try {
      await sendEmail({
        email: user.email,
        subject: "Your Password Reset OTP",
        message,
      });

      res.json({
        success: true,
        message: "OTP sent to email",
        data: {
          // In dev, we can still return it for testing if email fails
          // resetToken,
        },
      });
    } catch (emailError) {
      console.error("Email send error:", emailError);

      // In LOCAL/DEV, if email fails, return token anyway so we can test
      if (process.env.NODE_ENV !== "production") {
        return res.json({
          success: true,
          message: "Email failed (Dev Mode: OTP returned)",
          data: {
            resetToken, // Return token for testing
          },
        });
      }

      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });

      return res.status(500).json({
        success: false,
        error: "Email could not be sent. Please check server logs.",
      });
    }
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

// Reset password with token
exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        error: "Token and new password are required",
      });
    }

    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        error: "Invalid or expired token",
      });
    }

    user.password = newPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save();

    res.json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

// Delete user account (soft delete)
exports.deleteAccount = async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        success: false,
        error: "Password is required to delete account",
      });
    }

    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: "Password is incorrect",
      });
    }

    // Soft delete - mark as inactive
    user.isActive = false;
    await user.save();

    res.json({
      success: true,
      message: "Account deleted successfully",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

// Admin: Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const { role, search, isActive, limit = 50, page = 1 } = req.query;
    const skip = (page - 1) * limit;

    const query = {};

    if (role) query.role = role;
    if (isActive !== undefined) query.isActive = isActive === "true";

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ];
    }

    const users = await User.find(query)
      .select("-password -__v")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalUsers = await User.countDocuments(query);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          total: totalUsers,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(totalUsers / limit),
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Server error",
    });
  }
};

// Admin: Get user by ID
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select("-password -__v")
      .populate({
        path: "orders",
        options: { sort: { createdAt: -1 } },
      });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Server error",
    });
  }
};

// Admin: Update user
exports.updateUser = async (req, res) => {
  try {
    const updates = req.body;
    const allowedUpdates = [
      "name",
      "email",
      "phone",
      "role",
      "isActive",
      "address",
    ];
    const updateData = {};

    allowedUpdates.forEach((field) => {
      if (updates[field] !== undefined) {
        updateData[field] = updates[field];
      }
    });

    const user = await User.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    }).select("-password -__v");

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    res.json({
      success: true,
      message: "User updated successfully",
      data: user,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: "Email already exists",
      });
    }
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

// Admin: Delete user
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    // In production, you might want to archive instead of delete
    await user.deleteOne();

    res.json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Server error",
    });
  }
};
