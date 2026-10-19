import { useEffect, useLayoutEffect, useRef, useState, type MouseEvent } from "react"
import Seo from "../components/site/Seo"
import { labelLd, websiteLd } from "../lib/structuredData"
import { releases } from "../data/releases"
import { Link, useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import SiteNav from "../components/site/SiteNav"
import SiteFooter from "../components/site/SiteFooter"
import HeroContent, { HeroBackground, useHeroHover } from "../components/home/HeroContent"
import ArtistCard from "../components/home/ArtistCard"
import { useIntroZoom, ZOOM_DURATION } from "../components/home/useIntroZoom"
import { allCountries, getRosterArtist, roster, type RosterArtist } from "../data/roster"
import { BOOKING_PATH, SOCIAL_LINKS } from "../config/site"
import artwork from "../assets/design/assets/artwork-10-years.jpg"

const FEATURED_SLUGS = ["thehorrids", "heavyfawn", "xipetotecs", "fiorenza"]
const featured = FEATURED_SLUGS.map(getRosterArtist).filter((a): a is RosterArtist => Boolean(a))
const bandcampUrl = SOCIAL_LINKS.find((l) => l.label === "Bandcamp")?.href ?? null

// Circular fade of the hero background, coaxial with the central logo. The circle is
// as wide as the screen (its sides touch the screen edges), its top slides under the
// translucent nav, and the hero grows to its bottom so the circle is never cut there
// (the next section moves down with it).
// Measured in layout pixels (box ratios undo the intro's scale), refreshed on resize.
interface HeroGeometry {
  x: number
  y: number
  radius: number
  extra: number // space added under the content block to reach the circle's bottom
}

const useIsoLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect

function useLogoCircle(heroRef: React.RefObject<HTMLElement>) {
  const logoRef = useRef<HTMLImageElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const [geo, setGeo] = useState<HeroGeometry | null>(null)

  useIsoLayoutEffect(() => {
    const hero = heroRef.current
    const logo = logoRef.current
    const content = contentRef.current
    if (!hero || !logo || !content) return
    const update = () => {
      const h = hero.getBoundingClientRect()
      const l = logo.getBoundingClientRect()
      const k = hero.offsetHeight / h.height // undo the intro's scale
      const x = (l.left + l.width / 2 - h.left) * k
      const y = (l.top + l.height / 2 - h.top) * k
      const base = content.offsetHeight
      const radius = hero.offsetWidth / 2
      setGeo({ x, y, radius, extra: Math.max(0, Math.round(y + radius + 8 - base)) })
    }
    update()
    const observer = new ResizeObserver(update)
    observer.observe(content)
    return () => observer.disconnect()
  }, [heroRef])

  const mask = geo
    ? `radial-gradient(circle at ${geo.x}px ${geo.y}px, #000 ${Math.round(geo.radius * 0.7)}px, transparent ${Math.round(geo.radius)}px)`
    : undefined
  return { logoRef, contentRef, geo, mask }
}

export default function Home() {
  const heroRef = useRef<HTMLElement>(null)
  // Declared before the intro so the hero has its final height when the intro measures it
  const circle = useLogoCircle(heroRef)
  const { phase, heroStyle, backgroundStyle } = useIntroZoom(heroRef)
  const intro = phase === "intro"
  const { hovered, hoverProps } = useHeroHover()
  const navigate = useNavigate()
  const [leaving, setLeaving] = useState(false)

  // v1 landing transition: the page fades out, then navigates
  const handleHeroNavigate = (e: MouseEvent<HTMLAnchorElement>, to: string) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return
    e.preventDefault()
    setLeaving(true)
    window.setTimeout(() => navigate(to), 600)
  }
  // Nav and page content arrive while the hero pulls back
  const reveal = {
    initial: false as const,
    animate: intro ? { opacity: 0, y: 32 } : { opacity: 1, y: 0 },
    transition: { duration: ZOOM_DURATION * 0.7, delay: ZOOM_DURATION * 0.35, ease: "easeOut" as const },
  }

  return (
    <motion.div
      className="relative min-h-screen text-bone"
      initial={false}
      animate={{ opacity: leaving ? 0 : 1 }}
      transition={{ duration: 0.6, ease: "easeInOut" }}
    >
      <Seo
        title="Transubtil Records — International psytrance label · Darkpsy, Forest, Night psy"
        description={`Independent psytrance label from France with an international roster. Book ${roster.length} darkpsy, forest and night psy DJs and live acts for your festival or party, and listen to ${releases.length} releases on Bandcamp.`}
        path="/"
        jsonLd={[labelLd(), websiteLd()]}
      />

      <motion.div
        className="sticky top-0 z-30"
        initial={false}
        animate={intro ? { opacity: 0, y: -24 } : { opacity: 1, y: 0 }}
        transition={reveal.transition}
        style={{ pointerEvents: intro ? "none" : "auto" }}
      >
        <SiteNav />
      </motion.div>

      <main>
        <motion.section
          ref={heroRef}
          aria-label="Transubtil Records"
          style={heroStyle}
          className={[
            // clip-path as well as overflow: Chrome lets the spinning layer bleed 1px past the edge
            "relative overflow-hidden [clip-path:inset(0)]",
          ].join(" ")}
        >
          {/* Animated background, confined to the hero. A circular mask centred on the logo
              fades it out before the hero's bottom edge, so the boundary is invisible */}
          <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{ ...backgroundStyle, maskImage: circle.mask, WebkitMaskImage: circle.mask }}
          >
            <HeroBackground center={circle.geo ? { x: circle.geo.x, y: circle.geo.y } : undefined} />
          </motion.div>
          {/* Content block: 20% taller than the space under the nav, logo and text centred */}
          <div
            ref={circle.contentRef}
            className="relative flex h-[calc((100svh-68px-6svh)*1.2)] min-h-[672px] w-full items-center justify-center md:h-[calc((100svh-96px-10svh)*1.2)] md:min-h-[720px]"
          >
            <div className="relative flex w-full justify-center" {...hoverProps}>
              <HeroContent hovered={hovered} onNavigate={handleHeroNavigate} logoRef={circle.logoRef} />
            </div>
          </div>
          {/* Down to the bottom of the circle */}
          <div aria-hidden="true" style={{ height: circle.geo?.extra ?? 0 }} />
        </motion.section>

        <motion.div {...reveal}>
          {/* Latest release */}
          <section className="mx-auto max-w-page px-4 py-16 md:px-6 md:py-24">
            <div className="grid grid-cols-1 items-center gap-8 md:grid-cols-2 md:gap-16">
              <img
                src={artwork}
                alt="10 Years of Transubtil compilation artwork"
                loading="lazy"
                className="aspect-square w-full object-cover"
              />
              <div className="flex flex-col gap-5">
                <h2 className="font-display text-[22px] leading-tight md:text-[34px]">10 Years of Transubtil</h2>
                <p className="meta">Latest release · Compilation</p>
                <p className="text-[15px] leading-relaxed text-body md:text-lg">Anniversary compilation.</p>
                {/* TODO(content): release date, track count and Bandcamp player embed */}
                {bandcampUrl && (
                  <div className="mt-2 flex flex-wrap items-center gap-x-8 gap-y-4">
                    <a href={bandcampUrl} target="_blank" rel="noreferrer" className="btn-primary">
                      Buy on Bandcamp
                    </a>
                    <Link to="/releases" className="text-link">
                      Full catalogue
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Featured artists */}
          <section className="border-y border-brand-700 bg-brand-900">
            <div className="mx-auto flex max-w-page flex-col gap-10 px-4 py-16 md:px-6 md:py-24">
              <div className="flex flex-col gap-3">
                <h2 className="font-display text-[22px] md:text-[30px] md:leading-tight">Artists to book</h2>
                <p className="meta">
                  {roster.length} artists · {allCountries.length} countries
                </p>
              </div>
              <div className="grid grid-cols-2 gap-x-3.5 gap-y-8 lg:grid-cols-4 lg:gap-6">
                {featured.map((artist) => (
                  <ArtistCard key={artist.slug} artist={artist} />
                ))}
              </div>
              <Link to="/artists" className="text-link self-start">
                See all {roster.length} artists
              </Link>
            </div>
          </section>

          {/* Booking call to action: a full-width band, no boxed card */}
          <section className="mx-auto max-w-page px-4 py-16 md:px-6 md:py-24">
            <div className="flex max-w-[720px] flex-col gap-5">
              <h2 className="font-display text-[22px] leading-tight md:text-[30px]">Running a party or a festival?</h2>
              <p className="text-[15px] leading-relaxed text-body md:text-lg">
                Pick an artist, send your date, capacity and budget.
              </p>
              <Link to={BOOKING_PATH} className="btn-primary mt-2 self-start">
                Send a booking request
              </Link>
            </div>
          </section>

          <SiteFooter />
        </motion.div>
      </main>
    </motion.div>
  )
}
