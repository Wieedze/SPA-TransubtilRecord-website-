import rawArtists from "../assets/design/artists.json"
import { artistExtras } from "./artistExtras"
import { releases } from "./releases"
import type { Release } from "../types/release"

// Roster from the 2026 design handoff (src/assets/design/artists.json), enriched with
// the v1 catalogue info (act, country, style tags, social links) from artistExtras.ts.
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
  act: string
  country: string | null
  styles: string[]
  links: {
    soundcloud: string | null
    bandcamp: string | null
    instagram: string | null
    facebook: string | null
  }
  presskitZip: string | null
  rider: string | null
  upcomingDates: unknown[]
}

type RawArtist = Omit<RosterArtist, "photo" | "act" | "country" | "styles" | "links"> & {
  photo: string
  links: { soundcloud: string | null; bandcamp: string | null; instagram: string | null }
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

export const roster: RosterArtist[] = (rawArtists as RawArtist[]).map((artist) => {
  const extras = artistExtras[artist.slug]
  return {
    ...artist,
    photo: photoUrl(artist.photo),
    act: extras?.act ?? (artist.format === "Live" ? "Live Act" : "Dj Set"),
    country: extras?.country ?? null,
    styles: extras?.styles ?? artist.style.split(" · "),
    links: {
      soundcloud: artist.links.soundcloud ?? extras?.soundcloud ?? null,
      bandcamp: artist.links.bandcamp,
      instagram: artist.links.instagram ?? extras?.instagram ?? null,
      facebook: extras?.facebook ?? null,
    },
  }
})

export function getRosterArtist(slug: string): RosterArtist | undefined {
  return roster.find((artist) => artist.slug === slug)
}

export const allStyles = [...new Set(roster.flatMap((a) => a.styles))].sort()
export const allCountries = [...new Set(roster.map((a) => a.country).filter((c): c is string => Boolean(c)))].sort()

// Releases on the label by this artist (artist field or title mentioning the name)
export function releasesByArtist(artist: RosterArtist): Release[] {
  const name = artist.name.toLowerCase()
  return releases.filter((r) => r.artist.toLowerCase().includes(name) || r.title.toLowerCase().includes(name))
}
