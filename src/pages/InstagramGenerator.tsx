import { useState, useRef, useCallback } from "react"
import { motion } from "framer-motion"
import { Download, ChevronLeft, ChevronRight, Image, Smartphone } from "lucide-react"
import { toPng } from "html-to-image"
import PhoneMockup from "../components/PhoneMockup"
import { artists } from "../data/artists"

type Format = "instagram-portrait" | "instagram-square" | "story"

const formats: { value: Format; label: string; ratio: string }[] = [
  { value: "instagram-portrait", label: "Portrait", ratio: "4:5" },
  { value: "instagram-square", label: "Carré", ratio: "1:1" },
  { value: "story", label: "Story", ratio: "9:16" },
]

export default function InstagramGenerator() {
  const [selectedArtistIndex, setSelectedArtistIndex] = useState(0)
  const [selectedFormat, setSelectedFormat] = useState<Format>("instagram-portrait")
  const [isExporting, setIsExporting] = useState(false)
  const mockupRef = useRef<HTMLDivElement>(null)

  const selectedArtist = artists[selectedArtistIndex]

  const handlePrevArtist = () => {
    setSelectedArtistIndex((prev) =>
      prev === 0 ? artists.length - 1 : prev - 1
    )
  }

  const handleNextArtist = () => {
    setSelectedArtistIndex((prev) =>
      prev === artists.length - 1 ? 0 : prev + 1
    )
  }

  const handleExport = useCallback(async () => {
    if (!mockupRef.current) return

    setIsExporting(true)

    try {
      // Get dimensions based on format
      const dimensions = {
        "instagram-portrait": { width: 1080, height: 1350 },
        "instagram-square": { width: 1080, height: 1080 },
        story: { width: 1080, height: 1920 },
      }

      const { width, height } = dimensions[selectedFormat]

      const dataUrl = await toPng(mockupRef.current, {
        width,
        height,
        pixelRatio: 1,
        style: {
          transform: "scale(2.5)", // Inverse of the 0.4 scale
          transformOrigin: "top left",
        },
      })

      // Create download link
      const link = document.createElement("a")
      link.download = `${selectedArtist.name.replace(/\s+/g, "-").toLowerCase()}-${selectedFormat}.png`
      link.href = dataUrl
      link.click()
    } catch (error) {
      console.error("Export failed:", error)
    } finally {
      setIsExporting(false)
    }
  }, [selectedFormat, selectedArtist.name])

  return (
    <div className="min-h-screen bg-brand-900 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">
            Instagram Generator
          </h1>
          <p className="text-white/60 max-w-xl mx-auto">
            Générez des visuels marketing pour Instagram avec les profils artistes
            dans un frame téléphone style sci-fi/HUD
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Preview */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col items-center"
          >
            <div className="relative">
              {/* Glow effect behind mockup */}
              <div
                className="absolute inset-0 blur-3xl opacity-20 bg-brand-acid"
                style={{ transform: "scale(0.8)" }}
              />

              <PhoneMockup
                ref={mockupRef}
                artist={selectedArtist}
                format={selectedFormat}
              />
            </div>

            {/* Artist Navigation */}
            <div className="flex items-center gap-6 mt-8">
              <button
                onClick={handlePrevArtist}
                className="p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              >
                <ChevronLeft className="w-6 h-6 text-white" />
              </button>

              <div className="text-center min-w-[200px]">
                <p className="font-display text-xl text-white capitalize">
                  {selectedArtist.name}
                </p>
                <p className="text-sm text-white/50">
                  {selectedArtistIndex + 1} / {artists.length}
                </p>
              </div>

              <button
                onClick={handleNextArtist}
                className="p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              >
                <ChevronRight className="w-6 h-6 text-white" />
              </button>
            </div>
          </motion.div>

          {/* Controls */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-8"
          >
            {/* Format Selection */}
            <div className="space-y-4">
              <h3 className="font-display text-lg text-white flex items-center gap-2">
                <Image className="w-5 h-5 text-brand-acid" />
                Format
              </h3>
              <div className="grid grid-cols-3 gap-3">
                {formats.map((format) => (
                  <button
                    key={format.value}
                    onClick={() => setSelectedFormat(format.value)}
                    className={`p-4 rounded-lg border transition-all ${
                      selectedFormat === format.value
                        ? "border-brand-acid bg-brand-acid/10 text-white"
                        : "border-white/20 hover:border-white/40 text-white/60"
                    }`}
                  >
                    <p className="font-medium">{format.label}</p>
                    <p className="text-xs opacity-60 mt-1">{format.ratio}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Artist Selection */}
            <div className="space-y-4">
              <h3 className="font-display text-lg text-white flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-brand-acid" />
                Artiste
              </h3>
              <select
                value={selectedArtistIndex}
                onChange={(e) => setSelectedArtistIndex(Number(e.target.value))}
                className="w-full p-4 rounded-lg bg-white/5 border border-white/20 text-white focus:border-brand-acid focus:outline-none transition-colors"
              >
                {artists.map((artist, index) => (
                  <option key={artist.id} value={index} className="bg-brand-900">
                    {artist.name} - {artist.country}
                  </option>
                ))}
              </select>
            </div>

            {/* Export Button */}
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="w-full py-4 px-6 rounded-lg bg-brand-acid text-brand-900 font-bold uppercase tracking-wider hover:bg-brand-acid/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              {isExporting ? (
                <>
                  <div className="w-5 h-5 border-2 border-brand-900 border-t-transparent rounded-full animate-spin" />
                  Export en cours...
                </>
              ) : (
                <>
                  <Download className="w-5 h-5" />
                  Télécharger PNG
                </>
              )}
            </button>

            {/* Info */}
            <div className="p-4 rounded-lg bg-white/5 border border-white/10">
              <p className="text-sm text-white/60">
                <strong className="text-white">Résolution:</strong>{" "}
                {selectedFormat === "instagram-portrait" && "1080 × 1350px"}
                {selectedFormat === "instagram-square" && "1080 × 1080px"}
                {selectedFormat === "story" && "1080 × 1920px"}
              </p>
              <p className="text-sm text-white/60 mt-2">
                L'image sera exportée en haute qualité, prête pour Instagram.
              </p>
            </div>

            {/* Batch Export Info */}
            <div className="p-4 rounded-lg border border-brand-acid/30 bg-brand-acid/5">
              <p className="text-sm text-brand-acid">
                <strong>Astuce:</strong> Utilisez les flèches pour naviguer
                rapidement entre les artistes et générer plusieurs visuels.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
