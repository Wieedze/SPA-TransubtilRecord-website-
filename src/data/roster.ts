import rawArtists from "../assets/design/artists.json"

// Roster from the 2026 design handoff (src/assets/design/artists.json).
// `null` fields are content still to be provided by the label.

export type ArtistFormat = "Live" | "DJ"

export interface RosterArtist {
  slug: string
  name: string
  format: ArtistFormat
  style: string
  location: string | null
  photo: string // resolved asset URL
  bio: string | null
  links: {
    soundcloud: string | null
    bandcamp: string | null
    instagram: string | null
  }
  presskitZip: string | null
  rider: string | null
  upcomingDates: unknown[]
}

const photos = import.meta.glob<string>("../assets/design/assets/artists/*.jpg", {
  eager: true,
  query: "?url",
  import: "default",
})

function photoUrl(path: string): string {
  // artists.json stores "assets/artists/<slug>.jpg", relative to the design folder
  return photos[`../assets/design/${path}`] ?? ""
}

export const roster: RosterArtist[] = (rawArtists as Array<Omit<RosterArtist, "photo"> & { photo: string }>).map(
  (artist) => ({ ...artist, photo: photoUrl(artist.photo) })
)

export function getRosterArtist(slug: string): RosterArtist | undefined {
  return roster.find((artist) => artist.slug === slug)
}

// "Psychedelic · Live" / "Forest · Dark · DJ", as shown on cards
export function styleLine(artist: RosterArtist): string {
  return `${artist.style} · ${artist.format}`
}
