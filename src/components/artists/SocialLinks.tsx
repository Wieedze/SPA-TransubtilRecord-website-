import { Music2, Instagram, Facebook } from "lucide-react"
import type { Artist } from "../../types/artist"

interface SocialLinksProps {
  social: Artist["social"]
  className?: string
}

export default function SocialLinks({ social, className = "" }: SocialLinksProps) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {social.soundcloud && (
        <a
          href={social.soundcloud}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="text-white/60 hover:text-brand-300 transition-colors"
          aria-label="SoundCloud"
        >
          <Music2 className="w-5 h-5" />
        </a>
      )}
      {social.instagram && (
        <a
          href={social.instagram}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="text-white/60 hover:text-brand-300 transition-colors"
          aria-label="Instagram"
        >
          <Instagram className="w-5 h-5" />
        </a>
      )}
      {social.facebook && (
        <a
          href={social.facebook}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="text-white/60 hover:text-brand-300 transition-colors"
          aria-label="Facebook"
        >
          <Facebook className="w-5 h-5" />
        </a>
      )}
    </div>
  )
}
