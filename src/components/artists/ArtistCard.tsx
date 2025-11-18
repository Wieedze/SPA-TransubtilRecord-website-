import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import type { Artist } from "../../types/artist"
import SocialLinks from "./SocialLinks"

interface ArtistCardProps {
  artist: Artist
}

export default function ArtistCard({ artist }: ArtistCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="group"
    >
      <Link to={`/artists/${artist.slug}`}>
        <div className="border border-white/10 rounded-xl overflow-hidden hover:border-brand-300/60 hover:shadow-lg hover:shadow-brand-500/20 transition-all">
          {/* Image */}
          <div className="aspect-square bg-brand-700 overflow-hidden">
            <img
              src={artist.image_url}
              alt={artist.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                // Fallback if image doesn't exist
                e.currentTarget.src = "/images/placeholder.webp"
              }}
            />
          </div>

          {/* Content */}
          <div className="p-4 space-y-3">
            <div>
              <h3 className="text-lg font-semibold capitalize">{artist.name}</h3>
              <p className="text-xs text-white/60 mt-1">{artist.act}</p>
            </div>

            {/* Styles */}
            <div className="flex flex-wrap gap-1">
              {artist.style.map((style) => (
                <span
                  key={style}
                  className="text-[10px] px-2 py-1 rounded-full bg-brand-700/50 text-brand-300 uppercase tracking-wider"
                >
                  {style}
                </span>
              ))}
            </div>

            {/* Country & Social */}
            <div className="flex items-center justify-between pt-2 border-t border-white/5">
              <p className="text-[11px] text-white/40 uppercase tracking-[0.25em]">
                {artist.country}
              </p>
              <SocialLinks social={artist.social} />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
