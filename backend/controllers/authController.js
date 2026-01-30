const User = require("../models/User");
const jwt = require("jsonwebtoken");

// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET || "secret", {
    expiresIn: "7d",
  });
};

// User Registration
exports.register = async (req, res) => {
  try {
    const { email, password, name, phone } = req.body;

    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: "Email already registered",
      });
    }

    // Create new user
    const user = new User({
      email,
      password,
      name,
      phone,
    });

    await user.save();

    // Generate auth token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: "Registration successful",
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
        },
        token,
      },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

// User Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("Login attempt for:", email);

    // Find user
    const user = await User.findByEmail(email);
    if (!user) {
      console.log("User not found:", email);
      return res.status(401).json({
        success: false,
        error: "Invalid credentials",
      });
    }

    // Check if account is active
    if (!user.isActive) {
      console.log("User inactive:", email);
      return res.status(401).json({
        success: false,
        error: "Account is deactivated",
      });
    }

    // Check password
    try {
      const isPasswordValid = await user.comparePassword(password);
      console.log("Password valid:", isPasswordValid);

      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          error: "Invalid credentials",
        });
      }
    } catch (error) {
      console.error("Password comparison error:", error);
      return res.status(401).json({
        success: false,
        error: error.message,
      });
    }

    // Generate token
    const token = generateToken(user._id);

    console.log("Login successful for:", email);
    res.json({
      success: true,
      message: "Login successful",
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          profileImage: user.profileImage,
        },
        token,
      },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};



// Logout User
exports.logout = async (req, res) => {
  try {
    res.json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Server error during logout",
    });
  }
};

// Get current user (alternative to userController.getProfile)
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password -__v");

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
