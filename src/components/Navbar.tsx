import { useState } from "react"
import { NavLink, Link } from "react-router-dom"
import { User, ChevronDown } from "lucide-react"
import { useAuth } from "../contexts/AuthContext"
import logoWhite from "../assets/transubtil_logo_white.png"

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/artists", label: "Artists" },
  { to: "/releases", label: "Releases" },
  { to: "/about", label: "About" },
]

export default function Navbar() {
  const { user, profile } = useAuth()
  const [showAdminMenu, setShowAdminMenu] = useState(false)

  return (
    <header className="border-b border-white/10 bg-brand-900/80 backdrop-blur">
      <div className="mx-auto max-w-6xl flex items-center justify-between px-4 py-4">
        <Link to="/" className="inline-flex items-center hover:opacity-80 transition-opacity">
          <img
            src={logoWhite}
            alt="Transubtil Records"
            className="h-12"
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
                    "uppercase tracking-[0.25em] text-[11px]",
                    "transition-colors",
                    isActive
                      ? "text-white"
                      : "text-white/60 hover:text-white",
                  ].join(" ")
                }
              >
                {link.label}
              </NavLink>
            ))}
            {user && (
              <NavLink
                to="/dashboard"
                className={({ isActive }) =>
                  [
                    "uppercase tracking-[0.25em] text-[11px]",
                    "transition-colors",
                    isActive
                      ? "text-white"
                      : "text-white/60 hover:text-white",
                  ].join(" ")
                }
              >
                Dashboard
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
                    <div className="bg-brand-800 border border-white/10 rounded-lg shadow-lg overflow-hidden">
                    <NavLink
                      to="/admin/submissions"
                      className={({ isActive }) =>
                        `block px-4 py-2 text-sm transition-colors ${
                          isActive
                            ? "bg-brand-500 text-white"
                            : "text-white/80 hover:bg-white/5 hover:text-white"
                        }`
                      }
                    >
                      Label Submissions
                    </NavLink>
                    <NavLink
                      to="/admin/studio-requests"
                      className={({ isActive }) =>
                        `block px-4 py-2 text-sm transition-colors ${
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

          {/* Auth Section */}
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
      </div>
    </header>
  )
}
