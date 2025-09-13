const mongoose = require("mongoose")
const User = require("../models/User")
const Tenant = require("../models/Tenant")
require("dotenv").config()

const seedData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/saasnotes")
    console.log("Connected to MongoDB for seeding...")

    // Clear existing data
    await User.deleteMany({})
    await Tenant.deleteMany({})
    console.log("Cleared existing data...")

    // Create tenants
    const acmeTenant = await Tenant.create({
      name: "Acme",
      slug: "acme",
      subscription: { plan: "free" },
    })

    const globexTenant = await Tenant.create({
      name: "Globex",
      slug: "globex",
      subscription: { plan: "free" },
    })

    console.log("Created tenants...")

    // Create test users
    const testUsers = [
      {
        email: "admin@acme.test",
        password: "password",
        role: "admin",
        tenantId: acmeTenant._id,
      },
      {
        email: "user@acme.test",
        password: "password",
        role: "member",
        tenantId: acmeTenant._id,
      },
      {
        email: "admin@globex.test",
        password: "password",
        role: "admin",
        tenantId: globexTenant._id,
      },
      {
        email: "user@globex.test",
        password: "password",
        role: "member",
        tenantId: globexTenant._id,
      },
    ]

    await User.create(testUsers)
    console.log("Created test users...")

    console.log("Seed data created successfully!")
    console.log("\nTest Accounts:")
    console.log("admin@acme.test / password (Admin, Acme)")
    console.log("user@acme.test / password (Member, Acme)")
    console.log("admin@globex.test / password (Admin, Globex)")
    console.log("user@globex.test / password (Member, Globex)")

    process.exit(0)
  } catch (error) {
    console.error("Seeding error:", error)
    process.exit(1)
  }
}

// Run seeding if called directly
if (require.main === module) {
  seedData()
}

module.exports = seedData
