import { NavLink, Link } from "react-router-dom"
import { User, LogOut } from "lucide-react"
import { useAuth } from "../contexts/AuthContext"
import logoWhite from "../assets/transubtil_logo_white.png"

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/artists", label: "Artists" },
  { to: "/releases", label: "Releases" },
  { to: "/about", label: "About" },
]

export default function Navbar() {
  const { user, profile, signOut } = useAuth()

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
          </nav>

          {/* Auth Section */}
          {user ? (
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2 text-xs text-white/60">
                <User className="w-4 h-4" />
                <span>{profile?.full_name || user.email}</span>
              </div>
              <button
                onClick={() => signOut()}
                className="px-4 py-2 border border-white/20 hover:border-white/40 hover:bg-white/5 text-white text-xs uppercase tracking-wider rounded-lg transition-all flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
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
