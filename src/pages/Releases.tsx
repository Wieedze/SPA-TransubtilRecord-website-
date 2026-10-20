import { useMemo, useState } from "react"
import Seo from "../components/site/Seo"
import { breadcrumbLd, releasesListLd } from "../lib/structuredData"
import { motion } from "framer-motion"
import { ExternalLink, Play, Search, X } from "lucide-react"
import PageHeader from "../components/site/PageHeader"
import { usePlayer } from "../contexts/PlayerContext"
import DecryptedText from "../components/DecryptedText"
import { releases } from "../data/releases"
import { SOCIAL_LINKS } from "../config/site"
import type { Release } from "../types/release"

const PAGE_SIZE = 12
const years = releases.map((r) => Number(r.releaseDate)).filter(Boolean)
const yearSpan = `${Math.min(...years)}–${Math.max(...years)}`
const bandcampStore = SOCIAL_LINKS.find((l) => l.label === "Bandcamp")?.href ?? null

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
  const [query, setQuery] = useState("")
  const [visible, setVisible] = useState(PAGE_SIZE)
  const [selected, setSelected] = useState<Release | undefined>(releases[0])

  const list = useMemo(() => {
    const q = query.trim().toLowerCase()
    return sortReleases(sort).filter(
      (r) => !q || [r.title, r.artist, r.catalogNumber].some((field) => field.toLowerCase().includes(q))
    )
  }, [sort, query])

  const player = usePlayer()
  // Shows the release on top of the page and loads it in the site-wide player bar
  const play = (release: Release) => {
    setSelected(release)
    player.play(release)
  }

  return (
    <div className="flex flex-col gap-10">
      <Seo
        title="Psytrance releases — Transubtil Records discography"
        description={`The full Transubtil Records discography: ${releases.length} darkpsy, forest and night psy EPs, albums and compilations (${yearSpan}). Listen and buy on Bandcamp.`}
        path="/releases"
        jsonLd={[releasesListLd(), breadcrumbLd([{ name: "Home", path: "/" }, { name: "Releases", path: "/releases" }])]}
      />

      <PageHeader title="Releases" />

      {/* Selected release */}
      {selected && (
        <motion.section
          aria-label="Selected release"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="scroll-mt-28 border-b border-brand-700 pb-10"
        >
          {/* Selected release: cover shown whole; it plays in the site-wide player bar */}
          <div className="grid grid-cols-1 items-start gap-6 sm:grid-cols-[minmax(0,240px)_minmax(0,1fr)] md:grid-cols-[minmax(0,320px)_minmax(0,1fr)] md:gap-10">
            <img
              key={selected.id}
              src={selected.coverUrl}
              alt={`${selected.title} artwork`}
              className="aspect-square w-full max-w-[420px] bg-brand-800 object-contain"
            />
            <div className="flex min-w-0 flex-col gap-3">
              <h2 className="font-display text-lg md:text-[22px]">
                <DecryptedText key={selected.id} text={selected.title} animateOn="view" speed={40} maxIterations={6} />
              </h2>
              <p className="text-[17px] text-bone">{selected.artist}</p>
              <p className="text-xs text-brand-300">
                {TYPE_LABELS[selected.type]} · {selected.releaseDate}
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-x-8 gap-y-4">
                <button type="button" onClick={() => play(selected)} className="btn-primary">
                  <Play className="h-3.5 w-3.5" fill="currentColor" aria-hidden="true" />
                  {player.current?.id === selected.id ? "In the player" : "Play"}
                </button>
                <a href={selected.bandcampUrl} target="_blank" rel="noreferrer" className="text-link">
                  Buy on Bandcamp <ExternalLink className="h-4 w-4" aria-hidden="true" />
                </a>
              </div>
            </div>
          </div>
        </motion.section>
      )}

      {/* All releases */}
      <section className="flex flex-col gap-8" aria-label="All releases">
        <div className="flex flex-wrap items-end gap-2.5">
          <div className="relative min-w-[220px] flex-[1_1_260px]">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-300" aria-hidden="true" />
            <label htmlFor="release-search" className="sr-only">
              Search releases
            </label>
            <input
              id="release-search"
              type="search"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                setVisible(PAGE_SIZE)
              }}
              placeholder="Search releases…"
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
          <div className="flex items-center gap-2">
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
              className="select-chevron h-11 rounded-field border-[1.5px] border-brand-700 bg-brand-900 pl-3.5 text-[15px] text-bone hover:border-brand-500"
            >
              <option value="newest">Newest</option>
              <option value="artist">By artist</option>
              <option value="compilations">Compilations</option>
            </select>
          </div>
        </div>

        {list.length === 0 ? (
          <p className="py-12 text-center text-brand-300">No releases found matching “{query}”.</p>
        ) : (
          <div className="grid grid-cols-2 gap-x-3.5 gap-y-8 lg:grid-cols-4 lg:gap-6">
            {list.slice(0, visible).map((release, index) => {
              const isSelected = release.id === (player.current?.id ?? selected?.id)
              return (
                <motion.article
                  key={release.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: (index % PAGE_SIZE) * 0.05 }}
                  className="group/card flex flex-col gap-3.5"
                >
                  <button
                    type="button"
                    onClick={() => play(release)}
                    aria-label={`Play ${release.title}`}
                    aria-pressed={isSelected}
                    className={[
                      "group relative block overflow-hidden rounded-panel border-2",
                      isSelected ? "border-accent" : "border-transparent",
                    ].join(" ")}
                  >
                    <img
                      src={release.coverUrl}
                      alt=""
                      loading="lazy"
                      className="aspect-square w-full bg-brand-800 object-cover transition duration-300 group-hover:scale-[1.04] group-hover:opacity-80"
                    />
                    <span className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
                      <span className="flex h-12 w-12 items-center justify-center rounded-[2px] bg-accent text-brand-950">
                        <Play className="h-6 w-6 translate-x-0.5" fill="currentColor" aria-hidden="true" />
                      </span>
                    </span>
                  </button>
                  <div className="flex flex-col gap-1">
                    <h3 className="font-display text-[13px] leading-snug md:text-[15px]">{release.title}</h3>
                    <span className="text-small text-bone/80 md:text-[15px]">{release.artist}</span>
                    <span className="text-xs text-brand-300">
                      {release.catalogNumber && `${release.catalogNumber} · `}
                      {TYPE_LABELS[release.type]} · {release.releaseDate}
                    </span>
                  </div>
                  <a
                    href={release.bandcampUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-link self-start text-sm opacity-0 transition-opacity focus-visible:opacity-100 group-hover/card:opacity-100"
                  >
                    View on Bandcamp
                  </a>
                </motion.article>
              )
            })}
          </div>
        )}

        {visible < list.length && (
          <button type="button" onClick={() => setVisible((v) => v + PAGE_SIZE)} className="btn-secondary self-start">
            Load more releases
          </button>
        )}
      </section>

      {/* Support the label */}
      {bandcampStore && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-col gap-5 border-t border-brand-700 pt-10 md:pt-14"
        >
          <div className="flex max-w-[620px] flex-col gap-2">
            <h2 className="font-display text-xl md:text-[26px]">Support the label</h2>
            <p className="text-body">
              All releases are available on Bandcamp. Buying music there supports the artists and the label directly.
            </p>
          </div>
          <a href={bandcampStore} target="_blank" rel="noreferrer" className="btn-primary self-start">
            Visit Bandcamp store
          </a>
        </motion.section>
      )}
    </div>
  )
}
