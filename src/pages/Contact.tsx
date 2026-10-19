import { useState, type FormEvent } from "react"
import Seo from "../components/site/Seo"
import { breadcrumbLd } from "../lib/structuredData"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import DecryptedText from "../components/DecryptedText"
import { fieldClass, labelClass, textareaClass } from "../components/site/formStyles"

// Each subject changes the message placeholder (06-contact mockup)
const SUBJECTS: Record<string, string> = {
  Press: "Outlet, publication date, what you need…",
  Partnership: "Your project, dates, what you offer…",
  Booking: "For a faster reply, use the form on the artist page.",
  Shop: "Order number and question…",
  Other: "Tell us everything.",
}

export default function Contact() {
  const [subject, setSubject] = useState("Press")
  const [notice, setNotice] = useState<string | null>(null)

  // TODO(forms phase): POST to /api/contact (email to the label + D1 log)
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    setNotice("The contact form opens very soon. Thanks for your patience!")
  }

  return (
    <div className="grid grid-cols-1 items-start gap-12 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:gap-16">
      <Seo
        title="Contact — Transubtil Records"
        description="Contact Transubtil Records, international psytrance label from France, for press, partnerships, shop questions or bookings."
        path="/contact"
        jsonLd={breadcrumbLd([{ name: "Home", path: "/" }, { name: "Contact", path: "/contact" }])}
      />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="flex flex-col gap-5"
      >
        <h1 className="font-display text-[30px] uppercase leading-[1.1] md:text-[46px]">
          <DecryptedText text="Talk to us" animateOn="view" speed={60} maxIterations={8} />
        </h1>
        <p className="max-w-[48ch] text-[17px] leading-[1.7] text-body">
          Press, partnerships, a question about an order. For bookings, use the artist page: it is faster.
        </p>
        <Link to="/artists" className="text-link self-start">
          Find an artist to book
        </Link>
        {/* TODO(content): direct contact email once the label confirms the address */}
      </motion.div>

      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.15 }}
        className="flex flex-col gap-6 border-t border-brand-700 pt-8 md:border-t-0 md:pt-0"
      >
        <fieldset className="flex flex-col gap-3">
          <legend className={`${labelClass} mb-3`}>Subject *</legend>
          <div className="flex flex-wrap gap-x-7 gap-y-2">
            {Object.keys(SUBJECTS).map((label) => {
              const active = label === subject
              return (
                <button
                  key={label}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setSubject(label)}
                  className={[
                    "border-b-2 py-1.5 text-base font-medium",
                    active ? "border-accent text-accent" : "border-transparent text-bone hover:text-accent",
                  ].join(" ")}
                >
                  {label}
                </button>
              )
            })}
          </div>
          <input type="hidden" name="subject" value={subject} />
        </fieldset>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div className="flex flex-col gap-2">
            <label htmlFor="ct-name" className={labelClass}>
              Name *
            </label>
            <input id="ct-name" name="name" type="text" required autoComplete="name" placeholder="First and last name" className={fieldClass} />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="ct-mail" className={labelClass}>
              Email *
            </label>
            <input id="ct-mail" name="email" type="email" required autoComplete="email" placeholder="you@email.com" className={fieldClass} />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="ct-msg" className={labelClass}>
            Message *
          </label>
          <textarea id="ct-msg" name="message" rows={6} required placeholder={SUBJECTS[subject]} className={textareaClass} />
        </div>

        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          <button type="submit" className="btn-primary">
            Send
          </button>
          <p role="status" className="text-small text-brand-300">
            {notice ?? "We reply within a few days."}
          </p>
        </div>
      </motion.form>
    </div>
  )
}
