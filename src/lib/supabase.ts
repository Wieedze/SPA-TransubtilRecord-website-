import { createClient } from "@supabase/supabase-js"

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "⚠️ Supabase credentials not found. Please create a .env.local file with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY"
  )
}

export const supabase = createClient(
  supabaseUrl || "https://placeholder.supabase.co",
  supabaseAnonKey || "placeholder-key"
)

// Database types (will be generated from Supabase later)
export interface Profile {
  id: string
  role: "user" | "client" | "artist" | "admin" | "superadmin"
  full_name: string | null
  company: string | null
  has_studio_access: boolean
  linked_artist_id: number | null
  created_at: string
}

export interface StudioRequest {
  id: string
  user_id: string
  project_name: string
  service_type: "mixing" | "mastering" | "mix-master" | "production"
  description: string
  status: "pending" | "in_progress" | "completed" | "cancelled"
  audio_files: string[]
  reference_tracks: string | null
  deadline: string | null
  created_at: string
}

export interface Booking {
  id: string
  artist_id: number
  promoter_name: string
  promoter_email: string
  event_name: string
  event_date: string
  event_location: string
  budget_range: string
  message: string
  status: "pending" | "confirmed" | "declined"
  created_at: string
}

export interface NewsletterSubscriber {
  id: string
  email: string
  preferences: {
    news?: boolean
    releases?: boolean
  }
  subscribed: boolean
  subscribed_at: string
}

export interface LabelSubmission {
  id: string
  user_id: string
  track_title: string
  artist_name: string
  genre: string | null
  file_url: string
  description: string | null
  status: "pending" | "approved" | "rejected"
  feedback: string | null
  created_at: string
  profiles?: {
    full_name: string | null
  }
}

export interface Notification {
  id: string
  user_id: string
  type: "label_submission" | "studio_request" | "booking"
  title: string
  message: string
  link: string | null
  read: boolean
  created_at: string
}


