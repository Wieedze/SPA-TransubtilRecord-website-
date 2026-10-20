import { AnimatePresence, motion } from "framer-motion"
import { X } from "lucide-react"
import { PLAYER_BAR_HEIGHT, usePlayer } from "../../contexts/PlayerContext"
import { useConsent } from "../../contexts/ConsentContext"
import EmbedConsent from "./EmbedConsent"

// Bottom bar with Bandcamp's standard slim player (large size, small artwork, no
// tracklist: cover, release and track names, play/pause, previous/next, seek bar; at
// most 700 px wide) for the release picked anywhere on the site. Bandcamp
// embeds can't be driven from outside or autoplay: the visitor uses its own controls.
export default function MiniPlayer() {
  const { current, close } = usePlayer()
  const { embedsAllowed } = useConsent()

  return (
    <AnimatePresence>
      {current && (
        <motion.div
          key="mini-player"
          role="region"
          aria-label="Music player"
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="fixed inset-x-0 bottom-0 z-40 border-t border-brand-700 bg-brand-950/95 backdrop-blur"
          style={{ height: PLAYER_BAR_HEIGHT }}
        >
          <div className="mx-auto flex h-full max-w-page items-center gap-3 px-4 md:gap-4 md:px-6">
            {embedsAllowed ? (
              <iframe
                key={current.id}
                title={`${current.title} on Bandcamp`}
                src={`https://bandcamp.com/EmbeddedPlayer/${current.type === "track" ? "track" : "album"}=${current.bandcampId}/size=large/bgcol=07060b/linkcol=f9bc14/artwork=small/tracklist=false/transparent=true/`}
                className="mx-auto h-[120px] w-full min-w-0 max-w-[700px] border-0"
                seamless
              />
            ) : (
              <div className="mx-auto w-full min-w-0 max-w-[700px]">
                <EmbedConsent service="Bandcamp" href={current.bandcampUrl} compact />
              </div>
            )}
            <button
              type="button"
              onClick={close}
              aria-label="Close the player"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[2px] text-brand-300 hover:text-accent"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
