import { useState, type FormEvent } from "react"
import { Link } from "react-router-dom"
import logo from "../../assets/brand/transubtil-logo-white.svg"
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
          <h2 className="font-display text-xl leading-tight md:text-[26px]">Stay in touch.</h2>
          <p className="text-[17px] leading-normal">Releases, gifts and free downloads.</p>
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
            className="h-10 min-w-0 flex-[1_1_240px] rounded-[2px] border border-brand-950 bg-accent px-[18px] text-base font-medium text-brand-950 placeholder:text-brand-950/60 focus-visible:outline-brand-950"
          />
          <button
            type="submit"
            className="h-10 rounded-[2px] bg-brand-950 px-4 text-xs font-medium uppercase tracking-[0.16em] text-accent focus-visible:outline-brand-950"
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
            <img src={logo} alt="Transubtil Records" className="h-12 self-start" />
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
