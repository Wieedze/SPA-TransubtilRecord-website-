import { useParams, Link, Navigate } from "react-router-dom"
import { useEffect } from "react"
import { Helmet } from "react-helmet-async"
import { motion } from "framer-motion"
import { ArrowLeft, MapPin, ExternalLink } from "lucide-react"
import { getArtistBySlug } from "../data/artists"
import { getReleasesByArtist } from "../data/releases"
import SocialLinks from "../components/artists/SocialLinks"
import BookingForm from "../components/BookingForm"
import SoundCloudPlayer from "../components/SoundCloudPlayer"
import HubArtisteAnimated from "../components/artists/HubArtisteAnimated"
import artistHeaderLine from "../assets/artist_header_line.svg"
import DecryptedText from "../components/DecryptedText"

export default function ArtistProfile() {
  const { slug } = useParams<{ slug: string }>()
  const artist = slug ? getArtistBySlug(slug) : undefined
  const artistReleases = artist ? getReleasesByArtist(artist.name) : []

  // Scroll to top when component mounts or slug changes
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [slug])

  // If artist not found, redirect to artists page
  if (!artist) {
    return <Navigate to="/artists" replace />
  }

  return (
    <>
      <Helmet>
        <title>{artist.name} — Transubtil Records</title>
        <meta
          name="description"
          content={
            artist.description ||
            `${artist.name} - ${artist.style.join(", ")} artist from ${artist.country}`
          }
        />
      </Helmet>

      <article className="mx-auto max-w-6xl space-y-8">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Link
            to="/artists"
            className="inline-flex items-center gap-2 uppercase tracking-[0.25em] text-[11px] text-white/60 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Artists
          </Link>
        </motion.div>

        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="grid md:grid-cols-5 gap-8"
        >
          {/* Image */}
          <div className="md:col-span-2">
            <div
              className="relative mx-auto"
              style={{
                aspectRatio: '306 / 307',
                maxWidth: '400px',
                filter: 'drop-shadow(0 0 25px rgba(250, 244, 211, 0.6)) drop-shadow(0 0 35px rgba(250, 244, 211, 0.4))'
              }}
            >
              {/* SVG ClipPath Definition */}
              <svg width="0" height="0" style={{ position: 'absolute' }}>
                <defs>
                  <clipPath id="hub-circle-clip" clipPathUnits="objectBoundingBox">
                    {/* Circle scaled to 0-1 range for objectBoundingBox */}
                    <circle cx="0.5" cy="0.5" r="0.42" />
                  </clipPath>
                </defs>
              </svg>

              {/* Animated Hub SVG Frame */}
              <div className="absolute inset-0 w-full h-full z-10 opacity-60">
                <HubArtisteAnimated />
              </div>

              {/* Artist Image - clipped to exact circular area */}
              <div
                className="absolute w-full h-full"
                style={{
                  clipPath: 'url(#hub-circle-clip)'
                }}
              >
                <img
                  src={artist.image_url}
                  alt={artist.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = "/images/placeholder.webp"
                  }}
                />
              </div>
            </div>
          </div>

          {/* Info */}
          <div className="md:col-span-3 flex flex-col justify-center space-y-6">
            {/* Header */}
            <div className="space-y-4">
              <div>
                <h1 className="font-display text-4xl md:text-5xl font-bold capitalize">
                  {artist.name}
                </h1>

                {/* Decorative Line */}
                <div className="mt-3">
                  <img
                    src={artistHeaderLine}
                    alt=""
                    className="w-full max-w-md opacity-60"
                    aria-hidden="true"
                  />
                </div>

                <p className="uppercase tracking-[0.25em] text-[11px] text-white/60 mt-1">
                  <DecryptedText
                    text={artist.act}
                    animateOn="view"
                    speed={120}
                    maxIterations={10}
                    revealDirection="center"
                  />
                </p>
              </div>

              {/* Location */}
              <div className="flex items-center gap-2 text-white/60">
                <MapPin className="w-4 h-4" />
                <span className="uppercase tracking-[0.25em] text-[11px]">
                  <DecryptedText
                    text={artist.country}
                    animateOn="view"
                    speed={180}
                    maxIterations={15}
                    revealDirection="center"
                  />
                </span>
              </div>

              {/* Styles */}
              <div className="flex flex-wrap gap-2">
                {artist.style.map((style) => (
                  <span
                    key={style}
                    className="px-3 py-1 rounded-full bg-brand-700/50 text-brand-300 uppercase tracking-[0.25em] text-[11px] border border-brand-300/20"
                  >
                    <DecryptedText
                      text={style}
                      animateOn="view"
                      speed={180}
                      maxIterations={15}
                      revealDirection="center"
                    />
                  </span>
                ))}
              </div>

              {/* Social Links */}
              <SocialLinks social={artist.social} className="!gap-4" />
            </div>
          </div>
        </motion.div>

        {/* Description */}
        {artist.description && (
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.35 }}
            className="space-y-3"
          >
            <h2 className="text-xl font-semibold uppercase tracking-[0.25em]">
              <DecryptedText
                text="Biography"
                animateOn="view"
                speed={60}
                maxIterations={5}
                revealDirection="center"
              />
            </h2>
            <p className="uppercase tracking-[0.25em] text-[11px] text-white/70 leading-relaxed">
              {artist.description}
            </p>
          </motion.section>
        )}

        {/* SoundCloud Player Section */}
        {artist.social.soundcloud && (
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.55 }}
            className="space-y-6"
          >
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold uppercase tracking-[0.25em]">
                <DecryptedText
                  text="Latest Tracks"
                  animateOn="view"
                  speed={60}
                  maxIterations={5}
                  revealDirection="center"
                />
              </h2>
              <p className="uppercase tracking-[0.25em] text-[11px] text-white/60">
                Listen to the latest releases and mixes from {artist.name}
              </p>
            </div>
            <SoundCloudPlayer
              soundcloudUrl={artist.social.soundcloud}
              artistName={artist.name}
              height={450}
              visual={true}
            />
          </motion.section>
        )}

        {/* Videos Section */}
        {artist.videos && artist.videos.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.75 }}
            className="space-y-6"
          >
            <h2 className="text-2xl font-semibold uppercase tracking-[0.25em]">Live Performances</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {artist.videos.map((videoUrl, index) => (
                <div
                  key={index}
                  className="aspect-video bg-brand-700 rounded-xl border border-white/10 overflow-hidden"
                >
                  {/* TODO: Add YouTube embed when videos are available */}
                  <div className="w-full h-full flex items-center justify-center text-white/40 uppercase tracking-[0.25em] text-[11px]">
                    Video Player
                  </div>
                </div>
              ))}
            </div>
          </motion.section>
        )}

        {/* Releases Section */}
        {artistReleases.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.95 }}
            className="space-y-6"
          >
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold uppercase tracking-[0.25em]">
                <DecryptedText
                  text="Releases on Transubtil Records"
                  animateOn="view"
                  speed={60}
                  maxIterations={5}
                  revealDirection="center"
                />
              </h2>
              <p className="uppercase tracking-[0.25em] text-[11px] text-white/60">
                {artistReleases.length} release{artistReleases.length > 1 ? "s" : ""} by {artist.name}
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {artistReleases.map((release, index) => (
                <motion.div
                  key={release.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                  className="border border-white/10 hover:border-white/30 rounded-xl p-4 transition-all space-y-3"
                >
                  {/* Cover Image */}
                  <div className="aspect-square bg-brand-700 rounded-lg overflow-hidden border border-white/10">
                    <img
                      src={release.coverUrl}
                      alt={`${release.title} cover`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>

                  {/* Info */}
                  <div className="space-y-2">
                    <div>
                      <h4 className="font-semibold uppercase tracking-[0.25em] text-[11px] line-clamp-2">
                        {release.title}
                      </h4>
                      <p className="uppercase tracking-[0.25em] text-[11px] text-white/60 mt-1">{release.artist}</p>
                    </div>

                    <div className="flex items-center justify-between uppercase tracking-[0.25em] text-[11px]">
                      <span className="text-white/40">{release.type}</span>
                      <span className="text-white/40">{release.releaseDate}</span>
                    </div>

                    {/* Bandcamp Link */}
                    <a
                      href={release.bandcampUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 px-4 py-2 text-center border border-white/20 hover:border-white/40 hover:bg-white/5 rounded-lg uppercase tracking-[0.25em] text-[11px] transition-all"
                    >
                      <ExternalLink className="w-3 h-3" />
                      View on Bandcamp
                    </a>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}

        {/* Booking Section */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 1.15 }}
          className="space-y-6"
        >
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold uppercase tracking-[0.25em]">
              <DecryptedText
                text={`Book ${artist.name}`}
                animateOn="view"
                speed={60}
                maxIterations={5}
                revealDirection="center"
              />
            </h2>
            <p className="uppercase tracking-[0.25em] text-[11px] text-white/60">
              Interested in booking {artist.name} for your event? Fill out the form below
              and we'll get back to you as soon as possible.
            </p>
          </div>

          <div className="border border-white/10 rounded-2xl p-6 md:p-8 bg-brand-700/10">
            <BookingForm artistId={artist.id} artistName={artist.name} />
          </div>
        </motion.section>
      </article>
    </>
  )
}
