import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { Helmet } from "react-helmet-async"
import { motion } from "framer-motion"
import { Plus, Folder, Clock, CheckCircle, XCircle, Calendar } from "lucide-react"
import { useAuth } from "../contexts/AuthContext"
import { supabase } from "../lib/supabase"
import type { StudioProject } from "../types/studio"

export default function MyProjects() {
  const { user } = useAuth()
  const [projects, setProjects] = useState<StudioProject[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadProjects()
    }
  }, [user])

  const loadProjects = async () => {
    try {
      const { data, error } = await supabase
        .from("studio_requests")
        .select("*")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false })

      if (error) throw error
      setProjects(data || [])
    } catch (error) {
      console.error("Error loading projects:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: StudioProject["status"]) => {
    switch (status) {
      case "pending":
        return <Clock className="w-5 h-5 text-yellow-400" />
      case "in_progress":
        return <Folder className="w-5 h-5 text-blue-400" />
      case "completed":
        return <CheckCircle className="w-5 h-5 text-green-400" />
      case "cancelled":
        return <XCircle className="w-5 h-5 text-red-400" />
    }
  }

  const getStatusLabel = (status: StudioProject["status"]) => {
    return status.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())
  }

  const getStatusColor = (status: StudioProject["status"]) => {
    switch (status) {
      case "pending":
        return "text-yellow-400 bg-yellow-400/10 border-yellow-400/30"
      case "in_progress":
        return "text-blue-400 bg-blue-400/10 border-blue-400/30"
      case "completed":
        return "text-green-400 bg-green-400/10 border-green-400/30"
      case "cancelled":
        return "text-red-400 bg-red-400/10 border-red-400/30"
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="animate-pulse text-white/60">Loading projects...</div>
      </div>
    )
  }

  return (
    <>
      <Helmet>
        <title>My Projects — Transubtil Records</title>
      </Helmet>

      <section className="mx-auto max-w-6xl space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-3xl font-bold mb-2">My Projects</h1>
            <p className="text-white/60">
              Track the status of your studio requests
            </p>
          </div>
          <Link
            to="/studio/request"
            className="px-6 py-3 border-2 border-white/80 hover:bg-white hover:text-black text-white font-medium rounded-lg transition-all flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline">New Request</span>
          </Link>
        </motion.div>

        {/* Projects List */}
        {projects.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-center py-16 border border-white/10 rounded-2xl"
          >
            <Folder className="w-16 h-16 mx-auto mb-4 text-white/40" />
            <h3 className="text-xl font-semibold mb-2">No projects yet</h3>
            <p className="text-white/60 mb-6">
              Submit your first studio request to get started
            </p>
            <Link
              to="/studio/request"
              className="inline-flex items-center gap-2 px-6 py-3 border-2 border-white/80 hover:bg-white hover:text-black text-white font-medium rounded-lg transition-all"
            >
              <Plus className="w-5 h-5" />
              Create First Request
            </Link>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {projects.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="border border-white/10 rounded-xl p-6 hover:border-white/20 transition-all"
              >
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    {/* Project Name & Service */}
                    <div>
                      <h3 className="text-xl font-semibold">{project.project_name}</h3>
                      <p className="text-sm text-white/60 capitalize">
                        {project.service_type.replace("-", " + ")}
                      </p>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-white/70 line-clamp-2">
                      {project.description}
                    </p>

                    {/* Files Count */}
                    <div className="flex items-center gap-4 text-xs text-white/50">
                      <span>{project.audio_files.length} files</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(project.created_at)}
                      </span>
                      {project.deadline && (
                        <>
                          <span>•</span>
                          <span>Deadline: {formatDate(project.deadline)}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div
                    className={`
                      flex items-center gap-2 px-4 py-2 rounded-lg border
                      ${getStatusColor(project.status)}
                    `}
                  >
                    {getStatusIcon(project.status)}
                    <span className="text-sm font-medium whitespace-nowrap">
                      {getStatusLabel(project.status)}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>
    </>
  )
}
