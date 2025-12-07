import { useState, useEffect } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { Helmet } from "react-helmet-async"
import { motion } from "framer-motion"
import { useAuth } from "../contexts/AuthContext"
import { supabase } from "../lib/supabase"
import type { StudioProject } from "../types/studio"
import AudioUploader from "../components/studio/AudioUploader"
import {
  ArrowLeft,
  Calendar,
  CheckCircle,
  Clock,
  XCircle,
  Folder,
  MessageSquare,
  Upload,
  Download,
} from "lucide-react"

export default function ProjectDetail() {
  const { projectId } = useParams<{ projectId: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [project, setProject] = useState<StudioProject | null>(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [newFiles, setNewFiles] = useState<File[]>([])

  useEffect(() => {
    loadProject()
  }, [projectId])

  const loadProject = async () => {
    try {
      if (!projectId || !user) return

      const { data, error } = await supabase
        .from("studio_requests")
        .select("*")
        .eq("id", projectId)
        .eq("user_id", user.id)
        .single()

      if (error) throw error
      setProject(data)
    } catch (error) {
      console.error("Error loading project:", error)
      alert("Failed to load project")
      navigate("/dashboard?tab=studio")
    } finally {
      setLoading(false)
    }
  }

  const handleUploadNewFiles = async () => {
    if (!project || !user || newFiles.length === 0) return

    setUploading(true)
    try {
      // Upload new files to Supabase Storage
      const uploadedFiles = []
      for (const file of newFiles) {
        const filePath = `${user.id}/${Date.now()}_${file.name}`
        const { data, error: uploadError } = await supabase.storage
          .from("studio-audio-files")
          .upload(filePath, file)

        if (uploadError) {
          console.error("Upload error:", uploadError)
          throw new Error(`Failed to upload ${file.name}`)
        }

        uploadedFiles.push({
          name: file.name,
          size: file.size,
          url: data.path,
          uploaded_at: new Date().toISOString(),
        })
      }

      // Update project with new files
      const updatedFiles = [...project.audio_files, ...uploadedFiles]
      const { error: updateError } = await supabase
        .from("studio_requests")
        .update({ audio_files: updatedFiles })
        .eq("id", project.id)

      if (updateError) throw updateError

      alert("Files uploaded successfully!")
      setNewFiles([])
      loadProject()
    } catch (error) {
      console.error("Upload error:", error)
      alert("Failed to upload files. Please try again.")
    } finally {
      setUploading(false)
    }
  }

  const handleDownloadFile = async (fileUrl: string) => {
    try {
      const { data, error } = await supabase.storage
        .from("studio-audio-files")
        .createSignedUrl(fileUrl, 3600)

      if (error) throw error
      window.open(data.signedUrl, '_blank')
    } catch (error) {
      console.error("Download error:", error)
      alert("Failed to download file. Please try again.")
    }
  }

  const getStatusIcon = (status: StudioProject["status"]) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case "in_progress":
        return <Clock className="w-5 h-5 text-blue-500" />
      case "cancelled":
        return <XCircle className="w-5 h-5 text-red-500" />
      default:
        return <Clock className="w-5 h-5 text-yellow-500" />
    }
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
      <div className="mx-auto max-w-4xl py-20 text-center">
        <p className="text-white/60">Loading project...</p>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="mx-auto max-w-4xl py-20 text-center">
        <p className="text-white/60">Project not found</p>
        <Link
          to="/dashboard?tab=studio"
          className="inline-block mt-4 px-6 py-2 border border-white/20 hover:border-white/40 rounded-lg transition-colors"
        >
          Back to Dashboard
        </Link>
      </div>
    )
  }

  return (
    <>
      <Helmet>
        <title>{project.project_name} — Transubtil Records</title>
      </Helmet>

      <section className="mx-auto max-w-4xl space-y-6">
        {/* Back Button */}
        <Link
          to="/dashboard?tab=studio"
          className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-4"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <Folder className="w-8 h-8 text-brand-500 mt-1" />
              <div>
                <h1 className="text-3xl md:text-4xl font-bold">{project.project_name}</h1>
                <p className="text-white/60 capitalize mt-1">
                  {project.service_type.replace("-", " + ")}
                </p>
              </div>
            </div>
            <div
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${getStatusColor(
                project.status
              )}`}
            >
              {getStatusIcon(project.status)}
              <span className="text-sm font-medium capitalize">
                {project.status.replace("_", " ")}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-sm text-white/50">
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              Submitted: {formatDate(project.created_at)}
            </span>
          </div>
        </motion.div>

        {/* Description */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="border border-white/10 rounded-xl p-6 bg-white/5"
        >
          <h2 className="text-xl font-semibold mb-3">Project Description</h2>
          <p className="text-white/70">{project.description}</p>
        </motion.div>

        {/* Reference Tracks */}
        {project.reference_tracks && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="border border-white/10 rounded-xl p-6 bg-white/5"
          >
            <h2 className="text-xl font-semibold mb-3">Reference Tracks</h2>
            <p className="text-white/70">{project.reference_tracks}</p>
          </motion.div>
        )}

        {/* Studio Feedback */}
        {project.feedback && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="border border-brand-500/20 rounded-xl p-6 bg-brand-500/10"
          >
            <div className="flex items-start gap-3">
              <MessageSquare className="w-6 h-6 text-brand-500 mt-1" />
              <div>
                <h2 className="text-xl font-semibold mb-3 text-brand-300">Studio Feedback</h2>
                <p className="text-white/80">{project.feedback}</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Audio Files */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="border border-white/10 rounded-xl p-6 bg-white/5"
        >
          <h2 className="text-xl font-semibold mb-4">Audio Files ({project.audio_files.length})</h2>
          <div className="space-y-2">
            {project.audio_files.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-white/80 truncate">{file.name}</p>
                  <p className="text-xs text-white/50">
                    {(file.size / 1024 / 1024).toFixed(2)} MB • Uploaded {formatDate(file.uploaded_at)}
                  </p>
                </div>
                <button
                  onClick={() => handleDownloadFile(file.url)}
                  className="ml-4 px-4 py-2 bg-brand-500/20 hover:bg-brand-500/30 text-brand-300 rounded-lg transition-colors flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download
                </button>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Upload New Files */}
        {project.status === "in_progress" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="border border-white/10 rounded-xl p-6 bg-white/5"
          >
            <h2 className="text-xl font-semibold mb-4">Upload Additional Files</h2>
            <p className="text-white/60 text-sm mb-4">
              You can upload additional files to this project (revised versions, stems, etc.)
            </p>

            <AudioUploader files={newFiles} onFilesChange={setNewFiles} />

            {newFiles.length > 0 && (
              <button
                onClick={handleUploadNewFiles}
                disabled={uploading}
                className="mt-4 w-full px-6 py-3 bg-brand-500 hover:bg-brand-600 disabled:bg-brand-700 text-white font-medium rounded-lg transition-all disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {uploading ? (
                  <span>Uploading...</span>
                ) : (
                  <>
                    <Upload className="w-5 h-5" />
                    Upload {newFiles.length} File{newFiles.length > 1 ? "s" : ""}
                  </>
                )}
              </button>
            )}
          </motion.div>
        )}
      </section>
    </>
  )
}
