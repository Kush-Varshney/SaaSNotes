"use client"

import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { useNotes } from "../contexts/NotesContext"
import axios from "axios"

const Dashboard = () => {
  const { user } = useAuth()
  const { notes, subscription, upgradeSubscription } = useNotes()
  const [stats, setStats] = useState(null)
  const [upgrading, setUpgrading] = useState(false)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get("/notes/stats/summary")
        setStats(response.data.stats)
      } catch (error) {
        console.error("Error fetching stats:", error)
      }
    }

    fetchStats()
  }, [])

  const handleUpgrade = async () => {
    if (user?.role !== "admin") {
      alert("Only admins can upgrade subscriptions")
      return
    }

    setUpgrading(true)
    const result = await upgradeSubscription()

    if (result.success) {
      alert("Successfully upgraded to Pro plan!")
    } else {
      alert(result.message || "Failed to upgrade")
    }

    setUpgrading(false)
  }

  const recentNotes = notes.slice(0, 5)

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome back, {user?.email}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <span className="text-2xl">📝</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Notes</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.totalNotes || 0}</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <span className="text-2xl">📊</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Plan</p>
              <p className="text-2xl font-bold text-gray-900 capitalize">{subscription?.plan || "Free"}</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <span className="text-2xl">🗃️</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Archived</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.archivedNotes || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Subscription Status */}
      {subscription && subscription.plan === "free" && (
        <div className="card p-6 mb-8 border-l-4 border-yellow-400">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Free Plan</h3>
              <p className="text-gray-600">
                You're using {subscription.activeNotes} of {subscription.limit} notes
              </p>
              <div className="mt-2 w-64 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-yellow-400 h-2 rounded-full"
                  style={{ width: `${subscription.usagePercentage}%` }}
                ></div>
              </div>
            </div>
            {user?.role === "admin" && (
              <button onClick={handleUpgrade} disabled={upgrading} className="btn-primary disabled:opacity-50">
                {upgrading ? "Upgrading..." : "Upgrade to Pro"}
              </button>
            )}
          </div>
          {subscription.usagePercentage >= 80 && (
            <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
              <p className="text-sm text-yellow-800">
                You're running low on notes! Upgrade to Pro for unlimited notes.
              </p>
            </div>
          )}
        </div>
      )}

      {subscription && subscription.plan === "pro" && (
        <div className="card p-6 mb-8 border-l-4 border-green-400">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <span className="text-2xl">⭐</span>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Pro Plan</h3>
              <p className="text-gray-600">
                Unlimited notes • Upgraded on {new Date(subscription.upgradeDate).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Recent Notes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900">Recent Notes</h2>
            <Link to="/notes" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              View all
            </Link>
          </div>

          {recentNotes.length > 0 ? (
            <div className="space-y-3">
              {recentNotes.map((note) => (
                <div key={note._id} className="p-3 bg-gray-50 rounded-lg">
                  <h3 className="font-medium text-gray-900 truncate">{note.title}</h3>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">{note.content}</p>
                  <p className="text-xs text-gray-500 mt-2">{new Date(note.createdAt).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <span className="text-4xl">📝</span>
              <p className="text-gray-500 mt-2">No notes yet</p>
              <Link to="/notes" className="btn-primary mt-4 inline-block">
                Create your first note
              </Link>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="card p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Link
              to="/notes"
              className="flex items-center p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <span className="text-2xl mr-3">➕</span>
              <div>
                <p className="font-medium text-gray-900">Create New Note</p>
                <p className="text-sm text-gray-600">Start writing your ideas</p>
              </div>
            </Link>

            <Link
              to="/notes?archived=true"
              className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <span className="text-2xl mr-3">🗃️</span>
              <div>
                <p className="font-medium text-gray-900">View Archived</p>
                <p className="text-sm text-gray-600">Browse archived notes</p>
              </div>
            </Link>

            <Link
              to="/settings"
              className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <span className="text-2xl mr-3">⚙️</span>
              <div>
                <p className="font-medium text-gray-900">Settings</p>
                <p className="text-sm text-gray-600">Manage your account</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
