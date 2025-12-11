import { supabase } from "./supabase"

// =============================================
// TYPES
// =============================================
export interface Artist {
  id: number
  name: string
  slug: string
  act: string
  description: string
  style: string[]
  country: string
  image_url: string
  social: {
    soundcloud?: string
    instagram?: string
    facebook?: string
  }
  videos: string[]
  created_at?: string
  updated_at?: string
}

export interface Release {
  id: number
  title: string
  artist: string
  type: "album" | "ep" | "track" | "compilation"
  release_date: string
  catalog_number: string
  cover_url: string
  bandcamp_url: string
  bandcamp_id: string
  description?: string
  tracklist?: string[]
  created_at?: string
  updated_at?: string
}

// Helper to generate slug
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}

// =============================================
// ARTISTS CRUD
// =============================================

export async function getArtists(): Promise<Artist[]> {
  const { data, error } = await supabase
    .from("artists")
    .select("*")
    .order("name", { ascending: true })

  if (error) {
    console.error("Error fetching artists:", error)
    throw error
  }

  return data || []
}

export async function getArtistBySlug(slug: string): Promise<Artist | null> {
  const { data, error } = await supabase
    .from("artists")
    .select("*")
    .eq("slug", slug)
    .single()

  if (error) {
    if (error.code === "PGRST116") return null // Not found
    console.error("Error fetching artist:", error)
    throw error
  }

  return data
}

export async function getArtistById(id: number): Promise<Artist | null> {
  const { data, error } = await supabase
    .from("artists")
    .select("*")
    .eq("id", id)
    .single()

  if (error) {
    if (error.code === "PGRST116") return null
    throw error
  }

  return data
}

export async function createArtist(
  artist: Omit<Artist, "id" | "slug" | "created_at" | "updated_at">
): Promise<Artist> {
  const slug = slugify(artist.name)

  const { data, error } = await supabase
    .from("artists")
    .insert({
      ...artist,
      slug,
    })
    .select()
    .single()

  if (error) {
    console.error("Error creating artist:", error)
    throw error
  }

  return data
}

export async function updateArtist(
  id: number,
  updates: Partial<Omit<Artist, "id" | "created_at" | "updated_at">>
): Promise<Artist> {
  // If name is being updated, also update slug
  const updateData = updates.name
    ? { ...updates, slug: slugify(updates.name) }
    : updates

  const { data, error } = await supabase
    .from("artists")
    .update(updateData)
    .eq("id", id)
    .select()
    .single()

  if (error) {
    console.error("Error updating artist:", error)
    throw error
  }

  return data
}

export async function deleteArtist(id: number): Promise<void> {
  const { error } = await supabase.from("artists").delete().eq("id", id)

  if (error) {
    console.error("Error deleting artist:", error)
    throw error
  }
}

export async function getAllStyles(): Promise<string[]> {
  const { data, error } = await supabase.from("artists").select("style")

  if (error) throw error

  const styles = new Set<string>()
  data?.forEach((artist) => {
    artist.style?.forEach((s: string) => styles.add(s))
  })

  return Array.from(styles).sort()
}

export async function getAllCountries(): Promise<string[]> {
  const { data, error } = await supabase.from("artists").select("country")

  if (error) throw error

  const countries = new Set<string>()
  data?.forEach((artist) => countries.add(artist.country))

  return Array.from(countries).sort()
}

// =============================================
// RELEASES CRUD
// =============================================

export async function getReleases(): Promise<Release[]> {
  const { data, error } = await supabase
    .from("releases")
    .select("*")
    .order("id", { ascending: false }) // Newest first

  if (error) {
    console.error("Error fetching releases:", error)
    throw error
  }

  return data || []
}

export async function getReleaseById(id: number): Promise<Release | null> {
  const { data, error } = await supabase
    .from("releases")
    .select("*")
    .eq("id", id)
    .single()

  if (error) {
    if (error.code === "PGRST116") return null
    throw error
  }

  return data
}

export async function getReleasesByArtist(artistName: string): Promise<Release[]> {
  const { data, error } = await supabase
    .from("releases")
    .select("*")
    .or(`artist.ilike.%${artistName}%,title.ilike.%${artistName}%`)
    .order("id", { ascending: false })

  if (error) throw error

  return data || []
}

export async function getReleasesByType(
  type: Release["type"]
): Promise<Release[]> {
  const { data, error } = await supabase
    .from("releases")
    .select("*")
    .eq("type", type)
    .order("id", { ascending: false })

  if (error) throw error

  return data || []
}

export async function getReleasesByYear(year: string): Promise<Release[]> {
  const { data, error } = await supabase
    .from("releases")
    .select("*")
    .ilike("release_date", `%${year}%`)
    .order("id", { ascending: false })

  if (error) throw error

  return data || []
}

export async function createRelease(
  release: Omit<Release, "id" | "created_at" | "updated_at">
): Promise<Release> {
  const { data, error } = await supabase
    .from("releases")
    .insert(release)
    .select()
    .single()

  if (error) {
    console.error("Error creating release:", error)
    throw error
  }

  return data
}

export async function updateRelease(
  id: number,
  updates: Partial<Omit<Release, "id" | "created_at" | "updated_at">>
): Promise<Release> {
  const { data, error } = await supabase
    .from("releases")
    .update(updates)
    .eq("id", id)
    .select()
    .single()

  if (error) {
    console.error("Error updating release:", error)
    throw error
  }

  return data
}

export async function deleteRelease(id: number): Promise<void> {
  const { error } = await supabase.from("releases").delete().eq("id", id)

  if (error) {
    console.error("Error deleting release:", error)
    throw error
  }
}
