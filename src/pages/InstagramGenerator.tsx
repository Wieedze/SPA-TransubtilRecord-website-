import { useState, useRef, useCallback, useEffect } from "react"
import { motion } from "framer-motion"
import { Download, ChevronLeft, ChevronRight, Image, Smartphone, Disc3, Users } from "lucide-react"
import { toPng } from "html-to-image"
import PhoneMockup from "../components/PhoneMockup"
import ReleaseMockup from "../components/ReleaseMockup"
import { getArtists, getReleases, type Artist, type Release } from "../lib/catalogue"

type Format = "instagram-portrait" | "instagram-square" | "story"
type ContentType = "artists" | "releases"

const formats: { value: Format; label: string; ratio: string }[] = [
  { value: "instagram-portrait", label: "Portrait", ratio: "4:5" },
  { value: "instagram-square", label: "Carré", ratio: "1:1" },
  { value: "story", label: "Story", ratio: "9:16" },
]

export default function InstagramGenerator() {
  const [contentType, setContentType] = useState<ContentType>("artists")
  const [artists, setArtists] = useState<Artist[]>([])
  const [releases, setReleases] = useState<Release[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [selectedFormat, setSelectedFormat] = useState<Format>("instagram-portrait")
  const [isExporting, setIsExporting] = useState(false)
  const mockupRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadData()
  }, [])

  // Reset index when switching content type
  useEffect(() => {
    setSelectedIndex(0)
  }, [contentType])

  async function loadData() {
    try {
      setLoading(true)
      const [artistsData, releasesData] = await Promise.all([
        getArtists(),
        getReleases(),
      ])
      setArtists(artistsData)
      setReleases(releasesData)
    } catch (err) {
      console.error("Error loading data:", err)
    } finally {
      setLoading(false)
    }
  }

  const currentList = contentType === "artists" ? artists : releases
  const selectedItem = currentList[selectedIndex]

  const handlePrev = () => {
    setSelectedIndex((prev) =>
      prev === 0 ? currentList.length - 1 : prev - 1
    )
  }

  const handleNext = () => {
    setSelectedIndex((prev) =>
      prev === currentList.length - 1 ? 0 : prev + 1
    )
  }

  const handleExport = useCallback(async () => {
    if (!mockupRef.current || !selectedItem) return

    setIsExporting(true)

    try {
      const dimensions = {
        "instagram-portrait": { width: 1080, height: 1350 },
        "instagram-square": { width: 1080, height: 1080 },
        story: { width: 1080, height: 1920 },
      }

      const { width, height } = dimensions[selectedFormat]

      const dataUrl = await toPng(mockupRef.current, {
        canvasWidth: width,
        canvasHeight: height,
      })

      const itemName = contentType === "artists"
        ? (selectedItem as Artist).name
        : (selectedItem as Release).title

      const link = document.createElement("a")
      link.download = `${itemName.replace(/\s+/g, "-").toLowerCase()}-${selectedFormat}.png`
      link.href = dataUrl
      link.click()
    } catch (error) {
      console.error("Export failed:", error)
    } finally {
      setIsExporting(false)
    }
  }, [selectedFormat, selectedItem, contentType])

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-900 py-12 px-4 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-500"></div>
      </div>
    )
  }

  if (currentList.length === 0) {
    return (
      <div className="min-h-screen bg-brand-900 py-12 px-4 flex items-center justify-center">
        <p className="text-white/60">Aucun {contentType === "artists" ? "artiste" : "release"} trouvé</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-brand-900 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">
            Instagram Generator
          </h1>
          <p className="text-white/60 max-w-xl mx-auto">
            Générez des visuels marketing pour Instagram avec les profils artistes
            et les releases dans un style sci-fi/HUD
          </p>
        </motion.div>

        {/* Content Type Tabs */}
        <div className="flex justify-center gap-2 sm:gap-4 mb-8">
          <button
            onClick={() => setContentType("artists")}
            className={`flex items-center gap-1 sm:gap-2 px-3 sm:px-6 py-2 sm:py-3 rounded-lg border transition-all text-sm sm:text-base ${
              contentType === "artists"
                ? "border-brand-acid bg-brand-acid/10 text-white"
                : "border-white/20 hover:border-white/40 text-white/60"
            }`}
          >
            <Users className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="font-medium">Artistes</span>
            <span className="text-xs opacity-60 hidden sm:inline">({artists.length})</span>
          </button>
          <button
            onClick={() => setContentType("releases")}
            className={`flex items-center gap-1 sm:gap-2 px-3 sm:px-6 py-2 sm:py-3 rounded-lg border transition-all text-sm sm:text-base ${
              contentType === "releases"
                ? "border-brand-acid bg-brand-acid/10 text-white"
                : "border-white/20 hover:border-white/40 text-white/60"
            }`}
          >
            <Disc3 className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="font-medium">Releases</span>
            <span className="text-xs opacity-60 hidden sm:inline">({releases.length})</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
          {/* Preview */}
          <motion.div
            key={contentType}
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

              {selectedItem && contentType === "artists" && (
                <PhoneMockup
                  key={`artist-${selectedItem.id}-${selectedFormat}`}
                  ref={mockupRef}
                  artist={selectedItem as Artist}
                  format={selectedFormat}
                />
              )}

              {selectedItem && contentType === "releases" && (
                <ReleaseMockup
                  key={`release-${selectedItem.id}-${selectedFormat}`}
                  ref={mockupRef}
                  release={selectedItem as Release}
                  format={selectedFormat}
                />
              )}
            </div>

            {/* Navigation */}
            <div className="flex items-center gap-3 sm:gap-6 mt-6 sm:mt-8">
              <button
                onClick={handlePrev}
                className="p-2 sm:p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              >
                <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </button>

              <div className="text-center min-w-[140px] sm:min-w-[200px]">
                <p className="font-display text-base sm:text-xl text-white capitalize truncate">
                  {contentType === "artists"
                    ? (selectedItem as Artist)?.name
                    : (selectedItem as Release)?.title}
                </p>
                <p className="text-xs sm:text-sm text-white/50">
                  {selectedIndex + 1} / {currentList.length}
                </p>
              </div>

              <button
                onClick={handleNext}
                className="p-2 sm:p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              >
                <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </button>
            </div>
          </motion.div>

          {/* Controls */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6 sm:space-y-8"
          >
            {/* Format Selection */}
            <div className="space-y-3 sm:space-y-4">
              <h3 className="font-display text-base sm:text-lg text-white flex items-center gap-2">
                <Image className="w-4 h-4 sm:w-5 sm:h-5 text-brand-acid" />
                Format
              </h3>
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                {formats.map((format) => (
                  <button
                    key={format.value}
                    onClick={() => setSelectedFormat(format.value)}
                    className={`p-2 sm:p-4 rounded-lg border transition-all ${
                      selectedFormat === format.value
                        ? "border-brand-acid bg-brand-acid/10 text-white"
                        : "border-white/20 hover:border-white/40 text-white/60"
                    }`}
                  >
                    <p className="font-medium text-xs sm:text-base">{format.label}</p>
                    <p className="text-[10px] sm:text-xs opacity-60 mt-1">{format.ratio}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Item Selection */}
            <div className="space-y-3 sm:space-y-4">
              <h3 className="font-display text-base sm:text-lg text-white flex items-center gap-2">
                {contentType === "artists" ? (
                  <Smartphone className="w-4 h-4 sm:w-5 sm:h-5 text-brand-acid" />
                ) : (
                  <Disc3 className="w-4 h-4 sm:w-5 sm:h-5 text-brand-acid" />
                )}
                {contentType === "artists" ? "Artiste" : "Release"}
              </h3>
              <select
                value={selectedIndex}
                onChange={(e) => setSelectedIndex(Number(e.target.value))}
                className="w-full p-3 sm:p-4 rounded-lg bg-white/5 border border-white/20 text-white text-sm sm:text-base focus:border-brand-acid focus:outline-none transition-colors"
              >
                {currentList.map((item, index) => (
                  <option key={item.id} value={index} className="bg-brand-900">
                    {contentType === "artists"
                      ? `${(item as Artist).name} - ${(item as Artist).country}`
                      : `${(item as Release).title} - ${(item as Release).artist}`}
                  </option>
                ))}
              </select>
            </div>

            {/* Export Button */}
            <button
              onClick={handleExport}
              disabled={isExporting || !selectedItem}
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

            {/* Tips */}
            <div className="p-4 rounded-lg border border-brand-acid/30 bg-brand-acid/5">
              <p className="text-sm text-brand-acid">
                <strong>Astuce:</strong> Utilisez les flèches pour naviguer
                rapidement et générer plusieurs visuels. Passez de Artistes à Releases
                avec les onglets ci-dessus.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
