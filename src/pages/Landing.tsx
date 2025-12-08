import { useState, useEffect } from "react"
import { Helmet } from "react-helmet-async"
import { motion } from "framer-motion"
import { useNavigate } from "react-router-dom"
import logoCircle from "../assets/transubtil_logo_circle.png"
import LandingSpinner from "../components/LandingSpinner"
import AnimatedBackground from "../components/AnimatedBackground"
import DecryptedText from "../components/DecryptedText"

export default function Landing() {
  const navigate = useNavigate()
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  // Disable scroll on landing page
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [])

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

      <div className="fixed inset-0" style={{ backgroundColor: "#262626" }}>
        <motion.div
          className="absolute inset-0 flex flex-col items-center justify-center overflow-hidden"
          animate={{
            opacity: isTransitioning ? 0 : 1,
          }}
          transition={{
            duration: 0.6,
            ease: "easeInOut",
          }}
        >
        {/* Animated Background SVG */}
        <div className="absolute inset-0 z-0">
          <AnimatedBackground isHovered={isHovered} />
        </div>
        {/* Logo and Buttons Container */}
        <div
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className="flex flex-col items-center relative z-10"
        >
          {/* Logo with fixed glow */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{
              opacity: 1,
              scale: isHovered ? 0.7 : 1,
            }}
            transition={{
              opacity: { duration: 2 },
              scale: { duration: 0.8, ease: "easeInOut" },
            }}
            className="mb-8 cursor-pointer relative"
            style={{
              filter: "drop-shadow(0 0 60px rgba(250, 244, 211, 0.7))"
            }}
          >
            {/* Animated Spinner */}
            <div className="absolute pointer-events-none" style={{
              top: '-10%',
              left: '-10%',
              width: '120%',
              height: '120%'
            }}>
              <LandingSpinner />
            </div>

            <img
              src={logoCircle}
              alt="Transubtil Records"
              className="w-64 h-64 md:w-80 md:h-80 relative z-10"
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
              duration: 0.8,
              delay: isHovered ? 0.8 : 0,
              ease: "easeOut",
            }}
            className="flex gap-4"
            style={{
              pointerEvents: isHovered ? "auto" : "none",
            }}
          >
          <button
            onClick={() => handleNavigation("/studio")}
            className="px-6 py-2 text-white uppercase tracking-[0.25em] text-[11px] font-medium
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
            <DecryptedText text="Studio" speed={90} maxIterations={5} />
          </button>

          <button
            onClick={() => handleNavigation("/artists")}
            className="px-6 py-2 text-white uppercase tracking-[0.25em] text-[11px] font-medium
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
            <DecryptedText text="Label" speed={90} maxIterations={5} />
          </button>
        </motion.div>
        </div>
        </motion.div>
      </div>
    </>
  )
}
