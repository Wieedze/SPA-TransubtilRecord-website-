import { useConsent } from "../../contexts/ConsentContext"

// Placeholder shown instead of a third-party player until the visitor allows it.
// Clicking "Allow and play" records consent for all players (same choice as the banner).
export default function EmbedConsent({
  service,
  href,
  height,
  compact = false,
}: {
  service: "Bandcamp" | "SoundCloud"
  href?: string
  height?: number
  compact?: boolean
}) {
  const { setChoice } = useConsent()
  return (
    <div
      className={`flex w-full items-center justify-center gap-x-6 gap-y-3 text-center ${
        compact ? "flex-wrap" : "flex-col border border-brand-700 bg-brand-900/40 p-6"
      }`}
      style={height ? { height } : undefined}
    >
      <p className="max-w-[46ch] text-small text-body">
        The {service} player sets {service} cookies. Allow it to listen here
        {href ? " or open it on " + service : ""}.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
        <button type="button" onClick={() => setChoice("granted")} className="btn-primary">
          Allow and play
        </button>
        {href && (
          <a href={href} target="_blank" rel="noreferrer" className="text-link">
            Open on {service}
          </a>
        )}
      </div>
    </div>
  )
}
