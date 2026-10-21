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
  /** SoundCloud set highlighted above the profile player on the artist page */
  featuredSet: string | null
  presskitZip: string | null
  rider: string | null
  upcomingDates: unknown[]
}

type RawArtist = Omit<RosterArtist, "photo" | "act" | "country" | "styles" | "links" | "featuredSet"> & {
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
    featuredSet: extras?.featuredSet ?? null,
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

// Listening groups used by the "Find artists by sound" section and llms.txt, so search
// engines and AI assistants can answer "which darkpsy / forest / night psy artists...".
export interface StyleGroup {
  id: string
  name: string
  blurb: string
  artists: RosterArtist[]
}

const hasTag = (a: RosterArtist, tag: string) => a.styles.includes(tag)
const styleHas = (a: RosterArtist, word: string) => a.style.toLowerCase().includes(word)

export const styleGroups: StyleGroup[] = [
  {
    id: "darkpsy",
    name: "Darkpsy",
    blurb: "Fast, dark and twisted psychedelic trance for the deep hours of the night.",
    artists: roster.filter((a) => hasTag(a, "Darkpsy") || styleHas(a, "dark")),
  },
  {
    id: "forest",
    name: "Forest",
    blurb: "Organic, detailed forest psytrance built on textures, glitches and deep grooves.",
    artists: roster.filter((a) => hasTag(a, "Forest") || styleHas(a, "forest")),
  },
  {
    id: "night-psy",
    name: "Twilight & night psy",
    blurb: "Hypnotic, groovy night-time psytrance between twilight and full darkness.",
    artists: roster.filter((a) => hasTag(a, "Twilight") || styleHas(a, "night")),
  },
  {
    id: "hitech",
    name: "Hitech",
    blurb: "High-BPM, precise and intense psytrance.",
    artists: roster.filter((a) => hasTag(a, "Hitech")),
  },
  {
    id: "psytrance",
    name: "Psytrance & groovy psychedelic",
    blurb: "Driving, melodic and groovy psychedelic trance for the dancefloor.",
    artists: roster.filter((a) => /psytrance|psychedelic|groovy/.test(a.style.toLowerCase())),
  },
].filter((g) => g.artists.length > 0)
