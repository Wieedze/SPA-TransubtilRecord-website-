import type { CSSProperties } from "react"
import bandLeft from "../../assets/design/assets/band-left.svg"
import bandRight from "../../assets/design/assets/band-right.svg"

// Two fixed strips on the outer edges of the site, filled with the yellow flames cut
// from the edges of the "10 Years" artwork (band-*.svg: a traced 360 px slice plus its
// vertical mirror, so it repeats without a seam). Vector, so it stays sharp on
// high-density screens. Wide screens only.
const BAND = "max(20px, calc((100vw - 1280px) / 2))"

function Strip({ side }: { side: "left" | "right" }) {
  const motif: CSSProperties = {
    backgroundImage: `url(${side === "left" ? bandLeft : bandRight})`,
    backgroundRepeat: "repeat-y",
    backgroundSize: "360px auto",
    // Anchor the slice to the screen edge it was cut from
    backgroundPosition: `${side} top`,
  }
  return (
    <div
      className={`fixed inset-y-0 bg-brand-950 ${side === "left" ? "border-r" : "border-l"} border-brand-700`}
      style={{ width: BAND, [side]: 0 }}
    >
      <div className="absolute inset-0 opacity-60" style={motif} />
    </div>
  )
}

export default function SideBands() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-20 hidden lg:block">
      <Strip side="left" />
      <Strip side="right" />
    </div>
  )
}
