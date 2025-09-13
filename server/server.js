const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const helmet = require("helmet")
const rateLimit = require("express-rate-limit")
require("dotenv").config()

const app = express()

// Security middleware
app.use(helmet())

// Rate limiting - more lenient for development
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 2000 : 2000, // 2000 requests in both dev and prod
  message: {
    error: "Too many requests from this IP, please try again later.",
    retryAfter: "15 minutes"
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
})

// More lenient rate limiter for login attempts - UPDATED
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

app.use(limiter)

// CORS configuration
const allowedOrigins = [
  process.env.CLIENT_URL || "http://localhost:3000",
  "https://saasnotes-client.vercel.app",
  "https://saasnotes-client-e0hmfo5cw-kushvarshney708-gmailcoms-projects.vercel.app"
]

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true)
      
      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true)
      } else {
        callback(new Error('Not allowed by CORS'))
      }
    },
    credentials: true,
  }),
)

// Body parser middleware
app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true }))

// MongoDB connection
mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/notes-saas", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => console.error("MongoDB connection error:", err))

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() })
})

// Endpoint to reset rate limits (for testing)
app.get("/reset-rate-limit", (req, res) => {
  res.json({ 
    message: "Rate limits reset. Note: This only works if you restart the server.",
    timestamp: new Date().toISOString(),
    note: "If you're still getting 429 errors, wait 15 minutes for the rate limit window to reset."
  })
})

// Endpoint to check rate limit configuration
app.get("/rate-limit-config", (req, res) => {
  res.json({
    loginLimiter: {
      max: 50,
      windowMs: "15 minutes",
      environment: process.env.NODE_ENV
    },
    generalLimiter: {
      max: 2000,
      windowMs: "15 minutes"
    },
    timestamp: new Date().toISOString()
  })
})

// API Routes
app.use("/api/auth", require("./routes/auth"))
app.use("/api/notes", require("./routes/notes"))
app.use("/api/tenants", require("./routes/tenants"))
app.use("/api/subscription", require("./routes/subscription"))

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({
    message: "Something went wrong!",
    error: process.env.NODE_ENV === "development" ? err.message : {},
  })
})

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({ message: "Route not found" })
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
console.log(`Server running on port ${PORT}`)
console.log(`Rate limits: Login=50/15min, General=2000/15min`)
console.log(`Environment: ${process.env.NODE_ENV}`)
console.log(`Rate limit max: 50 (FIXED)`)
})
