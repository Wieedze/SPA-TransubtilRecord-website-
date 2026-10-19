import { useState, type MouseEvent } from "react"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import brandmark from "../../assets/design/assets/brandmark-white.png"
import wordmark from "../../assets/brand/transubtil-wordmark-white.svg"
// Yellow swirl extracted from the "10 Years" artwork (no central figure, no text)
import spiral from "../../assets/design/assets/spiral-yellow.webp"
import { BOOKING_PATH } from "../../config/site"
import DecryptedText from "../DecryptedText"
import { glowFlashProps } from "../site/glowFlash"
import { useHoverCount } from "../../hooks/useHoverCount"

const tileBase =
  "flex h-14 items-center justify-between rounded-panel px-5 font-bold md:h-16 md:px-[22px] md:text-[17px]"
const tileDark = `${tileBase} border-[1.5px] border-brand-700 bg-brand-900/80 text-bone hover:border-accent hover:text-bone`

// Spinning yellow spiral, dark vignette and yellow halo, behind the home hero.
export function HeroBackground() {
  return (
    <>
      <div className="absolute inset-[-30%] flex items-center justify-center">
        <img
          src={spiral}
          alt=""
          className="w-[140%] min-w-[900px] max-w-[2600px] animate-spin-slow opacity-60"
        />
      </div>
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 50% 45%, rgba(7,6,11,0.2) 0%, rgba(7,6,11,0.6) 50%, rgba(7,6,11,0.92) 85%)",
        }}
      />
      <div
        className="absolute left-1/2 top-[38%] -ml-[160px] -mt-[160px] h-[320px] w-[320px] animate-halo rounded-full md:-ml-[260px] md:-mt-[260px] md:h-[520px] md:w-[520px]"
        style={{ background: "radial-gradient(circle, rgba(249,188,20,0.35), rgba(249,188,20,0) 65%)" }}
      />
    </>
  )
}

function HeroTile({
  to,
  label,
  primary = false,
  onNavigate,
}: {
  to: string
  label: string
  primary?: boolean
  onNavigate: (e: MouseEvent<HTMLAnchorElement>, to: string) => void
}) {
  const { count, hoverProps } = useHoverCount()
  return (
    <Link
      to={to}
      onClick={(e) => onNavigate(e, to)}
      {...hoverProps}
      {...glowFlashProps}
      className={
        primary
          ? `${tileBase} order-first bg-accent text-brand-950 hover:bg-accent-hover hover:text-brand-950 md:order-none`
          : tileDark
      }
    >
      <DecryptedText text={label} trigger={count} speed={90} maxIterations={5} />
      <span aria-hidden="true" className={primary ? "" : "text-accent"}>
        →
      </span>
    </Link>
  )
}

// Content of the home hero (01-home / mobile-home mockups) with the v1 landing
// interactions: logo easing back on hover, scrambled tile labels on hover.
export default function HeroContent({
  hovered,
  onNavigate,
}: {
  hovered: boolean
  onNavigate: (e: MouseEvent<HTMLAnchorElement>, to: string) => void
}) {
  return (
    <div className="relative flex w-full max-w-[960px] flex-col items-center gap-5 px-8 text-center md:gap-7 md:px-4">
      <motion.img
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
      <div className="mt-2 grid w-full max-w-[820px] grid-cols-1 gap-2.5 md:mt-3 md:grid-cols-3 md:gap-4">
        <HeroTile to="/artists" label="Artists" onNavigate={onNavigate} />
        <HeroTile to="/releases" label="Releases" onNavigate={onNavigate} />
        <HeroTile to={BOOKING_PATH} label="Booking" primary onNavigate={onNavigate} />
      </div>
    </div>
  )
}

export function useHeroHover() {
  const [hovered, setHovered] = useState(false)
  return { hovered, hoverProps: { onMouseEnter: () => setHovered(true), onMouseLeave: () => setHovered(false) } }
}
