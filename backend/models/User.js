const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters long"],
    },
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters long"],
    },
    phone: {
      type: String,
      trim: true,
      match: [/^[+]?[\d\s\-()]+$/, "Please enter a valid phone number"],
    },
    address: {
      street: { type: String, trim: true },
      city: { type: String, trim: true },
      state: { type: String, trim: true },
      zipCode: { type: String, trim: true },
      country: { type: String, trim: true, default: "USA" },
    },
    role: {
      type: String,
      enum: ["customer", "restaurant_staff", "delivery_person", "admin"],
      default: "customer",
    },
    favorites: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "MenuItem",
      },
    ],
    orders: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order",
      },
    ],
    profileImage: {
      type: String,
      default: "https://cdn-icons-png.flaticon.com/512/149/149071.png",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationToken: String,
    emailVerificationExpires: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    lastLogin: Date,
    loginAttempts: {
      type: Number,
      default: 0,
    },
    lockUntil: Date,
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        delete ret.password;
        delete ret.__v;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      transform: function (doc, ret) {
        delete ret.password;
        delete ret.__v;
        return ret;
      },
    },
  },
);

// Virtual for full address
userSchema.virtual("fullAddress").get(function () {
  const parts = [];
  if (this.address?.street) parts.push(this.address.street);
  if (this.address?.city) parts.push(this.address.city);
  if (this.address?.state) parts.push(this.address.state);
  if (this.address?.zipCode) parts.push(this.address.zipCode);
  if (this.address?.country) parts.push(this.address.country);
  return parts.join(", ");
});

// Hash password before saving
// ✅ BEST - Pure Promise (no next() needed)
userSchema.pre("save", async function () {
  // No 'next' parameter
  if (!this.isModified("password")) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);

  // Clear password reset token
  if (this.passwordResetToken) {
    this.passwordResetToken = undefined;
    this.passwordResetExpires = undefined;
  }
});

// Update last login on successful login
userSchema.methods.updateLastLogin = function () {
  this.lastLogin = new Date();
  this.loginAttempts = 0;
  this.lockUntil = undefined;
  return this.save();
};

// Increment login attempts
userSchema.methods.incrementLoginAttempts = function () {
  this.loginAttempts += 1;

  // Lock account after 5 failed attempts for 15 minutes
  if (this.loginAttempts >= 5 && !this.lockUntil) {
    this.lockUntil = new Date(Date.now() + 15 * 60 * 1000);
  }

  return this.save();
};

// Check if account is locked
userSchema.methods.isLocked = function () {
  return this.lockUntil && this.lockUntil > new Date();
};

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    if (this.isLocked()) {
      throw new Error("Account is temporarily locked. Try again later.");
    }

    const isMatch = await bcrypt.compare(candidatePassword, this.password);

    if (isMatch) {
      await this.updateLastLogin();
      return true;
    } else {
      await this.incrementLoginAttempts();

      if (this.isLocked()) {
        throw new Error(
          "Account is temporarily locked. Try again in 15 minutes.",
        );
      }

      return false;
    }
  } catch (error) {
    throw error;
  }
};

// Generate password reset token (OTP)
userSchema.methods.createPasswordResetToken = function () {
  // Generate a 6-digit numeric OTP
  const resetToken = Math.floor(100000 + Math.random() * 900000).toString();

  this.passwordResetToken = resetToken;
  this.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes (shorter for OTP)

  return resetToken;
};

// Generate email verification token
userSchema.methods.createEmailVerificationToken = function () {
  const verificationToken = Math.random().toString(36).slice(-8);

  this.emailVerificationToken = verificationToken;
  this.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  return verificationToken;
};

// Add order to user
userSchema.methods.addOrder = function (orderId) {
  if (!this.orders.includes(orderId)) {
    this.orders.push(orderId);
  }
  return this.save();
};

// Add/remove favorite
userSchema.methods.toggleFavorite = function (menuItemId) {
  const index = this.favorites.indexOf(menuItemId);

  if (index === -1) {
    // Add to favorites
    this.favorites.push(menuItemId);
  } else {
    // Remove from favorites
    this.favorites.splice(index, 1);
  }

  return this.save();
};

// Check if item is favorite
userSchema.methods.isFavorite = function (menuItemId) {
  return this.favorites.includes(menuItemId);
};

// Static method to find by email
userSchema.statics.findByEmail = function (email) {
  return this.findOne({ email: new RegExp(`^${email}$`, "i") });
};

module.exports = mongoose.model("User", userSchema);
