import { useState, type MouseEvent } from "react"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import brandmark from "../../assets/design/assets/brandmark-white.png"
import wordmark from "../../assets/brand/transubtil-wordmark-white.svg"
import flames from "../../assets/design/assets/hero-flames.svg"
import DecryptedText from "../DecryptedText"
import { glowFlashProps } from "../site/glowFlash"
import { useHoverCount } from "../../hooks/useHoverCount"

// Static flames from the "10 Years" artwork, mirrored so both sides are identical, cut
// into ~120 "atoms" that appear layer by layer from the bottom and then each breathe at
// their own pace (CSS animation inside hero-flames.svg). Dark vignette and yellow halo on top.
// Everything is placed from --logo-y (the brandmark's centre in the hero, set by
// useLogoAnchor). Desktop: the logo sits at 63.6% of the artwork's height (the reference
// look). Phones: the part of the artwork below its 40.6% line is shown under the logo and
// mirrored above it, so the screen is filled symmetrically around the logo.
const FLAMES_SIZE = "max(100vw, min(125svh, 180vw))"
const DESKTOP_LOGO_AT = 0.636
const MOBILE_LOGO_AT = 0.406
export const LOGO_Y = "var(--logo-y, 40%)"

// The lower half of the phone layout: artwork from the logo line down. Flipped, it is the upper half.
function MobileFlamesHalf({ mirrored }: { mirrored?: boolean }) {
  return (
    <div
      className="absolute inset-x-0 bottom-0 overflow-hidden md:hidden"
      style={{ top: LOGO_Y, transform: mirrored ? "scaleY(-1)" : undefined, transformOrigin: "top" }}
    >
      <img
        src={flames}
        alt=""
        className="absolute left-1/2 aspect-square max-w-none -translate-x-1/2 opacity-60 [mask-image:linear-gradient(to_bottom,black_85%,transparent)]"
        style={{ width: FLAMES_SIZE, top: `calc(-${MOBILE_LOGO_AT} * ${FLAMES_SIZE})` }}
      />
    </div>
  )
}

export function HeroBackground() {
  return (
    <>
      <img
        src={flames}
        alt=""
        className="absolute left-1/2 hidden aspect-square max-w-none -translate-x-1/2 opacity-60 md:block"
        style={{ width: FLAMES_SIZE, top: `calc(${LOGO_Y} - ${DESKTOP_LOGO_AT} * ${FLAMES_SIZE})` }}
      />
      <MobileFlamesHalf />
      <MobileFlamesHalf mirrored />
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(circle at 50% ${LOGO_Y}, rgba(7,6,11,0.2) 0%, rgba(7,6,11,0.6) 50%, rgba(7,6,11,0.92) 85%)`,
        }}
      />
      <div
        className="absolute left-1/2 h-[320px] w-[320px] -translate-x-1/2 -translate-y-1/2 animate-halo rounded-full md:h-[520px] md:w-[520px]"
        style={{ top: LOGO_Y, background: "radial-gradient(circle, rgba(249,188,20,0.35), rgba(249,188,20,0) 65%)" }}
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
        data-hero-anchor=""
        className="w-[190px] animate-breathe md:w-[min(300px,26svh)]"
      />
      <h1>
        <img src={wordmark} alt="Transubtil Records" className="w-[280px] sm:w-[400px] md:w-[min(560px,52svh)]" />
      </h1>
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
