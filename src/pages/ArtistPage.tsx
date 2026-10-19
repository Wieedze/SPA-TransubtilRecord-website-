import { useState, type FormEvent, type ReactNode } from "react"
import { Helmet } from "react-helmet-async"
import { Link, useParams } from "react-router-dom"
import { motion } from "framer-motion"
import { ExternalLink } from "lucide-react"
import NotFound from "./NotFound"
import { getRosterArtist, releasesByArtist, type RosterArtist } from "../data/roster"
import DecryptedText from "../components/DecryptedText"
import HubArtisteAnimated from "../components/artists/HubArtisteAnimated"
import SoundCloudPlayer from "../components/SoundCloudPlayer"
import SocialIcons from "../components/site/SocialIcons"

const fieldClass =
  "h-12 rounded-field border border-brand-700 bg-brand-900 px-4 text-base text-bone placeholder:text-[#8C8995] [color-scheme:dark]"

const BOOKING_FIELDS = [
  { id: "bk-name", name: "name", label: "Name *", type: "text", placeholder: "First and last name", required: true, autoComplete: "name" },
  { id: "bk-mail", name: "email", label: "Email *", type: "email", placeholder: "you@organisation.com", required: true, autoComplete: "email" },
  { id: "bk-event", name: "event", label: "Event *", type: "text", placeholder: "Party or festival name", required: true },
  { id: "bk-date", name: "date", label: "Date *", type: "date", placeholder: "", required: true },
  { id: "bk-place", name: "venue", label: "Venue *", type: "text", placeholder: "Venue, city, country", required: true },
  { id: "bk-cap", name: "capacity", label: "Capacity", type: "number", placeholder: "e.g. 800", required: false },
] as const

function formatLabel(artist: RosterArtist) {
  return artist.format === "Live" ? "Live act" : "DJ set"
}

// v1 animated mecha hub around the circular photo: one SVG that turns slowly and whose
// 8 rings assemble on load and scatter on hover. The photo fits the hub's inner ring (r = 126.7 / 306).
function ArtistHub({ artist }: { artist: RosterArtist }) {
  return (
    <div className="flex w-full max-w-[420px] flex-col items-center gap-4 justify-self-center">
      <div className="relative aspect-[306/307] w-full" style={{ filter: "drop-shadow(0 0 24px rgba(249,188,20,0.25))" }}>
        <img
          src={artist.photo}
          alt={artist.name}
          className="absolute left-[9%] top-[9.1%] aspect-square w-[82%] rounded-full object-cover"
        />
        <div className="absolute inset-0 z-10 animate-spin-hub text-accent">
          <HubArtisteAnimated />
        </div>
      </div>
      <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-accent">
        <DecryptedText text={formatLabel(artist)} animateOn="view" speed={120} maxIterations={10} />
      </span>
    </div>
  )
}

