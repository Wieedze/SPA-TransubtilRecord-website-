import { useState, type FormEvent } from "react"
import Seo from "../components/site/Seo"
import { breadcrumbLd, labelLd } from "../lib/structuredData"
import { motion } from "framer-motion"
import DecryptedText from "../components/DecryptedText"
import { fieldClass, labelClass, textareaClass } from "../components/site/formStyles"
import { roster } from "../data/roster"
import { releases } from "../data/releases"
import artwork from "../assets/design/assets/artwork-10-years.jpg"

const STATS = [
  { value: "10", label: "years running" },
  { value: String(releases.length), label: "releases" },
  { value: String(roster.length), label: "artists" },
]

const DEMO_FIELDS = [
  { id: "dm-name", name: "artist", label: "Artist name *", type: "text", placeholder: "Your alias", required: true, span: false },
  { id: "dm-mail", name: "email", label: "Email *", type: "email", placeholder: "you@email.com", required: true, span: false },
  { id: "dm-title", name: "track", label: "Track title *", type: "text", placeholder: "Title of the track you send", required: true, span: true },
  { id: "dm-link", name: "link", label: "Listening link *", type: "url", placeholder: "https://soundcloud.com/…", required: true, span: true },
] as const

function DemoForm() {
  const [notice, setNotice] = useState<string | null>(null)

  // TODO(forms phase): POST to /api/demo (email to the label + D1 log)
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    setNotice("Demo submissions open very soon. Thanks for your patience!")
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-5 md:grid-cols-2">
      {DEMO_FIELDS.map((field) => (
        <div key={field.id} className={`flex flex-col gap-2 ${field.span ? "md:col-span-2" : ""}`}>
          <label htmlFor={field.id} className={labelClass}>
            {field.label}
          </label>
          <input
            id={field.id}
            name={field.name}
            type={field.type}
            placeholder={field.placeholder}
            required={field.required}
            className={fieldClass}
          />
        </div>
      ))}
      <div className="flex flex-col gap-2 md:col-span-2">
        <label htmlFor="dm-msg" className={labelClass}>
          Message
        </label>
        <textarea id="dm-msg" name="message" rows={5} placeholder="Your background, style, projects…" className={textareaClass} />
      </div>
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3 md:col-span-2">
        <button type="submit" className="btn-primary">
          Send my demo
        </button>
        <p role="status" className="text-small text-brand-300">
          {notice ?? "One submission per artist per month."}
        </p>
      </div>
    </form>
  )
}

export default function Label() {
  return (
    <div className="flex flex-col">
      <Seo
        title="About the label — Transubtil Records, international psytrance from France"
        description="Transubtil Records is an international psychedelic-trance label from France: darkpsy, forest and night sounds, artists from all over the world, ten years of releases. Our story, and how to send us your demo."
        path="/label"
        jsonLd={[labelLd(), breadcrumbLd([{ name: "Home", path: "/" }, { name: "Label", path: "/label" }])]}
      />

      {/* Story */}
      <section className="grid grid-cols-1 items-start gap-10 md:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] md:gap-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="flex flex-col gap-6"
        >
          <div className="flex flex-col gap-4">
            <h1 className="font-display text-[30px] uppercase leading-[1.1] md:text-[46px]">
              <DecryptedText text="Ten years of subtle trance" animateOn="view" speed={50} maxIterations={8} />
            </h1>
            <p className="meta">France · International · Psytrance · Darkpsy · Forest</p>
          </div>
          <div className="flex max-w-[62ch] flex-col gap-4 text-[17px] leading-[1.7] text-body">
            <p>
              Transubtil Records is a French psychedelic-trance label born from a passion for underground sound
              and collective spirit. What began as a local association dedicated to supporting emerging DJs and producers
              has evolved into a fully active label shaping the next generation of psytrance.
            </p>
            <p>
              Our mission goes beyond releasing music: we help artists structure their projects, navigate challenges, and
              access professional tools, providing a creative home for producers ready to grow.
            </p>
            <p>
              Specialized in psychedelic trance, darkpsy, forest and night-oriented sounds, Transubtil Records embraces
              deep grooves, experimental textures and the raw energy of the underground, connecting the French scene's creative
              pulse to the global psytrance movement.
            </p>
          </div>
          <dl className="grid grid-cols-3 border-y border-brand-700">
            {STATS.map((stat) => (
              <div key={stat.label} className="flex flex-col gap-1 py-5 pr-4">
                <dt className="order-2 text-xs uppercase tracking-[0.12em] text-brand-300">{stat.label}</dt>
                <dd className="order-1 font-display text-[28px] tabular-nums text-accent md:text-[36px]">{stat.value}</dd>
              </div>
            ))}
          </dl>
        </motion.div>
        <motion.img
          src={artwork}
          alt="10 Years of Transubtil compilation artwork"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="aspect-square w-full object-cover"
        />
      </section>

      {/* Demo */}
      <section id="demo" className="mt-20 scroll-mt-28 border-t border-brand-700 pt-12 md:mt-24 md:pt-16">
        <div className="grid grid-cols-1 items-start gap-10 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:gap-16">
          <div className="flex flex-col gap-5">
            <h2 className="font-display text-[22px] leading-tight md:text-[30px]">
              <DecryptedText text="Send your demo" animateOn="view" speed={60} maxIterations={5} />
            </h2>
            <p className="text-body">We listen to everything. To help us listen fast:</p>
            <ol className="flex list-decimal flex-col gap-2 pl-5 text-body marker:text-accent">
              <li>A private SoundCloud, Dropbox or Drive link, no attachments.</li>
              <li>Two or three finished tracks, mastered or close to it.</li>
              <li>A few words about you and what you are looking for.</li>
            </ol>
          </div>
          <DemoForm />
        </div>
      </section>
    </div>
  )
}
