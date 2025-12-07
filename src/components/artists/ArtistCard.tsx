import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import type { Artist } from "../../types/artist"
import SocialLinks from "./SocialLinks"
import fondSvg from "../../assets/fond.svg"

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
        <div className="relative rounded-xl overflow-hidden hover:shadow-2xl hover:shadow-brand-300/20 transition-all duration-500">
          {/* Background SVG Pattern */}
          <div
            className="absolute inset-0 opacity-30 group-hover:opacity-40 transition-opacity duration-500"
            style={{
              backgroundImage: `url(${fondSvg})`,
              backgroundSize: 'contain',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
            }}
          />

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-brand-900/50 to-brand-900" />

          {/* Image */}
          <div className="relative aspect-square overflow-hidden">
            <img
              src={artist.image_url}
              alt={artist.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 mix-blend-luminosity group-hover:mix-blend-normal"
              onError={(e) => {
                // Fallback if image doesn't exist
                e.currentTarget.src = "/images/placeholder.webp"
              }}
            />
            {/* Gradient over image */}
            <div className="absolute inset-0 bg-gradient-to-t from-brand-900 via-brand-900/40 to-transparent" />
          </div>

          {/* Content */}
          <div className="relative p-6 space-y-4 bg-gradient-to-b from-brand-900/80 to-brand-900">
            <div>
              <h3 className="font-display text-2xl font-bold capitalize tracking-wide">
                {artist.name}
              </h3>
              <p className="text-sm text-brand-300/80 mt-1 uppercase tracking-wider">
                {artist.act}
              </p>
            </div>

            {/* Styles */}
            <div className="flex flex-wrap gap-2">
              {artist.style.map((style) => (
                <span
                  key={style}
                  className="text-[10px] px-3 py-1.5 rounded-full bg-brand-500/20 border border-brand-500/30 text-brand-300 uppercase tracking-wider font-medium"
                >
                  {style}
                </span>
              ))}
            </div>

            {/* Country & Social */}
            <div className="flex items-center justify-between pt-3 border-t border-brand-300/10">
              <p className="text-xs text-brand-300/60 uppercase tracking-[0.3em] font-medium">
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
