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
      className="group relative"
      style={{ aspectRatio: '398.5 / 594.5' }}
    >
      {/* SVG Frame overlay */}
      <svg
        className="absolute pointer-events-none opacity-40 group-hover:opacity-60 transition-opacity duration-500 z-10"
        style={{
          top: '-3%',
          left: '-3%',
          width: '106%',
          height: '106%'
        }}
        viewBox="0 0 398.5 594.5"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <style>{`.frame-stroke { fill: none; stroke: #fff; stroke-miterlimit: 10; stroke-width: 1.5px; } .frame-fill { fill: #fff; }`}</style>
        </defs>
        {/* Main border */}
        <rect className="frame-stroke" x="12" y="18" width="374.5" height="558.5" />

        {/* Top right corner detail */}
        <path className="frame-stroke" d="M363.7,18c1.7-1.6,3.4-3.2,5.1-4.8c6.7.05,13.4.1,20.1.15.9.8,1.8,1.6,2.7,2.4.1,6.9.2,13.8.3,20.7-1.8,1.8-3.6,3.6-5.4,5.4V18h-22.9Z" />

        {/* Bottom left corner detail */}
        <path className="frame-stroke" d="M35.1,576.9c-1.7,1.6-3.4,3.2-5.1,4.8-6.7-.05-13.4-.1-20.1-.15-.9-.8-1.8-1.6-2.7-2.4-.1-6.9-.2-13.8-.3-20.7,1.8-1.8,3.6-3.6,5.4-5.4v23.9h22.9Z" />

        {/* Left side vertical detail */}
        <path className="frame-stroke" d="M12,219.5c-1.8-1.5-3.6-3.1-5.5-4.6v-113.6c1.8.1,3.6.2,5.5.3v117.9Z" />
        <path className="frame-fill" d="M4.5,100.5c1.7,1.6,3.3,3.3,5,4.9-.02,7.1-.03,14.2-.05,21.3,1.1,1.2,2.3,2.4,3.4,3.6-.003-23.8-.01-47.7-.013-71.5,0-.4,0-.7-.003-1.1.017-7.1.033-14.1.05-21.2,5.9-5.8,11.8-11.6,17.7-17.4,14.5.017,29,.033,43.5.05-2.3-2.2-4.5-4.3-6.8-6.5-17.8-.017-35.7-.033-53.5-.05-2,1.9-4,3.9-6,5.8-.05,13.3-.1,26.7-.15,40-1.1,1.1-2.1,2.1-3.2,3.2,0,12.9,0,25.9,0,38.8Z" />
        <rect className="frame-fill" x="7.9" y="57.5" width="4.8" height="2.1" transform="rotate(180 10.3 58.55)" />
      </svg>

      <Link to={`/artists/${artist.slug}`} className="relative h-full block">
        <div className="relative h-full overflow-hidden hover:shadow-2xl hover:shadow-brand-300/20 transition-all duration-500">
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-brand-900/50 to-brand-900 pointer-events-none" />

          {/* Image */}
          <div className="relative overflow-hidden" style={{ height: '60%' }}>
            <img
              src={artist.image_url}
              alt={artist.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              onError={(e) => {
                // Fallback if image doesn't exist
                e.currentTarget.src = "/images/placeholder.webp"
              }}
            />
            {/* Gradient over image */}
            <div className="absolute inset-0 bg-gradient-to-t from-brand-900 via-brand-900/20 to-transparent" />
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
