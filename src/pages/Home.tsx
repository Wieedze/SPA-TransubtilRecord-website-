import { useState, type MouseEvent } from "react"
import { Helmet } from "react-helmet-async"
import { Link, useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import SiteNav from "../components/site/SiteNav"
import SiteFooter from "../components/site/SiteFooter"
import HeroContent, { HeroBackground, useHeroHover } from "../components/home/HeroContent"
import ArtistCard from "../components/home/ArtistCard"
import { useIntroZoom, ZOOM_DURATION } from "../components/home/useIntroZoom"
import { getRosterArtist, roster, type RosterArtist } from "../data/roster"
import { BOOKING_PATH, SOCIAL_LINKS } from "../config/site"
import artwork from "../assets/design/assets/artwork-10-years.jpg"

const FEATURED_SLUGS = ["thehorrids", "heavyfawn", "xipetotecs", "fiorenza"]
const featured = FEATURED_SLUGS.map(getRosterArtist).filter((a): a is RosterArtist => Boolean(a))
const bandcampUrl = SOCIAL_LINKS.find((l) => l.label === "Bandcamp")?.href ?? null

export default function Home() {
  const { phase, heroRef, heroStyle, backgroundStyle } = useIntroZoom()
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
      <Helmet>
        <title>Transubtil Records — Psychedelic label, Marseille</title>
        <meta
          name="description"
          content="Independent psychedelic music label from Marseille. Psytrance, darkpsy and forest artists to book for your festival, and ten years of releases."
        />
      </Helmet>

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
            "relative flex items-center justify-center overflow-hidden [clip-path:inset(0)]",
            // Leaves the start of the next section visible once the hero has landed
            "h-[calc(100svh-68px-6svh)] min-h-[560px] md:h-[calc(100svh-96px-10svh)] md:min-h-[600px]",
          ].join(" ")}
        >
          {/* Animated background, confined to the hero */}
          <motion.div aria-hidden="true" className="pointer-events-none absolute inset-0" style={backgroundStyle}>
            <HeroBackground />
          </motion.div>
          {/* Fade into the page below */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 -bottom-1 h-44"
            style={{ background: "linear-gradient(to bottom, transparent, #07060B 80%)" }}
          />
          <div className="relative flex w-full justify-center" {...hoverProps}>
            <HeroContent hovered={hovered} onNavigate={handleHeroNavigate} />
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
                className="aspect-square w-full rounded-2xl object-cover md:rounded-[18px]"
              />
              <div className="flex flex-col gap-5">
                <p className="eyebrow">Latest release</p>
                <h2 className="font-display text-2xl font-bold leading-tight md:text-[44px]">10 Years of Transubtil</h2>
                <p className="text-[15px] leading-relaxed text-brand-300 md:text-lg">Anniversary compilation.</p>
                {/* TODO(content): release date, track count and Bandcamp player embed */}
                {bandcampUrl && (
                  <div className="flex flex-wrap gap-3">
                    <a href={bandcampUrl} target="_blank" rel="noreferrer" className="btn-primary">
                      Buy on Bandcamp
                    </a>
                    <Link to="/releases" className="btn-secondary">
                      Full catalogue
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Featured artists */}
          <section className="border-y border-brand-700 bg-brand-900">
            <div className="mx-auto flex max-w-page flex-col gap-10 px-4 pb-16 pt-12 md:px-6 md:pb-24 md:pt-[72px]">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div className="flex flex-col gap-3">
                  <p className="eyebrow">The roster</p>
                  <h2 className="font-display text-2xl font-bold md:text-[40px] md:leading-tight">Artists to book</h2>
                </div>
                <Link
                  to="/artists"
                  className="hidden border-b-[1.5px] border-accent pb-0.5 font-semibold text-bone hover:text-accent md:inline"
                >
                  See all {roster.length} artists →
                </Link>
              </div>
              <div className="grid grid-cols-2 gap-x-3.5 gap-y-5 lg:grid-cols-4 lg:gap-6">
                {featured.map((artist) => (
                  <ArtistCard key={artist.slug} artist={artist} />
                ))}
              </div>
              <Link to="/artists" className="btn-secondary md:hidden">
                All {roster.length} artists
              </Link>
            </div>
          </section>

          {/* Booking call to action */}
          <section className="mx-auto max-w-page px-4 py-16 md:px-6 md:py-24">
            <div className="flex flex-wrap items-center justify-between gap-8 rounded-card border-[1.5px] border-accent p-8 md:p-14">
              <div className="flex flex-[1_1_420px] flex-col gap-3.5">
                <h2 className="font-display text-2xl font-bold leading-tight md:text-[34px]">Running a party or a festival?</h2>
                <p className="text-[15px] leading-relaxed text-brand-300 md:text-lg">
                  Pick an artist, send your date, capacity and budget.
                </p>
              </div>
              <Link to={BOOKING_PATH} className="btn-primary h-12 px-6">
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
