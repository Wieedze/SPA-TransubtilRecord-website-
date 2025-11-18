import { Helmet } from "react-helmet-async"
import { motion } from "framer-motion"

export default function Home() {
  return (
    <>
      <Helmet>
        <title>Transubtil Records — Psychedelic Music Label</title>
        <meta
          name="description"
          content="Transubtil Records is a psychedelic music label dedicated to deep, hypnotic and powerful soundscapes for dancefloors and night-time journeys."
        />
      </Helmet>

      <section className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-6"
        >
          <p className="uppercase tracking-[0.35em] text-xs text-brand-acid">
            Psychedelic Music Label
          </p>

          <h1 className="text-4xl md:text-5xl font-light">
            Transubtil Records{" "}
            <span className="font-semibold text-brand-300">
              psytrance &amp; beyond.
            </span>
          </h1>

          <p className="max-w-xl text-sm text-white/70">
            Curated psychedelic journeys for night-time floors and deep
            listeners. Explore our artists, releases and upcoming sonic rituals.
          </p>
        </motion.div>
      </section>
    </>
  )
}
