import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Helmet } from "react-helmet-async"
import { motion } from "framer-motion"
import { ArrowLeft, Send } from "lucide-react"
import { useAuth } from "../contexts/AuthContext"
import { supabase } from "../lib/supabase"
import AudioUploader from "../components/studio/AudioUploader"
import type { StudioRequestForm } from "../types/studio"

export default function StudioRequest() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState<StudioRequestForm>({
    projectName: "",
    serviceType: "mastering",
    description: "",
    referenceTracks: "",
    audioFiles: [],
  })

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (!user) {
        setError("You must be logged in to submit a request")
        setLoading(false)
        return
      }

      // Upload audio files to Supabase Storage
      const uploadedFiles = []
      for (const file of formData.audioFiles) {
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

      // Insert studio request
      const { error: insertError } = await supabase.from("studio_requests").insert({
        user_id: user.id,
        project_name: formData.projectName,
        service_type: formData.serviceType,
        description: formData.description,
        reference_tracks: formData.referenceTracks || null,
        audio_files: uploadedFiles,
        status: "pending",
      })

      if (insertError) {
        console.error("Insert error:", insertError)
        throw new Error("Failed to submit request")
      }

      // TODO: Send email notification to admin via Edge Function
      // For now, just navigate to success page

      navigate("/studio/my-projects")
    } catch (err) {
      console.error("Submission error:", err)
      setError(err instanceof Error ? err.message : "Failed to submit request")
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Helmet>
        <title>Studio Request — Transubtil Records</title>
      </Helmet>

      <section className="mx-auto max-w-4xl space-y-8">
        {/* Back Button */}
        <button
          onClick={() => navigate("/studio")}
          className="inline-flex items-center gap-2 uppercase tracking-[0.25em] text-[11px] text-white/60 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Studio
        </button>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-3"
        >
          <h1 className="text-3xl md:text-4xl font-bold uppercase tracking-[0.25em]">Request Studio Service</h1>
          <p className="text-white/60 uppercase tracking-[0.25em] text-[11px]">
            Fill out the form below to submit your project. We'll review your request and
            get back to you within 24-48 hours.
          </p>
        </motion.div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="border border-white/10 rounded-2xl p-6 md:p-8 bg-brand-700/10"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Project Name */}
            <div>
              <label
                htmlFor="projectName"
                className="block uppercase tracking-[0.25em] text-[11px] font-medium text-white/80 mb-2"
              >
                Project Name *
              </label>
              <input
                type="text"
                id="projectName"
                name="projectName"
                value={formData.projectName}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-brand-700/30 border border-white/10 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:border-white/30 transition-colors uppercase tracking-[0.25em] text-[11px]"
                placeholder="MY EPIC TRACK"
              />
            </div>

            {/* Service Type */}
            <div>
              <label
                htmlFor="serviceType"
                className="block uppercase tracking-[0.25em] text-[11px] font-medium text-white/80 mb-2"
              >
                Service Type *
              </label>
              <select
                id="serviceType"
                name="serviceType"
                value={formData.serviceType}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-brand-700/30 border border-white/10 rounded-lg text-white focus:outline-none focus:border-white/30 transition-colors cursor-pointer uppercase tracking-[0.25em] text-[11px]"
              >
                <option value="mastering">Mastering</option>
                <option value="mixing">Mixing</option>
                <option value="mix-master">Mix + Master</option>
                <option value="production">Production</option>
              </select>
            </div>

            {/* Description */}
            <div>
              <label
                htmlFor="description"
                className="block uppercase tracking-[0.25em] text-[11px] font-medium text-white/80 mb-2"
              >
                Project Description *
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows={5}
                className="w-full px-4 py-3 bg-brand-700/30 border border-white/10 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:border-white/30 transition-colors resize-none uppercase tracking-[0.25em] text-[11px]"
                placeholder="DESCRIBE YOUR PROJECT, DESIRED SOUND, TARGET LOUDNESS, SPECIFIC REQUIREMENTS, ETC."
              />
            </div>

            {/* Audio Files Upload */}
            <div>
              <label className="block uppercase tracking-[0.25em] text-[11px] font-medium text-white/80 mb-2">
                Audio Files *
              </label>
              <AudioUploader
                files={formData.audioFiles}
                onFilesChange={(files) =>
                  setFormData({ ...formData, audioFiles: files })
                }
              />
              <p className="uppercase tracking-[0.25em] text-[11px] text-white/40 mt-2">
                Upload your stems, mixdown, or reference tracks
              </p>
            </div>

            {/* Reference Tracks */}
            <div>
              <label
                htmlFor="referenceTracks"
                className="block uppercase tracking-[0.25em] text-[11px] font-medium text-white/80 mb-2"
              >
                Reference Tracks (Optional)
              </label>
              <input
                type="text"
                id="referenceTracks"
                name="referenceTracks"
                value={formData.referenceTracks}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-brand-700/30 border border-white/10 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:border-white/30 transition-colors uppercase tracking-[0.25em] text-[11px]"
                placeholder="SOUNDCLOUD OR YOUTUBE LINKS"
              />
            </div>

            {/* Error */}
            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                <p className="uppercase tracking-[0.25em] text-[11px] text-red-400">{error}</p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || formData.audioFiles.length === 0}
              className="w-full px-6 py-3 border-2 border-white/80 hover:bg-white hover:text-black text-white font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 uppercase tracking-[0.25em] text-[11px]"
            >
              {loading ? (
                <span>Submitting...</span>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  <span>Submit Request</span>
                </>
              )}
            </button>

            <p className="uppercase tracking-[0.25em] text-[11px] text-white/40 text-center">
              By submitting this form, you agree to our terms of service
            </p>
          </form>
        </motion.div>
      </section>
    </>
  )
}
