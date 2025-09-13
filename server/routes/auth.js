const express = require("express")
const jwt = require("jsonwebtoken")
const { body, validationResult } = require("express-validator")
const rateLimit = require("express-rate-limit")
const User = require("../models/User")
const Tenant = require("../models/Tenant")
const { authenticate } = require("../middleware/auth")

const router = express.Router()

// Login rate limiter - UPDATED: More lenient for production
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // 50 login attempts in both dev and prod (FIXED)
  message: {
    error: "Too many login attempts, please try again later.",
    retryAfter: "15 minutes"
  },
  standardHeaders: true,
  legacyHeaders: false,
})

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "7d",
  })
}

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post(
  "/login",
  [
    loginLimiter, // Apply rate limiting to login
    body("email").isEmail().normalizeEmail().withMessage("Please provide a valid email"),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
  ],
  async (req, res) => {
    try {
      // Check for validation errors
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({
          message: "Validation failed",
          errors: errors.array(),
        })
      }

      const { email, password } = req.body

      // Find user and populate tenant information
      const user = await User.findOne({ email, isActive: true }).populate("tenantId")

      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" })
      }

      // Check if tenant is active
      if (!user.tenantId || !user.tenantId.isActive) {
        return res.status(401).json({ message: "Account suspended. Please contact support." })
      }

      // Verify password
      const isPasswordValid = await user.comparePassword(password)
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Invalid credentials" })
      }

      // Generate token
      const token = generateToken(user._id)

      // Return user data and token
      res.json({
        message: "Login successful",
        token,
        user: {
          id: user._id,
          email: user.email,
          role: user.role,
          tenant: {
            id: user.tenantId._id,
            name: user.tenantId.name,
            slug: user.tenantId.slug,
            subscription: user.tenantId.subscription,
          },
        },
      })
    } catch (error) {
      console.error("Login error:", error)
      res.status(500).json({ message: "Server error during login" })
    }
  },
)

// @route   POST /api/auth/register
// @desc    Register new user (Admin only - for inviting users)
// @access  Private (Admin)
router.post(
  "/register",
  [
    authenticate,
    body("email").isEmail().normalizeEmail().withMessage("Please provide a valid email"),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
    body("role").isIn(["admin", "member"]).withMessage("Role must be either admin or member"),
  ],
  async (req, res) => {
    try {
      // Only admins can register new users
      if (req.user.role !== "admin") {
        return res.status(403).json({ message: "Access denied. Admin role required." })
      }

      // Check for validation errors
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({
          message: "Validation failed",
          errors: errors.array(),
        })
      }

      const { email, password, role } = req.body

      // Check if user already exists
      const existingUser = await User.findOne({ email })
      if (existingUser) {
        return res.status(400).json({ message: "User already exists with this email" })
      }

      // Create new user in the same tenant as the admin
      const newUser = new User({
        email,
        password,
        role,
        tenantId: req.tenantId,
      })

      await newUser.save()

      res.status(201).json({
        message: "User registered successfully",
        user: {
          id: newUser._id,
          email: newUser.email,
          role: newUser.role,
          tenantId: newUser.tenantId,
        },
      })
    } catch (error) {
      console.error("Registration error:", error)
      res.status(500).json({ message: "Server error during registration" })
    }
  },
)

// @route   GET /api/auth/me
// @desc    Get current user profile
// @access  Private
router.get("/me", authenticate, async (req, res) => {
  try {
    res.json({
      user: {
        id: req.user._id,
        email: req.user.email,
        role: req.user.role,
        tenant: {
          id: req.tenant._id,
          name: req.tenant.name,
          slug: req.tenant.slug,
          subscription: req.tenant.subscription,
        },
      },
    })
  } catch (error) {
    console.error("Profile fetch error:", error)
    res.status(500).json({ message: "Server error fetching profile" })
  }
})

// @route   PUT /api/auth/change-password
// @desc    Change user password
// @access  Private
router.put(
  "/change-password",
  [
    authenticate,
    body("currentPassword").notEmpty().withMessage("Current password is required"),
    body("newPassword").isLength({ min: 6 }).withMessage("New password must be at least 6 characters"),
  ],
  async (req, res) => {
    try {
      // Check for validation errors
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({
          message: "Validation failed",
          errors: errors.array(),
        })
      }

      const { currentPassword, newPassword } = req.body

      // Verify current password
      const isCurrentPasswordValid = await req.user.comparePassword(currentPassword)
      if (!isCurrentPasswordValid) {
        return res.status(400).json({ message: "Current password is incorrect" })
      }

      // Update password
      req.user.password = newPassword
      await req.user.save()

      res.json({ message: "Password changed successfully" })
    } catch (error) {
      console.error("Password change error:", error)
      res.status(500).json({ message: "Server error changing password" })
    }
  },
)

// @route   POST /api/auth/refresh
// @desc    Refresh JWT token
// @access  Private
router.post("/refresh", authenticate, async (req, res) => {
  try {
    // Generate new token
    const token = generateToken(req.user._id)

    res.json({
      message: "Token refreshed successfully",
      token,
    })
  } catch (error) {
    console.error("Token refresh error:", error)
    res.status(500).json({ message: "Server error refreshing token" })
  }
})

// @route   GET /api/auth/users
// @desc    Get all users in tenant (Admin only)
// @access  Private (Admin)
router.get("/users", authenticate, async (req, res) => {
  try {
    // Only admins can view all users
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admin role required." })
    }

    const users = await User.find({
      tenantId: req.tenantId,
      isActive: true,
    })
      .select("-password")
      .sort({ createdAt: -1 })

    res.json({
      users,
      count: users.length,
    })
  } catch (error) {
    console.error("Users fetch error:", error)
    res.status(500).json({ message: "Server error fetching users" })
  }
})

module.exports = router
