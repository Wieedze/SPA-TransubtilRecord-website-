import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { Users, CheckCircle, XCircle, Mail, Calendar, Music, ChevronDown, AlertTriangle, Search, Shield } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import type { Profile } from '../../lib/supabase'
import { artists } from '../../data/artists'
import { useAuth } from '../../contexts/AuthContext'

interface UserWithEmail extends Profile {
  email: string
}

export default function UserManagement() {
  const { isSuperAdmin } = useAuth()
  const [users, setUsers] = useState<UserWithEmail[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)
  const [showRoleDropdown, setShowRoleDropdown] = useState<string | null>(null)
  const [showArtistDropdown, setShowArtistDropdown] = useState<string | null>(null)
  const [dropdownPosition, setDropdownPosition] = useState<{ top: number; left: number }>({ top: 0, left: 0 })
  const [confirmAdminPromotion, setConfirmAdminPromotion] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchUsers()
  }, [])

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setShowRoleDropdown(null)
      setShowArtistDropdown(null)
    }
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)

      // Use RPC function to get profiles with emails (admin only)
      const { data, error } = await supabase.rpc('get_profiles_with_emails')

      if (error) {
        // Fallback to regular profiles query if RPC not available
        console.warn('RPC not available, falling back to profiles query:', error)
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: false })

        if (profilesError) throw profilesError

        const usersWithEmails = profiles.map((profile) => ({
          ...profile,
          email: 'N/A',
        }))
        setUsers(usersWithEmails)
        return
      }

      setUsers(data || [])
    } catch (error) {
      console.error('Error fetching users:', error)
      alert('Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  const toggleStudioAccess = async (userId: string, currentAccess: boolean) => {
    try {
      setUpdating(userId)

      const { error } = await supabase
        .from('profiles')
        .update({ has_studio_access: !currentAccess })
        .eq('id', userId)

      if (error) throw error

      setUsers(
        users.map((user) =>
          user.id === userId
            ? { ...user, has_studio_access: !currentAccess }
            : user
        )
      )
    } catch (error) {
      console.error('Error updating studio access:', error)
      alert('Failed to update studio access')
    } finally {
      setUpdating(null)
    }
  }

  const updateUserRole = async (userId: string, newRole: Profile['role']) => {
    // Si promotion en admin, demander confirmation
    if (newRole === 'admin' && !confirmAdminPromotion) {
      setConfirmAdminPromotion(userId)
      return
    }

    try {
      setUpdating(userId)
      setConfirmAdminPromotion(null)

      // Si on retire le rôle artist, on retire aussi le linked_artist_id
      const updateData: Partial<Profile> = { role: newRole }
      if (newRole !== 'artist') {
        updateData.linked_artist_id = null
      }

      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', userId)

      if (error) throw error

      setUsers(
        users.map((user) =>
          user.id === userId
            ? { ...user, role: newRole, linked_artist_id: newRole === 'artist' ? user.linked_artist_id : null }
            : user
        )
      )

      alert(`Role updated to ${newRole} successfully!`)
    } catch (error) {
      console.error('Error updating role:', error)
      alert('Failed to update role')
    } finally {
      setUpdating(null)
      setShowRoleDropdown(null)
    }
  }

  const linkArtist = async (userId: string, artistId: number | null) => {
    try {
      setUpdating(userId)

      const { error } = await supabase
        .from('profiles')
        .update({ linked_artist_id: artistId })
        .eq('id', userId)

      if (error) throw error

      setUsers(
        users.map((user) =>
          user.id === userId
            ? { ...user, linked_artist_id: artistId }
            : user
        )
      )

      const artistName = artistId ? artists.find(a => a.id === artistId)?.name : null
      alert(artistId ? `Linked to artist "${artistName}" successfully!` : 'Artist link removed!')
    } catch (error) {
      console.error('Error linking artist:', error)
      alert('Failed to link artist')
    } finally {
      setUpdating(null)
      setShowArtistDropdown(null)
    }
  }

  const getLinkedArtistName = (artistId: number | null) => {
    if (!artistId) return null
    return artists.find(a => a.id === artistId)?.name || 'Unknown Artist'
  }

  const getRoleBadge = (role: Profile['role']) => {
    const badges = {
      superadmin: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      admin: 'bg-red-500/20 text-red-400 border-red-500/30',
      artist: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      client: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      user: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    }
    return badges[role] || badges.user
  }

  const getRoleIcon = (role: Profile['role']) => {
    if (role === 'superadmin') return <Shield className="w-3 h-3" />
    if (role === 'artist') return <Music className="w-3 h-3" />
    return null
  }

  // Get available roles based on current user's role
  const getAvailableRoles = (targetUserRole: Profile['role']): Profile['role'][] => {
    // Superadmin can't be changed by anyone (including themselves via UI)
    if (targetUserRole === 'superadmin') return []

    // Only superadmin can assign admin role
    if (isSuperAdmin) {
      return ['user', 'client', 'artist', 'admin']
    }

    // Regular admin can't promote to admin or change other admins
    if (targetUserRole === 'admin') return []
    return ['user', 'client', 'artist']
  }

  // Filter users based on search query
  const filteredUsers = users.filter((user) => {
    const query = searchQuery.toLowerCase()
    return (
      user.full_name?.toLowerCase().includes(query) ||
      user.email?.toLowerCase().includes(query) ||
      user.role?.toLowerCase().includes(query) ||
      user.company?.toLowerCase().includes(query)
    )
  })

  return (
    <>
      <Helmet>
        <title>User Management — Admin — Transubtil Records</title>
      </Helmet>

      <section className="mx-auto max-w-7xl space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-3"
        >
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-white/60" />
              <h1 className="text-3xl md:text-4xl font-bold uppercase tracking-[0.25em]">
                User Management
              </h1>
            </div>
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/40 text-sm focus:outline-none focus:border-white/40 w-64"
              />
            </div>
          </div>
          <p className="text-white/60 uppercase tracking-[0.25em] text-[11px]">
            Manage roles, artist links, and studio access for users
          </p>
        </motion.div>

        {/* Admin Promotion Confirmation Modal */}
        {confirmAdminPromotion && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
            onClick={() => setConfirmAdminPromotion(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-brand-800 border border-red-500/30 rounded-2xl p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle className="w-8 h-8 text-red-400" />
                <h3 className="text-xl font-bold uppercase tracking-[0.25em] text-red-400">
                  Confirm Admin Promotion
                </h3>
              </div>
              <p className="text-white/70 mb-6">
                Are you sure you want to promote this user to Admin? They will have full access to all admin features including user management.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setConfirmAdminPromotion(null)}
                  className="flex-1 px-4 py-3 border border-white/20 rounded-lg text-white/80 hover:bg-white/5 uppercase tracking-[0.25em] text-[11px]"
                >
                  Cancel
                </button>
                <button
                  onClick={() => updateUserRole(confirmAdminPromotion, 'admin')}
                  className="flex-1 px-4 py-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 hover:bg-red-500/30 uppercase tracking-[0.25em] text-[11px]"
                >
                  Confirm Promotion
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Users Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="border border-white/10 rounded-2xl bg-brand-700/10 overflow-x-auto"
        >
          {loading ? (
            <div className="p-12 text-center">
              <p className="text-white/60 uppercase tracking-[0.25em] text-[11px]">
                Loading users...
              </p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-white/60 uppercase tracking-[0.25em] text-[11px]">
                {searchQuery ? 'No users match your search' : 'No users found'}
              </p>
            </div>
          ) : (
            <div className="overflow-visible">
              <table className="w-full min-w-[900px]">
                <thead className="bg-brand-700/20 border-b border-white/10">
                  <tr>
                    <th className="px-6 py-4 text-left uppercase tracking-[0.25em] text-[11px] font-medium text-white/80">
                      Name
                    </th>
                    <th className="px-6 py-4 text-left uppercase tracking-[0.25em] text-[11px] font-medium text-white/80">
                      Email
                    </th>
                    <th className="px-6 py-4 text-left uppercase tracking-[0.25em] text-[11px] font-medium text-white/80">
                      Role
                    </th>
                    <th className="px-6 py-4 text-left uppercase tracking-[0.25em] text-[11px] font-medium text-white/80">
                      Linked Artist
                    </th>
                    <th className="px-6 py-4 text-left uppercase tracking-[0.25em] text-[11px] font-medium text-white/80">
                      Studio Access
                    </th>
                    <th className="px-6 py-4 text-left uppercase tracking-[0.25em] text-[11px] font-medium text-white/80">
                      Joined
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {filteredUsers.map((user) => (
                    <tr
                      key={user.id}
                      className="hover:bg-white/5 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <p className="text-white font-medium">
                          {user.full_name || 'No name'}
                        </p>
                        {user.company && (
                          <p className="text-xs text-white/40 mt-1">
                            {user.company}
                          </p>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-white/40" />
                          <span className="text-sm text-white/60">
                            {user.email}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {getAvailableRoles(user.role).length > 0 ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              const rect = e.currentTarget.getBoundingClientRect()
                              setDropdownPosition({ top: rect.bottom + 8, left: rect.left })
                              setShowRoleDropdown(showRoleDropdown === user.id ? null : user.id)
                              setShowArtistDropdown(null)
                            }}
                            className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs uppercase tracking-wider font-medium border ${getRoleBadge(user.role)} hover:opacity-80 transition-opacity`}
                          >
                            {getRoleIcon(user.role)}
                            {user.role}
                            <ChevronDown className="w-3 h-3" />
                          </button>
                        ) : (
                          <span
                            className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs uppercase tracking-wider font-medium border ${getRoleBadge(user.role)}`}
                          >
                            {getRoleIcon(user.role)}
                            {user.role}
                          </span>
                        )}

                        {/* Role Dropdown - Portal */}
                        {showRoleDropdown === user.id && getAvailableRoles(user.role).length > 0 && createPortal(
                          <div
                            className="fixed bg-brand-900 border border-white/20 rounded-lg shadow-2xl z-[9999] min-w-[150px]"
                            style={{ top: dropdownPosition.top, left: dropdownPosition.left }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            {getAvailableRoles(user.role).map((role) => (
                              <button
                                key={role}
                                onClick={(e) => {
                                  e.stopPropagation()
                                  updateUserRole(user.id, role)
                                }}
                                disabled={updating === user.id}
                                className={`w-full px-4 py-2 text-left text-sm uppercase tracking-wider hover:bg-white/10 transition-colors first:rounded-t-lg last:rounded-b-lg ${
                                  user.role === role ? 'bg-white/5 text-white' : 'text-white/70'
                                }`}
                              >
                                {role}
                              </button>
                            ))}
                          </div>,
                          document.body
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {user.role === 'artist' ? (
                          <>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                const rect = e.currentTarget.getBoundingClientRect()
                                setDropdownPosition({ top: rect.bottom + 8, left: rect.left })
                                setShowArtistDropdown(showArtistDropdown === user.id ? null : user.id)
                                setShowRoleDropdown(null)
                              }}
                              className="inline-flex items-center gap-2 px-3 py-1 rounded-lg text-xs uppercase tracking-wider font-medium border border-purple-500/30 bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 transition-colors"
                            >
                              <Music className="w-3 h-3" />
                              {user.linked_artist_id
                                ? getLinkedArtistName(user.linked_artist_id)
                                : 'Select Artist'}
                              <ChevronDown className="w-3 h-3" />
                            </button>

                            {/* Artist Dropdown - Portal */}
                            {showArtistDropdown === user.id && createPortal(
                              <div
                                className="fixed bg-brand-900 border border-white/20 rounded-lg shadow-2xl z-[9999] min-w-[200px] max-h-[300px] overflow-y-auto"
                                style={{ top: dropdownPosition.top, left: dropdownPosition.left }}
                                onClick={(e) => e.stopPropagation()}
                              >
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    linkArtist(user.id, null)
                                  }}
                                  className="w-full px-4 py-2 text-left text-sm text-white/50 hover:bg-white/10 transition-colors border-b border-white/10"
                                >
                                  — No Artist —
                                </button>
                                {artists.map((artist) => (
                                  <button
                                    key={artist.id}
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      linkArtist(user.id, artist.id)
                                    }}
                                    disabled={updating === user.id}
                                    className={`w-full px-4 py-2 text-left text-sm hover:bg-white/10 transition-colors ${
                                      user.linked_artist_id === artist.id ? 'bg-purple-500/20 text-purple-400' : 'text-white/70'
                                    }`}
                                  >
                                    {artist.name}
                                    <span className="text-white/40 ml-2">({artist.country})</span>
                                  </button>
                                ))}
                              </div>,
                              document.body
                            )}
                          </>
                        ) : (
                          <span className="text-white/30 text-sm">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {/* Admins and superadmins always have studio access */}
                        {user.role === 'admin' || user.role === 'superadmin' ? (
                          <div className="flex items-center gap-2 text-green-400">
                            <CheckCircle className="w-5 h-5" />
                            <span className="text-sm uppercase tracking-wider">
                              Auto ({user.role === 'superadmin' ? 'Super Admin' : 'Admin'})
                            </span>
                          </div>
                        ) : (
                          <button
                            onClick={() => toggleStudioAccess(user.id, user.has_studio_access)}
                            disabled={updating === user.id}
                            className={`flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity disabled:opacity-50 ${
                              user.has_studio_access ? 'text-green-400' : 'text-white/40'
                            }`}
                          >
                            {user.has_studio_access ? (
                              <CheckCircle className="w-5 h-5" />
                            ) : (
                              <XCircle className="w-5 h-5" />
                            )}
                            <span className="text-sm uppercase tracking-wider">
                              {updating === user.id ? 'Updating...' : user.has_studio_access ? 'Enabled' : 'Disabled'}
                            </span>
                          </button>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-white/60">
                          <Calendar className="w-4 h-4" />
                          <span className="text-sm">
                            {new Date(user.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>

        {/* Info Boxes */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="border border-gray-500/30 rounded-2xl p-4 bg-gray-500/5"
          >
            <p className="text-sm text-white/70 leading-relaxed">
              <strong className="text-gray-400">User:</strong> Basic access.
              Can only submit demos to the label.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.45 }}
            className="border border-blue-500/30 rounded-2xl p-4 bg-blue-500/5"
          >
            <p className="text-sm text-white/70 leading-relaxed">
              <strong className="text-blue-400">Client:</strong> Has access to
              studio requests and demo submissions.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="border border-purple-500/30 rounded-2xl p-4 bg-purple-500/5"
          >
            <p className="text-sm text-white/70 leading-relaxed">
              <strong className="text-purple-400">Artist:</strong> Studio + demo access,
              plus linked artist profile and Instagram generator.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.55 }}
            className="border border-red-500/30 rounded-2xl p-4 bg-red-500/5"
          >
            <p className="text-sm text-white/70 leading-relaxed">
              <strong className="text-red-400">Admin:</strong> Full access to all
              features including user management.
            </p>
          </motion.div>

          {isSuperAdmin && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="border border-yellow-500/30 rounded-2xl p-4 bg-yellow-500/5 lg:col-span-4"
            >
              <p className="text-sm text-white/70 leading-relaxed">
                <strong className="text-yellow-400">Super Admin:</strong> Owner access.
                Can promote users to admin. Only you (maxime.moodz@gmail.com) have this role.
              </p>
            </motion.div>
          )}
        </div>
      </section>
    </>
  )
}