// v1 sections fade up as they come into view
function FadeUp({ children, delay = 0, className = "" }: { children: ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7, delay }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

function SectionTitle({ children }: { children: string }) {
  return (
    <h2 className="font-display text-[28px] font-semibold">
      <DecryptedText text={children} animateOn="view" speed={60} maxIterations={5} />
    </h2>
  )
}

function BookingForm({ artist }: { artist: RosterArtist }) {
  const [notice, setNotice] = useState<string | null>(null)

  // TODO(forms phase): POST to /api/booking (email to the label + D1 log)
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    setNotice("Online booking opens very soon. Thanks for your patience!")
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-5 md:grid-cols-2">
      <input type="hidden" name="artist" value={artist.slug} />
      {BOOKING_FIELDS.map((field) => (
        <div key={field.id} className="flex flex-col gap-2">
          <label htmlFor={field.id} className="text-sm font-semibold">
            {field.label}
          </label>
          <input
            id={field.id}
            name={field.name}
            type={field.type}
            placeholder={field.placeholder}
            required={field.required}
            autoComplete={"autoComplete" in field ? field.autoComplete : undefined}
            min={field.type === "number" ? 0 : undefined}
            className={fieldClass}
          />
        </div>
      ))}
      <div className="flex flex-col gap-2">
        <label htmlFor="bk-budget" className="text-sm font-semibold">
          Fee budget
        </label>
        {/* TODO(content): fee ranges to be provided by the label */}
        <select id="bk-budget" name="budget" defaultValue="" className={`${fieldClass} px-3.5`}>
          <option value="" disabled>
            Pick a range
          </option>
          <option value="tbd">To be discussed</option>
        </select>
      </div>
      <div className="flex flex-col gap-2 md:col-span-2">
        <label htmlFor="bk-msg" className="text-sm font-semibold">
          Message
        </label>
        <textarea
          id="bk-msg"
          name="message"
          rows={5}
          placeholder="Line-up, set times, accommodation, travel…"
          className="resize-y rounded-field border border-brand-700 bg-brand-900 px-4 py-3.5 text-base leading-normal text-bone placeholder:text-[#8C8995]"
        />
      </div>
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3 md:col-span-2">
        <button type="submit" className="btn-primary h-12 px-7">
          Send request
        </button>
        <p role="status" className="text-small text-brand-300">
          {notice ?? "Your details are only used to handle this request."}
        </p>
      </div>
    </form>
  )
}

