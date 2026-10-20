import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react"
import type { Release } from "../types/release"

// Site-wide player: the release loaded in the bottom bar. It lives above the routes,
// so the music keeps playing while the visitor moves between pages.
interface PlayerState {
  current: Release | null
  play: (release: Release) => void
  close: () => void
}

const PlayerContext = createContext<PlayerState>({ current: null, play: () => {}, close: () => {} })

export const PLAYER_BAR_HEIGHT = 64 // px, mirrored in --player-h for sticky elements

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [current, setCurrent] = useState<Release | null>(null)
  const play = useCallback((release: Release) => setCurrent(release), [])
  const close = useCallback(() => setCurrent(null), [])

  // Lets page content and sticky bars stay clear of the player bar
  useEffect(() => {
    document.documentElement.style.setProperty("--player-h", current ? `${PLAYER_BAR_HEIGHT}px` : "0px")
  }, [current])

  const value = useMemo(() => ({ current, play, close }), [current, play, close])
  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>
}

export function usePlayer() {
  return useContext(PlayerContext)
}
