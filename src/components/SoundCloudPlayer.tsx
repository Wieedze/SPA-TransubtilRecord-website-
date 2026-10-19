import { useEffect, useState } from "react"

interface SoundCloudPlayerProps {
  soundcloudUrl: string
  artistName: string
  height?: number
  autoPlay?: boolean
  visual?: boolean
}

export default function SoundCloudPlayer({
  soundcloudUrl,
  artistName,
  height = 450,
  autoPlay = false,
  visual = true,
}: SoundCloudPlayerProps) {
  const [embedUrl, setEmbedUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    // Extract SoundCloud URL and convert to embed format
    const extractEmbedUrl = () => {
      try {
        // If it's already a SoundCloud URL (profile or track)
        if (soundcloudUrl.includes("soundcloud.com")) {
          // Build embed URL
          const params = new URLSearchParams({
            url: soundcloudUrl,
            color: "#F9BC14", // accent
            auto_play: autoPlay.toString(),
            hide_related: "true",
            show_comments: "false",
            show_user: "true",
            show_reposts: "false",
            show_teaser: "false",
            visual: visual.toString(),
          })

          setEmbedUrl(
            `https://w.soundcloud.com/player/?${params.toString()}`
          )
          setIsLoading(false)
        } else {
          setError(true)
          setIsLoading(false)
        }
      } catch (err) {
        console.error("Error creating SoundCloud embed:", err)
        setError(true)
        setIsLoading(false)
      }
    }

    extractEmbedUrl()
  }, [soundcloudUrl, autoPlay, visual])

  if (isLoading) {
    return (
      <div
        className="w-full bg-brand-700/20 border border-white/10 flex items-center justify-center"
        style={{ height: `${height}px` }}
      >
        <div className="animate-pulse text-white/40">Loading player...</div>
      </div>
    )
  }

  if (error || !embedUrl) {
    return (
      <div
        className="w-full bg-brand-700/20 border border-white/10 flex flex-col items-center justify-center gap-3 p-6"
        style={{ height: `${height}px` }}
      >
        <p className="text-white/40 text-sm">Unable to load SoundCloud player</p>
        <a
          href={soundcloudUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-accent hover:text-accent-hover text-sm underline"
        >
          Open on SoundCloud
        </a>
      </div>
    )
  }

  return (
    <div className="w-full">
      <iframe
        width="100%"
        height={height}
        scrolling="no"
        frameBorder="no"
        allow="autoplay"
        src={embedUrl}
        title={`${artistName} on SoundCloud`}
        className=""
      />
    </div>
  )
}

// Helper component for multiple tracks (playlist view)
export function SoundCloudPlaylist({
  playlistUrl,
  artistName,
  height = 450,
}: {
  playlistUrl: string
  artistName: string
  height?: number
}) {
  return (
    <SoundCloudPlayer
      soundcloudUrl={playlistUrl}
      artistName={artistName}
      height={height}
      visual={false}
      autoPlay={false}
    />
  )
}
