const mongoose = require("mongoose")

const tenantSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    subscription: {
      plan: {
        type: String,
        enum: ["free", "pro"],
        default: "free",
      },
      notesLimit: {
        type: Number,
        default: 3, // Free plan limit
      },
      upgradeDate: {
        type: Date,
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
)

// Update notes limit based on plan
tenantSchema.pre("save", function (next) {
  if (this.subscription.plan === "pro") {
    this.subscription.notesLimit = -1 // Unlimited
  } else {
    this.subscription.notesLimit = 3 // Free plan limit
  }
  next()
})

module.exports = mongoose.model("Tenant", tenantSchema)
