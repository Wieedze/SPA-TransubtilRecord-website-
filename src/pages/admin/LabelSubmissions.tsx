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
} from "lucide-react"

type FilterType = "all" | "pending" | "approved" | "rejected"

export default function LabelSubmissions() {
  const { isAdmin } = useAuth()
  const [submissions, setSubmissions] = useState<LabelSubmission[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<FilterType>("all")
  const [processingId, setProcessingId] = useState<string | null>(null)

  // Feedback form state
  const [feedbackForm, setFeedbackForm] = useState<{
    submissionId: string | null
    feedback: string
  }>({
    submissionId: null,
    feedback: "",
  })

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
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-4xl font-bold mb-2">Label Submissions</h1>
            <p className="text-white/60">Review and manage demo submissions</p>
          </div>
        </motion.div>

        {/* Filters */}
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-white/60" />
          <div className="flex gap-2">
            {(["all", "pending", "approved", "rejected"] as FilterType[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg capitalize transition-colors ${
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
          <div className="text-center py-12 text-white/40">Loading submissions...</div>
        ) : filteredSubmissions.length === 0 ? (
          <div className="text-center py-16 border border-white/10 rounded-2xl">
            <Music className="w-16 h-16 mx-auto mb-4 text-white/40" />
            <h3 className="text-xl font-semibold mb-2">No submissions</h3>
            <p className="text-white/60">
              No {filter === "all" ? "" : filter} submissions found
            </p>
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredSubmissions.map((submission) => (
              <motion.div
                key={submission.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="border border-white/10 rounded-xl p-6 hover:border-white/20 transition-all bg-white/5"
              >
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start gap-3 mb-2">
                        <Music className="w-6 h-6 text-brand-500 mt-1" />
                        <div>
                          <h3 className="text-xl font-semibold">
                            {submission.track_title}
                          </h3>
                          <p className="text-white/60">by {submission.artist_name}</p>
                          {submission.genre && (
                            <p className="text-white/50 text-sm mt-1">{submission.genre}</p>
                          )}
                        </div>
                      </div>
                      {submission.description && (
                        <p className="text-white/70 text-sm ml-9">
                          {submission.description}
                        </p>
                      )}
                    </div>
                    <div
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${getStatusBadge(
                        submission.status
                      )}`}
                    >
                      {getStatusIcon(submission.status)}
                      <span className="text-sm font-medium capitalize">
                        {submission.status}
                      </span>
                    </div>
                  </div>

                  {/* Metadata */}
                  <div className="flex items-center gap-4 text-xs text-white/50 ml-9">
                    <span>Submitted: {formatDate(submission.created_at)}</span>
                    <span>•</span>
                    <span>ID: {submission.user_id.slice(0, 8)}...</span>
                  </div>

                  {/* Audio Player */}
                  <div className="ml-9">
                    <audio
                      controls
                      src={submission.file_url}
                      className="w-full max-w-2xl"
                      style={{
                        filter: "invert(0.9) hue-rotate(180deg)",
                      }}
                    >
                      Your browser does not support the audio element.
                    </audio>
                  </div>

                  {/* Existing Feedback */}
                  {submission.feedback && (
                    <div className="ml-9 p-4 bg-white/5 rounded-lg border border-white/10">
                      <div className="flex items-start gap-2">
                        <MessageSquare className="w-4 h-4 mt-0.5 text-brand-500" />
                        <div>
                          <p className="text-sm font-medium mb-1">Your Feedback</p>
                          <p className="text-sm text-white/70">{submission.feedback}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="ml-9 flex items-start gap-4 pt-4 border-t border-white/10">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApprove(submission.id)}
                        disabled={
                          processingId === submission.id ||
                          submission.status === "approved"
                        }
                        className="px-4 py-2 bg-green-500/20 hover:bg-green-500/30 disabled:bg-green-500/10 text-green-400 disabled:text-green-400/50 rounded-lg transition-colors flex items-center gap-2 disabled:cursor-not-allowed"
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
                        className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 disabled:bg-red-500/10 text-red-400 disabled:text-red-400/50 rounded-lg transition-colors flex items-center gap-2 disabled:cursor-not-allowed"
                      >
                        <XCircle className="w-4 h-4" />
                        Reject
                      </button>
                    </div>

                    {/* Feedback Form */}
                    <div className="flex-1 flex gap-2">
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
                            placeholder="Enter feedback..."
                            className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:border-brand-500 focus:outline-none text-white text-sm"
                          />
                          <button
                            onClick={() => handleAddFeedback(submission.id)}
                            disabled={processingId === submission.id}
                            className="px-4 py-2 bg-brand-500 hover:bg-brand-600 disabled:bg-brand-700 text-white rounded-lg transition-colors text-sm disabled:cursor-not-allowed"
                          >
                            Save
                          </button>
                          <button
                            onClick={() =>
                              setFeedbackForm({ submissionId: null, feedback: "" })
                            }
                            className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-colors text-sm"
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() =>
                            setFeedbackForm({
                              submissionId: submission.id,
                              feedback: submission.feedback || "",
                            })
                          }
                          className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-colors flex items-center gap-2 text-sm"
                        >
                          <MessageSquare className="w-4 h-4" />
                          {submission.feedback ? "Edit Feedback" : "Add Feedback"}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
