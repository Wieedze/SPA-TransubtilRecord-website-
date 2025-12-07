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
  LogOut,
  UserCircle,
  Mail,
  Save,
} from "lucide-react"

type TabType = "studio" | "demo" | "account"

export default function Dashboard() {
  const { user, profile, signOut } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const [activeTab, setActiveTab] = useState<TabType>(
    (searchParams.get("tab") as TabType) || "account"
  )

  console.log("🎯 Dashboard loaded - Active tab:", activeTab)
  console.log("🎯 User:", user ? "Connected" : "Not connected")

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

  // Profile editing state
  const [editingProfile, setEditingProfile] = useState(false)
  const [profileData, setProfileData] = useState({
    full_name: profile?.full_name || "",
    email: user?.email || "",
  })
  const [savingProfile, setSavingProfile] = useState(false)

  useEffect(() => {
    if (user) {
      loadStudioProjects()
      loadSubmissions()
    }
  }, [user])

  useEffect(() => {
    // Update profile data when profile changes
    if (profile) {
      setProfileData({
        full_name: profile.full_name || "",
        email: user?.email || "",
      })
    }
  }, [profile, user])

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
      const file = e.target.files[0]
      const maxSize = 50 * 1024 * 1024 // 50 MB in bytes

      if (file.size > maxSize) {
        alert(`File size too large! Maximum size is 50 MB.\nYour file is ${(file.size / 1024 / 1024).toFixed(2)} MB.\n\nPlease compress your file or use a smaller format (MP3 instead of WAV).`)
        e.target.value = "" // Reset input
        return
      }

      setNewDemo({ ...newDemo, file })
    }
  }

  const handleSubmitDemo = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log("📝 Submit clicked - User:", user ? "✅ Connected" : "❌ Not connected")
    console.log("📝 Submit clicked - File:", newDemo.file ? `✅ ${newDemo.file.name}` : "❌ No file selected")
    console.log("📝 Form data:", newDemo)

    if (!user) {
      alert("You must be logged in to submit a demo!")
      return
    }

    if (!newDemo.file) {
      alert("Please select an audio file!")
      return
    }

    setUploading(true)
    setUploadProgress(0)

    try {
      // Upload file to Supabase Storage
      const fileName = `demos/${user.id}/${Date.now()}_${newDemo.file.name}`
      const { data: fileData, error: uploadError } = await supabase.storage
        .from("studio-audio-files")
        .upload(fileName, newDemo.file, {
          onUploadProgress: (progress) => {
            const percent = (progress.loaded / progress.total) * 100
            setUploadProgress(Math.round(percent))
          },
        })

      if (uploadError) throw uploadError

      // Insert submission record into database with file path (not URL)
      // We'll generate signed URLs when needed since bucket is private
      const { error: dbError } = await supabase.from("label_submissions").insert({
        user_id: user.id,
        track_title: newDemo.track_title,
        artist_name: newDemo.artist_name,
        genre: newDemo.genre || null,
        description: newDemo.description || null,
        file_url: fileName, // Store path, not URL, for private bucket
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
    } catch (error: any) {
      console.error("Error uploading demo:", error)
      const errorMessage = error?.message || error?.error?.message || "Unknown error"
      alert(`Error uploading demo: ${errorMessage}\n\nPlease check the console for more details.`)
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }

  // Profile update function
  const handleSaveProfile = async () => {
    if (!user) return

    setSavingProfile(true)
    try {
      // Update profile (full_name)
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ full_name: profileData.full_name })
        .eq("id", user.id)

      if (profileError) throw profileError

      // Update email if changed
      if (profileData.email !== user.email) {
        const { error: emailError } = await supabase.auth.updateUser({
          email: profileData.email,
        })

        if (emailError) throw emailError
        alert("Profile updated! Please check your new email for a confirmation link.")
      } else {
        alert("Profile updated successfully!")
      }

      setEditingProfile(false)

      // Refresh the page to get updated profile
      window.location.reload()
    } catch (error: any) {
      console.error("Error updating profile:", error)
      alert(`Error updating profile: ${error.message}`)
    } finally {
      setSavingProfile(false)
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
          className="flex items-start justify-between"
        >
          <div>

          </div>
          <button
            onClick={() => signOut()}
            className="px-4 py-2 border border-white/20 hover:border-white/40 hover:bg-white/5 text-white font-sans text-sm rounded-lg transition-all flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </motion.div>

        {/* Tabs */}
        <div className="border-b border-white/10">
          <div className="flex gap-6">
            <button
              onClick={() => setActiveTab("account")}
              className={`pb-4 px-2 uppercase tracking-[0.25em] text-[11px] transition-colors relative ${
                activeTab === "account"
                  ? "text-white"
                  : "text-white/50 hover:text-white/80"
              }`}
            >
              <div className="flex items-center gap-2">
                <UserCircle className="w-5 h-5" />
                Account
              </div>
              {activeTab === "account" && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-500"
                />
              )}
            </button>
            <button
              onClick={() => setActiveTab("studio")}
              className={`pb-4 px-2 uppercase tracking-[0.25em] text-[11px] transition-colors relative ${
                activeTab === "studio"
                  ? "text-white"
                  : "text-white/50 hover:text-white/80"
              }`}
            >
              <div className="flex items-center gap-2">
                <Folder className="w-5 h-5" />
                Studio Mastering
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
              className={`pb-4 px-2 uppercase tracking-[0.25em] text-[11px] transition-colors relative ${
                activeTab === "demo"
                  ? "text-white"
                  : "text-white/50 hover:text-white/80"
              }`}
            >
              <div className="flex items-center gap-2">
                <Music className="w-5 h-5" />
                Label Demos
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
                Professional mastering and mixing services - Track your studio requests
              </p>
              <Link
                to="/studio/request"
                className="px-6 py-3 border-2 border-white/80 hover:bg-white hover:text-black text-white font-medium uppercase tracking-[0.25em] text-[11px] rounded-lg transition-all flex items-center gap-2"
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
                <h3 className="text-xl font-semibold mb-2 uppercase tracking-[0.25em]">No projects yet</h3>
                <p className="text-white/60 mb-6 uppercase tracking-[0.25em] text-[11px]">
                  Submit your first studio request to get started
                </p>
                <Link
                  to="/studio/request"
                  className="inline-flex items-center gap-2 px-6 py-3 border-2 border-white/80 hover:bg-white hover:text-black text-white font-medium uppercase tracking-[0.25em] text-[11px] rounded-lg transition-all"
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
                    onClick={() => window.location.href = `/studio/project/${project.id}`}
                    className="border border-white/10 rounded-xl p-6 hover:border-white/20 transition-all cursor-pointer"
                  >
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                      <div className="flex-1 space-y-3">
                        <div>
                          <h3 className="text-xl font-semibold uppercase tracking-[0.25em]">{project.project_name}</h3>
                          <p className="uppercase tracking-[0.25em] text-[11px] text-white/60">
                            {project.service_type.replace("-", " + ")}
                          </p>
                        </div>
                        <p className="uppercase tracking-[0.25em] text-[11px] text-white/70 line-clamp-2">
                          {project.description}
                        </p>
                        <div className="flex items-center gap-4 uppercase tracking-[0.25em] text-[11px] text-white/50">
                          <span>{project.audio_files.length} files</span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(project.created_at)}
                          </span>
                        </div>

                        {/* Feedback Display */}
                        {project.feedback && (
                          <div className="mt-3 p-3 bg-brand-500/10 border border-brand-500/20 rounded-lg">
                            <div className="flex items-start gap-2">
                              <MessageSquare className="w-4 h-4 mt-0.5 text-brand-500 flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="uppercase tracking-[0.25em] text-[11px] font-medium text-brand-300 mb-1">Studio Feedback</p>
                                <p className="uppercase tracking-[0.25em] text-[11px] text-white/80">{project.feedback}</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                      <div
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${getStatusColor(
                          project.status
                        )}`}
                      >
                        {getStatusIcon(project.status)}
                        <span className="uppercase tracking-[0.25em] text-[11px] font-medium whitespace-nowrap">
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

        {/* Label Demos Tab */}
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
                <h2 className="text-2xl font-semibold uppercase tracking-[0.25em]">Submit Your Demo</h2>
              </div>

              <form onSubmit={handleSubmitDemo} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block uppercase tracking-[0.25em] text-[11px] font-medium mb-2">Track Title *</label>
                    <input
                      type="text"
                      value={newDemo.track_title}
                      onChange={(e) => setNewDemo({ ...newDemo, track_title: e.target.value })}
                      required
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:border-brand-500 focus:outline-none text-white uppercase tracking-[0.25em] text-[11px]"
                      placeholder="ENTER TRACK TITLE"
                    />
                  </div>

                  <div>
                    <label className="block uppercase tracking-[0.25em] text-[11px] font-medium mb-2">Artist Name *</label>
                    <input
                      type="text"
                      value={newDemo.artist_name}
                      onChange={(e) => setNewDemo({ ...newDemo, artist_name: e.target.value })}
                      required
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:border-brand-500 focus:outline-none text-white uppercase tracking-[0.25em] text-[11px]"
                      placeholder="ENTER ARTIST NAME"
                    />
                  </div>
                </div>

                <div>
                  <label className="block uppercase tracking-[0.25em] text-[11px] font-medium mb-2">Genre</label>
                  <input
                    type="text"
                    value={newDemo.genre}
                    onChange={(e) => setNewDemo({ ...newDemo, genre: e.target.value })}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:border-brand-500 focus:outline-none text-white uppercase tracking-[0.25em] text-[11px]"
                    placeholder="E.G., DARK PSY, FOREST, TWILIGHT"
                  />
                </div>

                <div>
                  <label className="block uppercase tracking-[0.25em] text-[11px] font-medium mb-2">Description</label>
                  <textarea
                    value={newDemo.description}
                    onChange={(e) => setNewDemo({ ...newDemo, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:border-brand-500 focus:outline-none text-white resize-none uppercase tracking-[0.25em] text-[11px]"
                    placeholder="TELL US ABOUT YOUR TRACK..."
                  />
                </div>

                <div>
                  <label className="block uppercase tracking-[0.25em] text-[11px] font-medium mb-2">Audio File *</label>
                  <input
                    type="file"
                    onChange={handleFileChange}
                    accept="audio/*"
                    required
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:border-brand-500 focus:outline-none text-white uppercase tracking-[0.25em] text-[11px] file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-brand-500 file:text-white hover:file:bg-brand-600 file:cursor-pointer file:uppercase file:tracking-[0.25em] file:text-[11px]"
                  />
                  <p className="text-xs text-white/40 mt-2">
                    Accepted formats: MP3, WAV, FLAC. Max size: 50MB
                  </p>
                  <p className="text-xs text-yellow-500/60 mt-1">
                    💡 Tip: Use MP3 format to keep file size under 50MB
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
                  className="w-full px-6 py-3 bg-brand-500 hover:bg-brand-600 disabled:bg-brand-700 text-white font-medium uppercase tracking-[0.25em] text-[11px] rounded-lg transition-colors disabled:cursor-not-allowed"
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

        {/* Account Tab */}
        {activeTab === "account" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-6"
          >
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Studio Projects - Pending */}
              <div className="border border-white/10 rounded-xl p-4 bg-white/5">
                <div className="flex items-center gap-3 mb-2">
                  <Clock className="w-5 h-5 text-yellow-400" />
                  <h3 className="uppercase tracking-[0.25em] text-[11px] font-medium text-white/60">Pending Studio</h3>
                </div>
                <p className="text-3xl font-bold text-white">
                  {studioProjects.filter(p => p.status === "pending").length}
                </p>
              </div>

              {/* Studio Projects - In Progress */}
              <div className="border border-white/10 rounded-xl p-4 bg-white/5">
                <div className="flex items-center gap-3 mb-2">
                  <Folder className="w-5 h-5 text-blue-400" />
                  <h3 className="uppercase tracking-[0.25em] text-[11px] font-medium text-white/60">In Progress</h3>
                </div>
                <p className="text-3xl font-bold text-white">
                  {studioProjects.filter(p => p.status === "in_progress").length}
                </p>
              </div>

              {/* Studio Projects - Completed */}
              <div className="border border-white/10 rounded-xl p-4 bg-white/5">
                <div className="flex items-center gap-3 mb-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <h3 className="uppercase tracking-[0.25em] text-[11px] font-medium text-white/60">Completed</h3>
                </div>
                <p className="text-3xl font-bold text-white">
                  {studioProjects.filter(p => p.status === "completed").length}
                </p>
              </div>

              {/* Label Submissions - Total */}
              <div className="border border-white/10 rounded-xl p-4 bg-white/5">
                <div className="flex items-center gap-3 mb-2">
                  <Music className="w-5 h-5 text-brand-500" />
                  <h3 className="uppercase tracking-[0.25em] text-[11px] font-medium text-white/60">Demos Submitted</h3>
                </div>
                <p className="text-3xl font-bold text-white">
                  {submissions.length}
                </p>
              </div>
            </div>

            {/* Account Settings */}
            <div className="border border-white/10 rounded-xl p-6 bg-white/5">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <UserCircle className="w-6 h-6 text-brand-500" />
                </div>
                {!editingProfile && (
                  <div className="flex flex-col gap-2 items-end">
                    <button
                      onClick={() => setEditingProfile(true)}
                      className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white uppercase tracking-[0.25em] text-[11px] rounded-lg transition-colors"
                    >
                      Edit Profile
                    </button>
                    <button
                      onClick={signOut}
                      className="flex items-center gap-2 px-4 py-2 bg-transparent hover:bg-red-500/30 border border-white/20 text-white uppercase tracking-[0.25em] text-[11px] rounded-lg transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-6">
                {/* Full Name */}
                <div>
                  <label className="block uppercase tracking-[0.25em] text-[11px] font-medium mb-2 text-white/80">
                    Full Name
                  </label>
                  {editingProfile ? (
                    <input
                      type="text"
                      value={profileData.full_name}
                      onChange={(e) =>
                        setProfileData({ ...profileData, full_name: e.target.value })
                      }
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:border-brand-500 focus:outline-none text-white uppercase tracking-[0.25em] text-[11px]"
                      placeholder="ENTER YOUR FULL NAME"
                    />
                  ) : (
                    <p className="text-white text-lg">
                      {profile?.full_name || "Not set"}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block uppercase tracking-[0.25em] text-[11px] font-medium mb-2 text-white/80">
                    Email Address
                  </label>
                  {editingProfile ? (
                    <div className="space-y-2">
                      <input
                        type="email"
                        value={profileData.email}
                        onChange={(e) =>
                          setProfileData({ ...profileData, email: e.target.value })
                        }
                        className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:border-brand-500 focus:outline-none text-white uppercase tracking-[0.25em] text-[11px]"
                        placeholder="ENTER YOUR EMAIL"
                      />
                      {profileData.email !== user?.email && (
                        <p className="text-xs text-yellow-400">
                          ⚠️ Changing your email will require confirmation from your new email address
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-white/60" />
                      <p className="text-white text-lg">{user?.email}</p>
                    </div>
                  )}
                </div>

                {/* User ID (read-only) */}
                <div>
                  <label className="block uppercase tracking-[0.25em] text-[11px] font-medium mb-2 text-white/80">
                    User ID
                  </label>
                  <p className="text-white/60 text-sm font-mono">{user?.id}</p>
                </div>

                {/* Account Created */}
                <div>
                  <label className="block uppercase tracking-[0.25em] text-[11px] font-medium mb-2 text-white/80">
                    Account Created
                  </label>
                  <p className="text-white/60">
                    {user?.created_at
                      ? new Date(user.created_at).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })
                      : "Unknown"}
                  </p>
                </div>

                {/* Action Buttons */}
                {editingProfile && (
                  <div className="flex gap-3 pt-4 border-t border-white/10">
                    <button
                      onClick={handleSaveProfile}
                      disabled={savingProfile}
                      className="flex-1 px-6 py-3 bg-brand-500 hover:bg-brand-600 disabled:bg-brand-500/50 text-white font-medium uppercase tracking-[0.25em] text-[11px] rounded-lg transition-colors disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      {savingProfile ? "Saving..." : "Save Changes"}
                    </button>
                    <button
                      onClick={() => {
                        setEditingProfile(false)
                        setProfileData({
                          full_name: profile?.full_name || "",
                          email: user?.email || "",
                        })
                      }}
                      disabled={savingProfile}
                      className="px-6 py-3 bg-transparent hover:bg-red-500/30 border border-white/20 text-white uppercase tracking-[0.25em] text-[11px] rounded-lg transition-colors disabled:opacity-50"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </>
  )
}
