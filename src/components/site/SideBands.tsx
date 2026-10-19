import type { CSSProperties } from "react"
import spiral from "../../assets/design/assets/spiral-yellow.webp"

// The home hero's rotating yellow spiral, as if it kept turning behind the whole page
// but only showed through two strips on the outer edges of the site. Both strips draw
// the same spiral centred on the viewport, so their rotation lines up. Wide screens only.
const BAND = "max(20px, calc((100vw - 1280px) / 2))"
const SPIRAL_SIZE = "min(2600px, max(900px, 224vw))"

function Strip({ side }: { side: "left" | "right" }) {
  // Offset that puts the spiral's centre on the viewport centre, from inside this strip
  const centreX = side === "left" ? "50vw" : `calc(${BAND} - 50vw)`
  const strip: CSSProperties = { width: BAND, [side]: 0 }
  const holder: CSSProperties = { left: centreX, width: SPIRAL_SIZE, height: SPIRAL_SIZE }

  return (
    <div
      className={`fixed inset-y-0 overflow-hidden bg-brand-950 ${side === "left" ? "border-r" : "border-l"} border-brand-700`}
      style={strip}
    >
      <div className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2" style={holder}>
        <img src={spiral} alt="" className="h-full w-full animate-spin-slow opacity-60" />
      </div>
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
