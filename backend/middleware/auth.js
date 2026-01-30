const jwt = require("jsonwebtoken");
const User = require("../models/User");

const auth = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({
        success: false,
        error: "Authentication required",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret");
    const user = await User.findOne({
      _id: decoded.userId,
      isActive: true,
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: "User not found or inactive",
      });
    }

    // Attach user info to request
    req.userId = user._id;
    req.user = user;
    req.token = token;

    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        error: "Invalid token",
      });
    }

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        error: "Token expired",
      });
    }

    res.status(401).json({
      success: false,
      error: "Authentication failed",
    });
  }
};

module.exports = auth;
