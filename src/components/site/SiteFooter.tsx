import { useState, type FormEvent } from "react"
import { Link } from "react-router-dom"
import brandmark from "../../assets/design/assets/brandmark-white.png"
import { activeSocialLinks } from "../../config/site"

function NewsletterBand() {
  const [notice, setNotice] = useState<string | null>(null)

  // TODO(newsletter phase): POST to /api/subscribe (D1 + double opt-in)
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    setNotice("Sign-ups open very soon. Thanks for your patience!")
  }

  return (
    <section id="newsletter" className="bg-accent text-brand-950">
      <div className="mx-auto flex max-w-page flex-wrap items-center justify-between gap-8 px-4 py-10 md:px-6 md:py-14">
        <div className="flex flex-[1_1_380px] flex-col gap-2.5">
          <h2 className="font-display text-2xl font-bold leading-tight md:text-[32px]">Stay in touch.</h2>
          <p className="text-[17px] leading-normal">Releases, gigs and free downloads. One email a month, no more.</p>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-[1_1_420px] flex-wrap gap-3">
          <label htmlFor="nl-email" className="sr-only">
            Email
          </label>
          <input
            id="nl-email"
            type="email"
            required
            autoComplete="email"
            placeholder="your@email.com"
            className="h-[52px] min-w-0 flex-[1_1_240px] rounded-full border-2 border-brand-950 bg-accent px-[18px] text-base font-medium text-brand-950 placeholder:text-brand-950/60 focus-visible:outline-brand-950"
          />
          <button
            type="submit"
            className="h-[52px] rounded-full bg-brand-950 px-[26px] font-bold text-accent focus-visible:outline-brand-950"
          >
            Subscribe
          </button>
          <p role="status" className="w-full text-small font-semibold">
            {notice}
          </p>
        </form>
      </div>
    </section>
  )
}

export default function SiteFooter() {
  return (
    <footer className="w-full bg-brand-950 text-bone">
      <NewsletterBand />
      <div className="mx-auto flex max-w-page flex-col gap-11 px-4 pb-10 pt-14 md:px-6">
        <div className="flex flex-wrap justify-between gap-10">
          <div className="flex flex-[1_1_280px] flex-col gap-4">
            <div className="flex items-center gap-3">
              <img src={brandmark} alt="" className="w-14" />
              <span className="font-display text-lg font-bold tracking-[0.08em]">TRANSUBTIL</span>
            </div>
            <p className="max-w-[340px] text-[15px] leading-relaxed text-brand-300">
              Independent psychedelic music label. Ten years of psytrance, darkpsy and forest from Marseille, France.
            </p>
          </div>

          <nav aria-label="Footer" className="flex flex-wrap gap-16 text-[15px]">
            <div className="flex flex-col gap-3">
              <span className="text-label uppercase text-brand-300">Label</span>
              <Link to="/artists" className="text-bone hover:text-accent">Artists</Link>
              <Link to="/releases" className="text-bone hover:text-accent">Releases</Link>
              <Link to="/label#demo" className="text-bone hover:text-accent">Send a demo</Link>
              <Link to="/contact" className="text-bone hover:text-accent">Contact</Link>
            </div>
            <div className="flex flex-col gap-3">
              <span className="text-label uppercase text-brand-300">Follow</span>
              {activeSocialLinks.map((link) => (
                <a key={link.label} href={link.href} target="_blank" rel="noreferrer" className="text-bone hover:text-accent">
                  {link.label}
                </a>
              ))}
            </div>
          </nav>
        </div>

        <div className="flex flex-wrap justify-between gap-4 border-t border-brand-700 pt-6 text-[13px] text-brand-300">
          <span>© {new Date().getFullYear()} Transubtil Records</span>
          {/* TODO: legal notice and privacy pages (content phase) */}
        </div>
      </div>
    </footer>
  )
}
