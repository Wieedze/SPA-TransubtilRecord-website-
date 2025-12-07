import { motion } from "framer-motion"
import { useEffect, useState } from "react"

interface AnimatedBackgroundProps {
  isHovered?: boolean
}

export default function AnimatedBackground({ isHovered = false }: AnimatedBackgroundProps) {
  const [svgContent, setSvgContent] = useState<string>("")
  const [hasAnimated, setHasAnimated] = useState(false)

  useEffect(() => {
    // Load SVG content from public folder
    fetch("/Bkg_pagedegarde.svg")
      .then(res => res.text())
      .then(data => setSvgContent(data))
      .catch(err => console.error("Failed to load SVG:", err))
  }, [])

  // Start translation animation after elements have appeared
  useEffect(() => {
    // Wait for most elements to appear before starting translation
    const timer = setTimeout(() => {
      setHasAnimated(true)
    }, 3000) // Start translation after 3 seconds

    return () => clearTimeout(timer)
  }, [])

  // Parse SVG and wrap each path/polygon with motion component
  const animateSvgElements = (svgString: string) => {
    const parser = new DOMParser()
    const doc = parser.parseFromString(svgString, "image/svg+xml")
    const svg = doc.querySelector("svg")

    if (!svg) return null

    // Get all path and polygon elements
    const paths = Array.from(svg.querySelectorAll("path"))
    const polygons = Array.from(svg.querySelectorAll("polygon"))
    const allElements = [...paths, ...polygons]

    // Group elements by their parent group (to animate each "branch" together)
    const groups = Array.from(svg.querySelectorAll("g.cls-1"))

    return (
      <svg
        viewBox={svg.getAttribute("viewBox") || "0 0 1190.55 841.89"}
        className="w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%'
        }}
      >
        <defs>
          <style>{`
            .cls-1 { mix-blend-mode: color-dodge; }
            .cls-2 { fill: #fff; }
            .cls-3 { fill: none; }
            .cls-4 { isolation: isolate; }
            .cls-5 { clip-path: url(#clippath); }
          `}</style>
          <clipPath id="clippath">
            <rect className="cls-3" width="1190.55" height="841.89" />
          </clipPath>
        </defs>
        <g className="cls-5">
          <g className="cls-4">
            {groups.map((group, groupIndex) => {
              const elements = Array.from(group.querySelectorAll("path, polygon"))

              // Directional translation for all branches
              // Left branches go right, right branches go left
              let translateX = 0
              let translateY = 0

              // Determine translation based on branch position
              // Top and bottom branches: same movement (horizontal + vertical)
              // Center branches: unique movement (only horizontal, more distance)
              const topBottomHorizontal = 2.5 // 90% reduced
              const topBottomVertical = 1 // 90% reduced
              const centerHorizontal = 3.5 // 90% reduced (more horizontal movement for center)

              if (groupIndex === 0) { // top-left
                translateX = topBottomHorizontal // go right
                translateY = topBottomVertical // down
              } else if (groupIndex === 1) { // top-right
                translateX = -topBottomHorizontal // go left
                translateY = topBottomVertical // down
              } else if (groupIndex === 2) { // middle-left
                translateX = centerHorizontal // go right more
                translateY = 0 // no vertical
              } else if (groupIndex === 3) { // middle-right
                translateX = -centerHorizontal // go left more
                translateY = 0 // no vertical
              } else if (groupIndex === 4) { // middle-left lower
                translateX = centerHorizontal // go right more
                translateY = 0 // no vertical
              } else if (groupIndex === 5) { // middle-right lower
                translateX = -centerHorizontal // go left more
                translateY = 0 // no vertical
              } else if (groupIndex === 6) { // bottom-left
                translateX = topBottomHorizontal // go right
                translateY = -topBottomVertical // up (same as top but inverted)
              } else if (groupIndex === 7) { // bottom-right
                translateX = -topBottomHorizontal // go left
                translateY = -topBottomVertical // up (same as top but inverted)
              }

              // Calculate staggered delay for progressive appearance
              const extensionDelay = groupIndex * 0.08

              return (
                <motion.g
                  key={groupIndex}
                  className="cls-1"
                  initial={{ x: 0, y: 0 }}
                  animate={{
                    x: hasAnimated && !isHovered ? translateX : 0,
                    y: hasAnimated && !isHovered ? translateY : 0
                  }}
                  transition={{
                    duration: 5,
                    delay: isHovered ? 0 : extensionDelay,
                    ease: "easeOut"
                  }}
                >
                  {elements.map((el, elIndex) => {
                    const isPath = el.tagName === "path"
                    const Component = motion[isPath ? "path" : "polygon"] as any

                    // Detect if this path is a circle (contains "c" commands and shorter paths)
                    const pathData = isPath ? el.getAttribute("d") || "" : ""
                    const isCircle = isPath && (
                      pathData.includes("c") && pathData.length < 500
                    )

                    // Calculate staggered delay based on group and element index
                    // More variation in delays for more organic appearance
                    const baseDelay = groupIndex * 0.2
                    const elementDelay = elIndex * 0.05
                    const randomOffset = (elIndex % 5) * 0.03

                    // Circles arrive slightly later (after 0.5-0.8 seconds)
                    const circleDelay = isCircle ? 0.5 + (elIndex % 3) * 0.1 : 0
                    const delay = baseDelay + elementDelay + randomOffset + circleDelay

                    // Vary duration for each element
                    const duration = 1.0 + (elIndex % 4) * 0.2

                    const props = isPath
                      ? { d: el.getAttribute("d") }
                      : { points: el.getAttribute("points") }

                    return (
                      <Component
                        key={elIndex}
                        {...props}
                        className="cls-2"
                        initial={{ opacity: 0, pathLength: 0 }}
                        animate={{ opacity: 1, pathLength: 1 }}
                        transition={{
                          opacity: {
                            duration: duration * 0.8,
                            delay,
                            ease: "easeOut"
                          },
                          pathLength: {
                            duration: duration * 1.5,
                            delay: delay + 0.1,
                            ease: "easeInOut"
                          }
                        }}
                      />
                    )
                  })}
                </motion.g>
              )
            })}
          </g>
        </g>
      </svg>
    )
  }

  if (!svgContent) return null

  return (
    <div className="absolute inset-0 opacity-30">
      {animateSvgElements(svgContent)}
    </div>
  )
}
