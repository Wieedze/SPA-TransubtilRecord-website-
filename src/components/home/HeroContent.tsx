import { useState, type MouseEvent, type Ref } from "react"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import brandmark from "../../assets/design/assets/brandmark-white.png"
import wordmark from "../../assets/brand/transubtil-wordmark-white.svg"
// Yellow swirl traced to SVG from the "10 Years" artwork (no central figure, no text),
// with a soft circular edge so the rotation never shows a corner. Sharp at any density.
import spiral from "../../assets/design/assets/spiral-yellow.svg"
import DecryptedText from "../DecryptedText"
import { glowFlashProps } from "../site/glowFlash"
import { useHoverCount } from "../../hooks/useHoverCount"

// Spinning yellow spiral, dark vignette and yellow halo, behind the home hero, all
// centred on `center` (the logo, in hero pixels) so the circle is coaxial with it.
export function HeroBackground({ center }: { center?: { x: number; y: number } }) {
  const at = center ? `${center.x}px ${center.y}px` : "50% 45%"
  const pos = center ? { left: center.x, top: center.y } : { left: "50%", top: "45%" }
  return (
    <>
      <div className="absolute -translate-x-1/2 -translate-y-1/2" style={pos}>
        <img
          src={spiral}
          alt=""
          className="max-w-none animate-spin-slow opacity-60"
          style={{ width: "clamp(900px, 224vw, 2600px)" }}
        />
      </div>
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(circle at ${at}, rgba(7,6,11,0.2) 0%, rgba(7,6,11,0.6) 50%, rgba(7,6,11,0.92) 85%)`,
        }}
      />
      <div
        className="absolute h-[320px] w-[320px] -translate-x-1/2 -translate-y-1/2 animate-halo rounded-full md:h-[520px] md:w-[520px]"
        style={{ ...pos, background: "radial-gradient(circle, rgba(249,188,20,0.35), rgba(249,188,20,0) 65%)" }}
      />
    </>
  )
}

// Hero link (Artists, Releases). Labels scramble on hover.
function HeroAction({
  to,
  label,
  onNavigate,
}: {
  to: string
  label: string
  onNavigate: (e: MouseEvent<HTMLAnchorElement>, to: string) => void
}) {
  const { count, hoverProps } = useHoverCount()
  return (
    <Link
      to={to}
      onClick={(e) => onNavigate(e, to)}
      {...hoverProps}
      {...glowFlashProps}
      className="text-link text-lg"
    >
      <DecryptedText text={label} trigger={count} speed={90} maxIterations={5} />
    </Link>
  )
}

// Content of the home hero (01-home / mobile-home mockups) with the v1 landing
// interactions: logo easing back on hover, scrambled action labels on hover.
export default function HeroContent({
  hovered,
  onNavigate,
  logoRef,
}: {
  hovered: boolean
  onNavigate: (e: MouseEvent<HTMLAnchorElement>, to: string) => void
  logoRef?: Ref<HTMLImageElement>
}) {
  return (
    <div className="relative flex w-full max-w-[960px] flex-col items-center gap-5 px-8 text-center md:gap-7 md:px-4">
      <motion.img
        ref={logoRef}
        src={brandmark}
        alt=""
        animate={{ scale: hovered ? 0.88 : 1 }}
        transition={{ duration: 0.8, ease: "easeInOut" }}
        className="w-[190px] animate-breathe md:w-[min(300px,26svh)]"
      />
      <h1>
        <img src={wordmark} alt="Transubtil Records" className="w-[280px] sm:w-[400px] md:w-[min(560px,52svh)]" />
      </h1>
      <p className="max-w-[620px] text-base leading-relaxed text-body md:text-[19px]">
        Psytrance, darkpsy and forest. Artists to book for your festival, releases to play tonight.
      </p>
      <div className="mt-3 flex flex-wrap items-center justify-center gap-x-8 gap-y-5">
        <HeroAction to="/artists" label="Artists" onNavigate={onNavigate} />
        <HeroAction to="/releases" label="Releases" onNavigate={onNavigate} />
      </div>
    </div>
  )
}

export function useHeroHover() {
  const [hovered, setHovered] = useState(false)
  return { hovered, hoverProps: { onMouseEnter: () => setHovered(true), onMouseLeave: () => setHovered(false) } }
}
