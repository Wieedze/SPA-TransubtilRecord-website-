import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react"
import { animate, useMotionValue } from "framer-motion"

// Home intro: the hero content starts scaled up so the hero fills the whole viewport,
// then "pulls back" (camera dezoom) to its place in the page while the fixed background
// eases back too. Plays once per session, starts after AUTO_DELAY_MS or as soon as the
// visitor scrolls, taps or presses a key.

export type IntroPhase = "intro" | "zooming" | "done"

const SESSION_KEY = "tr-intro-played"
const AUTO_DELAY_MS = 2500
export const ZOOM_DURATION = 1.3 // seconds
const BACKGROUND_START_SCALE = 1.2
const ZOOM_EASE = [0.76, 0, 0.24, 1] as const
const SKIP_KEYS = new Set([" ", "ArrowDown", "PageDown", "End", "Enter", "Escape"])

function shouldPlayIntro(): boolean {
  if (typeof window === "undefined") return false
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false
  try {
    return sessionStorage.getItem(SESSION_KEY) !== "1"
  } catch {
    return true
  }
}

function markIntroPlayed() {
  try {
    sessionStorage.setItem(SESSION_KEY, "1")
  } catch {
    // storage unavailable (private mode): the intro may replay, harmless
  }
}

export function useIntroZoom() {
  const [phase, setPhase] = useState<IntroPhase>(() => (shouldPlayIntro() ? "intro" : "done"))
  const heroRef = useRef<HTMLElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const scale = useMotionValue(1)
  const backgroundScale = useMotionValue(1)

  const start = useCallback(() => setPhase((p) => (p === "intro" ? "zooming" : p)), [])

  // Before first paint: scale the hero from its final box up to fill the viewport
  useLayoutEffect(() => {
    if (phase !== "intro" || !heroRef.current) return
    window.scrollTo(0, 0)
    const box = heroRef.current.getBoundingClientRect()
    const vw = window.innerWidth
    const vh = window.innerHeight
    scale.set(Math.max(vw / box.width, vh / box.height))
    x.set(vw / 2 - (box.left + box.width / 2))
    y.set(vh / 2 - (box.top + box.height / 2))
    backgroundScale.set(BACKGROUND_START_SCALE)
  }, []) // measured once, on mount

  // Lock scrolling until the hero has landed
  const landed = phase === "done"
  useEffect(() => {
    if (landed) return
    const root = document.documentElement
    const previous = root.style.overflow
    root.style.overflow = "hidden"
    return () => {
      root.style.overflow = previous
    }
  }, [landed])

  // Auto start, or skip ahead on the first scroll / tap / key
  useEffect(() => {
    if (phase !== "intro") return
    const timer = window.setTimeout(start, AUTO_DELAY_MS)
    const onKey = (e: KeyboardEvent) => SKIP_KEYS.has(e.key) && start()
    window.addEventListener("wheel", start, { passive: true })
    window.addEventListener("touchmove", start, { passive: true })
    window.addEventListener("pointerdown", start)
    window.addEventListener("keydown", onKey)
    return () => {
      window.clearTimeout(timer)
      window.removeEventListener("wheel", start)
      window.removeEventListener("touchmove", start)
      window.removeEventListener("pointerdown", start)
      window.removeEventListener("keydown", onKey)
    }
  }, [phase, start])

  // The dezoom itself
  useEffect(() => {
    if (phase !== "zooming") return
    markIntroPlayed()
    const options = { duration: ZOOM_DURATION, ease: ZOOM_EASE }
    const controls = [
      animate(x, 0, options),
      animate(y, 0, options),
      animate(scale, 1, options),
      animate(backgroundScale, 1, options),
    ]
    const timer = window.setTimeout(() => setPhase("done"), ZOOM_DURATION * 1000)
    return () => {
      controls.forEach((c) => c.stop())
      window.clearTimeout(timer)
    }
  }, [phase, x, y, scale, backgroundScale])

  return {
    phase,
    heroRef,
    heroStyle: { x, y, scale },
    backgroundStyle: { scale: backgroundScale },
  }
}
