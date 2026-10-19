import { useMemo, useState } from "react"
import { Helmet } from "react-helmet-async"
import { Search, X } from "lucide-react"
import ArtistCard from "../components/home/ArtistCard"
import PageHeader from "../components/site/PageHeader"
import { allCountries, allStyles, roster, type RosterArtist } from "../data/roster"

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
      <Helmet>
        <title>Artists — Transubtil Records</title>
        <meta
          name="description"
          content="Psytrance, darkpsy and forest DJs and live acts from the Transubtil Records roster. Press kits, riders and direct booking."
        />
      </Helmet>

      <PageHeader
        eyebrow={`Roster · ${roster.length} artists`}
        title="Artists"
        intro="DJs and live acts from France, Portugal, Japan, Mexico, Brazil, Australia and beyond. Each page has a press kit, a rider and a direct booking form."
      />

      <div className="flex flex-col gap-4">
        <div role="group" aria-label="Filter by format" className="flex flex-wrap items-center gap-2.5">
          {Object.keys(FORMATS).map((label) => {
            const active = label === format
            return (
              <button
                key={label}
                type="button"
                aria-pressed={active}
                onClick={() => setFormat(label)}
                className={[
                  "h-10 rounded-full border px-4 text-sm font-medium",
                  active
                    ? "border-accent bg-accent text-brand-950"
                    : "border-brand-700 text-bone hover:border-accent hover:text-accent",
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
    </div>
  )
}
