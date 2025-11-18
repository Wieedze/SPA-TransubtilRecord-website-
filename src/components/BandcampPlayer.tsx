interface BandcampPlayerProps {
  albumId: string
  type?: "album" | "track"
  artwork?: "small" | "large"
  size?: "small" | "large"
}

export default function BandcampPlayer({
  albumId,
  type = "album",
  artwork = "large",
  size = "large",
}: BandcampPlayerProps) {
  const height = size === "large" ? 470 : 120
  const artworkSize = artwork === "large" ? "large" : "small"
  const embedType = type === "track" ? "track" : "album"

  return (
    <iframe
      style={{
        border: 0,
        width: "100%",
        height: `${height}px`,
      }}
      src={`https://bandcamp.com/EmbeddedPlayer/${embedType}=${albumId}/size=${size}/bgcol=030008/linkcol=ffffff/tracklist=false/artwork=${artworkSize}/transparent=true/`}
      seamless
      title="Bandcamp Player"
      className="rounded-xl"
    >
      <a href="https://transubtilrec.bandcamp.com">Transubtil Rec on Bandcamp</a>
    </iframe>
  )
}

// Compact version for release cards
export function BandcampPlayerCompact({ albumId }: { albumId: string }) {
  return (
    <BandcampPlayer albumId={albumId} artwork="small" size="small" />
  )
}
