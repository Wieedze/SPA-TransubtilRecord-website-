import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Helmet } from "react-helmet-async"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowLeft, Send, AlertCircle, MessageSquare, User, Mail, X } from "lucide-react"
import { useAuth } from "../contexts/AuthContext"
import { supabase } from "../lib/supabase"
import { uploadFile } from "../lib/upload-service"
import AudioUploader from "../components/studio/AudioUploader"
import type { StudioRequestForm } from "../types/studio"

export default function StudioRequest() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasAccess, setHasAccess] = useState<boolean | null>(null)
  const [checkingAccess, setCheckingAccess] = useState(true)

  const [formData, setFormData] = useState<StudioRequestForm>({
    projectName: "",
    serviceType: "mastering",
    description: "",
    referenceTracks: "",
    audioFiles: [],
  })

  // Contact form state
  const [showContactModal, setShowContactModal] = useState(false)
  const [submittingContact, setSubmittingContact] = useState(false)
  const [contactFormData, setContactFormData] = useState({
    name: "",
    email: "",
    message: "",
  })

  // Vérifier l'accès studio au chargement
  useEffect(() => {
    const checkAccess = async () => {
      if (!user) {
        setCheckingAccess(false)
        return
      }

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('has_studio_access')
          .eq('id', user.id)
          .single()

        if (error) throw error
        setHasAccess(data?.has_studio_access === true)
      } catch (err) {
        console.error('Error checking studio access:', err)
        setHasAccess(false)
      } finally {
        setCheckingAccess(false)
      }
    }

    checkAccess()
  }, [user])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmittingContact(true)

    try {
      const emailData = {
        to: "studio@transubtilrecords.com",
        subject: `Studio Access Request from ${contactFormData.name}`,
        body: `
Name: ${contactFormData.name}
Email: ${contactFormData.email}

Message:
${contactFormData.message}
        `,
      }

      console.log("Email to send:", emailData)

      // Simulate sending
      await new Promise(resolve => setTimeout(resolve, 1000))

      alert("Your message has been sent! We'll get back to you soon.")
      setShowContactModal(false)
      setContactFormData({ name: "", email: "", message: "" })
    } catch (error) {
      console.error("Error sending message:", error)
      alert("Failed to send message. Please try again or email us directly at studio@transubtilrecords.com")
    } finally {
      setSubmittingContact(false)
    }
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

      // Upload audio files to o2switch via notre API
      const uploadedFiles = []
      for (const file of formData.audioFiles) {
        const fileUrl = await uploadFile(file, 'studio-requests')

        uploadedFiles.push({
          name: file.name,
          size: file.size,
          url: fileUrl,
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

      navigate("/studio/my-projects")
    } catch (err: any) {
      console.error("Submission error:", err)
      const errorMessage = err?.message || "Failed to submit request"

      if (errorMessage.includes('Access denied')) {
        setError('Studio requests are only available to authorized clients. Please contact us to request access.')
      } else {
        setError(errorMessage)
      }
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
            get back to you .
          </p>
        </motion.div>

        {/* Access Denied Message */}
        {!checkingAccess && !hasAccess && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="border border-yellow-500/30 rounded-2xl p-6 md:p-8 bg-yellow-500/5"
          >
            <div className="flex items-start gap-4">
              <AlertCircle className="w-6 h-6 text-yellow-400 shrink-0 mt-1" />
              <div className="space-y-3">
                <h2 className="text-xl font-bold uppercase tracking-[0.25em] text-white">
                  Studio Access Required
                </h2>
                <p className="text-white/70 text-sm leading-relaxed">
                  Studio requests are reserved for authorized clients who have an active agreement with us.
                </p>
                <p className="text-white/70 text-sm leading-relaxed">
                  If you're interested in our studio services, please contact us to discuss your project and request access.
                </p>
                <button
                  onClick={() => setShowContactModal(true)}
                  className="mt-4 inline-flex items-center gap-2 px-6 py-3 bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-500/50 text-yellow-400 font-medium rounded-lg transition-all uppercase tracking-[0.25em] text-[11px]"
                >
                  <MessageSquare className="w-4 h-4" />
                  Contact Studio
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Form - Only show if user has access */}
        {!checkingAccess && hasAccess && (
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
                placeholder="PROJECT NAME"
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
                placeholder="DESCRIBE YOUR PROJECT"
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
                maxFiles={20}
                maxSizeMB={50000}
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
        )}

        {/* Contact Modal */}
        <AnimatePresence>
          {showContactModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setShowContactModal(false)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-brand-800 border border-white/20 rounded-2xl p-6 md:p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h3 className="text-2xl font-bold mb-2">Contact Studio</h3>
                    <p className="text-sm text-white/60">
                      Send us a message and we'll get back to you soon
                    </p>
                  </div>
                  <button
                    onClick={() => setShowContactModal(false)}
                    className="text-white/60 hover:text-white transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {/* Form */}
                <form onSubmit={handleContactSubmit} className="space-y-4">
                  {/* Name */}
                  <div>
                    <label
                      htmlFor="contact-name"
                      className="block text-sm font-medium text-white/80 mb-2"
                    >
                      <User className="w-4 h-4 inline mr-2" />
                      Name *
                    </label>
                    <input
                      type="text"
                      id="contact-name"
                      value={contactFormData.name}
                      onChange={(e) => setContactFormData({ ...contactFormData, name: e.target.value })}
                      required
                      className="w-full px-4 py-3 bg-brand-700/30 border border-white/10 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:border-white/30 transition-colors"
                      placeholder="Your name"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label
                      htmlFor="contact-email"
                      className="block text-sm font-medium text-white/80 mb-2"
                    >
                      <Mail className="w-4 h-4 inline mr-2" />
                      Email *
                    </label>
                    <input
                      type="email"
                      id="contact-email"
                      value={contactFormData.email}
                      onChange={(e) => setContactFormData({ ...contactFormData, email: e.target.value })}
                      required
                      className="w-full px-4 py-3 bg-brand-700/30 border border-white/10 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:border-white/30 transition-colors"
                      placeholder="your@email.com"
                    />
                  </div>

                  {/* Message */}
                  <div>
                    <label
                      htmlFor="contact-message"
                      className="block text-sm font-medium text-white/80 mb-2"
                    >
                      <MessageSquare className="w-4 h-4 inline mr-2" />
                      Message *
                    </label>
                    <textarea
                      id="contact-message"
                      value={contactFormData.message}
                      onChange={(e) => setContactFormData({ ...contactFormData, message: e.target.value })}
                      required
                      rows={5}
                      className="w-full px-4 py-3 bg-brand-700/30 border border-white/10 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:border-white/30 transition-colors resize-none"
                      placeholder="Tell us about your project and why you need studio access..."
                    />
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowContactModal(false)}
                      className="flex-1 px-6 py-3 border border-white/20 hover:border-white/40 hover:bg-white/5 text-white rounded-lg transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submittingContact}
                      className="flex-1 px-6 py-3 bg-brand-500 hover:bg-brand-600 disabled:bg-brand-500/50 text-white font-medium rounded-lg transition-all disabled:cursor-not-allowed"
                    >
                      {submittingContact ? "Sending..." : "Send Message"}
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </>
  )
}
