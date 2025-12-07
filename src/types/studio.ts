export interface StudioRequestForm {
  projectName: string
  serviceType: "mixing" | "mastering" | "mix-master" | "production"
  description: string
  referenceTracks: string
  audioFiles: File[]
}

export interface StudioProject {
  id: string
  user_id: string
  project_name: string
  service_type: "mixing" | "mastering" | "mix-master" | "production"
  description: string
  status: "pending" | "in_progress" | "completed" | "cancelled"
  audio_files: AudioFile[]
  reference_tracks: string | null
  feedback: string | null
  created_at: string
}

export interface AudioFile {
  name: string
  size: number
  url: string
  uploaded_at: string
}
