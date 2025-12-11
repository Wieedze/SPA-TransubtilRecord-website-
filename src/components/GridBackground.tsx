import { useEffect, useState } from "react"

export default function GridBackground() {
  const [dimensions, setDimensions] = useState({ width: 1920, height: 1080 })

  useEffect(() => {
    function updateDimensions() {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }

    updateDimensions()
    window.addEventListener("resize", updateDimensions)
    return () => window.removeEventListener("resize", updateDimensions)
  }, [])

  const { width, height } = dimensions
  const cellSize = 60 // Size of each grid cell in pixels

  // Calculate number of lines based on viewport
  const verticalLines = Math.ceil(width / cellSize) + 1
  const horizontalLines = Math.ceil(height / cellSize) + 1

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Grid SVG */}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Radial gradient mask - transparent center, visible edges */}
          <radialGradient id="gridFade" cx="50%" cy="50%" r="71%" fx="50%" fy="50%">
            <stop offset="0%" stopColor="white" stopOpacity="0" />
            <stop offset="50%" stopColor="white" stopOpacity="0" />
            <stop offset="75%" stopColor="white" stopOpacity="0.4" />
            <stop offset="100%" stopColor="white" stopOpacity="1" />
          </radialGradient>

          <mask id="gridMask">
            <rect width="100%" height="100%" fill="url(#gridFade)" />
          </mask>
        </defs>

        <g mask="url(#gridMask)" opacity="0.15">
          {/* Vertical lines */}
          {[...Array(verticalLines)].map((_, i) => (
            <line
              key={`v-${i}`}
              x1={cellSize * i}
              y1="0"
              x2={cellSize * i}
              y2={height}
              stroke="#FAF4D3"
              strokeWidth="1"
            />
          ))}

          {/* Horizontal lines */}
          {[...Array(horizontalLines)].map((_, i) => (
            <line
              key={`h-${i}`}
              x1="0"
              y1={cellSize * i}
              x2={width}
              y2={cellSize * i}
              stroke="#FAF4D3"
              strokeWidth="1"
            />
          ))}
        </g>
      </svg>
    </div>
  )
}
