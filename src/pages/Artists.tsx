import { useMemo, useState } from "react"
import { Helmet } from "react-helmet-async"
import ArtistCard from "../components/home/ArtistCard"
import PageHeader from "../components/site/PageHeader"
import { roster, type RosterArtist } from "../data/roster"

const FILTERS: Record<string, (artist: RosterArtist) => boolean> = {
  All: () => true,
  "Live acts": (artist) => artist.format === "Live",
  "DJ sets": (artist) => artist.format === "DJ",
}

export default function Artists() {
  const [filter, setFilter] = useState("All")
  const shown = useMemo(() => roster.filter(FILTERS[filter]), [filter])

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

      <div role="group" aria-label="Filter by format" className="flex flex-wrap items-center gap-2.5">
        {Object.keys(FILTERS).map((label) => {
          const active = label === filter
          return (
            <button
              key={label}
              type="button"
              aria-pressed={active}
              onClick={() => setFilter(label)}
              className={[
                "h-11 rounded-full border-[1.5px] px-[18px] text-sm",
                active
                  ? "border-accent bg-accent font-bold text-brand-950"
                  : "border-brand-700 font-semibold text-bone hover:border-accent hover:text-accent",
              ].join(" ")}
            >
              {label}
            </button>
          )
        })}
        <span className="ml-auto text-small text-brand-300" aria-live="polite">
          {shown.length} shown
        </span>
      </div>

      <div className="grid grid-cols-2 gap-x-3.5 gap-y-8 lg:grid-cols-4 lg:gap-6">
        {shown.map((artist) => (
          <ArtistCard key={artist.slug} artist={artist} showLocation />
        ))}
      </div>
    </div>
  )
}
