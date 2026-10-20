import { useRef, useState, type MouseEvent } from "react"
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

export default function Home() {
  const heroRef = useRef<HTMLElement>(null)
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
    animate: intro ? { opacity: 0, y: 16 } : { opacity: 1, y: 0 },
    // Arrives during the second half of the dezoom, so both finish together
    transition: { duration: ZOOM_DURATION * 0.55, delay: ZOOM_DURATION * 0.45, ease: [0.22, 1, 0.36, 1] as const },
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
        animate={intro ? { opacity: 0, y: -12 } : { opacity: 1, y: 0 }}
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
          // Fades in on arrival instead of popping in when the page is revealed
          initial={intro ? { opacity: 0 } : false}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className={[
            // clip-path as well as overflow: Chrome lets the spinning layer bleed 1px past the edge
            "relative overflow-hidden [clip-path:inset(0)]",
          ].join(" ")}
        >
          {/* Background, confined to the hero */}
          <motion.div aria-hidden="true" className="pointer-events-none absolute inset-0" style={backgroundStyle}>
            <HeroBackground />
          </motion.div>
          {/* Short fade into the page below */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 -bottom-1 h-24"
            style={{ background: "linear-gradient(to bottom, transparent, #07060B)" }}
          />
          {/* Content block: 20% taller than the space under the nav, logo and text centred */}
          <div
            className="relative flex h-[calc((100svh-68px-6svh)*1.2)] min-h-[672px] w-full items-center justify-center md:h-[calc((100svh-96px-10svh)*1.2)] md:min-h-[720px]"
          >
            <div className="relative flex w-full justify-center" {...hoverProps}>
              <HeroContent hovered={hovered} onNavigate={handleHeroNavigate} />
            </div>
          </div>
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
