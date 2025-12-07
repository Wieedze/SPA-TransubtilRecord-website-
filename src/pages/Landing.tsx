import { useState } from "react"
import { Helmet } from "react-helmet-async"
import { motion } from "framer-motion"
import { useNavigate } from "react-router-dom"
import logoCircle from "../assets/transubtil_logo_circle.png"

export default function Landing() {
  const navigate = useNavigate()
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  const handleNavigation = (path: string) => {
    setIsTransitioning(true)
    // Navigate after transition animation completes
    setTimeout(() => {
      navigate(path)
    }, 600)
  }

  return (
    <>
      <Helmet>
        <title>Transubtil Records — Psychedelic Label & Studio</title>
        <meta
          name="description"
          content="Transubtil Records: Professional mastering studio and psychedelic music label."
        />
      </Helmet>

      <motion.div
        className="fixed inset-0 flex flex-col items-center justify-center overflow-hidden"
        style={{ backgroundColor: "#262626" }}
        animate={{
          opacity: isTransitioning ? 0 : 1,
        }}
        transition={{
          duration: 0.6,
          ease: "easeInOut",
        }}
      >
        {/* Logo and Buttons Container */}
        <div
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className="flex flex-col items-center"
        >
          {/* Logo with continuous glow animation */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{
              opacity: 1,
              scale: isHovered ? 0.7 : 1,
              filter: [
                "drop-shadow(0 0 30px rgba(250, 244, 211, 0.4))",
                "drop-shadow(0 0 50px rgba(250, 244, 211, 0.6))",
                "drop-shadow(0 0 30px rgba(250, 244, 211, 0.4))",
              ],
            }}
            transition={{
              opacity: { duration: 0.8 },
              scale: { duration: 0.4, ease: "easeInOut" },
              filter: {
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
                repeatType: "loop",
              },
            }}
            className="mb-8 cursor-pointer"
          >
            <img
              src={logoCircle}
              alt="Transubtil Records"
              className="w-96 h-96 md:w-[600px] md:h-[600px]"
            />
          </motion.div>

          {/* Navigation Buttons */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{
              opacity: isHovered ? 1 : 0,
              y: isHovered ? 0 : 20,
            }}
            transition={{
              duration: 0.3,
              ease: "easeOut",
            }}
            className="flex gap-4"
            style={{
              pointerEvents: isHovered ? "auto" : "none",
            }}
          >
          <button
            onClick={() => handleNavigation("/studio")}
            className="px-6 py-2 text-white text-sm uppercase tracking-[0.25em] font-medium
                       border border-white/60 rounded-lg
                       hover:bg-white/10 hover:border-white transition-all duration-300"
            style={{
              boxShadow: "0 0 15px rgba(255, 255, 255, 0.2)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = "0 0 20px rgba(255, 255, 255, 0.4)"
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = "0 0 15px rgba(255, 255, 255, 0.2)"
            }}
          >
            Studio
          </button>

          <button
            onClick={() => handleNavigation("/artists")}
            className="px-6 py-2 text-white text-sm uppercase tracking-[0.25em] font-medium
                       border border-white/60 rounded-lg
                       hover:bg-white/10 hover:border-white transition-all duration-300"
            style={{
              boxShadow: "0 0 15px rgba(255, 255, 255, 0.2)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = "0 0 20px rgba(255, 255, 255, 0.4)"
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = "0 0 15px rgba(255, 255, 255, 0.2)"
            }}
          >
            Label
          </button>
        </motion.div>
        </div>
      </motion.div>
    </>
  )
}
