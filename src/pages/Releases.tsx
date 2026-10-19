import { useMemo, useState } from "react"
import { Helmet } from "react-helmet-async"
import PageHeader from "../components/site/PageHeader"
import { releases } from "../data/releases"
import type { Release } from "../types/release"

const PAGE_SIZE = 12

const TYPE_LABELS: Record<Release["type"], string> = {
  album: "Album",
  ep: "EP",
  track: "Single",
  compilation: "Compilation",
}

type Sort = "newest" | "artist" | "compilations"

// releases.ts is stored newest first
function sortReleases(sort: Sort): Release[] {
  if (sort === "artist") return [...releases].sort((a, b) => a.artist.localeCompare(b.artist))
  if (sort === "compilations") return releases.filter((r) => r.type === "compilation")
  return releases
}

export default function Releases() {
  const [sort, setSort] = useState<Sort>("newest")
  const [visible, setVisible] = useState(PAGE_SIZE)
  const sorted = useMemo(() => sortReleases(sort), [sort])

  return (
    <div className="flex flex-col gap-10">
      <Helmet>
        <title>Releases — Transubtil Records</title>
        <meta name="description" content="EPs, albums and compilations from Transubtil Records, newest first." />
      </Helmet>

      <PageHeader
        eyebrow="Catalogue"
        title="Releases"
        intro="EPs, albums and compilations from the label, newest first."
        aside={
          <div className="flex flex-col gap-2">
            <label htmlFor="sort" className="text-[13px] font-semibold text-brand-300">
              Sort
            </label>
            <select
              id="sort"
              value={sort}
              onChange={(e) => {
                setSort(e.target.value as Sort)
                setVisible(PAGE_SIZE)
              }}
              className="h-11 rounded-field border-[1.5px] border-brand-700 bg-brand-900 px-3.5 text-[15px] text-bone"
            >
              <option value="newest">Newest</option>
              <option value="artist">By artist</option>
              <option value="compilations">Compilations</option>
            </select>
          </div>
        }
      />

      <div className="grid grid-cols-2 gap-x-3.5 gap-y-8 lg:grid-cols-4 lg:gap-6">
        {sorted.slice(0, visible).map((release) => (
          <article key={release.id} className="flex flex-col gap-3.5">
            <a href={release.bandcampUrl} target="_blank" rel="noreferrer" className="group block overflow-hidden rounded-panel">
              <img
                src={release.coverUrl}
                alt={`${release.title} artwork`}
                loading="lazy"
                className="aspect-square w-full bg-brand-800 object-cover transition-transform duration-200 group-hover:scale-[1.04]"
              />
            </a>
            <div className="flex flex-col gap-1">
              <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-accent md:text-xs">
                {TYPE_LABELS[release.type]} · {release.releaseDate}
              </span>
              <h2 className="font-display text-[15px] font-semibold leading-snug md:text-lg">{release.title}</h2>
              <span className="text-small text-brand-300 md:text-[15px]">{release.artist}</span>
            </div>
            <a
              href={release.bandcampUrl}
              target="_blank"
              rel="noreferrer"
              className="self-start border-b-[1.5px] border-accent pb-0.5 text-sm font-semibold text-bone hover:text-accent"
            >
              Listen &amp; buy on Bandcamp
            </a>
          </article>
        ))}
      </div>

      {visible < sorted.length && (
        <button type="button" onClick={() => setVisible((v) => v + PAGE_SIZE)} className="btn-secondary self-center">
          Load more releases
        </button>
      )}
    </div>
  )
}
