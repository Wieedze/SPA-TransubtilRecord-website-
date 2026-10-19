import { Facebook, Instagram, Music2 } from "lucide-react"
import type { RosterArtist } from "../../data/roster"

// Artist social links as icons (v1 SocialLinks). Clicks don't bubble to a parent card link.
export default function SocialIcons({ links, className = "" }: { links: RosterArtist["links"]; className?: string }) {
  const items = [
    links.soundcloud && { href: links.soundcloud, label: "SoundCloud", Icon: Music2 },
    links.instagram && { href: links.instagram, label: "Instagram", Icon: Instagram },
    links.facebook && { href: links.facebook, label: "Facebook", Icon: Facebook },
  ].filter((i): i is { href: string; label: string; Icon: typeof Music2 } => Boolean(i))

  if (items.length === 0) return null
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {items.map(({ href, label, Icon }) => (
        <a
          key={label}
          href={href}
          target="_blank"
          rel="noreferrer"
          aria-label={label}
          onClick={(e) => e.stopPropagation()}
          className="flex h-9 w-9 items-center justify-center rounded-full text-brand-300 transition-colors hover:text-accent"
        >
          <Icon className="h-5 w-5" aria-hidden="true" />
        </a>
      ))}
    </div>
  )
}
