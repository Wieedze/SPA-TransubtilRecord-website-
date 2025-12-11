import { motion } from "framer-motion"
import type { Artist } from "../types/artist"
import { forwardRef } from "react"
import { MapPin, Music2, Instagram, Facebook } from "lucide-react"
import artistHeaderLine from "../assets/artist_header_line.svg"

interface PhoneMockupProps {
  artist: Artist
  format: "instagram-portrait" | "instagram-square" | "story"
}

// Composant HubArtiste statique (sans animation pour l'export)
function HubArtisteStatic() {
  return (
    <svg
      width="306"
      height="307"
      viewBox="0 0 306 307"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
    >
      <g clipPath="url(#clip0_phone)">
        <path
          d="M62.5494 63.4266C65.8103 66.7397 71.0207 66.8535 74.4696 63.7694C95.4421 45.0729 122.937 33.7065 152.982 33.7065C183.026 33.7065 210.502 45.0729 231.494 63.7694C234.961 66.8535 240.171 66.7397 243.432 63.4266C246.956 59.8283 246.862 53.9071 243.095 50.5562C219.03 29.0609 187.487 16 153.001 16C118.514 16 86.9707 29.0609 62.9055 50.5562C59.1571 53.9071 59.0259 59.8283 62.5682 63.4266"
          fill="white"
        />
        <path
          d="M243.404 244.554C240.142 241.293 234.938 241.142 231.45 244.177C210.409 262.424 182.975 273.489 152.997 273.489C123.018 273.489 95.5846 262.424 74.5425 244.177C71.0545 241.142 65.8505 241.293 62.5888 244.554C59.0063 248.117 59.1572 254.017 62.947 257.315C87.0809 278.276 118.568 291 152.997 291C187.425 291 218.912 278.276 243.046 257.315C246.855 253.997 246.987 248.117 243.404 244.554Z"
          fill="white"
        />
        <path
          d="M153 26.7695C83.3813 26.7695 26.7551 83.6135 26.7551 153.5C26.7551 223.386 83.3813 280.231 153 280.231C222.618 280.231 279.245 223.367 279.245 153.5C279.245 83.6323 222.618 26.7695 153 26.7695ZM153 283.981C81.3156 283.981 23 225.441 23 153.481C23 81.5212 81.3156 23 153 23C224.684 23 283 81.5406 283 153.5C283 225.46 224.684 284 153 284"
          fill="white"
        />
        <path
          d="M277.669 127L268.743 129.929C267.609 137.877 260.65 142.019 257.075 143.66C257.435 147.112 257.624 150.62 257.624 154.164C257.624 157.933 257.397 161.646 257 165.302C260.574 166.907 267.628 171.048 268.762 179.071L277.688 182C277.688 182 282 175.731 282 154.5C282 133.269 277.688 127 277.688 127"
          fill="white"
        />
        <path
          d="M29.1392 127L37.708 129.929C38.7972 137.877 45.4599 142.019 48.9274 143.66C48.5825 147.112 48.4009 150.62 48.4009 154.164C48.4009 157.933 48.6187 161.646 49 165.302C45.587 166.907 38.8154 171.048 37.708 179.071L29.1392 182C29.1392 182 25 175.731 25 154.5C25 133.269 29.1392 127 29.1392 127Z"
          fill="white"
        />
        <path
          d="M153 20.1095C79.7236 20.1095 20.1055 79.9503 20.1055 153.5C20.1055 227.05 79.7236 286.872 153 286.872C226.277 286.872 285.894 227.032 285.894 153.5C285.894 79.969 226.258 20.1095 153 20.1095ZM153 287.981C79.124 287.981 19 227.652 19 153.481C19 79.3104 79.105 19 153 19C226.895 19 287 79.3298 287 153.5C287 227.671 226.895 288 153 288"
          fill="white"
        />
        <path
          d="M153 9.27892C73.7399 9.27892 9.26455 73.9718 9.26455 153.5C9.26455 233.028 73.7399 297.721 153 297.721C232.26 297.721 296.736 233.028 296.736 153.5C296.736 73.9718 232.242 9.27892 153 9.27892ZM153 302C71.3914 302 5 235.384 5 153.5C5 71.6155 71.3914 5 153 5C234.609 5 301 71.6155 301 153.5C301 235.384 234.609 302 153 302Z"
          fill="white"
        />
        <path
          d="M153 1.28263C69.3368 1.28263 1.27845 69.5634 1.27845 153.5C1.27845 237.437 69.3368 305.718 153 305.718C236.663 305.718 304.722 237.437 304.722 153.5C304.722 69.5634 236.644 1.28263 153 1.28263ZM153 306.981C68.6412 306.981 0 238.135 0 153.5C0 68.8658 68.6412 0 153 0C237.359 0 306 68.8658 306 153.5C306 238.135 237.359 307 153 307"
          fill="white"
        />
      </g>
      <defs>
        <clipPath id="clip0_phone">
          <rect width="306" height="307" fill="white" />
        </clipPath>
      </defs>
    </svg>
  )
}

