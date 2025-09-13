"use client"

import { createContext, useContext, useState, useEffect } from "react"
import axios from "axios"
import { useAuth } from "./AuthContext"

const NotesContext = createContext()

export const useNotes = () => {
  const context = useContext(NotesContext)
  if (!context) {
    throw new Error("useNotes must be used within a NotesProvider")
  }
  return context
}

export const NotesProvider = ({ children }) => {
  const { user } = useAuth()
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(false)
  const [subscription, setSubscription] = useState(null)
  const [pagination, setPagination] = useState({})

  // Fetch notes
  const fetchNotes = async (params = {}) => {
    setLoading(true)
    try {
      const response = await axios.get("/notes", { params })
      setNotes(response.data.notes)
      setPagination(response.data.pagination)
    } catch (error) {
      console.error("Error fetching notes:", error)
    } finally {
      setLoading(false)
    }
  }

  // Fetch subscription info
  const fetchSubscription = async () => {
    try {
      const response = await axios.get("/subscription/usage")
      setSubscription(response.data.usage)
    } catch (error) {
      console.error("Error fetching subscription:", error)
    }
  }

  // Create note
  const createNote = async (noteData) => {
    try {
      const response = await axios.post("/notes", noteData)
      await fetchNotes() // Refresh notes list
      await fetchSubscription() // Refresh subscription info
      return { success: true, note: response.data.note }
    } catch (error) {
      console.error("Error creating note:", error)
      return {
        success: false,
        message: error.response?.data?.message || "Failed to create note",
      }
    }
  }

  // Update note
  const updateNote = async (id, noteData) => {
    try {
      const response = await axios.put(`/notes/${id}`, noteData)
      await fetchNotes() // Refresh notes list
      return { success: true, note: response.data.note }
    } catch (error) {
      console.error("Error updating note:", error)
      return {
        success: false,
        message: error.response?.data?.message || "Failed to update note",
      }
    }
  }

  // Delete note
  const deleteNote = async (id) => {
    try {
      await axios.delete(`/notes/${id}`)
      await fetchNotes() // Refresh notes list
      await fetchSubscription() // Refresh subscription info
      return { success: true }
    } catch (error) {
      console.error("Error deleting note:", error)
      return {
        success: false,
        message: error.response?.data?.message || "Failed to delete note",
      }
    }
  }

  // Archive/unarchive note
  const toggleArchive = async (id) => {
    try {
      const response = await axios.post(`/notes/${id}/archive`)
      await fetchNotes() // Refresh notes list
      return { success: true, note: response.data.note }
    } catch (error) {
      console.error("Error toggling archive:", error)
      return {
        success: false,
        message: error.response?.data?.message || "Failed to archive note",
      }
    }
  }

  // Upgrade subscription
  const upgradeSubscription = async () => {
    try {
      await axios.post("/subscription/upgrade")
      await fetchSubscription() // Refresh subscription info
      return { success: true }
    } catch (error) {
      console.error("Error upgrading subscription:", error)
      return {
        success: false,
        message: error.response?.data?.message || "Failed to upgrade subscription",
      }
    }
  }

  // Load initial data when user is available
  useEffect(() => {
    if (user) {
      fetchNotes()
      fetchSubscription()
    }
  }, [user])

  const value = {
    notes,
    loading,
    subscription,
    pagination,
    fetchNotes,
    createNote,
    updateNote,
    deleteNote,
    toggleArchive,
    upgradeSubscription,
    refreshSubscription: fetchSubscription,
  }

  return <NotesContext.Provider value={value}>{children}</NotesContext.Provider>
}
