import { useState, useMemo } from "react"
import { Helmet } from "react-helmet-async"
import { motion } from "framer-motion"
import { ExternalLink, Search } from "lucide-react"
import { releases } from "../data/releases"
import BandcampPlayer from "../components/BandcampPlayer"

export default function Releases() {
  const [selectedRelease, setSelectedRelease] = useState(releases[0])
  const [searchQuery, setSearchQuery] = useState("")

  // Filter releases based on search query
  const filteredReleases = useMemo(() => {
    if (!searchQuery.trim()) return releases

    const query = searchQuery.toLowerCase()
    return releases.filter(
      (release) =>
        release.title.toLowerCase().includes(query) ||
        release.artist.toLowerCase().includes(query) ||
        release.catalogNumber?.toLowerCase().includes(query)
    )
  }, [searchQuery])

  return (
    <>
      <Helmet>
        <title>Releases — Transubtil Records</title>
        <meta
          name="description"
          content="Explore the full Transubtil Records discography. Dark psy, forest, twilight releases from international artists."
        />
      </Helmet>

      <section className="mx-auto max-w-6xl space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-4 text-center"
        >
        </motion.div>

        {/* Featured Player */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="border border-white/10 rounded-xl p-4 md:p-6 bg-brand-700/10"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
            <div>
              <p className="font-sans uppercase tracking-[0.25em] text-[11px] text-white/40 mb-1">
                Now Playing
              </p>
              <h2 className="font-display text-xl font-bold capitalize tracking-wide">{selectedRelease.title}</h2>
              <p className="font-sans text-brand-300/70 uppercase tracking-[0.25em] text-[11px]">{selectedRelease.artist}</p>
            </div>
            <a
              href={selectedRelease.bandcampUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-4 py-2 border border-white/40 hover:border-white/80 hover:bg-white/5 text-white font-sans uppercase tracking-[0.25em] text-[11px] rounded-lg transition-all flex items-center justify-center gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              <span className="hidden sm:inline">Buy on Bandcamp</span>
            </a>
          </div>

          <BandcampPlayer
            albumId={selectedRelease.bandcampId}
            type={selectedRelease.type === "track" ? "track" : "album"}
          />
        </motion.div>

        {/* Releases Grid */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <h3 className="font-display text-2xl font-bold uppercase tracking-[0.25em]">All Releases</h3>

            {/* Search Bar */}
            <div className="relative w-full sm:w-auto sm:min-w-[300px]">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="SEARCH RELEASES..."
                className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:border-brand-500 focus:outline-none text-white placeholder:text-white/40 uppercase tracking-[0.25em] text-[11px] transition-colors"
              />
            </div>
          </div>

          {filteredReleases.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredReleases.map((release, index) => (
              <motion.div
                key={release.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                className={`
                  border rounded-xl p-4 transition-all
                  ${
                    selectedRelease.id === release.id
                      ? "border-white/40 bg-white/5"
                      : "border-white/10 hover:border-white/30 hover:bg-white/5"
                  }
                `}
              >
                {/* Cover Image - Clickable to change player */}
                <button
                  onClick={() => setSelectedRelease(release)}
                  className="w-full aspect-square bg-brand-700 rounded-lg mb-4 overflow-hidden border border-white/10 hover:opacity-80 transition-opacity"
                >
                  <img
                    src={release.coverUrl}
                    alt={`${release.title} cover`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </button>

                {/* Info */}
                <div className="space-y-2">
                  <div>
                    {release.catalogNumber && (
                      <p className="font-sans uppercase tracking-[0.25em] text-[11px] text-white/40 mb-1">
                        {release.catalogNumber}
                      </p>
                    )}
                    <h4 className="font-display font-semibold text-sm line-clamp-2 capitalize tracking-wide">
                      {release.title}
                    </h4>
                    <p className="font-sans uppercase tracking-[0.25em] text-[11px] text-white/60 mt-1">{release.artist}</p>
                  </div>

                  <div className="flex items-center justify-between font-sans uppercase tracking-[0.25em] text-[11px]">
                    <span className="text-white/40">{release.type}</span>
                    <span className="text-white/40">{release.releaseDate}</span>
                  </div>

                  {/* Bandcamp Link */}
                  <a
                    href={release.bandcampUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block mt-3 px-4 py-2 text-center border border-white/20 hover:border-white/40 hover:bg-white/5 rounded-lg font-sans uppercase tracking-[0.25em] text-[11px] transition-all"
                  >
                    View on Bandcamp
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
          ) : (
            <div className="text-center py-12 border border-white/10 rounded-xl bg-white/5">
              <p className="text-white/60 uppercase tracking-[0.25em] text-[11px]">
                No releases found matching "{searchQuery}"
              </p>
            </div>
          )}
        </div>

        {/* Bandcamp CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center py-12 border-t border-white/10"
        >
          <h3 className="font-display text-2xl font-bold mb-4 uppercase tracking-[0.25em]">Support the Label</h3>
          <p className="font-sans text-white/60 mb-6 max-w-xl mx-auto uppercase tracking-[0.25em] text-[11px]">
            All releases are available on Bandcamp. Your support helps us continue
            releasing cutting-edge psychedelic music.
          </p>
          <a
            href="https://transubtilrec.bandcamp.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-3 border-2 border-white/80 hover:bg-white hover:text-black text-white font-sans font-medium uppercase tracking-[0.25em] text-[11px] rounded-lg transition-all"
          >
            <ExternalLink className="w-5 h-5" />
            Visit Bandcamp Store
          </a>
        </motion.div>
      </section>
    </>
  )
}
