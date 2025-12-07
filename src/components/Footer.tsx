export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-brand-900/80">
      <div className="mx-auto max-w-6xl px-4 py-6 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-white/50">
        <p>
          © {new Date().getFullYear()} Transubtil Records. All rights reserved.
        </p>
        <p className="uppercase tracking-[0.25em] text-white/40 text-center">
          Psychedelic Trance &amp; Deep Sonic Journeys
        </p>
      </div>
    </footer>
  )
}
