export interface Release {
  id: number
  title: string
  artist: string
  type: "album" | "ep" | "track" | "compilation"
  releaseDate: string
  catalogNumber: string
  coverUrl: string
  bandcampUrl: string
  bandcampId: string // For embed player
  description?: string
  tracklist?: string[]
}
