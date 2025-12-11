import { useState, useEffect } from "react"
import { Helmet } from "react-helmet-async"
import { motion } from "framer-motion"
import { Link, useSearchParams } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { supabase } from "../lib/supabase"
import { uploadFile } from "../lib/upload-service"
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
  Trash2,
  Download,
  ExternalLink,
  Globe,
} from "lucide-react"
import { getArtistById } from "../data/artists"
import type { Artist } from "../types/artist"

type TabType = "studio" | "demo" | "account" | "artist"

export default function Dashboard() {
  const { user, profile, signOut, isArtist, linkedArtistId } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const [activeTab, setActiveTab] = useState<TabType>(
    (searchParams.get("tab") as TabType) || "account"
  )

  // Get linked artist data if user is an artist
  const linkedArtist: Artist | undefined = linkedArtistId ? getArtistById(linkedArtistId) : undefined

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

  const handleDeleteStudioProject = async (id: string) => {
    if (!confirm("Are you sure you want to delete this studio project?")) {
      return
    }

    try {
      const { error } = await supabase
        .from("studio_requests")
        .delete()
        .eq("id", id)

      if (error) throw error
      await loadStudioProjects()
      alert("Studio project deleted successfully!")
    } catch (error) {
      console.error("Error deleting studio project:", error)
      alert("Error deleting studio project")
    }
  }

  const handleDeleteSubmission = async (id: string) => {
    if (!confirm("Are you sure you want to delete this demo submission?")) {
      return
    }

    try {
      const { error } = await supabase
        .from("label_submissions")
        .delete()
        .eq("id", id)

      if (error) throw error
      await loadSubmissions()
      alert("Demo submission deleted successfully!")
    } catch (error) {
      console.error("Error deleting demo submission:", error)
      alert("Error deleting demo submission")
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      const maxSize = 250 * 1024 * 1024 // 250 MB max for demos (WAV/AIFF)

      // Vérifier le type de fichier (WAV ou AIFF uniquement)
      const allowedTypes = ['audio/wav', 'audio/x-wav', 'audio/aiff', 'audio/x-aiff']
      const fileExtension = file.name.toLowerCase().split('.').pop()
      const isAllowedType = allowedTypes.includes(file.type) || ['wav', 'aiff'].includes(fileExtension || '')

      if (!isAllowedType) {
        alert('Invalid file format! Only WAV and AIFF files are allowed for demo submissions.')
        e.target.value = "" // Reset input
        return
      }

      if (file.size > maxSize) {
        alert(`File size too large! Maximum size is 250 MB.\nYour file is ${(file.size / 1024 / 1024).toFixed(2)} MB.`)
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
      // Upload file to o2switch via notre API
      const fileUrl = await uploadFile(
        newDemo.file,
        'label-submissions',
        (progress) => setUploadProgress(progress.percentage)
      )

      console.log("✅ File uploaded successfully:", fileUrl)

      // Insert submission record into database with the o2switch URL
      const { error: dbError } = await supabase.from("label_submissions").insert({
        user_id: user.id,
        track_title: newDemo.track_title,
        artist_name: newDemo.artist_name,
        genre: newDemo.genre || null,
        description: newDemo.description || null,
        file_url: fileUrl, // URL vers o2switch
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
      const errorMessage = error?.message || "Upload failed"

      // Gérer les erreurs spécifiques
      if (errorMessage.includes('quota exceeded')) {
        alert('You have reached the maximum of 3 active demo submissions.\n\nPlease wait for your pending demos to be reviewed before submitting more.')
      } else if (errorMessage.includes('Invalid file format')) {
        alert('Invalid file format! Only WAV and AIFF files are allowed for demo submissions.')
      } else {
        alert(`Error uploading demo: ${errorMessage}`)
      }
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

        {/* Tabs */}
        <div className="border-b border-white/10 overflow-x-auto">
          <div className="flex gap-3 md:gap-6 min-w-max">
            <button
              onClick={() => setActiveTab("account")}
              className={`pb-4 px-2 uppercase tracking-[0.25em] text-[11px] transition-colors relative whitespace-nowrap ${
                activeTab === "account"
                  ? "text-white"
                  : "text-white/50 hover:text-white/80"
              }`}
            >
              <div className="flex items-center gap-2">
                <UserCircle className="w-4 h-4 md:w-5 md:h-5" />
                <span className="hidden sm:inline">Account</span>
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
              className={`pb-4 px-2 uppercase tracking-[0.25em] text-[11px] transition-colors relative whitespace-nowrap ${
                activeTab === "studio"
                  ? "text-white"
                  : "text-white/50 hover:text-white/80"
              }`}
            >
              <div className="flex items-center gap-2">
                <Folder className="w-4 h-4 md:w-5 md:h-5" />
                <span className="hidden sm:inline">Studio</span>
                <span className="sm:hidden">Studio</span>
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
              className={`pb-4 px-2 uppercase tracking-[0.25em] text-[11px] transition-colors relative whitespace-nowrap ${
                activeTab === "demo"
                  ? "text-white"
                  : "text-white/50 hover:text-white/80"
              }`}
            >
              <div className="flex items-center gap-2">
                <Music className="w-4 h-4 md:w-5 md:h-5" />
                <span className="hidden sm:inline">Demos</span>
                <span className="sm:hidden">Demos</span>
              </div>
              {activeTab === "demo" && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-500"
                />
              )}
            </button>
            {/* Artist Tab - Only visible for users with artist role */}
            {isArtist && (
              <button
                onClick={() => setActiveTab("artist")}
                className={`pb-4 px-2 uppercase tracking-[0.25em] text-[11px] transition-colors relative whitespace-nowrap ${
                  activeTab === "artist"
                    ? "text-white"
                    : "text-white/50 hover:text-white/80"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 md:w-5 md:h-5" />
                  <span className="hidden sm:inline">Artist</span>
                  <span className="sm:hidden">Artist</span>
                </div>
                {activeTab === "artist" && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-500"
                  />
                )}
              </button>
            )}
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
            <div className="flex items-center justify-end">
              <Link
                to="/studio/request"
                className="w-full sm:w-auto px-6 py-3 border-2 border-white/80 hover:bg-white hover:text-black text-white font-medium uppercase tracking-[0.25em] text-[11px] rounded-lg transition-all flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" />
                <span>New Request</span>
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
                      <div className="flex flex-col gap-2">
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
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteStudioProject(project.id)
                          }}
                          className="px-3 py-1.5 bg-transparent hover:bg-red-600/40 border border-red-500/30 text-red-400 hover:text-red-300 rounded-lg transition-colors flex items-center justify-center gap-2 uppercase tracking-[0.25em] text-[10px]"
                        >
                          <Trash2 className="w-3 h-3" />
                          Delete
                        </button>
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
                  <p className="text-xs text-yellow-500/60 mt-1">
                    💡 Accepted formats: WAV, AIFF only. Max size: 250MB
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
              <h2 className="text-2xl font-semibold mb-4 uppercase tracking-[0.25em]">Your Submissions</h2>
              {loadingSubmissions ? (
                <div className="text-center py-12 text-white/40 uppercase tracking-[0.25em] text-[11px]">Loading...</div>
              ) : submissions.length === 0 ? (
                <div className="border border-white/10 rounded-xl p-12 text-center">
                  <Music className="w-12 h-12 mx-auto mb-4 text-white/20" />
                  <p className="text-white/40 uppercase tracking-[0.25em] text-[11px]">No demos submitted yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {submissions.map((submission) => (
                    <div
                      key={submission.id}
                      className="border border-white/10 rounded-xl p-4 sm:p-6 hover:border-white/20 transition-all"
                    >
                      <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                        <div className="flex-1 w-full">
                          <h3 className="text-base sm:text-lg font-semibold mb-1 uppercase tracking-[0.25em] break-words">{submission.track_title}</h3>
                          <p className="text-white/60 mb-1 uppercase tracking-[0.25em] text-[11px]">by {submission.artist_name}</p>
                          {submission.genre && (
                            <p className="text-white/50 mb-3 uppercase tracking-[0.25em] text-[11px]">{submission.genre}</p>
                          )}
                          <div className="flex items-center gap-2 mb-3">
                            {getSubmissionStatusIcon(submission.status)}
                            <span className="uppercase tracking-[0.25em] text-[11px]">{getSubmissionStatusText(submission.status)}</span>
                          </div>
                          {submission.feedback && (
                            <div className="mt-4 p-3 sm:p-4 bg-white/5 rounded-lg border border-white/10">
                              <div className="flex items-start gap-2">
                                <MessageSquare className="w-4 h-4 mt-0.5 text-brand-500 flex-shrink-0" />
                                <div className="min-w-0 flex-1">
                                  <p className="font-medium mb-1 uppercase tracking-[0.25em] text-[11px]">Feedback from Label</p>
                                  <p className="text-white/70 uppercase tracking-[0.25em] text-[11px] break-words">{submission.feedback}</p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="flex sm:flex-col items-center sm:items-end gap-2 w-full sm:w-auto justify-between sm:justify-start">
                          <p className="text-white/40 sm:mb-2 uppercase tracking-[0.25em] text-[11px] whitespace-nowrap">
                            {formatDate(submission.created_at)}
                          </p>
                          <div className="flex gap-2">
                            <a
                              href={submission.file_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-brand-300 hover:text-brand-200 underline uppercase tracking-[0.25em] text-[11px] whitespace-nowrap"
                            >
                              Download
                            </a>
                            <button
                              onClick={() => handleDeleteSubmission(submission.id)}
                              className="px-2 py-1 bg-transparent hover:bg-red-600/40 border border-red-500/30 text-red-400 hover:text-red-300 rounded transition-colors flex items-center gap-1 uppercase tracking-[0.25em] text-[10px]"
                            >
                              <Trash2 className="w-3 h-3" />
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Artist Tab - Only for users with artist role */}
        {activeTab === "artist" && isArtist && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-6"
          >
            {linkedArtist ? (
              <>
                {/* Artist Profile Card */}
                <div className="border border-purple-500/30 rounded-2xl overflow-hidden bg-purple-500/5">
                  <div className="flex flex-col md:flex-row">
                    {/* Artist Image */}
                    <div className="md:w-1/3 relative">
                      <img
                        src={linkedArtist.image_url}
                        alt={linkedArtist.name}
                        className="w-full h-64 md:h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-brand-900/80 to-transparent" />
                    </div>

                    {/* Artist Info */}
                    <div className="md:w-2/3 p-6 space-y-4">
                      <div>
                        <p className="uppercase tracking-[0.25em] text-[11px] text-purple-400 mb-1">
                          {linkedArtist.act}
                        </p>
                        <h2 className="text-3xl font-bold uppercase tracking-[0.15em] text-white">
                          {linkedArtist.name}
                        </h2>
                        <p className="text-white/60 mt-1">{linkedArtist.country}</p>
                      </div>

                      {/* Styles */}
                      <div className="flex flex-wrap gap-2">
                        {linkedArtist.style.map((style) => (
                          <span
                            key={style}
                            className="px-3 py-1 text-xs uppercase tracking-wider bg-white/10 border border-white/20 rounded-full text-white/80"
                          >
                            {style}
                          </span>
                        ))}
                      </div>

                      {/* Description */}
                      {linkedArtist.description && (
                        <p className="text-white/70 text-sm leading-relaxed line-clamp-4">
                          {linkedArtist.description}
                        </p>
                      )}

                      {/* Social Links */}
                      <div className="flex flex-wrap gap-3 pt-2">
                        {linkedArtist.social.soundcloud && (
                          <a
                            href={linkedArtist.social.soundcloud}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 bg-orange-500/20 border border-orange-500/30 rounded-lg text-orange-400 text-xs uppercase tracking-wider hover:bg-orange-500/30 transition-colors flex items-center gap-2"
                          >
                            SoundCloud
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                        {linkedArtist.social.instagram && (
                          <a
                            href={linkedArtist.social.instagram}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 bg-pink-500/20 border border-pink-500/30 rounded-lg text-pink-400 text-xs uppercase tracking-wider hover:bg-pink-500/30 transition-colors flex items-center gap-2"
                          >
                            Instagram
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                        {linkedArtist.social.facebook && (
                          <a
                            href={linkedArtist.social.facebook}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 bg-blue-500/20 border border-blue-500/30 rounded-lg text-blue-400 text-xs uppercase tracking-wider hover:bg-blue-500/30 transition-colors flex items-center gap-2"
                          >
                            Facebook
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="grid md:grid-cols-2 gap-4">
                  {/* Download Profile Image */}
                  <div className="border border-white/10 rounded-xl p-6 bg-white/5">
                    <h3 className="uppercase tracking-[0.25em] text-[11px] font-medium text-white/80 mb-4">
                      Download Your Profile Image
                    </h3>
                    <p className="text-white/60 text-sm mb-4">
                      Download your official artist profile image in high quality for use in promotional materials.
                    </p>
                    <a
                      href={linkedArtist.image_url}
                      download={`${linkedArtist.name.replace(/\s+/g, '-').toLowerCase()}-profile.jpg`}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-purple-500/20 border border-purple-500/30 rounded-lg text-purple-400 hover:bg-purple-500/30 transition-colors uppercase tracking-[0.25em] text-[11px]"
                    >
                      <Download className="w-4 h-4" />
                      Download Image
                    </a>
                  </div>

                  {/* View Public Page */}
                  <div className="border border-white/10 rounded-xl p-6 bg-white/5">
                    <h3 className="uppercase tracking-[0.25em] text-[11px] font-medium text-white/80 mb-4">
                      Your Public Artist Page
                    </h3>
                    <p className="text-white/60 text-sm mb-4">
                      View your public artist page on the Transubtil Records website.
                    </p>
                    <Link
                      to={`/artists/${linkedArtist.slug}`}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 border border-white/20 rounded-lg text-white hover:bg-white/20 transition-colors uppercase tracking-[0.25em] text-[11px]"
                    >
                      <ExternalLink className="w-4 h-4" />
                      View Page
                    </Link>
                  </div>
                </div>

                {/* Info Box */}
                <div className="border border-purple-500/30 rounded-2xl p-6 bg-purple-500/5">
                  <p className="text-sm text-white/70 leading-relaxed">
                    <strong className="text-white">Artist Account:</strong> As an artist on Transubtil Records,
                    you have access to your profile image and public page. If you need to update your artist
                    information, please contact the label administration.
                  </p>
                </div>
              </>
            ) : (
              /* No linked artist */
              <div className="border border-yellow-500/30 rounded-2xl p-8 bg-yellow-500/5 text-center">
                <Globe className="w-12 h-12 mx-auto mb-4 text-yellow-500/60" />
                <h3 className="text-xl font-bold uppercase tracking-[0.25em] mb-2 text-yellow-400">
                  No Artist Linked
                </h3>
                <p className="text-white/60 max-w-md mx-auto">
                  Your account has the artist role but is not yet linked to an artist profile.
                  Please contact the label administration to link your account.
                </p>
              </div>
            )}
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
                <h3 className="uppercase tracking-[0.25em] text-[11px] font-medium text-white/60 mb-2">Pending Studio</h3>
                <p className="uppercase tracking-[0.25em] text-base font-medium text-white">
                  {studioProjects.filter(p => p.status === "pending").length}
                </p>
              </div>

              {/* Studio Projects - In Progress */}
              <div className="border border-white/10 rounded-xl p-4 bg-white/5">
                <h3 className="uppercase tracking-[0.25em] text-[11px] font-medium text-white/60 mb-2">In Progress</h3>
                <p className="uppercase tracking-[0.25em] text-base font-medium text-white">
                  {studioProjects.filter(p => p.status === "in_progress").length}
                </p>
              </div>

              {/* Studio Projects - Completed */}
              <div className="border border-white/10 rounded-xl p-4 bg-white/5">
                <h3 className="uppercase tracking-[0.25em] text-[11px] font-medium text-white/60 mb-2">Completed</h3>
                <p className="uppercase tracking-[0.25em] text-base font-medium text-white">
                  {studioProjects.filter(p => p.status === "completed").length}
                </p>
              </div>

              {/* Label Submissions - Total */}
              <div className="border border-white/10 rounded-xl p-4 bg-white/5">
                <h3 className="uppercase tracking-[0.25em] text-[11px] font-medium text-white/60 mb-2">Demos Submitted</h3>
                <p className="uppercase tracking-[0.25em] text-base font-medium text-white">
                  {submissions.length}
                </p>
              </div>
            </div>

            {/* Account Settings */}
            <div className="relative">
              {/* SVG Card Border */}
              <svg
                className="absolute pointer-events-none"
                viewBox="0 0 725 419"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                preserveAspectRatio="none"
                style={{
                  opacity: 0.3,
                  top: '-8%',
                  left: '-3%',
                  width: '106%',
                  height: '116%'
                }}
              >
                <path d="M703.065 27.7661H22.2576V391.139H703.065V27.7661Z" stroke="white" strokeWidth="1.5" strokeMiterlimit="10"/>
                <path d="M703.059 92.2368C706.378 94.5312 709.691 96.8205 713.009 99.1149V268.076C709.691 267.921 706.378 267.772 703.059 267.618V92.2368Z" stroke="white" strokeWidth="1.5" strokeMiterlimit="10"/>
                <path d="M717.053 269.011C714.027 266.583 711 264.159 707.973 261.73C708.004 251.184 708.034 240.633 708.065 230.087C705.994 228.28 703.918 226.469 701.847 224.662C701.853 260.137 701.866 295.618 701.872 331.093C701.872 331.645 701.872 332.198 701.878 332.75C701.847 343.272 701.817 353.793 701.786 364.309C691.002 372.944 680.217 381.579 669.432 390.214C642.973 390.189 616.507 390.164 590.048 390.139C594.164 393.374 598.275 396.609 602.392 399.844C634.928 399.869 667.471 399.894 700.008 399.919C703.656 397.017 707.304 394.111 710.951 391.209C711.043 371.321 711.134 351.439 711.225 331.551C713.168 329.953 715.11 328.356 717.059 326.758V269.011H717.053Z" fill="white"/>
                <path d="M710.86 330.272H702.067V333.367H710.86V330.272Z" fill="white"/>
                <path d="M703.059 320.069C701.561 321.214 700.069 322.364 698.571 323.508C698.48 336.155 698.382 348.801 698.291 361.452C687.725 369.933 677.16 378.418 666.594 386.899H631.25C629.533 388.312 627.822 389.726 626.105 391.139H670.425C681.301 382.35 692.183 373.561 703.059 364.777V320.069Z" stroke="white" strokeWidth="1.5" strokeMiterlimit="10"/>
              </svg>

              <div className="border border-white/10 rounded-xl p-4 sm:p-6 bg-white/5 relative z-10">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
                <div className="flex items-center gap-3">
                  <UserCircle className="w-6 h-6 text-brand-500" />
                </div>
                {!editingProfile && (
                  <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                    <button
                      onClick={() => setEditingProfile(true)}
                      className="w-full sm:w-auto px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white uppercase tracking-[0.25em] text-[11px] rounded-lg transition-colors"
                    >
                      Edit Profile
                    </button>
                    <button
                      onClick={signOut}
                      className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-transparent hover:bg-red-500/30 border border-white/20 text-white uppercase tracking-[0.25em] text-[11px] rounded-lg transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-6 relative z-10">
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
            </div>
          </motion.div>
        )}
      </div>
    </>
  )
}
