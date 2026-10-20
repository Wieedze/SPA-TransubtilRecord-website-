import { useEffect, useRef } from "react"
import { TURNSTILE_SITE_KEY } from "../../config/turnstile"

interface TurnstileApi {
  render: (el: HTMLElement, options: Record<string, unknown>) => string
  remove: (widgetId: string) => void
}
declare global {
  interface Window {
    turnstile?: TurnstileApi
  }
}

const SCRIPT_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
let loading: Promise<TurnstileApi> | null = null

function loadTurnstile(): Promise<TurnstileApi> {
  if (window.turnstile) return Promise.resolve(window.turnstile)
  loading ??= new Promise((resolve, reject) => {
    const script = document.createElement("script")
    script.src = SCRIPT_SRC
    script.async = true
    script.onload = () => (window.turnstile ? resolve(window.turnstile) : reject(new Error("turnstile missing")))
    script.onerror = () => reject(new Error("turnstile failed to load"))
    document.head.appendChild(script)
  })
  return loading
}

// Cloudflare Turnstile anti-bot check. Invisible unless Cloudflare needs the visitor to
// interact; adds a hidden "cf-turnstile-response" field to the surrounding form.
// Remount it (change its key) after each submit: a token can only be used once.
export default function Turnstile({ theme = "dark" }: { theme?: "dark" | "light" }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let widgetId: string | null = null
    let cancelled = false
    loadTurnstile()
      .then((turnstile) => {
        if (cancelled || !ref.current) return
        widgetId = turnstile.render(ref.current, {
          sitekey: TURNSTILE_SITE_KEY,
          theme,
          appearance: "interaction-only",
          "response-field-name": "cf-turnstile-response",
        })
      })
      .catch((error) => console.warn(error))
    return () => {
      cancelled = true
      if (widgetId && window.turnstile) window.turnstile.remove(widgetId)
    }
  }, [theme])

  return <div ref={ref} className="empty:hidden" />
}
