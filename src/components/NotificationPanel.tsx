import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { X, CheckCheck, Loader2 } from "lucide-react"
import type { Notification } from "../lib/supabase"
import { formatDistanceToNow } from "date-fns"

interface NotificationPanelProps {
  notifications: Notification[]
  loading: boolean
  onClose: () => void
  onMarkAsRead: (id: string) => void
  onMarkAllAsRead: () => void
}

export default function NotificationPanel({
  notifications,
  loading,
  onClose,
  onMarkAsRead,
  onMarkAllAsRead,
}: NotificationPanelProps) {
  const navigate = useNavigate()

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      onMarkAsRead(notification.id)
    }
    if (notification.link) {
      navigate(notification.link)
      onClose()
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="absolute top-full right-0 pt-2 w-80 sm:w-96 z-50">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="bg-brand-900 border border-white/10 rounded-lg shadow-lg max-h-[32rem] flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-white/10">
            <div className="flex items-center gap-1">

              {notifications.some((n) => !n.read) && (
                <button
                  onClick={onMarkAllAsRead}
                  className="p-2 text-white/60 hover:text-white transition-colors"
                  title="Mark all as read"
                >
                  <CheckCheck className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={onClose}
                className="p-2 text-white/60 hover:text-white transition-colors"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="overflow-y-auto flex-1">
            {loading ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="w-6 h-6 animate-spin text-white/60" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-white/60 uppercase tracking-[0.25em] text-[11px]">
                  No notifications yet
                </p>
              </div>
            ) : (
              <div className="divide-y divide-white/10">
                {notifications.map((notification) => (
                  <button
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`w-full text-left p-4 transition-colors hover:bg-white/5 ${
                      !notification.read ? "bg-brand-300/10" : ""
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Unread indicator */}
                      <div className="flex-shrink-0 mt-1">
                        {!notification.read && (
                          <div className="w-2 h-2 bg-brand-300 rounded-full"></div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm mb-1 uppercase tracking-[0.15em]">
                          {notification.title}
                        </h4>
                        <p className="text-white/70 text-xs mb-2 uppercase tracking-[0.25em]">
                          {notification.message}
                        </p>
                        <p className="text-white/40 text-[10px] uppercase tracking-[0.25em]">
                          {formatDistanceToNow(new Date(notification.created_at), {
                            addSuffix: true,
                          })}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </>
  )
}
