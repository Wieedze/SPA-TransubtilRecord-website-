import { useCallback, useEffect, useState } from "react"
import { createPortal } from "react-dom"
import { Link, NavLink, useLocation } from "react-router-dom"
import { AnimatePresence, motion } from "framer-motion"
import logo from "../../assets/brand/transubtil-logo-white.svg"
import { BOOKING_PATH, NAV_LINKS, activeSocialLinks } from "../../config/site"
import DecryptedText from "../DecryptedText"
import { glowFlashProps } from "./glowFlash"
import { useHoverCount } from "../../hooks/useHoverCount"

function Wordmark({ compact = false }: { compact?: boolean }) {
  return (
    <Link to="/" className="flex items-center hover:opacity-80">
      <img src={logo} alt="Transubtil Records, home" className={compact ? "h-9" : "h-9 md:h-12"} />
    </Link>
  )
}

function MobileMenu({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose()
    document.addEventListener("keydown", onKey)
    const previousOverflow = document.documentElement.style.overflow
    document.documentElement.style.overflow = "hidden"
    return () => {
      document.removeEventListener("keydown", onKey)
      document.documentElement.style.overflow = previousOverflow
    }
  }, [onClose])

  return createPortal(
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label="Menu"
      className="fixed inset-0 z-[60] flex flex-col bg-brand-950"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex h-[68px] items-center justify-between border-b border-brand-700 px-4">
        <Wordmark compact />
        <button
          type="button"
          onClick={onClose}
          aria-label="Close menu"
          className="flex h-11 w-11 items-center justify-center rounded-[2px] bg-accent text-brand-950"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      </div>

      <nav aria-label="Menu" className="flex flex-col px-4 py-8">
        {NAV_LINKS.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === "/"}
            onClick={onClose}
            {...glowFlashProps}
            className={({ isActive }) =>
              [
                "border-b border-brand-700 py-[18px] font-display text-[22px]",
                isActive ? "text-accent" : "text-bone hover:text-accent",
              ].join(" ")
            }
          >
            {link.label}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto flex flex-col gap-[18px] px-4 pb-8">
        <Link to={BOOKING_PATH} onClick={onClose} className="btn-primary h-12">
          Book an artist
        </Link>
        <div className="flex justify-center gap-[22px] text-sm font-semibold">
          {activeSocialLinks.map((link) => (
            <a key={link.label} href={link.href} target="_blank" rel="noreferrer" className="text-brand-300 hover:text-accent">
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </motion.div>,
    document.body
  )
}

function DesktopNavLink({ to, label }: { to: string; label: string }) {
  const { count, hoverProps } = useHoverCount()
  return (
    <NavLink
      to={to}
      end={to === "/"}
      {...hoverProps}
      {...glowFlashProps}
      className={({ isActive }) =>
        ["border-b-2 py-1.5", isActive ? "border-accent text-accent" : "border-transparent text-bone hover:text-accent"].join(" ")
      }
    >
      <DecryptedText text={label} trigger={count} speed={45} maxIterations={6} />
    </NavLink>
  )
}

export default function SiteNav() {
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()
  const closeMenu = useCallback(() => setMenuOpen(false), [])

  // Close the mobile menu on navigation
  useEffect(() => setMenuOpen(false), [location.pathname])

  return (
    <header className="w-full border-b border-brand-700 bg-brand-950/90 backdrop-blur">
      <nav
        aria-label="Main navigation"
        className="mx-auto flex h-[68px] max-w-page items-center justify-between gap-6 px-4 md:h-24 md:px-6"
      >
        <Wordmark />

        <div className="hidden items-center gap-8 text-[17px] font-medium lg:flex">
          {NAV_LINKS.map((link) => (
            <DesktopNavLink key={link.to} to={link.to} label={link.label} />
          ))}
        </div>

        <Link to={BOOKING_PATH} className="btn-primary hidden h-10 px-5 text-sm lg:inline-flex">
          Book an artist
        </Link>

        <button
          type="button"
          onClick={() => setMenuOpen(true)}
          aria-label="Open menu"
          aria-expanded={menuOpen}
          className="inline-flex h-11 w-11 items-center justify-center rounded-[2px] border border-brand-700 text-bone lg:hidden"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <path d="M4 7h16M4 12h16M4 17h10" />
          </svg>
        </button>
      </nav>

      <AnimatePresence>{menuOpen && <MobileMenu onClose={closeMenu} />}</AnimatePresence>
    </header>
  )
}
