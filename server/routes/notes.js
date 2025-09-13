const express = require("express")
const { body, validationResult, query } = require("express-validator")
const Note = require("../models/Note")
const { authenticate } = require("../middleware/auth")

const router = express.Router()

// @route   POST /api/notes
// @desc    Create a new note
// @access  Private
router.post(
  "/",
  [
    authenticate,
    body("title")
      .trim()
      .isLength({ min: 1, max: 200 })
      .withMessage("Title is required and must be less than 200 characters"),
    body("content")
      .trim()
      .isLength({ min: 1, max: 10000 })
      .withMessage("Content is required and must be less than 10,000 characters"),
    body("tags").optional().isArray().withMessage("Tags must be an array"),
    body("tags.*").optional().trim().isLength({ max: 50 }).withMessage("Each tag must be less than 50 characters"),
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

      // Check subscription limits for Free plan
      if (req.tenant.subscription.plan === "free") {
        const currentNotesCount = await Note.countDocuments({
          tenantId: req.tenantId,
          isArchived: false,
        })

        if (currentNotesCount >= req.tenant.subscription.notesLimit) {
          return res.status(403).json({
            message: `Free plan limit reached. You can create maximum ${req.tenant.subscription.notesLimit} notes. Upgrade to Pro for unlimited notes.`,
            currentCount: currentNotesCount,
            limit: req.tenant.subscription.notesLimit,
            plan: req.tenant.subscription.plan,
          })
        }
      }

      const { title, content, tags = [] } = req.body

      // Create new note
      const note = new Note({
        title,
        content,
        tags: tags.filter((tag) => tag.trim() !== ""), // Remove empty tags
        userId: req.user._id,
        tenantId: req.tenantId,
      })

      await note.save()

      // Populate user information for response
      await note.populate("userId", "email")

      res.status(201).json({
        message: "Note created successfully",
        note,
      })
    } catch (error) {
      console.error("Note creation error:", error)
      res.status(500).json({ message: "Server error creating note" })
    }
  },
)

// @route   GET /api/notes
// @desc    Get all notes for the tenant (with pagination and filtering)
// @access  Private
router.get(
  "/",
  [
    authenticate,
    query("page").optional().isInt({ min: 1 }).withMessage("Page must be a positive integer"),
    query("limit").optional().isInt({ min: 1, max: 100 }).withMessage("Limit must be between 1 and 100"),
    query("search")
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage("Search term must be less than 100 characters"),
    query("tags").optional().isString().withMessage("Tags must be a comma-separated string"),
    query("archived").optional().isBoolean().withMessage("Archived must be a boolean"),
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

      const page = Number.parseInt(req.query.page) || 1
      const limit = Number.parseInt(req.query.limit) || 10
      const skip = (page - 1) * limit
      const search = req.query.search || ""
      const tagsFilter = req.query.tags ? req.query.tags.split(",").map((tag) => tag.trim()) : []
      const archived = req.query.archived === "true"

      // Build query
      const query = {
        tenantId: req.tenantId,
        isArchived: archived,
      }

      // Add search functionality
      if (search) {
        query.$or = [{ title: { $regex: search, $options: "i" } }, { content: { $regex: search, $options: "i" } }]
      }

      // Add tags filter
      if (tagsFilter.length > 0) {
        query.tags = { $in: tagsFilter }
      }

      // Execute query with pagination
      const [notes, totalCount] = await Promise.all([
        Note.find(query).populate("userId", "email").sort({ createdAt: -1 }).skip(skip).limit(limit),
        Note.countDocuments(query),
      ])

      // Calculate pagination info
      const totalPages = Math.ceil(totalCount / limit)
      const hasNextPage = page < totalPages
      const hasPrevPage = page > 1

      res.json({
        notes,
        pagination: {
          currentPage: page,
          totalPages,
          totalCount,
          hasNextPage,
          hasPrevPage,
          limit,
        },
        filters: {
          search,
          tags: tagsFilter,
          archived,
        },
      })
    } catch (error) {
      console.error("Notes fetch error:", error)
      res.status(500).json({ message: "Server error fetching notes" })
    }
  },
)

// @route   GET /api/notes/:id
// @desc    Get a single note by ID
// @access  Private
router.get("/:id", authenticate, async (req, res) => {
  try {
    const note = await Note.findOne({
      _id: req.params.id,
      tenantId: req.tenantId, // Ensure tenant isolation
    }).populate("userId", "email")

    if (!note) {
      return res.status(404).json({ message: "Note not found" })
    }

    res.json({ note })
  } catch (error) {
    console.error("Note fetch error:", error)
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid note ID format" })
    }
    res.status(500).json({ message: "Server error fetching note" })
  }
})

