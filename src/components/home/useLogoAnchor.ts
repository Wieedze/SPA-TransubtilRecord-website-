import { useEffect, useLayoutEffect, type RefObject } from "react"

// useLayoutEffect warns when the page is prerendered on the server
const useIsoLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect

// Writes the brandmark's vertical centre, in px from the top of the hero, to the hero's
// --logo-y variable. The hero background (flames, vignette, halo) is placed and scaled
// from it, so it stays centred on the logo whatever the screen size (see HeroBackground).
export function useLogoAnchor(heroRef: RefObject<HTMLElement>) {
  useIsoLayoutEffect(() => {
    const hero = heroRef.current
    const logo = hero?.querySelector<HTMLElement>("[data-hero-anchor]")
    if (!hero || !logo) return

    const update = () => {
      const heroBox = hero.getBoundingClientRect()
      const logoBox = logo.getBoundingClientRect()
      if (!heroBox.height) return
      // Rects include the intro zoom transform: bring the offset back to layout pixels
      const scale = heroBox.height / hero.offsetHeight
      const y = (logoBox.top + logoBox.height / 2 - heroBox.top) / scale
      hero.style.setProperty("--logo-y", `${Math.round(y)}px`)
    }

    update()
    const observer = new ResizeObserver(update)
    observer.observe(hero)
    observer.observe(logo)
    return () => observer.disconnect()
  }, [heroRef])
}
