import { useState } from "react"
import { Helmet } from "react-helmet-async"
import { motion, AnimatePresence } from "framer-motion"
import { Link } from "react-router-dom"
import { Music2, Headphones, ArrowRight } from "lucide-react"

export default function Landing() {
  const [hoveredSide, setHoveredSide] = useState<"studio" | "label" | null>(null)

  return (
    <>
      <Helmet>
        <title>Transubtil Records — Psychedelic Label & Studio</title>
        <meta
          name="description"
          content="Transubtil Records: Professional mastering studio and psychedelic music label. Explore our services or discover our artists."
        />
      </Helmet>

      <div className="fixed inset-0 flex flex-col items-center justify-center overflow-hidden">
        {/* Header - Split Color Text */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="absolute top-12 text-center z-20 px-4 w-full pointer-events-none"
        >
          <div className="relative w-full flex justify-center mb-4">
            <div className="relative inline-block">
              {/* Base layer - full text in white */}
              <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white whitespace-nowrap">
                TRANSUBTIL
              </h1>
              {/* Black version overlaid on left half */}
              <h1
                className="text-5xl md:text-7xl font-bold tracking-tight text-black absolute top-0 left-0 w-full whitespace-nowrap"
                style={{
                  clipPath: "polygon(0 0, 50% 0, 50% 100%, 0 100%)",
                }}
              >
                TRANSUBTIL
              </h1>
            </div>
          </div>
          <p className="text-sm md:text-base uppercase tracking-[0.3em] text-white/60 mt-4">
            Psychedelic Label & Studio
          </p>
        </motion.div>

        {/* Split Screen Container */}
        <div className="w-full h-full flex flex-col md:flex-row">
          {/* STUDIO Side - Black on White */}
          <motion.div
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            onHoverStart={() => setHoveredSide("studio")}
            onHoverEnd={() => setHoveredSide(null)}
            className={`
              relative flex-1 flex items-center justify-center
              transition-all duration-700 ease-out cursor-pointer
              ${hoveredSide === "studio" ? "flex-[1.2]" : ""}
              ${hoveredSide === "label" ? "flex-[0.8]" : ""}
            `}
            style={{
              backgroundColor: hoveredSide === "studio" ? "#ffffff" : "#f5f5f5",
            }}
          >
            <Link
              to="/studio"
              className="absolute inset-0 flex items-center justify-center"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="text-center space-y-6 p-8"
              >
                <motion.div
                  animate={{
                    scale: hoveredSide === "studio" ? 1.1 : 1,
                    rotate: hoveredSide === "studio" ? 5 : 0,
                  }}
                  transition={{ duration: 0.3 }}
                >
                  <Headphones
                    className={`w-20 h-20 md:w-28 md:h-28 mx-auto transition-colors duration-500 ${
                      hoveredSide === "studio"
                        ? "text-brand-500"
                        : "text-black/80"
                    }`}
                  />
                </motion.div>

                <div>
                  <h2 className="text-4xl md:text-6xl font-bold text-black mb-4">
                    STUDIO
                  </h2>
                  <p className="text-black/60 text-sm md:text-base max-w-xs mx-auto leading-relaxed">
                    Professional mastering & mixing services for your psychedelic
                    productions
                  </p>
                </div>

                <motion.div
                  animate={{
                    x: hoveredSide === "studio" ? 10 : 0,
                  }}
                  transition={{ duration: 0.3 }}
                  className="flex items-center justify-center gap-2 text-black/80"
                >
                  <span className="text-sm uppercase tracking-wider">Enter</span>
                  <ArrowRight className="w-5 h-5" />
                </motion.div>
              </motion.div>
            </Link>

            {/* Divider Line */}
            <div className="absolute right-0 top-0 bottom-0 w-px bg-black/10 md:block hidden" />
          </motion.div>

          {/* LABEL Side - White on Black */}
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            onHoverStart={() => setHoveredSide("label")}
            onHoverEnd={() => setHoveredSide(null)}
            className={`
              relative flex-1 flex items-center justify-center
              transition-all duration-700 ease-out cursor-pointer
              ${hoveredSide === "label" ? "flex-[1.2]" : ""}
              ${hoveredSide === "studio" ? "flex-[0.8]" : ""}
            `}
            style={{
              backgroundColor: hoveredSide === "label" ? "#000000" : "#030008",
            }}
          >
            <Link
              to="/artists"
              className="absolute inset-0 flex items-center justify-center"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="text-center space-y-6 p-8"
              >
                <motion.div
                  animate={{
                    scale: hoveredSide === "label" ? 1.1 : 1,
                    rotate: hoveredSide === "label" ? -5 : 0,
                  }}
                  transition={{ duration: 0.3 }}
                >
                  <Music2
                    className={`w-20 h-20 md:w-28 md:h-28 mx-auto transition-colors duration-500 ${
                      hoveredSide === "label"
                        ? "text-brand-acid"
                        : "text-white/80"
                    }`}
                  />
                </motion.div>

                <div>
                  <h2 className="text-4xl md:text-6xl font-bold text-white mb-4">
                    LABEL
                  </h2>
                  <p className="text-white/60 text-sm md:text-base max-w-xs mx-auto leading-relaxed">
                    Discover our international roster of psychedelic trance artists
                  </p>
                </div>

                <motion.div
                  animate={{
                    x: hoveredSide === "label" ? 10 : 0,
                  }}
                  transition={{ duration: 0.3 }}
                  className="flex items-center justify-center gap-2 text-white/80"
                >
                  <span className="text-sm uppercase tracking-wider">Enter</span>
                  <ArrowRight className="w-5 h-5" />
                </motion.div>
              </motion.div>
            </Link>
          </motion.div>
        </div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="absolute bottom-8 text-center z-20 px-4"
        >
          <p
            className={`text-xs uppercase tracking-[0.3em] transition-colors duration-500 ${
              hoveredSide === "studio" ? "text-black/40" : "text-white/40"
            }`}
          >
            Choose Your Path
          </p>
        </motion.div>

        {/* Animated Background Elements */}
        <AnimatePresence>
          {hoveredSide === "studio" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.03 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "radial-gradient(circle at 25% 50%, rgba(168, 85, 247, 0.1) 0%, transparent 50%)",
              }}
            />
          )}
          {hoveredSide === "label" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.05 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "radial-gradient(circle at 75% 50%, rgba(163, 255, 18, 0.1) 0%, transparent 50%)",
              }}
            />
          )}
        </AnimatePresence>
      </div>
    </>
  )
}
