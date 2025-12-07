import { motion } from "framer-motion"
import { useEffect, useState } from "react"

export default function AnimatedBackground() {
  const [svgContent, setSvgContent] = useState<string>("")

  useEffect(() => {
    // Load SVG content from public folder
    fetch("/Bkg_pagedegarde.svg")
      .then(res => res.text())
      .then(data => setSvgContent(data))
      .catch(err => console.error("Failed to load SVG:", err))
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

              return (
                <g key={groupIndex} className="cls-1">
                  {elements.map((el, elIndex) => {
                    const isPath = el.tagName === "path"
                    const Component = motion[isPath ? "path" : "polygon"] as any

                    // Calculate staggered delay based on group and element index
                    const delay = groupIndex * 0.15 + elIndex * 0.02

                    // Vary duration for each element
                    const duration = 0.8 + (elIndex % 3) * 0.3

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
                            duration,
                            delay,
                            ease: "easeOut"
                          },
                          pathLength: {
                            duration: duration * 1.2,
                            delay: delay + 0.1,
                            ease: "easeInOut"
                          }
                        }}
                      />
                    )
                  })}
                </g>
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
