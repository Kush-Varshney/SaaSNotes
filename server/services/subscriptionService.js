const Tenant = require("../models/Tenant")
const Note = require("../models/Note")

class SubscriptionService {
  /**
   * Check if tenant can create more notes based on their subscription
   */
  static async canCreateNote(tenantId) {
    try {
      const tenant = await Tenant.findById(tenantId)
      if (!tenant) {
        throw new Error("Tenant not found")
      }

      // Pro plan has unlimited notes
      if (tenant.subscription.plan === "pro") {
        return { canCreate: true, reason: "Pro plan - unlimited notes" }
      }

      // Free plan - check current count against limit
      const currentCount = await Note.countDocuments({
        tenantId,
        isArchived: false,
      })

      const limit = tenant.subscription.notesLimit
      const canCreate = currentCount < limit

      return {
        canCreate,
        currentCount,
        limit,
        remaining: Math.max(0, limit - currentCount),
        reason: canCreate
          ? `${limit - currentCount} notes remaining on Free plan`
          : `Free plan limit of ${limit} notes reached`,
      }
    } catch (error) {
      console.error("Error checking note creation permission:", error)
      throw error
    }
  }

  /**
   * Get subscription usage statistics
   */
  static async getUsageStats(tenantId) {
    try {
      const tenant = await Tenant.findById(tenantId)
      if (!tenant) {
        throw new Error("Tenant not found")
      }

      const [activeNotes, archivedNotes, totalNotes] = await Promise.all([
        Note.countDocuments({ tenantId, isArchived: false }),
        Note.countDocuments({ tenantId, isArchived: true }),
        Note.countDocuments({ tenantId }),
      ])

      const usage = {
        plan: tenant.subscription.plan,
        activeNotes,
        archivedNotes,
        totalNotes,
        limit: tenant.subscription.notesLimit,
        unlimited: tenant.subscription.plan === "pro",
        upgradeDate: tenant.subscription.upgradeDate,
      }

      // Calculate usage percentage for free plan
      if (tenant.subscription.plan === "free") {
        usage.usagePercentage = Math.round((activeNotes / tenant.subscription.notesLimit) * 100)
        usage.remaining = Math.max(0, tenant.subscription.notesLimit - activeNotes)
      }

      return usage
    } catch (error) {
      console.error("Error getting usage stats:", error)
      throw error
    }
  }

  /**
   * Upgrade tenant to Pro plan
   */
  static async upgradeToPro(tenantId) {
    try {
      const tenant = await Tenant.findById(tenantId)
      if (!tenant) {
        throw new Error("Tenant not found")
      }

      if (tenant.subscription.plan === "pro") {
        throw new Error("Tenant is already on Pro plan")
      }

      tenant.subscription.plan = "pro"
      tenant.subscription.upgradeDate = new Date()
      await tenant.save()

      return {
        success: true,
        message: "Successfully upgraded to Pro plan",
        subscription: tenant.subscription,
      }
    } catch (error) {
      console.error("Error upgrading to Pro:", error)
      throw error
    }
  }

  /**
   * Downgrade tenant to Free plan
   */
  static async downgradeToFree(tenantId) {
    try {
      const tenant = await Tenant.findById(tenantId)
      if (!tenant) {
        throw new Error("Tenant not found")
      }

      if (tenant.subscription.plan === "free") {
        throw new Error("Tenant is already on Free plan")
      }

      // Check if tenant has more than 3 active notes
      const activeNotesCount = await Note.countDocuments({
        tenantId,
        isArchived: false,
      })

      if (activeNotesCount > 3) {
        throw new Error(
          `Cannot downgrade: Tenant has ${activeNotesCount} active notes. Free plan allows maximum 3 notes. Please delete ${activeNotesCount - 3} notes first.`,
        )
      }

      tenant.subscription.plan = "free"
      tenant.subscription.upgradeDate = null
      await tenant.save()

      return {
        success: true,
        message: "Successfully downgraded to Free plan",
        subscription: tenant.subscription,
      }
    } catch (error) {
      console.error("Error downgrading to Free:", error)
      throw error
    }
  }

  /**
   * Get subscription plans information
   */
  static getPlansInfo() {
    return {
      free: {
        name: "Free",
        price: 0,
        notesLimit: 3,
        features: ["Up to 3 notes", "Basic note editing", "Search functionality", "Archive notes"],
      },
      pro: {
        name: "Pro",
        price: 9.99,
        notesLimit: -1, // Unlimited
        features: [
          "Unlimited notes",
          "Advanced note editing",
          "Search functionality",
          "Archive notes",
          "Priority support",
          "Export functionality",
        ],
      },
    }
  }

  /**
   * Check if tenant needs to upgrade based on usage
   */
  static async shouldSuggestUpgrade(tenantId) {
    try {
      const usage = await this.getUsageStats(tenantId)

      if (usage.plan === "pro") {
        return { suggest: false, reason: "Already on Pro plan" }
      }

      // Suggest upgrade if user has used 80% or more of their limit
      if (usage.usagePercentage >= 80) {
        return {
          suggest: true,
          reason: `You've used ${usage.usagePercentage}% of your Free plan limit`,
          usage,
        }
      }

      return { suggest: false, reason: "Usage is within comfortable limits" }
    } catch (error) {
      console.error("Error checking upgrade suggestion:", error)
      throw error
    }
  }
}

module.exports = SubscriptionService
