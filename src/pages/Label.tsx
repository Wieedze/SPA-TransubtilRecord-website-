import { useState, type FormEvent } from "react"
import Seo from "../components/site/Seo"
import { breadcrumbLd, labelLd } from "../lib/structuredData"
import { motion } from "framer-motion"
import DecryptedText from "../components/DecryptedText"
import { fieldClass, labelClass, textareaClass } from "../components/site/formStyles"

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
          {notice}
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
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="mx-auto flex max-w-[720px] flex-col items-center gap-6 text-center"
      >
        {/* No visible title: the h1 stays for search engines and screen readers */}
        <h1 className="sr-only">Transubtil Records, international psytrance label from France</h1>
        <div className="flex flex-col gap-4 text-[17px] leading-[1.7] text-body">
          <p>
            Transubtil Records is a French psychedelic-trance label born from a passion for underground sound and
            collective spirit. What began as a local association dedicated to supporting emerging DJs and producers has
            evolved into a fully active label shaping the next generation of psytrance.
          </p>
          <p>
            Our mission goes beyond releasing music: we help artists structure their projects, navigate challenges, and
            access professional tools, providing a creative home for producers ready to grow.
          </p>
          <p>
            Specialized in psychedelic trance, darkpsy, forest and night-oriented sounds, Transubtil Records embraces deep
            grooves, experimental textures and the raw energy of the underground.
          </p>
        </div>
      </motion.section>

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
              <li>Two or three finished tracks.</li>
              <li>A few words about you and what you are looking for.</li>
            </ol>
          </div>
          <DemoForm />
        </div>
      </section>
    </div>
  )
}
