import { AnimatePresence, motion } from "framer-motion"
import { X } from "lucide-react"
import { PLAYER_BAR_HEIGHT, usePlayer } from "../../contexts/PlayerContext"

// Bottom bar with Bandcamp's compact player for the release picked anywhere on the
// site. Bandcamp embeds can't autoplay: the visitor presses play inside the bar.
export default function MiniPlayer() {
  const { current, close } = usePlayer()

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
            <img src={current.coverUrl} alt="" className="h-11 w-11 shrink-0 object-cover" />
            <div className="hidden min-w-0 flex-col md:flex md:w-[240px]">
              <span className="truncate text-sm font-semibold text-bone">{current.title}</span>
              <span className="truncate text-xs text-brand-300">{current.artist}</span>
            </div>
            <iframe
              key={current.id}
              title={`${current.title} on Bandcamp`}
              src={`https://bandcamp.com/EmbeddedPlayer/${current.type === "track" ? "track" : "album"}=${current.bandcampId}/size=small/bgcol=07060b/linkcol=f9bc14/transparent=true/`}
              className="h-[42px] min-w-0 flex-1 border-0"
              seamless
            />
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
