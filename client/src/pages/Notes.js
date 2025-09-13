"use client"

import { useState, useEffect } from "react"
import { useNotes } from "../contexts/NotesContext"
import NoteCard from "../components/NoteCard"
import NoteModal from "../components/NoteModal"
import { useAuth } from "../contexts/AuthContext"

const Notes = () => {
  const { user } = useAuth()
  const { notes, loading, subscription, createNote, updateNote, deleteNote, toggleArchive, fetchNotes, upgradeSubscription } = useNotes()

  const [showModal, setShowModal] = useState(false)
  const [editingNote, setEditingNote] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [showArchived, setShowArchived] = useState(false)

  // Fetch notes when filters change
  useEffect(() => {
    fetchNotes({
      search: searchTerm,
      archived: showArchived,
    })
  }, [searchTerm, showArchived])

  const handleCreateNote = () => {
    // Check if user can create more notes
    if (subscription?.plan === "free" && subscription?.remaining <= 0) {
      alert(
        `Free plan limit reached! You can create maximum ${subscription.limit} notes. Upgrade to Pro for unlimited notes.`,
      )
      return
    }

    setEditingNote(null)
    setShowModal(true)
  }

  const handleEditNote = (note) => {
    setEditingNote(note)
    setShowModal(true)
  }

  const handleSaveNote = async (noteData) => {
    let result

    if (editingNote) {
      result = await updateNote(editingNote._id, noteData)
    } else {
      result = await createNote(noteData)
    }

    if (result.success) {
      setShowModal(false)
      setEditingNote(null)
    } else {
      alert(result.message)
    }
  }

  const handleDeleteNote = async (id) => {
    if (window.confirm("Are you sure you want to delete this note?")) {
      const result = await deleteNote(id)
      if (!result.success) {
        alert(result.message)
      }
    }
  }

  const handleToggleArchive = async (id) => {
    const result = await toggleArchive(id)
    if (!result.success) {
      alert(result.message)
    }
  }

  const handleUpgrade = async () => {
    if (window.confirm("Are you sure you want to upgrade to Pro plan? This will give you unlimited notes.")) {
      const result = await upgradeSubscription()
      if (result.success) {
        alert("Successfully upgraded to Pro plan! You now have unlimited notes.")
      } else {
        alert(result.message)
      }
    }
  }

  const canCreateNote = !subscription || subscription.plan === "pro" || subscription.remaining > 0

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{showArchived ? "Archived Notes" : "My Notes"}</h1>
          <p className="text-gray-600">{showArchived ? "Browse your archived notes" : "Manage your notes"}</p>
        </div>

        <button
          onClick={handleCreateNote}
          disabled={!canCreateNote}
          className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          title={!canCreateNote ? "Free plan limit reached" : ""}
        >
          ➕ New Note
        </button>
      </div>

      {/* Subscription warning */}
      {subscription?.plan === "free" && subscription?.usagePercentage >= 80 && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-800 font-medium">
                You're using {subscription.activeNotes} of {subscription.limit} notes
              </p>
              <p className="text-yellow-700 text-sm">
                {subscription.remaining > 0
                  ? `${subscription.remaining} notes remaining on Free plan`
                  : "Free plan limit reached! Upgrade to Pro for unlimited notes."}
              </p>
            </div>
            {user?.role === "admin" && <button onClick={handleUpgrade} className="btn-primary text-sm">Upgrade to Pro</button>}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field"
          />
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setShowArchived(false)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              !showArchived ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Active
          </button>
          <button
            onClick={() => setShowArchived(true)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              showArchived ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Archived
          </button>
        </div>
      </div>

      {/* Notes Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : notes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {notes.map((note) => (
            <NoteCard
              key={note._id}
              note={note}
              onEdit={handleEditNote}
              onDelete={handleDeleteNote}
              onToggleArchive={handleToggleArchive}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <span className="text-6xl">📝</span>
          <h3 className="text-lg font-medium text-gray-900 mt-4">
            {showArchived ? "No archived notes" : "No notes yet"}
          </h3>
          <p className="text-gray-600 mt-2">
            {showArchived ? "Archive some notes to see them here" : "Create your first note to get started"}
          </p>
          {!showArchived && canCreateNote && (
            <button onClick={handleCreateNote} className="btn-primary mt-4">
              Create Note
            </button>
          )}
        </div>
      )}

      {/* Note Modal */}
      {showModal && (
        <NoteModal
          note={editingNote}
          onSave={handleSaveNote}
          onClose={() => {
            setShowModal(false)
            setEditingNote(null)
          }}
        />
      )}
    </div>
  )
}

export default Notes
