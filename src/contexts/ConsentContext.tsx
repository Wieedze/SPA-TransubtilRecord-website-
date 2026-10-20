import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react"

// Cookie consent. The site itself sets no tracking cookies; the only third-party
// cookies come from the Bandcamp and SoundCloud players, so there is a single
// "embedded players" choice. Turnstile (anti-spam) is strictly necessary and exempt.
// The choice is kept in localStorage for 6 months, then asked again.
export type ConsentChoice = "granted" | "denied"

interface ConsentState {
  /** null until the visitor has chosen (or before hydration) */
  choice: ConsentChoice | null
  embedsAllowed: boolean
  /** true while the banner should show */
  bannerOpen: boolean
  setChoice: (choice: ConsentChoice) => void
  openSettings: () => void
}

const STORAGE_KEY = "tr-consent"
const MAX_AGE_MS = 1000 * 60 * 60 * 24 * 182

const ConsentContext = createContext<ConsentState>({
  choice: null,
  embedsAllowed: false,
  bannerOpen: false,
  setChoice: () => {},
  openSettings: () => {},
})

function readStored(): ConsentChoice | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const { choice, at } = JSON.parse(raw) as { choice?: string; at?: number }
    if ((choice !== "granted" && choice !== "denied") || !at || Date.now() - at > MAX_AGE_MS) return null
    return choice
  } catch {
    return null
  }
}

export function ConsentProvider({ children }: { children: ReactNode }) {
  const [choice, setChoiceState] = useState<ConsentChoice | null>(null)
  const [bannerOpen, setBannerOpen] = useState(false)

  // Read after mount: the page is prerendered without any stored choice
  useEffect(() => {
    const stored = readStored()
    setChoiceState(stored)
    setBannerOpen(stored === null)
  }, [])

  const setChoice = useCallback((next: ConsentChoice) => {
    setChoiceState(next)
    setBannerOpen(false)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ choice: next, at: Date.now() }))
    } catch {
      // storage unavailable: the choice lasts for this visit only
    }
  }, [])

  const openSettings = useCallback(() => setBannerOpen(true), [])

  const value = useMemo(
    () => ({ choice, embedsAllowed: choice === "granted", bannerOpen, setChoice, openSettings }),
    [choice, bannerOpen, setChoice, openSettings]
  )
  return <ConsentContext.Provider value={value}>{children}</ConsentContext.Provider>
}

export function useConsent() {
  return useContext(ConsentContext)
}
