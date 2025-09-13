const express = require("express")
const { body, validationResult } = require("express-validator")
const Tenant = require("../models/Tenant")
const Note = require("../models/Note")
const { authenticate, requireAdmin, validateTenantAccess } = require("../middleware/auth")

const router = express.Router()

// @route   GET /api/tenants/:slug
// @desc    Get tenant information
// @access  Private
router.get("/:slug", [authenticate, validateTenantAccess], async (req, res) => {
  try {
    const tenant = await Tenant.findOne({
      slug: req.params.slug,
      isActive: true,
    })

    if (!tenant) {
      return res.status(404).json({ message: "Tenant not found" })
    }

    // Get notes count for the tenant
    const notesCount = await Note.countDocuments({
      tenantId: tenant._id,
      isArchived: false,
    })

    res.json({
      tenant: {
        id: tenant._id,
        name: tenant.name,
        slug: tenant.slug,
        subscription: tenant.subscription,
        notesCount,
        createdAt: tenant.createdAt,
      },
    })
  } catch (error) {
    console.error("Tenant fetch error:", error)
    res.status(500).json({ message: "Server error fetching tenant" })
  }
})

// @route   POST /api/tenants/:slug/upgrade
// @desc    Upgrade tenant subscription to Pro
// @access  Private (Admin only)
router.post("/:slug/upgrade", [authenticate, requireAdmin, validateTenantAccess], async (req, res) => {
  try {
    const tenant = await Tenant.findOne({
      slug: req.params.slug,
      isActive: true,
    })

    if (!tenant) {
      return res.status(404).json({ message: "Tenant not found" })
    }

    // Check if already on Pro plan
    if (tenant.subscription.plan === "pro") {
      return res.status(400).json({ message: "Tenant is already on Pro plan" })
    }

    // Upgrade to Pro
    tenant.subscription.plan = "pro"
    tenant.subscription.upgradeDate = new Date()
    await tenant.save()

    res.json({
      message: "Tenant upgraded to Pro plan successfully",
      tenant: {
        id: tenant._id,
        name: tenant.name,
        slug: tenant.slug,
        subscription: tenant.subscription,
      },
    })
  } catch (error) {
    console.error("Tenant upgrade error:", error)
    res.status(500).json({ message: "Server error upgrading tenant" })
  }
})

// @route   POST /api/tenants/:slug/downgrade
// @desc    Downgrade tenant subscription to Free
// @access  Private (Admin only)
router.post("/:slug/downgrade", [authenticate, requireAdmin, validateTenantAccess], async (req, res) => {
  try {
    const tenant = await Tenant.findOne({
      slug: req.params.slug,
      isActive: true,
    })

    if (!tenant) {
      return res.status(404).json({ message: "Tenant not found" })
    }

    // Check if already on Free plan
    if (tenant.subscription.plan === "free") {
      return res.status(400).json({ message: "Tenant is already on Free plan" })
    }

    // Check notes count - if more than 3, warn about potential data loss
    const notesCount = await Note.countDocuments({
      tenantId: tenant._id,
      isArchived: false,
    })

    if (notesCount > 3) {
      return res.status(400).json({
        message: `Cannot downgrade: Tenant has ${notesCount} notes. Free plan allows maximum 3 notes. Please delete ${notesCount - 3} notes first.`,
        notesCount,
        maxAllowed: 3,
      })
    }

    // Downgrade to Free
    tenant.subscription.plan = "free"
    tenant.subscription.upgradeDate = null
    await tenant.save()

    res.json({
      message: "Tenant downgraded to Free plan successfully",
      tenant: {
        id: tenant._id,
        name: tenant.name,
        slug: tenant.slug,
        subscription: tenant.subscription,
      },
    })
  } catch (error) {
    console.error("Tenant downgrade error:", error)
    res.status(500).json({ message: "Server error downgrading tenant" })
  }
})

// @route   GET /api/tenants/:slug/stats
// @desc    Get tenant statistics
// @access  Private (Admin only)
router.get("/:slug/stats", [authenticate, requireAdmin, validateTenantAccess], async (req, res) => {
  try {
    const tenant = await Tenant.findOne({
      slug: req.params.slug,
      isActive: true,
    })

    if (!tenant) {
      return res.status(404).json({ message: "Tenant not found" })
    }

    // Get various statistics
    const [notesCount, archivedNotesCount, usersCount] = await Promise.all([
      Note.countDocuments({ tenantId: tenant._id, isArchived: false }),
      Note.countDocuments({ tenantId: tenant._id, isArchived: true }),
      require("../models/User").countDocuments({ tenantId: tenant._id, isActive: true }),
    ])

    // Get recent notes
    const recentNotes = await Note.find({
      tenantId: tenant._id,
      isArchived: false,
    })
      .populate("userId", "email")
      .sort({ createdAt: -1 })
      .limit(5)
      .select("title createdAt userId")

    res.json({
      stats: {
        notesCount,
        archivedNotesCount,
        usersCount,
        subscription: tenant.subscription,
        recentNotes,
      },
    })
  } catch (error) {
    console.error("Tenant stats error:", error)
    res.status(500).json({ message: "Server error fetching tenant stats" })
  }
})

module.exports = router