export default function ArtistPage() {
  const { slug = "" } = useParams()
  const artist = getRosterArtist(slug)
  if (!artist) return <NotFound />

  const bio = artist.bio?.split("\n").filter(Boolean) ?? []
  const artistReleases = releasesByArtist(artist)
  const place = artist.location ?? artist.country
  const facts = [
    { label: "Format", value: artist.act },
    { label: "Style", value: artist.style },
    place && { label: "Based in", value: place },
  ].filter((f): f is { label: string; value: string } => Boolean(f))

  return (
    <div className="flex flex-col">
      <Helmet>
        <title>{`${artist.name} — Book with Transubtil Records`}</title>
        <meta
          name="description"
          content={`${artist.name}, ${artist.style.toLowerCase()} ${formatLabel(artist).toLowerCase()} on Transubtil Records. Bio, music and booking.`}
        />
      </Helmet>

      {/* Hero */}
      <section className="flex flex-col gap-8">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
          <Link to="/artists" className="text-sm font-semibold text-brand-300 hover:text-accent">
            ← All artists
          </Link>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="grid grid-cols-1 items-center gap-7 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:gap-[72px]"
        >
          <ArtistHub artist={artist} />
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-4">
              <h1 className="font-display text-[40px] font-extrabold uppercase leading-none md:text-[72px]">{artist.name}</h1>
              <p className="meta">
                <DecryptedText text={artist.styles.join(" · ")} animateOn="view" speed={120} maxIterations={10} />
              </p>
            </div>
            <dl className="grid grid-cols-2 border-t border-brand-700 md:grid-cols-3">
              {facts.map((fact) => (
                <div key={fact.label} className="flex flex-col gap-1 border-b border-brand-700 py-3.5 pr-4">
                  <dt className="text-xs uppercase tracking-[0.12em] text-brand-300">{fact.label}</dt>
                  <dd className="font-semibold">
                    <DecryptedText text={fact.value} animateOn="view" speed={180} maxIterations={15} />
                  </dd>
                </div>
              ))}
            </dl>
            <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
              <a href="#booking" className="btn-primary h-12 px-7">
                Book {artist.name}
              </a>
              {artist.presskitZip && (
                <a href={artist.presskitZip} download className="text-link">
                  Press kit (ZIP)
                </a>
              )}
              <SocialIcons links={artist.links} className="-ml-2 gap-1" />
            </div>
          </div>
        </motion.div>
      </section>

      {/* Bio, listen, rider + dates */}
      <section className="mx-[calc(50%-50vw)] mt-16 border-y border-brand-700 bg-brand-900 md:mt-20">
        <div className="mx-auto grid max-w-page grid-cols-1 items-start gap-12 px-4 py-14 md:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] md:gap-14 md:px-6 md:py-20">
          <div className="flex min-w-0 flex-col gap-12">
            {bio.length > 0 && (
              <FadeUp className="flex flex-col gap-4">
                <SectionTitle>Bio</SectionTitle>
                {bio.map((paragraph, i) => (
                  <p key={i} className="text-[17px] leading-[1.7] text-body">
                    {paragraph}
                  </p>
                ))}
              </FadeUp>
            )}
            {artist.links.soundcloud && (
              <FadeUp className="flex flex-col gap-4" delay={0.1}>
                <SectionTitle>Listen</SectionTitle>
                <p className="text-brand-300">Latest releases and mixes from {artist.name}.</p>
                <SoundCloudPlayer soundcloudUrl={artist.links.soundcloud} artistName={artist.name} height={450} visual />
              </FadeUp>
            )}
            {artist.rider && (
              <FadeUp className="flex flex-col gap-4">
                <SectionTitle>Technical rider</SectionTitle>
                <a href={artist.rider} className="text-link self-start">
                  Full rider (PDF)
                </a>
              </FadeUp>
            )}
          </div>

          <FadeUp className="flex flex-col gap-4" delay={0.2}>
            <SectionTitle>Upcoming dates</SectionTitle>
            {/* TODO(content): render artist.upcomingDates once the label provides them */}
            <p className="border-y border-brand-700 py-4 text-brand-300">
              No dates announced yet.
            </p>
            <p className="text-small text-brand-300">Got a free date in mind? Send your request just below.</p>
          </FadeUp>
        </div>
      </section>

      {/* Releases on the label */}
      {artistReleases.length > 0 && (
        <FadeUp className="flex flex-col gap-8 pt-16 md:pt-24">
          <div className="flex flex-col gap-2">
            <SectionTitle>Releases on Transubtil Records</SectionTitle>
            <p className="text-brand-300">
              {artistReleases.length} {artistReleases.length === 1 ? "release" : "releases"} by {artist.name}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-x-3.5 gap-y-8 lg:grid-cols-4 lg:gap-6">
            {artistReleases.map((release, index) => (
              <motion.a
                key={release.id}
                href={release.bandcampUrl}
                target="_blank"
                rel="noreferrer"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="group flex flex-col gap-3 text-bone hover:text-bone"
              >
                <div className="overflow-hidden rounded-panel">
                  <img
                    src={release.coverUrl}
                    alt={`${release.title} artwork`}
                    loading="lazy"
                    className="aspect-square w-full bg-brand-800 object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-accent">
                  {release.type} · {release.releaseDate}
                </span>
                <span className="font-display text-[15px] font-semibold leading-snug group-hover:text-accent">{release.title}</span>
                <span className="flex items-center gap-1.5 text-small text-brand-300">
                  View on Bandcamp <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                </span>
              </motion.a>
            ))}
          </div>
        </FadeUp>
      )}

      {/* Booking */}
      <section id="booking" className="scroll-mt-28 pt-16 md:pt-24">
        <FadeUp className="flex flex-col gap-8 border-t border-brand-700 pt-10 md:pt-14">
          <div className="flex max-w-[680px] flex-col gap-3">
            <h2 className="font-display text-[28px] font-bold leading-tight md:text-[40px]">
              <DecryptedText text={`Book ${artist.name}`} animateOn="view" speed={60} maxIterations={5} />
            </h2>
            <p className="text-[17px] leading-relaxed text-brand-300">
              Interested in booking {artist.name} for your event? Fields marked * are required.
            </p>
          </div>
          <BookingForm artist={artist} />
        </FadeUp>
      </section>

      {/* Mobile sticky booking bar */}
      <div className="sticky bottom-0 z-20 mx-[calc(50%-50vw)] mt-10 flex items-center gap-3 border-t border-brand-700 bg-brand-950/95 px-4 py-3 md:hidden">
        <span className="flex-1 text-[15px] font-bold">{artist.name}</span>
        <a href="#booking" className="btn-primary">
          Book
        </a>
      </div>
    </div>
  )
}
