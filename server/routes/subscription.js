const express = require("express")
const SubscriptionService = require("../services/subscriptionService")
const { authenticate, requireAdmin, validateTenantAccess } = require("../middleware/auth")

const router = express.Router()

// @route   GET /api/subscription/usage
// @desc    Get current subscription usage stats
// @access  Private
router.get("/usage", authenticate, async (req, res) => {
  try {
    const usage = await SubscriptionService.getUsageStats(req.tenantId)
    res.json({ usage })
  } catch (error) {
    console.error("Usage stats error:", error)
    res.status(500).json({ message: "Server error fetching usage stats" })
  }
})

// @route   GET /api/subscription/plans
// @desc    Get available subscription plans
// @access  Private
router.get("/plans", authenticate, async (req, res) => {
  try {
    const plans = SubscriptionService.getPlansInfo()
    const usage = await SubscriptionService.getUsageStats(req.tenantId)

    res.json({
      plans,
      currentPlan: usage.plan,
      usage,
    })
  } catch (error) {
    console.error("Plans fetch error:", error)
    res.status(500).json({ message: "Server error fetching plans" })
  }
})

// @route   POST /api/subscription/upgrade
// @desc    Upgrade to Pro plan (Admin only)
// @access  Private (Admin)
router.post("/upgrade", [authenticate, requireAdmin], async (req, res) => {
  try {
    const result = await SubscriptionService.upgradeToPro(req.tenantId)
    res.json(result)
  } catch (error) {
    console.error("Upgrade error:", error)
    if (error.message.includes("already on Pro plan")) {
      return res.status(400).json({ message: error.message })
    }
    res.status(500).json({ message: "Server error during upgrade" })
  }
})

// @route   POST /api/subscription/downgrade
// @desc    Downgrade to Free plan (Admin only)
// @access  Private (Admin)
router.post("/downgrade", [authenticate, requireAdmin], async (req, res) => {
  try {
    const result = await SubscriptionService.downgradeToFree(req.tenantId)
    res.json(result)
  } catch (error) {
    console.error("Downgrade error:", error)
    if (error.message.includes("Cannot downgrade") || error.message.includes("already on Free plan")) {
      return res.status(400).json({ message: error.message })
    }
    res.status(500).json({ message: "Server error during downgrade" })
  }
})

// @route   GET /api/subscription/check-limits
// @desc    Check if user can create more notes
// @access  Private
router.get("/check-limits", authenticate, async (req, res) => {
  try {
    const result = await SubscriptionService.canCreateNote(req.tenantId)
    res.json(result)
  } catch (error) {
    console.error("Limit check error:", error)
    res.status(500).json({ message: "Server error checking limits" })
  }
})

// @route   GET /api/subscription/upgrade-suggestion
// @desc    Check if user should be suggested to upgrade
// @access  Private
router.get("/upgrade-suggestion", authenticate, async (req, res) => {
  try {
    const suggestion = await SubscriptionService.shouldSuggestUpgrade(req.tenantId)
    res.json(suggestion)
  } catch (error) {
    console.error("Upgrade suggestion error:", error)
    res.status(500).json({ message: "Server error checking upgrade suggestion" })
  }
})

module.exports = router
