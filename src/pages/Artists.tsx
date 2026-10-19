import { useMemo, useState } from "react"
import Seo from "../components/site/Seo"
import { artistsListLd, breadcrumbLd } from "../lib/structuredData"
import { Search, X } from "lucide-react"
import ArtistCard from "../components/home/ArtistCard"
import PageHeader from "../components/site/PageHeader"
import { Link } from "react-router-dom"
import { allCountries, allStyles, roster, styleGroups, type RosterArtist } from "../data/roster"

const FORMATS: Record<string, (artist: RosterArtist) => boolean> = {
  All: () => true,
  "Live acts": (artist) => artist.format === "Live",
  "DJ sets": (artist) => artist.format === "DJ",
}

const selectClass =
  "h-11 rounded-field border-[1.5px] border-brand-700 bg-brand-900 px-3.5 text-[15px] text-bone hover:border-brand-500"

export default function Artists() {
  const [format, setFormat] = useState("All")
  const [query, setQuery] = useState("")
  const [style, setStyle] = useState("all")
  const [country, setCountry] = useState("all")

  const shown = useMemo(
    () =>
      roster
        .filter(FORMATS[format])
        .filter((a) => a.name.toLowerCase().includes(query.trim().toLowerCase()))
        .filter((a) => style === "all" || a.styles.includes(style))
        .filter((a) => country === "all" || a.country === country),
    [format, query, style, country]
  )
  const filtered = format !== "All" || query !== "" || style !== "all" || country !== "all"
  const clearFilters = () => {
    setFormat("All")
    setQuery("")
    setStyle("all")
    setCountry("all")
  }

  return (
    <div className="flex flex-col gap-10">
      <Seo
        title="Psytrance DJs & live acts to book — Transubtil Records artists"
        description={`${roster.length} psytrance artists from ${allCountries.length} countries: darkpsy, forest, night psy and twilight DJs and live acts on Transubtil Records. Press kits, music and direct booking.`}
        path="/artists"
        jsonLd={[artistsListLd(), breadcrumbLd([{ name: "Home", path: "/" }, { name: "Artists", path: "/artists" }])]}
      />

      <PageHeader
        title="Artists"
        meta={`${roster.length} artists · ${allCountries.length} countries`}
        intro="DJs and live acts from France, Portugal, Japan, Mexico, Brazil, Australia and beyond. Each page has a press kit, a rider and a direct booking form."
      />

      <div className="flex flex-col gap-4">
        <div role="group" aria-label="Filter by format" className="flex flex-wrap items-center gap-7">
          {Object.keys(FORMATS).map((label) => {
            const active = label === format
            return (
              <button
                key={label}
                type="button"
                aria-pressed={active}
                onClick={() => setFormat(label)}
                className={[
                  "border-b-2 py-1.5 text-base font-medium",
                  active ? "border-accent text-accent" : "border-transparent text-bone hover:text-accent",
                ].join(" ")}
              >
                {label}
              </button>
            )
          })}
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative min-w-[220px] flex-[1_1_260px]">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-300" aria-hidden="true" />
            <label htmlFor="artist-search" className="sr-only">
              Search artists
            </label>
            <input
              id="artist-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search artists…"
              className="h-11 w-full rounded-field border-[1.5px] border-brand-700 bg-brand-900 pl-10 pr-10 text-[15px] text-bone placeholder:text-brand-300 hover:border-brand-500"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Clear search"
                className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center text-brand-300 hover:text-accent"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            )}
          </div>
          <label htmlFor="artist-style" className="sr-only">
            Style
          </label>
          <select id="artist-style" value={style} onChange={(e) => setStyle(e.target.value)} className={selectClass}>
            <option value="all">All styles</option>
            {allStyles.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <label htmlFor="artist-country" className="sr-only">
            Country
          </label>
          <select id="artist-country" value={country} onChange={(e) => setCountry(e.target.value)} className={selectClass}>
            <option value="all">All countries</option>
            {allCountries.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          {filtered && (
            <button type="button" onClick={clearFilters} className="h-11 px-2 text-sm font-semibold text-accent hover:text-accent-hover">
              Clear filters
            </button>
          )}
          <span className="ml-auto text-small text-brand-300" aria-live="polite">
            {shown.length} {shown.length === 1 ? "artist" : "artists"} shown
          </span>
        </div>
      </div>

      {shown.length > 0 ? (
        <div className="grid grid-cols-2 gap-x-5 gap-y-10 lg:grid-cols-4 lg:gap-x-8">
          {shown.map((artist) => (
            <ArtistCard key={artist.slug} artist={artist} showDetails />
          ))}
        </div>
      ) : (
        <div className="py-12 text-center">
          <p className="text-bone">No artists found matching your filters.</p>
          <p className="mt-2 text-small text-brand-300">Try adjusting your search or clearing filters.</p>
        </div>
      )}

      {/* Explore by sound: plain links grouped by style, read by search engines and AI assistants */}
      <section aria-labelledby="by-sound" className="flex flex-col gap-8 border-t border-brand-700 pt-12 md:pt-16">
        <div className="flex flex-col gap-3">
          <h2 id="by-sound" className="font-display text-[22px] md:text-[30px]">
            Find artists by sound
          </h2>
          <p className="max-w-[62ch] text-body">
            Looking for psytrance to book or to listen to? Here is the roster by style.
          </p>
        </div>
        <dl className="grid grid-cols-1 gap-x-12 md:grid-cols-2">
          {styleGroups.map((group) => (
            <div key={group.id} id={group.id} className="flex flex-col gap-2 border-t border-brand-700 py-5">
              <dt className="flex flex-col gap-1">
                <span className="font-display text-base text-accent">{group.name}</span>
                <span className="text-small text-brand-300">{group.blurb}</span>
              </dt>
              <dd className="text-[15px] leading-relaxed">
                {group.artists.map((artist, i) => (
                  <span key={artist.slug}>
                    {i > 0 && <span className="text-brand-500"> · </span>}
                    <Link to={`/artists/${artist.slug}`} className="text-bone hover:text-accent">
                      {artist.name}
                    </Link>
                  </span>
                ))}
              </dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  )
}
