import { Link } from "react-router-dom"
import brandmark from "../../assets/design/assets/brandmark-white.png"
import artwork from "../../assets/design/assets/artwork-10-years.jpg"
import { BOOKING_PATH } from "../../config/site"

const tileBase =
  "flex h-14 items-center justify-between rounded-panel px-5 font-bold md:h-16 md:px-[22px] md:text-[17px]"
const tileDark = `${tileBase} border-[1.5px] border-brand-700 bg-brand-900/80 text-bone hover:border-accent hover:text-bone`

// Spinning artwork, dark vignette and yellow halo. Rendered inside a fixed,
// full-viewport layer so it stays behind the whole home page.
export function HeroBackground() {
  return (
    <>
      <div className="absolute inset-[-30%] flex items-center justify-center">
        <img
          src={artwork}
          alt=""
          className="w-[140%] min-w-[900px] max-w-[2000px] animate-spin-slow opacity-[0.38]"
        />
      </div>
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 50% 45%, rgba(7,6,11,0.55) 0%, rgba(7,6,11,0.92) 55%, #07060B 85%)",
        }}
      />
      <div
        className="absolute left-1/2 top-[38%] -ml-[160px] -mt-[160px] h-[320px] w-[320px] animate-halo rounded-full md:-ml-[260px] md:-mt-[260px] md:h-[520px] md:w-[520px]"
        style={{ background: "radial-gradient(circle, rgba(249,188,20,0.35), rgba(249,188,20,0) 65%)" }}
      />
    </>
  )
}

// Content of the home hero (01-home / mobile-home mockups)
export default function HeroContent() {
  return (
    <div className="relative flex w-full max-w-[960px] flex-col items-center gap-5 px-8 text-center md:gap-7 md:px-4">
      <img src={brandmark} alt="Transubtil Records" className="w-[190px] animate-breathe md:w-[min(300px,26svh)]" />
      <h1 className="font-display text-[34px] font-extrabold uppercase leading-[1.05] tracking-[0.01em] sm:text-5xl md:text-[64px]">
        Transubtil Records
      </h1>
      <p className="max-w-[620px] text-base leading-relaxed text-body md:text-[19px]">
        Psytrance, darkpsy and forest. Artists to book for your festival, releases to play tonight.
      </p>
      <div className="mt-2 grid w-full max-w-[820px] grid-cols-1 gap-2.5 md:mt-3 md:grid-cols-3 md:gap-4">
        <Link to="/artists" className={tileDark}>
          Artists <span aria-hidden="true" className="text-accent">→</span>
        </Link>
        <Link to="/releases" className={tileDark}>
          Releases <span aria-hidden="true" className="text-accent">→</span>
        </Link>
        <Link
          to={BOOKING_PATH}
          className={`${tileBase} order-first bg-accent text-brand-950 hover:bg-accent-hover hover:text-brand-950 md:order-none`}
        >
          Booking <span aria-hidden="true">→</span>
        </Link>
      </div>
    </div>
  )
}
