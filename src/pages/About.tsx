import { Helmet } from "react-helmet-async"

export default function About() {
  return (
    <>
      <Helmet>
        <title>Transubtil Records — About</title>
      </Helmet>

      <section className="mx-auto max-w-3xl space-y-6">
        <h2 className="text-2xl font-semibold tracking-tight">
          About Transubtil Records
        </h2>
        <p className="text-sm text-white/70 leading-relaxed">
          Transubtil Records is a psychedelic music label focusing on
          story-driven psytrance, night-time journeys and deep sonic exploration.
          Built by artists for dancers, the label aims to connect raw energy,
          detailed sound design and immersive atmospheres.
        </p>
        <p className="text-sm text-white/70 leading-relaxed">
          From intimate club nights to open-air festivals, our releases are
          designed to be experienced loud, on proper sound systems, and to
          resonate long after the last kick drum fades away.
        </p>
      </section>
    </>
  )
}