// @route   PUT /api/notes/:id
// @desc    Update a note
// @access  Private
router.put(
  "/:id",
  [
    authenticate,
    body("title")
      .optional()
      .trim()
      .isLength({ min: 1, max: 200 })
      .withMessage("Title must be between 1 and 200 characters"),
    body("content")
      .optional()
      .trim()
      .isLength({ min: 1, max: 10000 })
      .withMessage("Content must be between 1 and 10,000 characters"),
    body("tags").optional().isArray().withMessage("Tags must be an array"),
    body("tags.*").optional().trim().isLength({ max: 50 }).withMessage("Each tag must be less than 50 characters"),
    body("isArchived").optional().isBoolean().withMessage("isArchived must be a boolean"),
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

      const note = await Note.findOne({
        _id: req.params.id,
        tenantId: req.tenantId, // Ensure tenant isolation
      })

      if (!note) {
        return res.status(404).json({ message: "Note not found" })
      }

      // Update fields if provided
      const { title, content, tags, isArchived } = req.body

      if (title !== undefined) note.title = title
      if (content !== undefined) note.content = content
      if (tags !== undefined) note.tags = tags.filter((tag) => tag.trim() !== "")
      if (isArchived !== undefined) note.isArchived = isArchived

      await note.save()

      // Populate user information for response
      await note.populate("userId", "email")

      res.json({
        message: "Note updated successfully",
        note,
      })
    } catch (error) {
      console.error("Note update error:", error)
      if (error.name === "CastError") {
        return res.status(400).json({ message: "Invalid note ID format" })
      }
      res.status(500).json({ message: "Server error updating note" })
    }
  },
)

// @route   DELETE /api/notes/:id
// @desc    Delete a note
// @access  Private
router.delete("/:id", authenticate, async (req, res) => {
  try {
    const note = await Note.findOne({
      _id: req.params.id,
      tenantId: req.tenantId, // Ensure tenant isolation
    })

    if (!note) {
      return res.status(404).json({ message: "Note not found" })
    }

    await Note.findByIdAndDelete(req.params.id)

    res.json({ message: "Note deleted successfully" })
  } catch (error) {
    console.error("Note deletion error:", error)
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid note ID format" })
    }
    res.status(500).json({ message: "Server error deleting note" })
  }
})

// @route   POST /api/notes/:id/archive
// @desc    Archive/Unarchive a note
// @access  Private
router.post("/:id/archive", authenticate, async (req, res) => {
  try {
    const note = await Note.findOne({
      _id: req.params.id,
      tenantId: req.tenantId, // Ensure tenant isolation
    })

    if (!note) {
      return res.status(404).json({ message: "Note not found" })
    }

    // Toggle archive status
    note.isArchived = !note.isArchived
    await note.save()

    await note.populate("userId", "email")

    res.json({
      message: `Note ${note.isArchived ? "archived" : "unarchived"} successfully`,
      note,
    })
  } catch (error) {
    console.error("Note archive error:", error)
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid note ID format" })
    }
    res.status(500).json({ message: "Server error archiving note" })
  }
})

// @route   GET /api/notes/stats/summary
// @desc    Get notes statistics for the tenant
// @access  Private
router.get("/stats/summary", authenticate, async (req, res) => {
  try {
    const [totalNotes, archivedNotes, recentNotes] = await Promise.all([
      Note.countDocuments({ tenantId: req.tenantId, isArchived: false }),
      Note.countDocuments({ tenantId: req.tenantId, isArchived: true }),
      Note.find({ tenantId: req.tenantId, isArchived: false })
        .sort({ createdAt: -1 })
        .limit(5)
        .select("title createdAt"),
    ])

    // Get unique tags
    const tagsPipeline = [
      { $match: { tenantId: req.tenantId, isArchived: false } },
      { $unwind: "$tags" },
      { $group: { _id: "$tags", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]

    const topTags = await Note.aggregate(tagsPipeline)

    res.json({
      stats: {
        totalNotes,
        archivedNotes,
        subscription: req.tenant.subscription,
        recentNotes,
        topTags: topTags.map((tag) => ({ name: tag._id, count: tag.count })),
      },
    })
  } catch (error) {
    console.error("Notes stats error:", error)
    res.status(500).json({ message: "Server error fetching notes statistics" })
  }
})

module.exports = router
