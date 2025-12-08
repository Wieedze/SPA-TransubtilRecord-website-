import { useEffect, useState, useRef } from "react"
import { useInView } from "framer-motion"

interface DecryptedTextProps {
  text: string
  speed?: number
  maxIterations?: number
  characters?: string
  className?: string
  parentClassName?: string
  encryptedClassName?: string
  animateOn?: "hover" | "view"
  revealDirection?: "start" | "end" | "center"
  cursorFollow?: boolean
  cursorRadius?: number
}

const defaultCharacters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?"

export default function DecryptedText({
  text,
  speed = 50,
  maxIterations = 10,
  characters = defaultCharacters,
  className = "",
  parentClassName = "",
  encryptedClassName = "",
  animateOn = "hover",
  revealDirection = "center",
  cursorFollow = false,
  cursorRadius = 100,
}: DecryptedTextProps) {
  const [displayText, setDisplayText] = useState(text)
  const [isAnimating, setIsAnimating] = useState(false)
  const [revealedIndices, setRevealedIndices] = useState<Set<number>>(new Set())
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const ref = useRef<HTMLSpanElement>(null)
  const textRef = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true })
  const mousePositionRef = useRef({ x: 0, y: 0 })
  const letterPositionsRef = useRef<Array<{ x: number; y: number; width: number }>>([])

  // Calculate letter positions
  const calculateLetterPositions = () => {
    if (!textRef.current) return

    const range = document.createRange()
    const positions: Array<{ x: number; y: number; width: number }> = []
    const textNode = textRef.current.firstChild

    if (!textNode) return

    for (let i = 0; i < text.length; i++) {
      range.setStart(textNode, i)
      range.setEnd(textNode, i + 1)
      const rect = range.getBoundingClientRect()
      positions.push({
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
        width: rect.width,
      })
    }

    letterPositionsRef.current = positions
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (!cursorFollow || !textRef.current) return

    mousePositionRef.current = { x: e.clientX, y: e.clientY }

    // Calculate which letters are near the cursor
    const newRevealed = new Set<number>()
    letterPositionsRef.current.forEach((pos, index) => {
      const distance = Math.sqrt(
        Math.pow(pos.x - e.clientX, 2) + Math.pow(pos.y - e.clientY, 2)
      )

      if (distance < cursorRadius) {
        newRevealed.add(index)
      }
    })

    // Update revealed indices
    setRevealedIndices((prev) => new Set([...prev, ...newRevealed]))

    // Update display text based on cursor proximity
    const letters = text.split("")
    const newDisplayText = letters
      .map((letter, index) => {
        if (revealedIndices.has(index) || newRevealed.has(index)) {
          return letter
        }
        return characters[Math.floor(Math.random() * characters.length)]
      })
      .join("")

    setDisplayText(newDisplayText)
  }

  const decrypt = () => {
    if (isAnimating) return
    setIsAnimating(true)

    let iteration = 0
    const letters = text.split("")

    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }

    intervalRef.current = setInterval(() => {
      setDisplayText(
        letters
          .map((letter, index) => {
            // Determine reveal order based on direction
            let revealThreshold: number
            if (revealDirection === "start") {
              revealThreshold = index
            } else if (revealDirection === "end") {
              revealThreshold = letters.length - 1 - index
            } else {
              // center
              const middle = Math.floor(letters.length / 2)
              revealThreshold = Math.abs(index - middle)
            }

            if (iteration > revealThreshold) {
              return letter
            }

            return characters[Math.floor(Math.random() * characters.length)]
          })
          .join("")
      )

      iteration += 1

      if (iteration > letters.length + maxIterations) {
        if (intervalRef.current) {
          clearInterval(intervalRef.current)
        }
        setDisplayText(text)
        setIsAnimating(false)
      }
    }, speed)
  }

  useEffect(() => {
    if (animateOn === "view" && isInView) {
      decrypt()
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isInView, animateOn])

  useEffect(() => {
    if (cursorFollow) {
      calculateLetterPositions()
      window.addEventListener("resize", calculateLetterPositions)
      return () => {
        window.removeEventListener("resize", calculateLetterPositions)
      }
    }
  }, [cursorFollow, text])

  const handleMouseEnter = () => {
    if (!cursorFollow) {
      decrypt()
    } else if (cursorFollow) {
      calculateLetterPositions()
      setRevealedIndices(new Set())
      document.addEventListener("mousemove", handleMouseMove)
    }
  }

  const handleMouseLeave = () => {
    if (cursorFollow) {
      document.removeEventListener("mousemove", handleMouseMove)
      setDisplayText(text)
      setRevealedIndices(new Set())
    }
  }

  return (
    <span
      ref={ref}
      className={parentClassName}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <span ref={textRef} className={isAnimating ? encryptedClassName : className}>
        {displayText}
      </span>
    </span>
  )
}
