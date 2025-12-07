import { useState, useEffect } from "react"
import { Helmet } from "react-helmet-async"
import { motion } from "framer-motion"
import { Link, useSearchParams } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { supabase } from "../lib/supabase"
import type { StudioProject } from "../types/studio"
import type { LabelSubmission } from "../lib/supabase"
import {
  Upload,
  Music,
  MessageSquare,
  CheckCircle,
  Clock,
  XCircle,
  Folder,
  Calendar,
  Plus,
} from "lucide-react"

type TabType = "studio" | "demo"

export default function Dashboard() {
  const { user, profile } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const [activeTab, setActiveTab] = useState<TabType>(
    (searchParams.get("tab") as TabType) || "studio"
  )

  // Studio Projects State
  const [studioProjects, setStudioProjects] = useState<StudioProject[]>([])
  const [loadingStudio, setLoadingStudio] = useState(true)

  // Label Submissions State
  const [submissions, setSubmissions] = useState<LabelSubmission[]>([])
  const [loadingSubmissions, setLoadingSubmissions] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  // Form state for new demo submission
  const [newDemo, setNewDemo] = useState({
    track_title: "",
    artist_name: "",
    genre: "",
    description: "",
    file: null as File | null,
  })

  useEffect(() => {
    if (user) {
      loadStudioProjects()
      loadSubmissions()
    }
  }, [user])

  useEffect(() => {
    // Update URL when tab changes
    setSearchParams({ tab: activeTab })
  }, [activeTab, setSearchParams])

  const loadStudioProjects = async () => {
    try {
      const { data, error } = await supabase
        .from("studio_requests")
        .select("*")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false })

      if (error) throw error
      setStudioProjects(data || [])
    } catch (error) {
      console.error("Error loading studio projects:", error)
    } finally {
      setLoadingStudio(false)
    }
  }

  const loadSubmissions = async () => {
    try {
      const { data, error} = await supabase
        .from("label_submissions")
        .select("*")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false })

      if (error) throw error
      setSubmissions(data || [])
    } catch (error) {
      console.error("Error loading submissions:", error)
    } finally {
      setLoadingSubmissions(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setNewDemo({ ...newDemo, file: e.target.files[0] })
    }
  }

  const handleSubmitDemo = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !newDemo.file) return

    setUploading(true)
    setUploadProgress(0)

    try {
      // Upload file to Supabase Storage
      const fileName = `${user.id}/${Date.now()}_${newDemo.file.name}`
      const { data: fileData, error: uploadError } = await supabase.storage
        .from("label_demos")
        .upload(fileName, newDemo.file, {
          onUploadProgress: (progress) => {
            const percent = (progress.loaded / progress.total) * 100
            setUploadProgress(Math.round(percent))
          },
        })

      if (uploadError) throw uploadError

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("label_demos")
        .getPublicUrl(fileName)

      // Insert submission record into database
      const { error: dbError } = await supabase.from("label_submissions").insert({
        user_id: user.id,
        track_title: newDemo.track_title,
        artist_name: newDemo.artist_name,
        genre: newDemo.genre || null,
        description: newDemo.description || null,
        file_url: urlData.publicUrl,
        status: "pending",
      })

      if (dbError) throw dbError

      // Reset form
      setNewDemo({
        track_title: "",
        artist_name: "",
        genre: "",
        description: "",
        file: null,
      })

      // Reset file input
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
      if (fileInput) fileInput.value = ""

      // Refresh submissions list
      await loadSubmissions()

      alert("Demo submitted successfully!")
    } catch (error) {
      console.error("Error uploading demo:", error)
      alert("Error uploading demo. Please try again.")
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }

  // Studio Projects helpers (from MyProjects.tsx)
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

  // Label Submission helpers
  const getSubmissionStatusIcon = (status: LabelSubmission["status"]) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case "rejected":
        return <XCircle className="w-5 h-5 text-red-500" />
      default:
        return <Clock className="w-5 h-5 text-yellow-500" />
    }
  }

  const getSubmissionStatusText = (status: LabelSubmission["status"]) => {
    switch (status) {
      case "approved":
        return "Approved"
      case "rejected":
        return "Rejected"
      default:
        return "Pending Review"
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-6xl text-center py-20">
        <h1 className="text-3xl font-bold mb-4">Please Log In</h1>
        <p className="text-white/60 mb-8">You need to be logged in to access the dashboard.</p>
        <Link
          to="/login"
          className="px-6 py-3 bg-brand-500 hover:bg-brand-600 text-white rounded-lg transition-colors"
        >
          Log In
        </Link>
      </div>
    )
  }

  return (
    <>
      <Helmet>
        <title>Dashboard — Transubtil Records</title>
      </Helmet>

      <div className="mx-auto max-w-6xl space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
          <p className="text-white/60">
            Welcome back, {profile?.full_name || user.email}
          </p>
        </motion.div>

        {/* Tabs */}
        <div className="border-b border-white/10">
          <div className="flex gap-6">
            <button
              onClick={() => setActiveTab("studio")}
              className={`pb-4 px-2 font-medium transition-colors relative ${
                activeTab === "studio"
                  ? "text-white"
                  : "text-white/50 hover:text-white/80"
              }`}
            >
              <div className="flex items-center gap-2">
                <Folder className="w-5 h-5" />
                Studio Projects
              </div>
              {activeTab === "studio" && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-500"
                />
              )}
            </button>
            <button
              onClick={() => setActiveTab("demo")}
              className={`pb-4 px-2 font-medium transition-colors relative ${
                activeTab === "demo"
                  ? "text-white"
                  : "text-white/50 hover:text-white/80"
              }`}
            >
              <div className="flex items-center gap-2">
                <Music className="w-5 h-5" />
                Send Demo
              </div>
              {activeTab === "demo" && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-500"
                />
              )}
            </button>
          </div>
        </div>

        {/* Studio Projects Tab */}
        {activeTab === "studio" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between">
              <p className="text-white/60">
                Track the status of your studio mastering and mixing requests
              </p>
              <Link
                to="/studio/request"
                className="px-6 py-3 border-2 border-white/80 hover:bg-white hover:text-black text-white font-medium rounded-lg transition-all flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                <span className="hidden sm:inline">New Request</span>
              </Link>
            </div>

            {loadingStudio ? (
              <div className="text-center py-12 text-white/40">Loading...</div>
            ) : studioProjects.length === 0 ? (
              <div className="text-center py-16 border border-white/10 rounded-2xl">
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
              </div>
            ) : (
              <div className="space-y-4">
                {studioProjects.map((project, index) => (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="border border-white/10 rounded-xl p-6 hover:border-white/20 transition-all"
                  >
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                      <div className="flex-1 space-y-3">
                        <div>
                          <h3 className="text-xl font-semibold">{project.project_name}</h3>
                          <p className="text-sm text-white/60 capitalize">
                            {project.service_type.replace("-", " + ")}
                          </p>
                        </div>
                        <p className="text-sm text-white/70 line-clamp-2">
                          {project.description}
                        </p>
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
                      <div
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${getStatusColor(
                          project.status
                        )}`}
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
          </motion.div>
        )}

        {/* Send Demo Tab */}
        {activeTab === "demo" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-6"
          >
            {/* Upload Form */}
            <div className="border border-white/10 rounded-xl p-6 bg-white/5">
              <div className="flex items-center gap-3 mb-6">
                <Upload className="w-6 h-6 text-brand-500" />
                <h2 className="text-2xl font-semibold">Submit Your Demo</h2>
              </div>

              <form onSubmit={handleSubmitDemo} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Track Title *</label>
                    <input
                      type="text"
                      value={newDemo.track_title}
                      onChange={(e) => setNewDemo({ ...newDemo, track_title: e.target.value })}
                      required
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:border-brand-500 focus:outline-none text-white"
                      placeholder="Enter track title"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Artist Name *</label>
                    <input
                      type="text"
                      value={newDemo.artist_name}
                      onChange={(e) => setNewDemo({ ...newDemo, artist_name: e.target.value })}
                      required
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:border-brand-500 focus:outline-none text-white"
                      placeholder="Enter artist name"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Genre</label>
                  <input
                    type="text"
                    value={newDemo.genre}
                    onChange={(e) => setNewDemo({ ...newDemo, genre: e.target.value })}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:border-brand-500 focus:outline-none text-white"
                    placeholder="e.g., Dark Psy, Forest, Twilight"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <textarea
                    value={newDemo.description}
                    onChange={(e) => setNewDemo({ ...newDemo, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:border-brand-500 focus:outline-none text-white resize-none"
                    placeholder="Tell us about your track..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Audio File *</label>
                  <input
                    type="file"
                    onChange={handleFileChange}
                    accept="audio/*"
                    required
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:border-brand-500 focus:outline-none text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-brand-500 file:text-white hover:file:bg-brand-600 file:cursor-pointer"
                  />
                  <p className="text-xs text-white/40 mt-2">
                    Accepted formats: MP3, WAV, FLAC. Max size: 100MB
                  </p>
                </div>

                {uploading && (
                  <div className="space-y-2">
                    <div className="w-full bg-white/10 rounded-full h-2">
                      <div
                        className="bg-brand-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                    <p className="text-sm text-white/60">Uploading... {uploadProgress}%</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={uploading}
                  className="w-full px-6 py-3 bg-brand-500 hover:bg-brand-600 disabled:bg-brand-700 text-white font-medium rounded-lg transition-colors disabled:cursor-not-allowed"
                >
                  {uploading ? "Uploading..." : "Submit Demo"}
                </button>
              </form>
            </div>

            {/* Submitted Demos */}
            <div>
              <h2 className="text-2xl font-semibold mb-4">Your Submissions</h2>
              {loadingSubmissions ? (
                <div className="text-center py-12 text-white/40">Loading...</div>
              ) : submissions.length === 0 ? (
                <div className="border border-white/10 rounded-xl p-12 text-center">
                  <Music className="w-12 h-12 mx-auto mb-4 text-white/20" />
                  <p className="text-white/40">No demos submitted yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {submissions.map((submission) => (
                    <div
                      key={submission.id}
                      className="border border-white/10 rounded-xl p-6 hover:border-white/20 transition-all"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold mb-1">{submission.track_title}</h3>
                          <p className="text-white/60 text-sm mb-1">by {submission.artist_name}</p>
                          {submission.genre && (
                            <p className="text-white/50 text-xs mb-3">{submission.genre}</p>
                          )}
                          <div className="flex items-center gap-2 mb-3">
                            {getSubmissionStatusIcon(submission.status)}
                            <span className="text-sm">{getSubmissionStatusText(submission.status)}</span>
                          </div>
                          {submission.feedback && (
                            <div className="mt-4 p-4 bg-white/5 rounded-lg border border-white/10">
                              <div className="flex items-start gap-2">
                                <MessageSquare className="w-4 h-4 mt-0.5 text-brand-500" />
                                <div>
                                  <p className="text-sm font-medium mb-1">Feedback from Label</p>
                                  <p className="text-sm text-white/70">{submission.feedback}</p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-white/40 mb-2">
                            {formatDate(submission.created_at)}
                          </p>
                          <a
                            href={submission.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-brand-300 hover:text-brand-200 underline"
                          >
                            Download
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </>
  )
}
