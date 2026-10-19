import type { MouseEvent, TouchEvent } from "react"

// v1 click/tap feedback: an instant glow on press that fades out over 0.6 s on release.
type PressEvent = MouseEvent<HTMLElement> | TouchEvent<HTMLElement>

const ON = "drop-shadow(0 0 20px rgba(249,188,20,0.9)) drop-shadow(0 0 10px rgba(249,188,20,0.9))"
const OFF = "drop-shadow(0 0 0px rgba(249,188,20,0))"

function press(e: PressEvent) {
  e.currentTarget.style.transition = "filter 0s"
  e.currentTarget.style.filter = ON
}

function release(e: PressEvent) {
  e.currentTarget.style.transition = "filter 0.6s ease-out"
  e.currentTarget.style.filter = OFF
}

export const glowFlashProps = {
  onMouseDown: press,
  onMouseUp: release,
  onMouseLeave: release,
  onTouchStart: press,
  onTouchEnd: release,
}
