import { forwardRef } from "react"
import type { Release } from "../lib/catalogue"
import { Music, Calendar, Disc3 } from "lucide-react"

interface ReleaseMockupProps {
  release: Release
  format: "instagram-portrait" | "instagram-square" | "story"
}

const ReleaseMockup = forwardRef<HTMLDivElement, ReleaseMockupProps>(
  ({ release, format }, ref) => {
    // Dimensions selon le format
    const dimensions = {
      "instagram-portrait": { width: 1080, height: 1350 }, // 4:5
      "instagram-square": { width: 1080, height: 1080 }, // 1:1
      story: { width: 1080, height: 1920 }, // 9:16
    }

    const { width, height } = dimensions[format]
    const scale = 0.4 // Scale pour l'affichage preview

    const typeLabels: Record<string, string> = {
      album: "Album",
      ep: "EP",
      track: "Single",
      compilation: "Compilation",
    }

    return (
      <div
        ref={ref}
        className="relative"
        style={{
          width: width * scale,
          height: height * scale,
          overflow: "hidden",
          backgroundColor: "#262626",
        }}
      >
        {/* Background */}
        <div
          className="absolute inset-0"
          style={{ backgroundColor: "#262626" }}
        />

        {/* Decorative grid lines */}
        <svg
          className="absolute inset-0 w-full h-full opacity-5"
          viewBox={`0 0 ${width} ${height}`}
          preserveAspectRatio="none"
        >
          {[...Array(20)].map((_, i) => (
            <line
              key={`v-${i}`}
              x1={(width / 20) * i}
              y1="0"
              x2={(width / 20) * i}
              y2={height}
              stroke="#fff"
              strokeWidth="1"
            />
          ))}
          {[...Array(25)].map((_, i) => (
            <line
              key={`h-${i}`}
              x1="0"
              y1={(height / 25) * i}
              x2={width}
              y2={(height / 25) * i}
              stroke="#fff"
              strokeWidth="1"
            />
          ))}
        </svg>

        {/* Content Container */}
        <div
          className="absolute"
          style={{
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "85%",
            height: "90%",
          }}
        >
          <div className="w-full h-full flex flex-col items-center justify-center p-4">
            {/* Release Type Badge */}
            <div
              className="flex items-center gap-1.5 mb-3"
              style={{ fontSize: `${10 * scale * 2.5}px` }}
            >
              <Disc3 style={{ width: `${14 * scale * 2.5}px`, height: `${14 * scale * 2.5}px` }} className="text-brand-acid" />
              <span className="uppercase tracking-[0.3em] text-brand-acid font-medium">
                {typeLabels[release.type] || release.type}
              </span>
            </div>

            {/* Cover Art with glow */}
            <div
              className="relative mb-4"
              style={{
                width: format === "story" ? "65%" : "75%",
                aspectRatio: "1/1",
                filter: "drop-shadow(0 0 20px rgba(250, 244, 211, 0.3))",
              }}
            >
              {/* Decorative frame */}
              <div className="absolute -inset-2 border border-white/20 rounded-lg" />
              <div className="absolute -inset-4 border border-white/10 rounded-lg" />

              {/* Cover image */}
              <div className="w-full h-full rounded-lg overflow-hidden border-2 border-white/30">
                <img
                  src={release.cover_url}
                  alt={release.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Corner accents */}
              <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-brand-acid" />
              <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-brand-acid" />
              <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-brand-acid" />
              <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-brand-acid" />
            </div>

            {/* Release Info */}
            <div className="text-center space-y-2 mt-2">
              {/* Catalog Number */}
              {release.catalog_number && (
                <p
                  className="uppercase tracking-[0.3em] text-white/40"
                  style={{ fontSize: `${9 * scale * 2.5}px` }}
                >
                  {release.catalog_number}
                </p>
              )}

              {/* Title */}
              <h1
                className="font-display font-bold capitalize text-white leading-tight"
                style={{ fontSize: `${24 * scale * 2.5}px` }}
              >
                {release.title}
              </h1>

              {/* Artist */}
              <div
                className="flex items-center justify-center gap-1.5 text-white/70"
                style={{ fontSize: `${12 * scale * 2.5}px` }}
              >
                <Music style={{ width: `${14 * scale * 2.5}px`, height: `${14 * scale * 2.5}px` }} />
                <span className="uppercase tracking-[0.2em]">{release.artist}</span>
              </div>

              {/* Release Date */}
              <div
                className="flex items-center justify-center gap-1.5 text-white/50"
                style={{ fontSize: `${10 * scale * 2.5}px` }}
              >
                <Calendar style={{ width: `${12 * scale * 2.5}px`, height: `${12 * scale * 2.5}px` }} />
                <span className="uppercase tracking-[0.2em]">{release.release_date}</span>
              </div>

              {/* Tracklist preview (if available) */}
              {release.tracklist && release.tracklist.length > 0 && (
                <div
                  className="mt-3 pt-3 border-t border-white/10"
                  style={{ fontSize: `${9 * scale * 2.5}px` }}
                >
                  <p className="uppercase tracking-[0.2em] text-white/40 mb-2">Tracklist</p>
                  <div className="space-y-1">
                    {release.tracklist.slice(0, 4).map((track, i) => (
                      <p key={i} className="text-white/60 truncate">
                        {i + 1}. {track}
                      </p>
                    ))}
                    {release.tracklist.length > 4 && (
                      <p className="text-white/40">+ {release.tracklist.length - 4} more</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Outer HUD Frame */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none z-30"
          viewBox={`0 0 ${width} ${height}`}
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <style>{`
              .hud-stroke {
                fill: none;
                stroke: #fff;
                stroke-width: 2px;
                opacity: 0.3;
              }
              .hud-accent {
                fill: none;
                stroke: #FAF4D3;
                stroke-width: 1.5px;
                opacity: 0.5;
              }
            `}</style>
          </defs>

          {/* Main border */}
          <rect
            className="hud-stroke"
            x="30"
            y="30"
            width={width - 60}
            height={height - 60}
          />

          {/* Top right corner detail */}
          <path
            className="hud-stroke"
            d={`M${width - 110},30 L${width - 110},15 L${width - 15},15 L${width - 15},110`}
          />
          <path
            className="hud-accent"
            d={`M${width - 90},30 L${width - 90},35 L${width - 35},35 L${width - 35},90`}
          />

          {/* Bottom left corner detail */}
          <path
            className="hud-stroke"
            d={`M110,${height - 30} L110,${height - 15} L15,${height - 15} L15,${height - 110}`}
          />
          <path
            className="hud-accent"
            d={`M90,${height - 30} L90,${height - 35} L35,${height - 35} L35,${height - 90}`}
          />

          {/* Side accents */}
          <line className="hud-accent" x1="30" y1={height * 0.3} x2="15" y2={height * 0.3} />
          <line className="hud-accent" x1="15" y1={height * 0.3} x2="15" y2={height * 0.5} />
          <line className="hud-accent" x1={width - 30} y1={height * 0.5} x2={width - 15} y2={height * 0.5} />
          <line className="hud-accent" x1={width - 15} y1={height * 0.5} x2={width - 15} y2={height * 0.7} />
        </svg>

        {/* Logo watermark */}
        <div
          className="absolute z-40 flex items-center"
          style={{
            bottom: 45 * scale,
            right: 45 * scale,
          }}
        >
          <span
            className="font-display text-white/50 uppercase tracking-[0.3em]"
            style={{ fontSize: `${20 * scale}px` }}
          >
            Transubtil Records
          </span>
        </div>

        {/* Top label */}
        <div
          className="absolute z-40"
          style={{
            top: 45 * scale,
            left: 45 * scale,
          }}
        >
          <span
            className="text-brand-acid/60 uppercase tracking-[0.2em] font-mono"
            style={{ fontSize: `${11 * scale}px` }}
          >
            New Release
          </span>
        </div>

        {/* "Out Now" or "Coming Soon" badge */}
        <div
          className="absolute z-40"
          style={{
            top: 45 * scale,
            right: 45 * scale,
          }}
        >
          <span
            className="px-2 py-1 bg-brand-acid text-brand-900 uppercase tracking-[0.15em] font-bold rounded"
            style={{ fontSize: `${9 * scale}px` }}
          >
            Out Now
          </span>
        </div>
      </div>
    )
  }
)

ReleaseMockup.displayName = "ReleaseMockup"

export default ReleaseMockup
