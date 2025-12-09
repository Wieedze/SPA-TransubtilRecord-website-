import { useState } from "react"
import { NavLink, Link } from "react-router-dom"
import { User, ChevronDown, Menu } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useAuth } from "../contexts/AuthContext"
import logoWhite from "../assets/transubtil_logo_white.png"
import MobileMenuModal from "./MobileMenuModal"
import NotificationBell from "./NotificationBell"

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/artists", label: "Artists" },
  { to: "/releases", label: "Releases" },
  { to: "/about", label: "About" },
]

export default function Navbar() {
  const { user, profile, signOut } = useAuth()
  const [showAdminMenu, setShowAdminMenu] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="border-b border-white/10 bg-brand-900/80 backdrop-blur relative z-40">
      <div className="mx-auto max-w-6xl flex items-center justify-between px-4 py-4">
        <Link to="/" className="inline-flex items-center hover:opacity-80 transition-opacity">
          <img
            src={logoWhite}
            alt="Transubtil Records"
            className="h-10 md:h-12"
          />
        </Link>

        <div className="flex items-center gap-6">
          <nav className="hidden md:flex items-center gap-6 text-sm">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  [
                    "uppercase tracking-[0.25em] text-[11px] relative",
                    "px-4 py-2",
                    isActive
                      ? "text-white"
                      : "text-white/60 hover:text-white",
                  ].join(" ")
                }
                style={{
                  filter: 'drop-shadow(0 0 0px rgba(250, 244, 211, 0))',
                  transition: 'filter 0s, filter 0.6s ease-out'
                }}
                onMouseDown={(e) => {
                  e.currentTarget.style.transition = 'filter 0s';
                  e.currentTarget.style.filter = 'drop-shadow(0 0 20px rgba(250, 244, 211, 1)) drop-shadow(0 0 10px rgba(250, 244, 211, 1))';
                }}
                onMouseUp={(e) => {
                  e.currentTarget.style.transition = 'filter 0.6s ease-out';
                  e.currentTarget.style.filter = 'drop-shadow(0 0 0px rgba(250, 244, 211, 0))';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transition = 'filter 0.6s ease-out';
                  e.currentTarget.style.filter = 'drop-shadow(0 0 0px rgba(250, 244, 211, 0))';
                }}
              >
                {({ isActive }) => (
                  <>
                    <AnimatePresence>
                      {isActive && (
                        <motion.svg
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 0.4 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.5, exit: { duration: 1.2, ease: "easeOut" } }}
                          className="absolute inset-0 w-full h-full pointer-events-none"
                          viewBox="0 0 243 103"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          preserveAspectRatio="none"
                        >
                          <path d="M235.648 6.82544H7.46014V96.1511H235.648V6.82544Z" stroke="white" strokeWidth="4" strokeMiterlimit="10"/>
                          <path d="M221.638 6.82563C222.687 6.21513 223.738 5.60464 224.788 4.99414C228.892 5.01249 232.999 5.03207 237.103 5.05042C237.652 5.35995 238.199 5.6707 238.748 5.98023C238.812 8.51642 238.873 11.0526 238.936 13.5888C237.84 14.2556 236.742 14.9223 235.646 15.5891V6.82563H221.636H221.638Z" stroke="white" strokeWidth="4" strokeMiterlimit="10"/>
                          <path d="M21.468 96.2C20.4189 96.8105 19.3678 97.421 18.3186 98.0315C14.214 98.0131 10.1074 97.9936 6.00281 97.9752C5.45376 97.6657 4.90675 97.3549 4.3577 97.0454C4.29443 94.5092 4.2332 91.973 4.16992 89.4368C5.26598 88.7701 6.36408 88.1033 7.46013 87.4365C7.46013 90.3581 7.46013 93.2784 7.46013 96.2C12.1301 96.2 16.8001 96.2 21.4701 96.2H21.468Z" stroke="white" strokeWidth="4" strokeMiterlimit="10"/>
                          <path d="M235.646 22.6741C236.758 23.2381 237.869 23.8009 238.981 24.3649V65.8994C237.869 65.8614 236.758 65.8247 235.646 65.7868V22.6741Z" stroke="white" strokeWidth="4" strokeMiterlimit="10"/>
                          <path d="M240.336 66.1294C239.322 65.5323 238.308 64.9365 237.293 64.3395C237.303 61.747 237.314 59.1533 237.324 56.5608C236.63 56.1167 235.934 55.6714 235.24 55.2273C235.242 63.948 235.246 72.6698 235.248 81.3905C235.248 81.5263 235.248 81.6621 235.25 81.7979C235.24 84.3843 235.23 86.9706 235.219 89.5557C231.605 91.6784 227.99 93.8011 224.375 95.9237C215.507 95.9176 206.636 95.9115 197.768 95.9054C199.148 96.7006 200.525 97.4958 201.905 98.2911C212.81 98.2972 223.718 98.3033 234.623 98.3094C235.846 97.5962 237.069 96.8817 238.291 96.1684C238.322 91.2796 238.352 86.3919 238.383 81.5031C239.034 81.1103 239.685 80.7176 240.338 80.3249V66.1294H240.336Z" fill="white"/>
                        </motion.svg>
                      )}
                    </AnimatePresence>
                    <span className="relative z-10">{link.label}</span>
                  </>
                )}
              </NavLink>
            ))}
            {user && (
              <NavLink
                to="/dashboard"
                className={({ isActive }) =>
                  [
                    "uppercase tracking-[0.25em] text-[11px] relative",
                    "px-4 py-2",
                    isActive
                      ? "text-white"
                      : "text-white/60 hover:text-white",
                  ].join(" ")
                }
                style={{
                  filter: 'drop-shadow(0 0 0px rgba(250, 244, 211, 0))',
                  transition: 'filter 0s, filter 0.6s ease-out'
                }}
                onMouseDown={(e) => {
                  e.currentTarget.style.transition = 'filter 0s';
                  e.currentTarget.style.filter = 'drop-shadow(0 0 20px rgba(250, 244, 211, 1)) drop-shadow(0 0 10px rgba(250, 244, 211, 1))';
                }}
                onMouseUp={(e) => {
                  e.currentTarget.style.transition = 'filter 0.6s ease-out';
                  e.currentTarget.style.filter = 'drop-shadow(0 0 0px rgba(250, 244, 211, 0))';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transition = 'filter 0.6s ease-out';
                  e.currentTarget.style.filter = 'drop-shadow(0 0 0px rgba(250, 244, 211, 0))';
                }}
              >
                {({ isActive }) => (
                  <>
                    <AnimatePresence>
                      {isActive && (
                        <motion.svg
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 0.4 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.5, exit: { duration: 1.2, ease: "easeOut" } }}
                          className="absolute inset-0 w-full h-full pointer-events-none"
                          viewBox="0 0 243 103"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          preserveAspectRatio="none"
                        >
                          <path d="M235.648 6.82544H7.46014V96.1511H235.648V6.82544Z" stroke="white" strokeWidth="4" strokeMiterlimit="10"/>
                          <path d="M221.638 6.82563C222.687 6.21513 223.738 5.60464 224.788 4.99414C228.892 5.01249 232.999 5.03207 237.103 5.05042C237.652 5.35995 238.199 5.6707 238.748 5.98023C238.812 8.51642 238.873 11.0526 238.936 13.5888C237.84 14.2556 236.742 14.9223 235.646 15.5891V6.82563H221.636H221.638Z" stroke="white" strokeWidth="4" strokeMiterlimit="10"/>
                          <path d="M21.468 96.2C20.4189 96.8105 19.3678 97.421 18.3186 98.0315C14.214 98.0131 10.1074 97.9936 6.00281 97.9752C5.45376 97.6657 4.90675 97.3549 4.3577 97.0454C4.29443 94.5092 4.2332 91.973 4.16992 89.4368C5.26598 88.7701 6.36408 88.1033 7.46013 87.4365C7.46013 90.3581 7.46013 93.2784 7.46013 96.2C12.1301 96.2 16.8001 96.2 21.4701 96.2H21.468Z" stroke="white" strokeWidth="4" strokeMiterlimit="10"/>
                          <path d="M235.646 22.6741C236.758 23.2381 237.869 23.8009 238.981 24.3649V65.8994C237.869 65.8614 236.758 65.8247 235.646 65.7868V22.6741Z" stroke="white" strokeWidth="4" strokeMiterlimit="10"/>
                          <path d="M240.336 66.1294C239.322 65.5323 238.308 64.9365 237.293 64.3395C237.303 61.747 237.314 59.1533 237.324 56.5608C236.63 56.1167 235.934 55.6714 235.24 55.2273C235.242 63.948 235.246 72.6698 235.248 81.3905C235.248 81.5263 235.248 81.6621 235.25 81.7979C235.24 84.3843 235.23 86.9706 235.219 89.5557C231.605 91.6784 227.99 93.8011 224.375 95.9237C215.507 95.9176 206.636 95.9115 197.768 95.9054C199.148 96.7006 200.525 97.4958 201.905 98.2911C212.81 98.2972 223.718 98.3033 234.623 98.3094C235.846 97.5962 237.069 96.8817 238.291 96.1684C238.322 91.2796 238.352 86.3919 238.383 81.5031C239.034 81.1103 239.685 80.7176 240.338 80.3249V66.1294H240.336Z" fill="white"/>
                        </motion.svg>
                      )}
                    </AnimatePresence>
                    <span className="relative z-10">Dashboard</span>
                  </>
                )}
              </NavLink>
            )}
            {user && profile?.role === "admin" && (
              <div
                className="relative"
                onMouseEnter={() => setShowAdminMenu(true)}
                onMouseLeave={() => setShowAdminMenu(false)}
              >
                <button
                  className="flex items-center gap-1 uppercase tracking-[0.25em] text-[11px] text-white/60 hover:text-white transition-colors"
                >
                  Admin
                  <ChevronDown className="w-3 h-3" />
                </button>

                {showAdminMenu && (
                  <div className="absolute top-full left-0 pt-2 w-48 z-50">
                    <div className="bg-brand-900 border border-white/10 rounded-lg shadow-lg overflow-hidden">
                    <NavLink
                      to="/admin/submissions"
                      className={({ isActive }) =>
                        `block px-4 py-2 uppercase tracking-[0.25em] text-[11px] transition-colors ${
                          isActive
                            ? "bg-brand-500 text-white"
                            : "text-white/80 hover:bg-white/5 hover:text-white"
                        }`
                      }
                    >
                      Demo Received
                    </NavLink>
                    <NavLink
                      to="/admin/studio-requests"
                      className={({ isActive }) =>
                        `block px-4 py-2 uppercase tracking-[0.25em] text-[11px] transition-colors ${
                          isActive
                            ? "bg-brand-500 text-white"
                            : "text-white/80 hover:bg-white/5 hover:text-white"
                        }`
                      }
                    >
                      Studio Requests
                    </NavLink>
                    </div>
                  </div>
                )}
              </div>
            )}
          </nav>

          {/* Auth Section - Desktop */}
          <div className="hidden md:flex items-center gap-4">
            {/* Notification Bell - Only for admin */}
            {user && profile?.role === "admin" && (
              <NotificationBell userId={user.id} />
            )}

            {user ? (
              <Link
                to="/dashboard"
                className="flex items-center gap-2 text-xs text-white/60 hover:text-white transition-colors"
              >
                <User className="w-4 h-4" />
                <span className="hidden sm:inline">{profile?.full_name || user.email}</span>
              </Link>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="px-4 py-2 text-white/80 hover:text-white text-xs uppercase tracking-wider transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="px-4 py-2 border border-white/40 hover:border-white/80 hover:bg-white/5 text-white text-xs uppercase tracking-wider rounded-lg transition-all"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Burger Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-white hover:text-white/80 transition-colors"
            aria-label="Toggle menu"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Mobile Menu Modal */}
      <MobileMenuModal
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        user={user}
        profile={profile}
        signOut={signOut}
        navLinks={navLinks}
        isAdmin={profile?.role === "admin"}
      />
    </header>
  )
}
