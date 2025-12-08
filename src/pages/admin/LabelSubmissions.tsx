import { useState, useEffect } from "react"
import { Helmet } from "react-helmet-async"
import { motion } from "framer-motion"
import { useAuth } from "../../contexts/AuthContext"
import { supabase } from "../../lib/supabase"
import type { LabelSubmission } from "../../lib/supabase"
import {
  Music,
  CheckCircle,
  XCircle,
  Clock,
  MessageSquare,
  Play,
  Filter,
  ChevronDown,
  ChevronUp,
} from "lucide-react"

type FilterType = "all" | "pending" | "approved" | "rejected"

export default function LabelSubmissions() {
  const { isAdmin } = useAuth()
  const [submissions, setSubmissions] = useState<LabelSubmission[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<FilterType>("all")
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [audioUrls, setAudioUrls] = useState<Record<string, string>>({})
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set())

  // Feedback form state
  const [feedbackForm, setFeedbackForm] = useState<{
    submissionId: string | null
    feedback: string
  }>({
    submissionId: null,
    feedback: "",
  })

  const toggleExpanded = (id: string) => {
    setExpandedCards(prev => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }

  useEffect(() => {
    loadSubmissions()
  }, [])

  const loadSubmissions = async () => {
    try {
      let query = supabase
        .from("label_submissions")
        .select("*")
        .order("created_at", { ascending: false })

      if (filter !== "all") {
        query = query.eq("status", filter)
      }

      const { data, error } = await query

      if (error) throw error
      setSubmissions(data || [])

      // Generate signed URLs for audio files
      const urls: Record<string, string> = {}
      for (const submission of data || []) {
        console.log("🎵 Processing submission:", submission.id)
        console.log("📁 File URL:", submission.file_url)

        // Skip SoundCloud links
        if (submission.file_url.includes('soundcloud.com')) {
          console.log("🎧 SoundCloud link detected")
          urls[submission.id] = submission.file_url
          continue
        }

        // For storage files (whether it's a path or a storage URL), extract the path and generate signed URL
        let filePath = submission.file_url

        // If it's a full storage URL, extract just the path part
        if (submission.file_url.includes('supabase.co/storage/v1/object/public/studio-audio-files/')) {
          filePath = submission.file_url.split('studio-audio-files/')[1]
          console.log("🔄 Extracted path from URL:", filePath)
        }

        // Generate signed URL for the file path
        console.log("🔑 Generating signed URL for:", filePath)
        const { data: signedData, error: signError } = await supabase.storage
          .from("studio-audio-files")
          .createSignedUrl(filePath, 3600)

        if (signError) {
          console.error("❌ Error generating signed URL:", signError)
        } else if (signedData) {
          console.log("✅ Signed URL generated:", signedData.signedUrl)
          urls[submission.id] = signedData.signedUrl
        }
      }
      console.log("🎯 Final audioUrls:", urls)
      setAudioUrls(urls)
    } catch (error) {
      console.error("Error loading submissions:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSubmissions()
  }, [filter])

  const handleApprove = async (id: string) => {
    setProcessingId(id)
    try {
      const { error } = await supabase
        .from("label_submissions")
        .update({ status: "approved" })
        .eq("id", id)

      if (error) throw error
      await loadSubmissions()
      alert("Submission approved!")
    } catch (error) {
      console.error("Error approving submission:", error)
      alert("Error approving submission")
    } finally {
      setProcessingId(null)
    }
  }

  const handleReject = async (id: string) => {
    setProcessingId(id)
    try {
      const { error } = await supabase
        .from("label_submissions")
        .update({ status: "rejected" })
        .eq("id", id)

      if (error) throw error
      await loadSubmissions()
      alert("Submission rejected")
    } catch (error) {
      console.error("Error rejecting submission:", error)
      alert("Error rejecting submission")
    } finally {
      setProcessingId(null)
    }
  }

  const handleAddFeedback = async (id: string) => {
    if (!feedbackForm.feedback.trim()) {
      alert("Please enter feedback")
      return
    }

    setProcessingId(id)
    try {
      const { error } = await supabase
        .from("label_submissions")
        .update({ feedback: feedbackForm.feedback })
        .eq("id", id)

      if (error) throw error

      setFeedbackForm({ submissionId: null, feedback: "" })
      await loadSubmissions()
      alert("Feedback added successfully!")
    } catch (error) {
      console.error("Error adding feedback:", error)
      alert("Error adding feedback")
    } finally {
      setProcessingId(null)
    }
  }

  const getStatusIcon = (status: LabelSubmission["status"]) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case "rejected":
        return <XCircle className="w-5 h-5 text-red-500" />
      default:
        return <Clock className="w-5 h-5 text-yellow-500" />
    }
  }

  const getStatusBadge = (status: LabelSubmission["status"]) => {
    const colors = {
      pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
      approved: "bg-green-500/20 text-green-400 border-green-500/30",
      rejected: "bg-red-500/20 text-red-400 border-red-500/30",
    }
    return colors[status]
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const filteredSubmissions = submissions.filter((sub) =>
    filter === "all" ? true : sub.status === filter
  )

  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-6xl text-center py-20">
        <h1 className="text-3xl font-bold mb-4">Access Denied</h1>
        <p className="text-white/60">You don't have permission to access this page.</p>
      </div>
    )
  }

  return (
    <>
      <Helmet>
        <title>Label Submissions — Admin — Transubtil Records</title>
      </Helmet>

      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        >
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 uppercase tracking-[0.25em]">Label Submissions</h1>
            <p className="text-white/60 uppercase tracking-[0.25em] text-[11px]">Review and manage demo submissions</p>
          </div>
        </motion.div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <Filter className="w-5 h-5 text-white/60 hidden sm:block" />
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            {(["all", "pending", "approved", "rejected"] as FilterType[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`flex-1 sm:flex-none px-4 py-2 rounded-lg uppercase tracking-[0.25em] text-[11px] transition-colors ${
                  filter === f
                    ? "bg-brand-500 text-white"
                    : "bg-white/5 text-white/60 hover:bg-white/10"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Submissions List */}
        {loading ? (
          <div className="text-center py-12 text-white/40 uppercase tracking-[0.25em] text-[11px]">Loading submissions...</div>
        ) : filteredSubmissions.length === 0 ? (
          <div className="text-center py-16 border border-white/10 rounded-2xl">
            <Music className="w-16 h-16 mx-auto mb-4 text-white/40" />
            <h3 className="text-xl font-semibold mb-2 uppercase tracking-[0.25em]">No submissions</h3>
            <p className="text-white/60 uppercase tracking-[0.25em] text-[11px]">
              No {filter === "all" ? "" : filter} submissions found
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredSubmissions.map((submission) => {
              const isExpanded = expandedCards.has(submission.id)

              return (
                <motion.div
                  key={submission.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border border-white/10 rounded-xl hover:border-white/20 transition-all bg-white/5"
                >
                  {/* Compact Header - Always Visible */}
                  <div className="p-3 sm:p-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                      <div className="flex items-center gap-3 flex-1 min-w-0 w-full">
                        <Music className="w-4 h-4 sm:w-5 sm:h-5 text-brand-500 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base sm:text-lg font-semibold truncate uppercase tracking-[0.25em]">
                            {submission.track_title}
                          </h3>
                          <p className="text-white/60 truncate uppercase tracking-[0.25em] text-[11px]">
                            by {submission.artist_name}
                            {submission.genre && ` • ${submission.genre}`}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start flex-shrink-0">
                        <div
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border uppercase tracking-[0.25em] text-[11px] ${getStatusBadge(
                            submission.status
                          )}`}
                        >
                          {getStatusIcon(submission.status)}
                          <span className="font-medium">
                            {submission.status}
                          </span>
                        </div>

                        <button
                          onClick={() => toggleExpanded(submission.id)}
                          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                        >
                          {isExpanded ? (
                            <ChevronUp className="w-5 h-5" />
                          ) : (
                            <ChevronDown className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Quick Info - Always Visible */}
                    <div className="flex items-center gap-4 uppercase tracking-[0.25em] text-[11px] text-white/50 mt-2 ml-0 sm:ml-8">
                      <span className="break-all">Submitted: {formatDate(submission.created_at)}</span>
                    </div>
                  </div>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="border-t border-white/10"
                    >
                      <div className="p-6 space-y-4">
                        {/* Full Description */}
                        {submission.description && (
                          <div>
                            <p className="uppercase tracking-[0.25em] text-[11px] font-medium text-white/80 mb-1">Description</p>
                            <p className="text-white/70 uppercase tracking-[0.25em] text-[11px]">
                              {submission.description}
                            </p>
                          </div>
                        )}

                        {/* Metadata */}
                        <div className="flex items-center gap-4 uppercase tracking-[0.25em] text-[11px] text-white/50">
                          <span>User ID: {submission.user_id.slice(0, 8)}...</span>
                        </div>

                        {/* Audio Player */}
                        <div>
                    {submission.file_url.includes('soundcloud.com') ? (
                      // SoundCloud link - show link instead of player
                      <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                        <p className="uppercase tracking-[0.25em] text-[11px] text-white/70 mb-2">SoundCloud Link:</p>
                        <a
                          href={submission.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-brand-300 hover:text-brand-200 underline uppercase tracking-[0.25em] text-[11px] break-all"
                        >
                          {submission.file_url}
                        </a>
                      </div>
                    ) : (
                      // Uploaded file - use audio player
                      <audio
                        controls
                        src={audioUrls[submission.id] || submission.file_url}
                        className="w-full max-w-2xl"
                        style={{
                          filter: "invert(0.9) hue-rotate(180deg)",
                        }}
                      >
                        Your browser does not support the audio element.
                      </audio>
                    )}
                  </div>

                        {/* Existing Feedback */}
                        {submission.feedback && (
                          <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                      <div className="flex items-start gap-2">
                        <MessageSquare className="w-4 h-4 mt-0.5 text-brand-500" />
                        <div>
                          <p className="uppercase tracking-[0.25em] text-[11px] font-medium mb-1">Your Feedback</p>
                          <p className="uppercase tracking-[0.25em] text-[11px] text-white/70">{submission.feedback}</p>
                        </div>
                          </div>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex flex-col gap-4 pt-4 border-t border-white/10">
                    <div className="flex flex-col sm:flex-row gap-2">
                      <button
                        onClick={() => handleApprove(submission.id)}
                        disabled={
                          processingId === submission.id ||
                          submission.status === "approved"
                        }
                        className="w-full sm:w-auto px-4 py-2 bg-brand-500 hover:bg-brand-600 disabled:bg-brand-500/50 text-white disabled:text-white/50 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:cursor-not-allowed uppercase tracking-[0.25em] text-[11px]"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(submission.id)}
                        disabled={
                          processingId === submission.id ||
                          submission.status === "rejected"
                        }
                        className="w-full sm:w-auto px-4 py-2 bg-transparent hover:bg-red-500/30 disabled:bg-transparent border border-white/20 disabled:border-white/10 text-white disabled:text-white/50 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:cursor-not-allowed uppercase tracking-[0.25em] text-[11px]"
                      >
                        <XCircle className="w-4 h-4" />
                        Reject
                      </button>
                    </div>

                    {/* Feedback Form */}
                    <div className="flex flex-col sm:flex-row gap-2">
                      {feedbackForm.submissionId === submission.id ? (
                        <>
                          <input
                            type="text"
                            value={feedbackForm.feedback}
                            onChange={(e) =>
                              setFeedbackForm({
                                ...feedbackForm,
                                feedback: e.target.value,
                              })
                            }
                            placeholder="ENTER FEEDBACK..."
                            className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:border-brand-500 focus:outline-none text-white uppercase tracking-[0.25em] text-[11px]"
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleAddFeedback(submission.id)}
                              disabled={processingId === submission.id}
                              className="flex-1 sm:flex-none px-4 py-2 bg-brand-500 hover:bg-brand-600 disabled:bg-brand-700 text-white rounded-lg transition-colors uppercase tracking-[0.25em] text-[11px] disabled:cursor-not-allowed"
                            >
                              Save
                            </button>
                            <button
                              onClick={() =>
                                setFeedbackForm({ submissionId: null, feedback: "" })
                              }
                              className="flex-1 sm:flex-none px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-colors uppercase tracking-[0.25em] text-[11px]"
                            >
                              Cancel
                            </button>
                          </div>
                        </>
                      ) : (
                        <button
                          onClick={() =>
                            setFeedbackForm({
                              submissionId: submission.id,
                              feedback: submission.feedback || "",
                            })
                          }
                          className="w-full sm:w-auto px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-colors flex items-center justify-center gap-2 uppercase tracking-[0.25em] text-[11px]"
                        >
                          <MessageSquare className="w-4 h-4" />
                          {submission.feedback ? "Edit Feedback" : "Add Feedback"}
                        </button>
                      )}
                    </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
    </>
  )
}
