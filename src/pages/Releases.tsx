import { useState } from "react"
import { Helmet } from "react-helmet-async"
import { motion } from "framer-motion"
import { ExternalLink } from "lucide-react"
import { releases } from "../data/releases"
import BandcampPlayer from "../components/BandcampPlayer"

export default function Releases() {
  const [selectedRelease, setSelectedRelease] = useState(releases[0])

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
          className="space-y-3"
        >
          <h1 className="text-3xl md:text-4xl font-bold">Releases</h1>
          <p className="text-white/60 max-w-2xl">
            Explore our discography of psychedelic trance. Albums, EPs, and
            compilations from our international roster. All releases available on
            Bandcamp.
          </p>
        </motion.div>

        {/* Featured Player */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="border border-white/10 rounded-2xl p-6 md:p-8 bg-brand-700/10"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-xs text-white/40 uppercase tracking-wider mb-2">
                Now Playing
              </p>
              <h2 className="text-2xl font-bold">{selectedRelease.title}</h2>
              <p className="text-white/60">{selectedRelease.artist}</p>
            </div>
            <a
              href={selectedRelease.bandcampUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 border border-white/40 hover:border-white/80 hover:bg-white/5 text-white text-sm rounded-lg transition-all flex items-center gap-2"
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
          <h3 className="text-xl font-semibold">All Releases</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {releases.map((release, index) => (
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
                      <p className="text-xs text-white/40 uppercase tracking-wider mb-1">
                        {release.catalogNumber}
                      </p>
                    )}
                    <h4 className="font-semibold text-sm line-clamp-2">
                      {release.title}
                    </h4>
                    <p className="text-xs text-white/60 mt-1">{release.artist}</p>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-white/40 capitalize">{release.type}</span>
                    <span className="text-white/40">{release.releaseDate}</span>
                  </div>

                  {/* Bandcamp Link */}
                  <a
                    href={release.bandcampUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block mt-3 px-4 py-2 text-center border border-white/20 hover:border-white/40 hover:bg-white/5 rounded-lg text-xs transition-all"
                  >
                    View on Bandcamp
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Bandcamp CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center py-12 border-t border-white/10"
        >
          <h3 className="text-2xl font-bold mb-4">Support the Label</h3>
          <p className="text-white/60 mb-6 max-w-xl mx-auto">
            All releases are available on Bandcamp. Your support helps us continue
            releasing cutting-edge psychedelic music.
          </p>
          <a
            href="https://transubtilrec.bandcamp.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-3 border-2 border-white/80 hover:bg-white hover:text-black text-white font-medium rounded-lg transition-all"
          >
            <ExternalLink className="w-5 h-5" />
            Visit Bandcamp Store
          </a>
        </motion.div>
      </section>
    </>
  )
}
