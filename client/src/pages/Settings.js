"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../contexts/AuthContext"
import { useNotes } from "../contexts/NotesContext"
import axios from "axios"

const Settings = () => {
  const { user } = useAuth()
  const { subscription, upgradeSubscription, refreshSubscription } = useNotes()
  const [activeTab, setActiveTab] = useState("account")
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [users, setUsers] = useState([])
  const [inviteData, setInviteData] = useState({
    email: "",
    password: "",
    role: "member",
  })
  const [showInviteForm, setShowInviteForm] = useState(false)

  const handlePasswordChange = async (e) => {
    e.preventDefault()

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage("New passwords do not match")
      return
    }

    setLoading(true)
    setMessage("")

    try {
      await axios.put("/auth/change-password", {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      })

      setMessage("Password changed successfully")
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to change password")
    } finally {
      setLoading(false)
    }
  }

  const handleUpgrade = async () => {
    if (user?.role !== "admin") {
      setMessage("Only admins can upgrade subscriptions")
      return
    }

    setLoading(true)
    const result = await upgradeSubscription()

    if (result.success) {
      setMessage("Successfully upgraded to Pro plan!")
      await refreshSubscription()
    } else {
      setMessage(result.message || "Failed to upgrade")
    }

    setLoading(false)
  }

  // Fetch users for admin
  const fetchUsers = async () => {
    if (user?.role !== "admin") return
    
    try {
      const response = await axios.get("/auth/users")
      setUsers(response.data.users)
    } catch (error) {
      console.error("Error fetching users:", error)
    }
  }

  // Invite new user
  const handleInviteUser = async (e) => {
    e.preventDefault()
    
    if (user?.role !== "admin") {
      setMessage("Only admins can invite users")
      return
    }

    setLoading(true)
    setMessage("")

    try {
      await axios.post("/auth/register", inviteData)
      setMessage("User invited successfully!")
      setInviteData({ email: "", password: "", role: "member" })
      setShowInviteForm(false)
      await fetchUsers() // Refresh users list
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to invite user")
    } finally {
      setLoading(false)
    }
  }

  // Load users when component mounts and user is admin
  useEffect(() => {
    if (user?.role === "admin") {
      fetchUsers()
    }
  }, [user])

  const tabs = [
    { id: "account", name: "Account", icon: "👤" },
    { id: "subscription", name: "Subscription", icon: "💳" },
    { id: "users", name: "Users", icon: "👥" },
    { id: "security", name: "Security", icon: "🔒" },
  ]

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">Manage your account and preferences</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <div className="lg:w-64">
          <nav className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                <span className="mr-3">{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1">
          {message && (
            <div
              className={`mb-6 p-4 rounded-lg ${
                message.includes("success") || message.includes("Successfully")
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : "bg-red-50 text-red-700 border border-red-200"
              }`}
            >
              {message}
            </div>
          )}

          {/* Account Tab */}
          {activeTab === "account" && (
            <div className="card p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-6">Account Information</h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                  <input
                    type="email"
                    value={user?.email || ""}
                    disabled
                    className="input-field bg-gray-50 cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                  <input
                    type="text"
                    value={user?.role || ""}
                    disabled
                    className="input-field bg-gray-50 cursor-not-allowed capitalize"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Organization</label>
                  <input
                    type="text"
                    value={user?.tenant?.name || ""}
                    disabled
                    className="input-field bg-gray-50 cursor-not-allowed"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Subscription Tab */}
          {activeTab === "subscription" && (
            <div className="space-y-6">
              <div className="card p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-6">Current Plan</h2>

                {subscription && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <h3 className="font-medium text-gray-900 capitalize">{subscription.plan} Plan</h3>
                        <p className="text-sm text-gray-600">
                          {subscription.plan === "free"
                            ? `${subscription.activeNotes}/${subscription.limit} notes used`
                            : "Unlimited notes"}
                        </p>
                      </div>
                      {subscription.plan === "free" && user?.role === "admin" && (
                        <button onClick={handleUpgrade} disabled={loading} className="btn-primary disabled:opacity-50">
                          {loading ? "Upgrading..." : "Upgrade to Pro"}
                        </button>
                      )}
                    </div>

                    {subscription.plan === "free" && (
                      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <h4 className="font-medium text-yellow-800 mb-2">Upgrade to Pro</h4>
                        <ul className="text-sm text-yellow-700 space-y-1">
                          <li>• Unlimited notes</li>
                          <li>• Priority support</li>
                          <li>• Advanced features</li>
                        </ul>
                        {user?.role !== "admin" && (
                          <p className="text-xs text-yellow-600 mt-2">Contact your admin to upgrade</p>
                        )}
                      </div>
                    )}

                    {subscription.plan === "pro" && subscription.upgradeDate && (
                      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                        <h4 className="font-medium text-green-800 mb-1">Pro Plan Active</h4>
                        <p className="text-sm text-green-700">
                          Upgraded on {new Date(subscription.upgradeDate).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === "users" && (
            <div className="space-y-6">
              <div className="card p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-medium text-gray-900">Team Members</h2>
                  {user?.role === "admin" && (
                    <button
                      onClick={() => setShowInviteForm(!showInviteForm)}
                      className="btn-primary"
                    >
                      {showInviteForm ? "Cancel" : "Invite User"}
                    </button>
                  )}
                </div>

                {/* Invite Form */}
                {showInviteForm && user?.role === "admin" && (
                  <form onSubmit={handleInviteUser} className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <h3 className="text-md font-medium text-gray-900 mb-4">Invite New User</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email Address
                        </label>
                        <input
                          type="email"
                          required
                          className="input-field"
                          value={inviteData.email}
                          onChange={(e) =>
                            setInviteData({ ...inviteData, email: e.target.value })
                          }
                          placeholder="user@example.com"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Password
                        </label>
                        <input
                          type="password"
                          required
                          minLength={6}
                          className="input-field"
                          value={inviteData.password}
                          onChange={(e) =>
                            setInviteData({ ...inviteData, password: e.target.value })
                          }
                          placeholder="Minimum 6 characters"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Role
                        </label>
                        <select
                          className="input-field"
                          value={inviteData.role}
                          onChange={(e) =>
                            setInviteData({ ...inviteData, role: e.target.value })
                          }
                        >
                          <option value="member">Member</option>
                          <option value="admin">Admin</option>
                        </select>
                      </div>
                    </div>
                    <div className="mt-4 flex gap-2">
                      <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary disabled:opacity-50"
                      >
                        {loading ? "Inviting..." : "Send Invitation"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowInviteForm(false)}
                        className="btn-secondary"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}

                {/* Users List */}
                <div className="space-y-3">
                  {users.length > 0 ? (
                    users.map((userItem) => (
                      <div
                        key={userItem._id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 font-medium text-sm">
                              {userItem.email.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{userItem.email}</p>
                            <p className="text-sm text-gray-500 capitalize">
                              {userItem.role} • Joined {new Date(userItem.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${
                              userItem.role === "admin"
                                ? "bg-purple-100 text-purple-800"
                                : "bg-green-100 text-green-800"
                            }`}
                          >
                            {userItem.role}
                          </span>
                          {userItem._id === user?._id && (
                            <span className="text-xs text-gray-500">(You)</span>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <span className="text-4xl">👥</span>
                      <h3 className="text-lg font-medium text-gray-900 mt-2">No team members</h3>
                      <p className="text-gray-600 mt-1">
                        {user?.role === "admin"
                          ? "Invite users to get started"
                          : "Only admins can view team members"}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === "security" && (
            <div className="card p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-6">Change Password</h2>

              <form onSubmit={handlePasswordChange} className="space-y-6">
                <div>
                  <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-2">
                    Current Password
                  </label>
                  <input
                    type="password"
                    id="currentPassword"
                    required
                    className="input-field"
                    value={passwordData.currentPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        currentPassword: e.target.value,
                      })
                    }
                  />
                </div>

                <div>
                  <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                    New Password
                  </label>
                  <input
                    type="password"
                    id="newPassword"
                    required
                    minLength={6}
                    className="input-field"
                    value={passwordData.newPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        newPassword: e.target.value,
                      })
                    }
                  />
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    required
                    minLength={6}
                    className="input-field"
                    value={passwordData.confirmPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        confirmPassword: e.target.value,
                      })
                    }
                  />
                </div>

                <button type="submit" disabled={loading} className="btn-primary disabled:opacity-50">
                  {loading ? "Changing Password..." : "Change Password"}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Settings
