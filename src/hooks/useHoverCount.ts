import { useState } from "react"

// Counts pointer entries on an element; pass `count` as DecryptedText's `trigger`
// so the text scrambles whenever the whole parent (button, card, tile) is hovered.
export function useHoverCount() {
  const [count, setCount] = useState(0)
  return { count, hoverProps: { onMouseEnter: () => setCount((c) => c + 1), onFocus: () => setCount((c) => c + 1) } }
}
