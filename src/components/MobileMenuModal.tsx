import { createPortal } from "react-dom"
import { NavLink, Link } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { X, User } from "lucide-react"

interface MobileMenuModalProps {
  isOpen: boolean
  onClose: () => void
  user: any
  profile: any
  signOut: () => void
  navLinks: Array<{ to: string; label: string }>
  isAdmin: boolean
}

export default function MobileMenuModal({
  isOpen,
  onClose,
  user,
  profile,
  signOut,
  navLinks,
  isAdmin,
}: MobileMenuModalProps) {
  if (!isOpen) return null

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-brand-900"
            style={{
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
              zIndex: 9999,
            }}
            onClick={onClose}
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 flex flex-col items-center justify-center p-8"
            style={{ zIndex: 10000 }}
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-8 right-8 p-3 text-white hover:text-white/80 transition-colors"
              aria-label="Close menu"
            >
              <X className="w-8 h-8" />
            </button>

            {/* Navigation Links */}
            <nav className="flex flex-col items-center gap-8 mb-8">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `uppercase tracking-[0.25em] text-2xl font-medium transition-colors text-center ${
                      isActive ? "text-white" : "text-white/60"
                    }`
                  }
                  style={{
                    filter: "drop-shadow(0 0 0px rgba(250, 244, 211, 0))",
                    transition: "filter 0s, filter 0.6s ease-out, color 0.3s",
                  }}
                  onTouchStart={(e) => {
                    e.currentTarget.style.transition = "filter 0s"
                    e.currentTarget.style.filter =
                      "drop-shadow(0 0 20px rgba(250, 244, 211, 1)) drop-shadow(0 0 10px rgba(250, 244, 211, 1))"
                  }}
                  onTouchEnd={(e) => {
                    e.currentTarget.style.transition = "filter 0.6s ease-out"
                    e.currentTarget.style.filter =
                      "drop-shadow(0 0 0px rgba(250, 244, 211, 0))"
                  }}
                >
                  {link.label}
                </NavLink>
              ))}

              {/* Dashboard Link */}
              {user && (
                <NavLink
                  to="/dashboard"
                  onClick={onClose}
                  className={({ isActive }) =>
                    `uppercase tracking-[0.25em] text-2xl font-medium transition-colors text-center ${
                      isActive ? "text-white" : "text-white/60"
                    }`
                  }
                  style={{
                    filter: "drop-shadow(0 0 0px rgba(250, 244, 211, 0))",
                    transition: "filter 0s, filter 0.6s ease-out, color 0.3s",
                  }}
                  onTouchStart={(e) => {
                    e.currentTarget.style.transition = "filter 0s"
                    e.currentTarget.style.filter =
                      "drop-shadow(0 0 20px rgba(250, 244, 211, 1)) drop-shadow(0 0 10px rgba(250, 244, 211, 1))"
                  }}
                  onTouchEnd={(e) => {
                    e.currentTarget.style.transition = "filter 0.6s ease-out"
                    e.currentTarget.style.filter =
                      "drop-shadow(0 0 0px rgba(250, 244, 211, 0))"
                  }}
                >
                  Dashboard
                </NavLink>
              )}

              {/* Admin Links */}
              {isAdmin && (
                <>
                  <NavLink
                    to="/admin/submissions"
                    onClick={onClose}
                    className={({ isActive }) =>
                      `uppercase tracking-[0.25em] text-2xl font-medium transition-colors text-center ${
                        isActive ? "text-white" : "text-white/60"
                      }`
                    }
                    style={{
                      filter: "drop-shadow(0 0 0px rgba(250, 244, 211, 0))",
                      transition: "filter 0s, filter 0.6s ease-out, color 0.3s",
                    }}
                    onTouchStart={(e) => {
                      e.currentTarget.style.transition = "filter 0s"
                      e.currentTarget.style.filter =
                        "drop-shadow(0 0 20px rgba(250, 244, 211, 1)) drop-shadow(0 0 10px rgba(250, 244, 211, 1))"
                    }}
                    onTouchEnd={(e) => {
                      e.currentTarget.style.transition = "filter 0.6s ease-out"
                      e.currentTarget.style.filter =
                        "drop-shadow(0 0 0px rgba(250, 244, 211, 0))"
                    }}
                  >
                    Demo Received
                  </NavLink>
                  <NavLink
                    to="/admin/studio-requests"
                    onClick={onClose}
                    className={({ isActive }) =>
                      `uppercase tracking-[0.25em] text-2xl font-medium transition-colors text-center ${
                        isActive ? "text-white" : "text-white/60"
                      }`
                    }
                    style={{
                      filter: "drop-shadow(0 0 0px rgba(250, 244, 211, 0))",
                      transition: "filter 0s, filter 0.6s ease-out, color 0.3s",
                    }}
                    onTouchStart={(e) => {
                      e.currentTarget.style.transition = "filter 0s"
                      e.currentTarget.style.filter =
                        "drop-shadow(0 0 20px rgba(250, 244, 211, 1)) drop-shadow(0 0 10px rgba(250, 244, 211, 1))"
                    }}
                    onTouchEnd={(e) => {
                      e.currentTarget.style.transition = "filter 0.6s ease-out"
                      e.currentTarget.style.filter =
                        "drop-shadow(0 0 0px rgba(250, 244, 211, 0))"
                    }}
                  >
                    Studio Requests
                  </NavLink>
                  <NavLink
                    to="/admin/catalogue"
                    onClick={onClose}
                    className={({ isActive }) =>
                      `uppercase tracking-[0.25em] text-2xl font-medium transition-colors text-center ${
                        isActive ? "text-white" : "text-white/60"
                      }`
                    }
                    style={{
                      filter: "drop-shadow(0 0 0px rgba(250, 244, 211, 0))",
                      transition: "filter 0s, filter 0.6s ease-out, color 0.3s",
                    }}
                    onTouchStart={(e) => {
                      e.currentTarget.style.transition = "filter 0s"
                      e.currentTarget.style.filter =
                        "drop-shadow(0 0 20px rgba(250, 244, 211, 1)) drop-shadow(0 0 10px rgba(250, 244, 211, 1))"
                    }}
                    onTouchEnd={(e) => {
                      e.currentTarget.style.transition = "filter 0.6s ease-out"
                      e.currentTarget.style.filter =
                        "drop-shadow(0 0 0px rgba(250, 244, 211, 0))"
                    }}
                  >
                    Catalogue
                  </NavLink>
                  <NavLink
                    to="/admin/instagram-generator"
                    onClick={onClose}
                    className={({ isActive }) =>
                      `uppercase tracking-[0.25em] text-2xl font-medium transition-colors text-center ${
                        isActive ? "text-white" : "text-white/60"
                      }`
                    }
                    style={{
                      filter: "drop-shadow(0 0 0px rgba(250, 244, 211, 0))",
                      transition: "filter 0s, filter 0.6s ease-out, color 0.3s",
                    }}
                    onTouchStart={(e) => {
                      e.currentTarget.style.transition = "filter 0s"
                      e.currentTarget.style.filter =
                        "drop-shadow(0 0 20px rgba(250, 244, 211, 1)) drop-shadow(0 0 10px rgba(250, 244, 211, 1))"
                    }}
                    onTouchEnd={(e) => {
                      e.currentTarget.style.transition = "filter 0.6s ease-out"
                      e.currentTarget.style.filter =
                        "drop-shadow(0 0 0px rgba(250, 244, 211, 0))"
                    }}
                  >
                    Instagram Generator
                  </NavLink>
                  <NavLink
                    to="/admin/my-drive"
                    onClick={onClose}
                    className={({ isActive }) =>
                      `uppercase tracking-[0.25em] text-2xl font-medium transition-colors text-center ${
                        isActive ? "text-white" : "text-white/60"
                      }`
                    }
                    style={{
                      filter: "drop-shadow(0 0 0px rgba(250, 244, 211, 0))",
                      transition: "filter 0s, filter 0.6s ease-out, color 0.3s",
                    }}
                    onTouchStart={(e) => {
                      e.currentTarget.style.transition = "filter 0s"
                      e.currentTarget.style.filter =
                        "drop-shadow(0 0 20px rgba(250, 244, 211, 1)) drop-shadow(0 0 10px rgba(250, 244, 211, 1))"
                    }}
                    onTouchEnd={(e) => {
                      e.currentTarget.style.transition = "filter 0.6s ease-out"
                      e.currentTarget.style.filter =
                        "drop-shadow(0 0 0px rgba(250, 244, 211, 0))"
                    }}
                  >
                    My Drive
                  </NavLink>
                </>
              )}
            </nav>

            {/* Auth Section */}
            <div className="border-t border-white/20 pt-8 flex flex-col items-center gap-4 w-full max-w-xs">
              {user ? (
                <>
                  <div className="flex items-center gap-3 text-white/70">
                    <User className="w-5 h-5" />
                    <span className="text-sm uppercase tracking-[0.25em]">
                      {profile?.full_name || user.email}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      signOut()
                      onClose()
                    }}
                    className="w-full px-6 py-3 border border-white/40 hover:border-white/80 hover:bg-white/5 text-white text-sm uppercase tracking-[0.25em] rounded-lg transition-all"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <div className="flex flex-col gap-3 w-full">
                  <Link
                    to="/login"
                    onClick={onClose}
                    className="w-full px-6 py-3 text-white/80 hover:text-white text-sm uppercase tracking-[0.25em] transition-colors text-center"
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    onClick={onClose}
                    className="w-full px-6 py-3 border border-white/40 hover:border-white/80 hover:bg-white/5 text-white text-sm uppercase tracking-[0.25em] rounded-lg transition-all text-center"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )

  return createPortal(modalContent, document.body)
}
