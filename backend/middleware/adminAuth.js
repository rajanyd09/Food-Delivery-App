const jwt = require("jsonwebtoken");
const User = require("../models/User");

const adminAuth = async (req, res, next) => {
  try {
    console.log(
      "🔍 AdminAuth - Token received:",
      req.header("Authorization")?.substring(0, 20) + "...",
    );

    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      console.log("❌ No token");
      return res.status(401).json({ success: false, error: "No token" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret");
    console.log("✅ Token decoded:", decoded);

    const user = await User.findById(decoded.userId).select("-password");
    console.log("👤 User found:", user?.email, "Role:", user?.role);

    if (!user) {
      console.log("❌ User not found");
      return res.status(401).json({ success: false, error: "User not found" });
    }

    if (user.role !== "admin") {
      console.log("🚫 Not admin - Role:", user.role);
      return res.status(403).json({ success: false, error: "Admin required" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.log("💥 Auth error:", error.message);
    res.status(401).json({ success: false, error: "Token invalid" });
  }
};

module.exports = adminAuth;
