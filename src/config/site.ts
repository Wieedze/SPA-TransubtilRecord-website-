// Site-wide navigation and label links. `null` = not provided yet, hidden in the UI.

export const NAV_LINKS = [
  { to: "/", label: "Home" },
  { to: "/artists", label: "Artists" },
  { to: "/releases", label: "Releases" },
  { to: "/label", label: "Label" },
  { to: "/contact", label: "Contact" },
] as const

// Promoters pick an artist first, then use the booking form on the artist page
export const BOOKING_PATH = "/artists"

export const SOCIAL_LINKS: Array<{ label: string; href: string | null }> = [
  { label: "SoundCloud", href: "https://soundcloud.com/transubtil" },
  { label: "Bandcamp", href: "https://transubtilrec.bandcamp.com" },
  { label: "YouTube", href: null },
  { label: "Instagram", href: null },
  { label: "TikTok", href: null },
]

export const activeSocialLinks = SOCIAL_LINKS.filter(
  (link): link is { label: string; href: string } => link.href !== null
)