const PhoneMockup = forwardRef<HTMLDivElement, PhoneMockupProps>(
  ({ artist, format }, ref) => {
    // Dimensions selon le format
    const dimensions = {
      "instagram-portrait": { width: 1080, height: 1350 }, // 4:5
      "instagram-square": { width: 1080, height: 1080 }, // 1:1
      story: { width: 1080, height: 1920 }, // 9:16
    }

    const { width, height } = dimensions[format]
    const scale = 0.4 // Scale pour l'affichage preview

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
        {/* Background - same as site */}
        <div
          className="absolute inset-0"
          style={{ backgroundColor: "#262626" }}
        />

        {/* Decorative grid lines - subtle */}
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

        {/* Content Container - Centered */}
        <div
          className="absolute"
          style={{
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "80%",
            height: "85%",
          }}
        >
          {/* Artist Profile Content */}
          <div
            className="w-full h-full overflow-hidden"
            style={{
              backgroundColor: "#262626",
            }}
          >
            {/* Mobile Artist Profile Layout */}
            <div className="w-full h-full flex flex-col p-3 overflow-hidden">

              {/* Hero Section with Hub Frame */}
              <div
                className="relative mx-auto flex-shrink-0"
                style={{
                  width: "70%",
                  aspectRatio: "1/1",
                  filter: "drop-shadow(0 0 8px rgba(250, 244, 211, 0.3))",
                }}
              >
                {/* SVG ClipPath for circular image */}
                <svg width="0" height="0" style={{ position: "absolute" }}>
                  <defs>
                    <clipPath id="hub-circle-clip-phone" clipPathUnits="objectBoundingBox">
                      <circle cx="0.5" cy="0.5" r="0.42" />
                    </clipPath>
                  </defs>
                </svg>

                {/* Hub Artiste Frame */}
                <div className="absolute inset-0 w-full h-full z-10 opacity-90">
                  <HubArtisteStatic />
                </div>

                {/* Artist Image - clipped to circle */}
                <div
                  className="absolute w-full h-full"
                  style={{ clipPath: "url(#hub-circle-clip-phone)" }}
                >
                  <img
                    src={artist.image_url}
                    alt={artist.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Artist Info Section */}
              <div className="flex-1 flex flex-col justify-center items-center text-center mt-3 space-y-2">
                {/* Name */}
                <h1
                  className="font-display font-bold capitalize text-white"
                  style={{ fontSize: `${28 * scale * 2.5}px` }}
                >
                  {artist.name}
                </h1>

                {/* Decorative Line */}
                <img
                  src={artistHeaderLine}
                  alt=""
                  className="opacity-60"
                  style={{
                    width: "85%",
                    maxWidth: "180px",
                  }}
                />

                {/* Act Type */}
                <p
                  className="uppercase tracking-[0.25em] text-white/60"
                  style={{ fontSize: `${11 * scale * 2.5}px` }}
                >
                  {artist.act}
                </p>

                {/* Location */}
                <div
                  className="flex items-center gap-1.5 text-white/60"
                  style={{ fontSize: `${11 * scale * 2.5}px` }}
                >
                  <MapPin style={{ width: `${12 * scale * 2.5}px`, height: `${12 * scale * 2.5}px` }} />
                  <span className="uppercase tracking-[0.25em]">{artist.country}</span>
                </div>

                {/* Styles Tags */}
                <div className="flex flex-wrap justify-center gap-1.5 mt-2">
                  {artist.style.map((style) => (
                    <span
                      key={style}
                      className="rounded-full text-white/90 uppercase tracking-[0.15em]"
                      style={{
                        fontSize: `${9 * scale * 2.5}px`,
                        padding: `${3 * scale * 2.5}px ${8 * scale * 2.5}px`,
                        backgroundColor: "rgba(26, 26, 26, 0.5)",
                        border: "1px solid rgba(250, 244, 211, 0.2)",
                      }}
                    >
                      {style}
                    </span>
                  ))}
                </div>

                {/* Social Links */}
                <div
                  className="flex items-center justify-center gap-3 mt-3"
                  style={{ fontSize: `${14 * scale * 2.5}px` }}
                >
                  {artist.social.soundcloud && (
                    <div className="text-white/60">
                      <Music2 style={{ width: `${18 * scale * 2.5}px`, height: `${18 * scale * 2.5}px` }} />
                    </div>
                  )}
                  {artist.social.instagram && (
                    <div className="text-white/60">
                      <Instagram style={{ width: `${18 * scale * 2.5}px`, height: `${18 * scale * 2.5}px` }} />
                    </div>
                  )}
                  {artist.social.facebook && (
                    <div className="text-white/60">
                      <Facebook style={{ width: `${18 * scale * 2.5}px`, height: `${18 * scale * 2.5}px` }} />
                    </div>
                  )}
                </div>

                {/* Description */}
                {artist.description && (
                  <p
                    className="text-white/70 text-center mt-4 leading-relaxed line-clamp-6"
                    style={{
                      fontSize: `${11 * scale * 2.5}px`,
                      maxWidth: "95%",
                    }}
                  >
                    {artist.description}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Outer HUD Frame - Matching PageFrame style */}
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
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
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
            Artist Profile
          </span>
        </motion.div>
      </div>
    )
  }
)

PhoneMockup.displayName = "PhoneMockup"

export default PhoneMockup
