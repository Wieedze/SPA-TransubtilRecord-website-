interface BandcampPlayerProps {
  albumId: string
  type?: "album" | "track"
  artwork?: "small" | "large" | "none"
  size?: "small" | "large"
}

export default function BandcampPlayer({
  albumId,
  type = "album",
  artwork = "large",
  size = "large",
}: BandcampPlayerProps) {
  // Large size is 470 px tall with the big artwork, 120 px without it
  const height = size === "large" && artwork === "large" ? 470 : 120
  const artworkSize = artwork
  const embedType = type === "track" ? "track" : "album"

  return (
    <iframe
      style={{
        border: 0,
        width: "100%",
        height: `${height}px`,
      }}
      src={`https://bandcamp.com/EmbeddedPlayer/${embedType}=${albumId}/size=${size}/bgcol=030008/linkcol=f9bc14/tracklist=false/artwork=${artworkSize}/transparent=true/`}
      seamless
      title="Bandcamp Player"
      className=""
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
