import { Helmet } from "react-helmet-async"

export default function About() {
  return (
    <>
      <Helmet>
        <title>Transubtil Records — About</title>
      </Helmet>

      <section className="mx-auto max-w-3xl space-y-6">
        <h2 className="font-display text-4xl md:text-5xl font-bold tracking-wide text-center mb-8">
          About Transubtil Records
        </h2>

        <p className="font-sans text-base text-brand-300/70 leading-relaxed">
          Transubtil Records is a Marseille-based psychedelic-trance label born from a passion for underground sound and collective spirit. What began as a local association dedicated to supporting emerging DJs and producers has evolved into a fully active label shaping the next generation of psytrance.
        </p>

        <p className="font-sans text-base text-brand-300/70 leading-relaxed">
          Our mission goes beyond releasing music: we help artists structure their projects, navigate challenges, and access professional tools — providing a creative home for producers ready to grow.
        </p>

        <p className="font-sans text-base text-brand-300/70 leading-relaxed">
          Specialized in psychedelic trance, darkpsy, forest and night-oriented sounds, Transubtil Records embraces deep grooves, experimental textures and the raw energy of the underground — connecting Marseille's creative pulse to the global psytrance movement.
        </p>
      </section>
    </>
  )
}
