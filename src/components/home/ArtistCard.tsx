import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import type { RosterArtist } from "../../data/roster"
import DecryptedText from "../DecryptedText"
import SocialIcons from "../site/SocialIcons"
import { useHoverCount } from "../../hooks/useHoverCount"

// Artist card: 2026 design + v1 interactions (slow photo zoom, name scrambling on
// hover, country and social links).
export default function ArtistCard({ artist, showDetails = false }: { artist: RosterArtist; showDetails?: boolean }) {
  const { count, hoverProps } = useHoverCount()
  const place = artist.location ?? artist.country

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="group relative"
      {...hoverProps}
    >
      <Link to={`/artists/${artist.slug}`} className="flex flex-col gap-3.5 text-bone hover:text-bone">
        <div className="relative aspect-[4/5] overflow-hidden bg-brand-800">
          <img
            src={artist.photo}
            alt={artist.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        </div>
        <div className="flex flex-col gap-1.5 px-1">
          <span className="font-display text-[15px] font-semibold uppercase transition-colors group-hover:text-accent md:text-[19px]">
            <DecryptedText text={artist.name} trigger={count} speed={50} maxIterations={6} />
          </span>
          <span className="text-[11px] uppercase tracking-[0.12em] text-brand-300 md:text-xs">
            {artist.style} · <span className="text-accent">{artist.format}</span>
          </span>
        </div>
      </Link>
      {showDetails && (place || artist.links.soundcloud || artist.links.instagram || artist.links.facebook) && (
        <div className="relative z-20 mt-2 flex items-center justify-between gap-2 border-t border-brand-700 px-1 pt-2">
          <span className="text-small text-brand-300">{place}</span>
          <SocialIcons links={artist.links} className="-mr-2 gap-0" />
        </div>
      )}
    </motion.div>
  )
}
