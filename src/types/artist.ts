export interface Artist {
  id: number
  name: string
  slug: string
  act: string
  description: string
  style: string[]
  social: {
    soundcloud?: string
    instagram?: string
    facebook?: string
  }
  country: string
  image_url: string
  videos?: string[]
}

export interface BookingRequest {
  artistId: number
  artistName: string
  promoterName: string
  promoterEmail: string
  eventName: string
  eventDate: string
  eventLocation: string
  message: string
}
