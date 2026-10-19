import { useState, type FormEvent } from "react"
import { Helmet } from "react-helmet-async"
import { Link, useParams } from "react-router-dom"
import NotFound from "./NotFound"
import { getRosterArtist, type RosterArtist } from "../data/roster"
import hubArtiste from "../assets/design/assets/hub-artiste.svg"
import hubCircle from "../assets/design/assets/hub-circle.svg"

const fieldClass =
  "h-[52px] rounded-field border-[1.5px] border-brand-700 bg-brand-950 px-4 text-base text-bone placeholder:text-[#8C8995] [color-scheme:dark]"

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

// Photo framed by the yellow hub (the only mecha element on the site)
function ArtistHub({ artist }: { artist: RosterArtist }) {
  return (
    <div className="relative aspect-[487/649] w-full max-w-[460px] justify-self-center">
      <img src={hubCircle} alt="" aria-hidden="true" className="absolute left-[1%] top-0 w-[97%] animate-spin-hub opacity-15" />
      <img
        src={artist.photo}
        alt={artist.name}
        className="absolute left-[9.4%] top-[7.7%] aspect-square w-[80.2%] rounded-full object-cover"
      />
      <img src={hubArtiste} alt="" aria-hidden="true" className="absolute inset-x-0 top-0 w-full" />
      <span className="absolute left-1/2 top-[88.5%] whitespace-nowrap text-[11px] font-bold uppercase tracking-[0.2em] text-accent">
        {formatLabel(artist)}
      </span>
    </div>
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
          className="resize-y rounded-field border-[1.5px] border-brand-700 bg-brand-950 px-4 py-3.5 text-base leading-normal text-bone placeholder:text-[#8C8995]"
        />
      </div>
      <div className="flex flex-wrap items-center justify-between gap-4 md:col-span-2">
        <p role="status" className="text-small text-brand-300">
          {notice ?? "Your details are only used to handle this request."}
        </p>
        <button type="submit" className="btn-primary h-14 px-8 text-[17px]">
          Send request
        </button>
      </div>
    </form>
  )
}

export default function ArtistPage() {
  const { slug = "" } = useParams()
  const artist = getRosterArtist(slug)
  if (!artist) return <NotFound />

  const bio = artist.bio?.split("\n").filter(Boolean) ?? []
  const listen = [
    artist.links.soundcloud && { label: "SoundCloud", href: artist.links.soundcloud },
    artist.links.bandcamp && { label: "Bandcamp", href: artist.links.bandcamp },
  ].filter((l): l is { label: string; href: string } => Boolean(l))
  const facts = [
    { label: "Format", value: formatLabel(artist) },
    { label: "Style", value: artist.style },
    artist.location && { label: "Based in", value: artist.location },
  ].filter((f): f is { label: string; value: string } => Boolean(f))

  return (
    <div className="flex flex-col">
      <Helmet>
        <title>{`${artist.name} — Book with Transubtil Records`}</title>
        <meta
          name="description"
          content={`${artist.name}, ${artist.style.toLowerCase()} ${formatLabel(artist).toLowerCase()} on Transubtil Records. Bio, press kit and booking.`}
        />
      </Helmet>

      {/* Hero */}
      <section className="flex flex-col gap-8">
        <Link to="/artists" className="text-sm font-semibold text-brand-300 hover:text-accent">
          ← All artists
        </Link>
        <div className="grid grid-cols-1 items-center gap-7 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:gap-[72px]">
          <ArtistHub artist={artist} />
          <div className="flex flex-col gap-[22px]">
            <p className="eyebrow">
              {artist.style} · {artist.format}
            </p>
            <h1 className="font-display text-[40px] font-extrabold uppercase leading-none md:text-[72px]">{artist.name}</h1>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
              {facts.map((fact) => (
                <div key={fact.label} className="flex flex-col gap-1 rounded-xl border border-brand-700 px-4 py-3.5">
                  <span className="text-xs uppercase tracking-[0.12em] text-brand-300">{fact.label}</span>
                  <span className="font-bold">{fact.value}</span>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-3">
              <a href="#booking" className="btn-primary h-[52px] px-[26px]">
                Book {artist.name}
              </a>
              {artist.presskitZip && (
                <a href={artist.presskitZip} download className="btn-secondary h-[52px]">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M12 3v12M7 10l5 5 5-5M5 21h14" />
                  </svg>
                  Press kit (ZIP)
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Bio, listen, rider + dates */}
      <section className="mx-[calc(50%-50vw)] mt-16 border-y border-brand-700 bg-brand-900 md:mt-20">
        <div className="mx-auto grid max-w-page grid-cols-1 items-start gap-12 px-4 py-14 md:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] md:gap-14 md:px-6 md:py-20">
          <div className="flex flex-col gap-12">
            {bio.length > 0 && (
              <div className="flex flex-col gap-4">
                <h2 className="font-display text-[28px] font-semibold">Bio</h2>
                {bio.map((paragraph, i) => (
                  <p key={i} className="text-[17px] leading-[1.7] text-body">
                    {paragraph}
                  </p>
                ))}
              </div>
            )}
            {listen.length > 0 && (
              <div className="flex flex-col gap-4">
                <h2 className="font-display text-[28px] font-semibold">Listen</h2>
                <div className="flex flex-wrap gap-3">
                  {listen.map((link) => (
                    <a key={link.label} href={link.href} target="_blank" rel="noreferrer" className="btn-secondary">
                      {link.label}
                    </a>
                  ))}
                </div>
              </div>
            )}
            {artist.rider && (
              <div className="flex flex-col gap-4">
                <h2 className="font-display text-[28px] font-semibold">Technical rider</h2>
                <a href={artist.rider} className="self-start border-b-[1.5px] border-accent pb-0.5 font-semibold text-bone hover:text-accent">
                  Full rider (PDF) →
                </a>
              </div>
            )}
          </div>

          <aside className="flex flex-col gap-4">
            <h2 className="font-display text-[28px] font-semibold">Upcoming dates</h2>
            {/* TODO(content): render artist.upcomingDates once the label provides them */}
            <p className="rounded-panel border border-brand-700 bg-brand-950 px-[18px] py-4 text-brand-300">
              No dates announced yet.
            </p>
            <p className="text-small text-brand-300">Got a free date in mind? Send your request just below.</p>
          </aside>
        </div>
      </section>

      {/* Booking */}
      <section id="booking" className="scroll-mt-28 pt-16 md:pt-24">
        <div className="flex flex-col gap-8 rounded-card border-[1.5px] border-brand-700 bg-brand-900 p-6 md:p-14">
          <div className="flex max-w-[680px] flex-col gap-3">
            <p className="eyebrow">Booking</p>
            <h2 className="font-display text-[28px] font-bold leading-tight md:text-[40px]">Book {artist.name}</h2>
            <p className="text-[17px] leading-relaxed text-brand-300">Fields marked * are required.</p>
          </div>
          <BookingForm artist={artist} />
        </div>
      </section>

      {/* Mobile sticky booking bar */}
      <div className="sticky bottom-0 z-20 mx-[calc(50%-50vw)] mt-10 flex items-center gap-3 border-t border-brand-700 bg-brand-950/95 px-4 py-3 md:hidden">
        <span className="flex-1 text-[15px] font-bold">{artist.name}</span>
        <a href="#booking" className="btn-primary h-12 px-[22px]">
          Book
        </a>
      </div>
    </div>
  )
}
