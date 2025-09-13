const jwt = require("jsonwebtoken")
const User = require("../models/User")
const Tenant = require("../models/Tenant")

// Verify JWT token and attach user to request
const authenticate = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "")

    if (!token) {
      return res.status(401).json({ message: "Access denied. No token provided." })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findById(decoded.userId).populate("tenantId")

    if (!user || !user.isActive) {
      return res.status(401).json({ message: "Invalid token or user inactive." })
    }

    if (!user.tenantId || !user.tenantId.isActive) {
      return res.status(401).json({ message: "Tenant inactive or not found." })
    }

    req.user = user
    req.tenantId = user.tenantId._id
    req.tenant = user.tenantId

    next()
  } catch (error) {
    console.error("Auth middleware error:", error)
    res.status(401).json({ message: "Invalid token." })
  }
}

// Check if user has admin role
const requireAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied. Admin role required." })
  }
  next()
}

// Validate tenant access (ensure user belongs to the tenant in URL)
const validateTenantAccess = async (req, res, next) => {
  try {
    const { slug } = req.params

    if (slug && req.tenant.slug !== slug) {
      return res.status(403).json({ message: "Access denied. Invalid tenant." })
    }

    next()
  } catch (error) {
    console.error("Tenant validation error:", error)
    res.status(500).json({ message: "Server error during tenant validation." })
  }
}

module.exports = {
  authenticate,
  requireAdmin,
  validateTenantAccess,
}
