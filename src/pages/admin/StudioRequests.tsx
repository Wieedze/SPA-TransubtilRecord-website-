import { useState, useEffect } from "react"
import { Helmet } from "react-helmet-async"
import { motion } from "framer-motion"
import { useAuth } from "../../contexts/AuthContext"
import { supabase } from "../../lib/supabase"
import type { StudioProject } from "../../types/studio"
import {
  Folder,
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  Filter,
  Download,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Trash2,
} from "lucide-react"

type FilterType = "all" | "pending" | "in_progress" | "completed" | "cancelled"

export default function StudioRequests() {
  const { isAdmin } = useAuth()
  const [requests, setRequests] = useState<StudioProject[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<FilterType>("all")
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set())
  const [feedbackForm, setFeedbackForm] = useState<{
    requestId: string | null
    feedback: string
  }>({
    requestId: null,
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
    loadRequests()
  }, [])

  const loadRequests = async () => {
    try {
      let query = supabase
        .from("studio_requests")
        .select("*")
        .order("created_at", { ascending: false })

      if (filter !== "all") {
        query = query.eq("status", filter)
      }

      const { data, error } = await query

      if (error) throw error

      // Fetch emails separately for each request
      if (data) {
        const requestsWithEmails = await Promise.all(
          data.map(async (request) => {
            const { data: profile } = await supabase
              .from("profiles")
              .select("email")
              .eq("id", request.user_id)
              .single()

            return {
              ...request,
              userEmail: profile?.email || null
            }
          })
        )
        setRequests(requestsWithEmails as any)
      } else {
        setRequests([])
      }
    } catch (error) {
      console.error("Error loading requests:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRequests()
  }, [filter])

  const handleUpdateStatus = async (id: string, newStatus: StudioProject["status"]) => {
    setProcessingId(id)
    try {
      const { error } = await supabase
        .from("studio_requests")
        .update({ status: newStatus })
        .eq("id", id)

      if (error) throw error
      await loadRequests()
      alert(`Request status updated to ${newStatus}`)
    } catch (error) {
      console.error("Error updating status:", error)
      alert("Error updating status")
    } finally {
      setProcessingId(null)
    }
  }

  const handleAddFeedback = async (id: string) => {
    setProcessingId(id)
    try {
      const { error } = await supabase
        .from("studio_requests")
        .update({ feedback: feedbackForm.feedback })
        .eq("id", id)

      if (error) throw error
      await loadRequests()
      setFeedbackForm({ requestId: null, feedback: "" })
      alert("Feedback saved successfully!")
    } catch (error) {
      console.error("Error saving feedback:", error)
      alert("Error saving feedback")
    } finally {
      setProcessingId(null)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this studio request? This action cannot be undone.")) {
      return
    }

    setProcessingId(id)
    try {
      const { error } = await supabase
        .from("studio_requests")
        .delete()
        .eq("id", id)

      if (error) throw error
      await loadRequests()
      alert("Studio request deleted successfully!")
    } catch (error) {
      console.error("Error deleting request:", error)
      alert("Error deleting request")
    } finally {
      setProcessingId(null)
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

  const getStatusBadge = (status: StudioProject["status"]) => {
    const colors = {
      pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
      in_progress: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      completed: "bg-green-500/20 text-green-400 border-green-500/30",
      cancelled: "bg-red-500/20 text-red-400 border-red-500/30",
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

  const filteredRequests = requests.filter((req) =>
    filter === "all" ? true : req.status === filter
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
        <title>Studio Requests — Admin — Transubtil Records</title>
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
            <h1 className="font-sans text-4xl font-bold mb-2 uppercase tracking-[0.25em]">Studio Requests</h1>
            <p className="text-white/60 uppercase tracking-[0.25em] text-[11px]">Review and manage mastering/mixing requests</p>
          </div>
        </motion.div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <Filter className="w-5 h-5 text-white/60 hidden sm:block" />
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            {(["all", "pending", "in_progress", "completed", "cancelled"] as FilterType[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-lg uppercase tracking-[0.25em] text-[11px] transition-colors whitespace-nowrap ${
                  filter === f
                    ? "bg-brand-500 text-white"
                    : "bg-white/5 text-white/60 hover:bg-white/10"
                }`}
              >
                {f.replace("_", " ")}
              </button>
            ))}
          </div>
        </div>

        {/* Requests List */}
        {loading ? (
          <div className="text-center py-12 text-white/40 uppercase tracking-[0.25em] text-[11px]">Loading requests...</div>
        ) : filteredRequests.length === 0 ? (
          <div className="text-center py-16 border border-white/10 rounded-2xl">
            <Folder className="w-16 h-16 mx-auto mb-4 text-white/40" />
            <h3 className="text-xl font-semibold mb-2 uppercase tracking-[0.25em]">No requests</h3>
            <p className="text-white/60 uppercase tracking-[0.25em] text-[11px]">
              No {filter === "all" ? "" : filter} requests found
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredRequests.map((request) => {
              const isExpanded = expandedCards.has(request.id)

              return (
                <motion.div
                  key={request.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border border-white/10 rounded-xl hover:border-white/20 transition-all bg-white/5"
                >
                  {/* Compact Header - Always Visible */}
                  <div className="p-3 sm:p-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                      <div className="flex items-center gap-3 flex-1 min-w-0 w-full">
                        <Folder className="w-4 h-4 sm:w-5 sm:h-5 text-brand-500 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base sm:text-lg font-semibold font-sans truncate uppercase tracking-[0.25em]">
                            {request.project_name}
                          </h3>
                          <p className="text-white/60 truncate uppercase tracking-[0.25em] text-[11px]">
                            {request.service_type.replace("-", " + ")} • {request.audio_files.length} file(s)
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start flex-shrink-0">
                        <div
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border uppercase tracking-[0.25em] text-[11px] ${getStatusBadge(
                            request.status
                          )}`}
                        >
                          {getStatusIcon(request.status)}
                          <span className="font-medium">
                            {request.status.replace("_", " ")}
                          </span>
                        </div>

                        <button
                          onClick={() => toggleExpanded(request.id)}
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
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(request.created_at)}
                      </span>
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
                      <div className="p-4 sm:p-6 space-y-4">
                        {/* Full Description */}
                        {request.description && (
                          <div>
                            <p className="uppercase tracking-[0.25em] text-[11px] font-medium text-white/80 mb-1">Description</p>
                            <p className="text-white/70 uppercase tracking-[0.25em] text-[11px] break-words">
                              {request.description}
                            </p>
                          </div>
                        )}

                        {/* Metadata */}
                        <div className="flex items-center gap-4 uppercase tracking-[0.25em] text-[11px] text-white/50">
                          <span className="break-all">Email: {(request as any).userEmail || request.user_id.slice(0, 8) + '...'}</span>
                        </div>

                        {/* Audio Files */}
                        {request.audio_files.length > 0 && (
                          <div className="p-3 sm:p-4 bg-white/5 rounded-lg border border-white/10">
                      <p className="uppercase tracking-[0.25em] text-[11px] font-medium mb-2">Audio Files:</p>
                      <div className="space-y-1">
                        {request.audio_files.map((file: any, index: number) => {
                          const handleDownload = async () => {
                            try {
                              // Create a signed URL for private bucket (valid for 1 hour)
                              const { data, error } = await supabase.storage
                                .from("studio-audio-files")
                                .createSignedUrl(file.url, 3600)

                              if (error) throw error

                              // Download the file
                              window.open(data.signedUrl, '_blank')
                            } catch (error) {
                              console.error("Download error:", error)
                              alert("Failed to download file. Please try again.")
                            }
                          }

                          return (
                            <div key={index} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 uppercase tracking-[0.25em] text-[11px]">
                              <span className="text-white/70 break-all flex-1">{file.name}</span>
                              <button
                                onClick={handleDownload}
                                className="text-brand-300 hover:text-brand-200 flex items-center gap-1 whitespace-nowrap"
                              >
                                <Download className="w-3 h-3" />
                                Download
                              </button>
                            </div>
                          )
                        })}
                          </div>
                          </div>
                        )}

                        {/* Reference Tracks */}
                        {request.reference_tracks && (
                          <div className="p-3 sm:p-4 bg-white/5 rounded-lg border border-white/10">
                            <p className="uppercase tracking-[0.25em] text-[11px] font-medium mb-1">Reference Tracks:</p>
                            <p className="uppercase tracking-[0.25em] text-[11px] text-white/70 break-words">{request.reference_tracks}</p>
                          </div>
                        )}

                        {/* Existing Feedback */}
                        {request.feedback && (
                          <div className="p-3 sm:p-4 bg-white/5 rounded-lg border border-white/10">
                            <div className="flex items-start gap-2">
                              <MessageSquare className="w-4 h-4 mt-0.5 text-brand-500 flex-shrink-0" />
                              <div className="min-w-0 flex-1">
                                <p className="uppercase tracking-[0.25em] text-[11px] font-medium mb-1">Your Feedback</p>
                                <p className="uppercase tracking-[0.25em] text-[11px] text-white/70 break-words">{request.feedback}</p>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex flex-col gap-4 pt-4 border-t border-white/10">
                          {/* Status Buttons */}
                          <div className="grid grid-cols-2 sm:flex gap-2">
                    <button
                      onClick={() => handleUpdateStatus(request.id, "pending")}
                      disabled={processingId === request.id || request.status === "pending"}
                      className="px-4 py-2 bg-yellow-500/20 hover:bg-yellow-500/30 disabled:bg-yellow-500/10 text-yellow-400 disabled:text-yellow-400/50 rounded-lg transition-colors uppercase tracking-[0.25em] text-[11px] disabled:cursor-not-allowed whitespace-nowrap"
                    >
                      Pending
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(request.id, "in_progress")}
                      disabled={processingId === request.id || request.status === "in_progress"}
                      className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 disabled:bg-blue-500/10 text-blue-400 disabled:text-blue-400/50 rounded-lg transition-colors uppercase tracking-[0.25em] text-[11px] disabled:cursor-not-allowed whitespace-nowrap"
                    >
                      In Progress
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(request.id, "completed")}
                      disabled={processingId === request.id || request.status === "completed"}
                      className="px-4 py-2 bg-brand-500 hover:bg-brand-600 disabled:bg-brand-500/50 text-white disabled:text-white/50 rounded-lg transition-colors uppercase tracking-[0.25em] text-[11px] disabled:cursor-not-allowed whitespace-nowrap"
                    >
                      Complete
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(request.id, "cancelled")}
                      disabled={processingId === request.id || request.status === "cancelled"}
                      className="px-4 py-2 bg-transparent hover:bg-red-500/30 disabled:bg-transparent border border-white/20 disabled:border-white/10 text-white disabled:text-white/50 rounded-lg transition-colors uppercase tracking-[0.25em] text-[11px] disabled:cursor-not-allowed whitespace-nowrap"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleDelete(request.id)}
                      disabled={processingId === request.id}
                      className="px-4 py-2 bg-transparent hover:bg-red-600/40 disabled:bg-transparent border border-red-500/30 disabled:border-red-500/10 text-red-400 disabled:text-red-400/50 rounded-lg transition-colors uppercase tracking-[0.25em] text-[11px] disabled:cursor-not-allowed whitespace-nowrap flex items-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                          </div>

                          {/* Feedback Form */}
                          <div className="flex flex-col sm:flex-row gap-2">
                            {feedbackForm.requestId === request.id ? (
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
                                  placeholder="ENTER FEEDBACK FOR THE USER..."
                                  className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:border-brand-500 focus:outline-none text-white uppercase tracking-[0.25em] text-[11px]"
                                />
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => handleAddFeedback(request.id)}
                                    disabled={processingId === request.id}
                                    className="flex-1 sm:flex-none px-4 py-2 bg-brand-500 hover:bg-brand-600 disabled:bg-brand-700 text-white rounded-lg transition-colors uppercase tracking-[0.25em] text-[11px] disabled:cursor-not-allowed whitespace-nowrap"
                                  >
                                    Save
                                  </button>
                                  <button
                                    onClick={() =>
                                      setFeedbackForm({ requestId: null, feedback: "" })
                                    }
                                    className="flex-1 sm:flex-none px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-colors uppercase tracking-[0.25em] text-[11px] whitespace-nowrap"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </>
                            ) : (
                              <button
                                onClick={() =>
                                  setFeedbackForm({
                                    requestId: request.id,
                                    feedback: request.feedback || "",
                                  })
                                }
                                className="w-full sm:w-auto px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-colors flex items-center justify-center gap-2 uppercase tracking-[0.25em] text-[11px]"
                              >
                                <MessageSquare className="w-4 h-4" />
                                {request.feedback ? "Edit Feedback" : "Add Feedback"}
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
