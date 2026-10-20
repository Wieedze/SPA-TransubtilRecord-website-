import { AnimatePresence, motion } from "framer-motion"
import { Link } from "react-router-dom"
import { useConsent } from "../../contexts/ConsentContext"

// Small consent bar above the player bar. Accept and Decline weigh the same, and
// declining keeps the whole site usable: players then load only on an explicit click.
export default function CookieBanner() {
  const { bannerOpen, choice, setChoice } = useConsent()

  return (
    <AnimatePresence>
      {bannerOpen && (
        <motion.div
          key="cookie-banner"
          role="dialog"
          aria-live="polite"
          aria-label="Cookie consent"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="fixed inset-x-0 z-50 px-4 pb-4 md:px-6"
          style={{ bottom: "var(--player-h, 0px)" }}
        >
          <div className="mx-auto flex max-w-[760px] flex-wrap items-center gap-x-6 gap-y-4 rounded-[2px] border border-brand-700 bg-brand-950/95 px-5 py-4 backdrop-blur">
            <p className="min-w-0 flex-[1_1_320px] text-small leading-relaxed text-body">
              We don't track you. The Bandcamp and SoundCloud players set their own cookies, so they only load if you
              allow them.{" "}
              <Link to="/legal#cookies" className="underline underline-offset-2 hover:text-accent">
                Privacy
              </Link>
            </p>
            <div className="flex shrink-0 gap-3">
              <button type="button" onClick={() => setChoice("denied")} className="btn-secondary">
                {choice === "denied" ? "Keep declined" : "Decline"}
              </button>
              <button type="button" onClick={() => setChoice("granted")} className="btn-primary">
                Allow players
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
