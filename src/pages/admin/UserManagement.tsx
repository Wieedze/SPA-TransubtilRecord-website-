import { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { Users, CheckCircle, XCircle, Mail, Calendar } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import type { Profile } from '../../lib/supabase'

interface UserWithEmail extends Profile {
  email: string
}

export default function UserManagement() {
  const [users, setUsers] = useState<UserWithEmail[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)

      // Récupérer tous les profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (profilesError) throw profilesError

      // Récupérer les emails depuis auth.users (nécessite service_role ou admin)
      // Pour l'instant on affiche juste les profiles
      // Tu devras peut-être créer une fonction Edge pour récupérer les emails
      const usersWithEmails = profiles.map((profile) => ({
        ...profile,
        email: 'N/A', // À remplacer par un appel API si besoin
      }))

      setUsers(usersWithEmails)
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

      // Mettre à jour l'état local
      setUsers(
        users.map((user) =>
          user.id === userId
            ? { ...user, has_studio_access: !currentAccess }
            : user
        )
      )

      alert(
        `Studio access ${!currentAccess ? 'granted' : 'revoked'} successfully!`
      )
    } catch (error) {
      console.error('Error updating studio access:', error)
      alert('Failed to update studio access')
    } finally {
      setUpdating(null)
    }
  }

  const getRoleBadge = (role: Profile['role']) => {
    const badges = {
      admin: 'bg-red-500/20 text-red-400 border-red-500/30',
      artist: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      client: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    }
    return badges[role] || badges.client
  }

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
          <div className="flex items-center gap-3">
            <Users className="w-8 h-8 text-white/60" />
            <h1 className="text-3xl md:text-4xl font-bold uppercase tracking-[0.25em]">
              User Management
            </h1>
          </div>
          <p className="text-white/60 uppercase tracking-[0.25em] text-[11px]">
            Manage studio access for users
          </p>
        </motion.div>

        {/* Users Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="border border-white/10 rounded-2xl overflow-hidden bg-brand-700/10"
        >
          {loading ? (
            <div className="p-12 text-center">
              <p className="text-white/60 uppercase tracking-[0.25em] text-[11px]">
                Loading users...
              </p>
            </div>
          ) : users.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-white/60 uppercase tracking-[0.25em] text-[11px]">
                No users found
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
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
                      Studio Access
                    </th>
                    <th className="px-6 py-4 text-left uppercase tracking-[0.25em] text-[11px] font-medium text-white/80">
                      Joined
                    </th>
                    <th className="px-6 py-4 text-center uppercase tracking-[0.25em] text-[11px] font-medium text-white/80">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {users.map((user) => (
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
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs uppercase tracking-wider font-medium border ${getRoleBadge(
                            user.role
                          )}`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {user.has_studio_access ? (
                          <div className="flex items-center gap-2 text-green-400">
                            <CheckCircle className="w-5 h-5" />
                            <span className="text-sm uppercase tracking-wider">
                              Enabled
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-white/40">
                            <XCircle className="w-5 h-5" />
                            <span className="text-sm uppercase tracking-wider">
                              Disabled
                            </span>
                          </div>
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
                      <td className="px-6 py-4">
                        <div className="flex justify-center">
                          <button
                            onClick={() =>
                              toggleStudioAccess(
                                user.id,
                                user.has_studio_access
                              )
                            }
                            disabled={updating === user.id}
                            className={`px-4 py-2 rounded-lg text-xs uppercase tracking-wider font-medium transition-colors ${
                              user.has_studio_access
                                ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30'
                                : 'bg-green-500/20 text-green-400 hover:bg-green-500/30 border border-green-500/30'
                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                          >
                            {updating === user.id
                              ? 'Updating...'
                              : user.has_studio_access
                              ? 'Revoke Access'
                              : 'Grant Access'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>

        {/* Info Box */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="border border-blue-500/30 rounded-2xl p-6 bg-blue-500/5"
        >
          <p className="text-sm text-white/70 leading-relaxed">
            <strong className="text-white">Studio Access:</strong> Users with
            studio access can submit studio requests and upload files to the
            studio. Only grant access to authorized clients with active
            agreements.
          </p>
        </motion.div>
      </section>
    </>
  )
}
