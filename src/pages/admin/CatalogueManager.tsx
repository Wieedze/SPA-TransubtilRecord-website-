import { useState } from "react"
import { Helmet } from "react-helmet-async"
import { motion } from "framer-motion"
import { useAuth } from "../../contexts/AuthContext"
import {
  Users,
  Disc3,
  Plus,
  Copy,
  Check,
  Music2,
  Instagram,
  Facebook,
  MapPin,
  Globe,
} from "lucide-react"

type TabType = "artists" | "releases"

// Styles disponibles
const AVAILABLE_STYLES = [
  "Darkpsy",
  "Forest",
  "Hitech",
  "Twilight",
  "Dark-Prog",
  "Psy Techno",
]

// Types de releases
const RELEASE_TYPES = ["album", "ep", "track", "compilation"] as const

export default function CatalogueManager() {
  const { isAdmin } = useAuth()
  const [activeTab, setActiveTab] = useState<TabType>("artists")
  const [copied, setCopied] = useState(false)

  // Artist form state
  const [artistForm, setArtistForm] = useState({
    name: "",
    act: "Live Act",
    description: "",
    styles: [] as string[],
    country: "",
    image_url: "",
    soundcloud: "",
    instagram: "",
    facebook: "",
  })

  // Release form state
  const [releaseForm, setReleaseForm] = useState({
    title: "",
    artist: "",
    type: "ep" as typeof RELEASE_TYPES[number],
    releaseDate: new Date().getFullYear().toString(),
    catalogNumber: "",
    coverUrl: "",
    bandcampUrl: "",
    bandcampId: "",
    description: "",
  })

  const handleStyleToggle = (style: string) => {
    setArtistForm((prev) => ({
      ...prev,
      styles: prev.styles.includes(style)
        ? prev.styles.filter((s) => s !== style)
        : [...prev.styles, style],
    }))
  }

  const generateArtistCode = () => {
    const code = `  {
    id: ${Date.now()},
    name: "${artistForm.name.toLowerCase()}",
    act: "${artistForm.act}",
    description: "${artistForm.description.replace(/"/g, '\\"')}",
    style: [${artistForm.styles.map((s) => `"${s}"`).join(", ")}],
    social: {
      ${artistForm.soundcloud ? `soundcloud: "${artistForm.soundcloud}",` : ""}
      ${artistForm.instagram ? `instagram: "${artistForm.instagram}",` : ""}
      ${artistForm.facebook ? `facebook: "${artistForm.facebook}",` : ""}
    },
    country: "${artistForm.country}",
    image_url: "${artistForm.image_url}",
  },`
    return code
  }

  const generateReleaseCode = () => {
    const code = `  {
    id: ${Date.now()},
    title: "${releaseForm.title}",
    artist: "${releaseForm.artist}",
    type: "${releaseForm.type}",
    releaseDate: "${releaseForm.releaseDate}",
    catalogNumber: "${releaseForm.catalogNumber}",
    coverUrl: "${releaseForm.coverUrl}",
    bandcampUrl: "${releaseForm.bandcampUrl}",
    bandcampId: "${releaseForm.bandcampId}",${releaseForm.description ? `\n    description: "${releaseForm.description.replace(/"/g, '\\"')}",` : ""}
  },`
    return code
  }

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const resetArtistForm = () => {
    setArtistForm({
      name: "",
      act: "Live Act",
      description: "",
      styles: [],
      country: "",
      image_url: "",
      soundcloud: "",
      instagram: "",
      facebook: "",
    })
  }

  const resetReleaseForm = () => {
    setReleaseForm({
      title: "",
      artist: "",
      type: "ep",
      releaseDate: new Date().getFullYear().toString(),
      catalogNumber: "",
      coverUrl: "",
      bandcampUrl: "",
      bandcampId: "",
      description: "",
    })
  }

  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-6xl text-center py-20">
        <h1 className="text-3xl font-bold mb-4">Access Denied</h1>
        <p className="text-white/60">You don't have permission to access this page.</p>
      </div>
    )
  }

  return (
    <>
      <Helmet>
        <title>Catalogue Manager — Admin — Transubtil Records</title>
      </Helmet>

      <div className="mx-auto max-w-5xl space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 uppercase tracking-[0.25em]">
            Catalogue Manager
          </h1>
          <p className="text-white/60 uppercase tracking-[0.25em] text-[11px]">
            Generate code to add artists and releases to the catalogue
          </p>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("artists")}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg uppercase tracking-[0.25em] text-[11px] transition-all ${
              activeTab === "artists"
                ? "bg-brand-acid text-brand-900 font-bold"
                : "bg-white/5 text-white/60 hover:bg-white/10"
            }`}
          >
            <Users className="w-4 h-4" />
            Add Artist
          </button>
          <button
            onClick={() => setActiveTab("releases")}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg uppercase tracking-[0.25em] text-[11px] transition-all ${
              activeTab === "releases"
                ? "bg-brand-acid text-brand-900 font-bold"
                : "bg-white/5 text-white/60 hover:bg-white/10"
            }`}
          >
            <Disc3 className="w-4 h-4" />
            Add Release
          </button>
        </div>

        {/* Artist Form */}
        {activeTab === "artists" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="grid md:grid-cols-2 gap-6">
              {/* Left Column - Form */}
              <div className="space-y-4">
                {/* Name */}
                <div>
                  <label className="block text-white/60 uppercase tracking-[0.25em] text-[11px] mb-2">
                    Artist Name *
                  </label>
                  <input
                    type="text"
                    value={artistForm.name}
                    onChange={(e) =>
                      setArtistForm({ ...artistForm, name: e.target.value })
                    }
                    placeholder="Enter artist name..."
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:border-brand-acid focus:outline-none text-white uppercase tracking-[0.15em] text-[11px]"
                  />
                </div>

                {/* Act Type */}
                <div>
                  <label className="block text-white/60 uppercase tracking-[0.25em] text-[11px] mb-2">
                    Act Type *
                  </label>
                  <select
                    value={artistForm.act}
                    onChange={(e) =>
                      setArtistForm({ ...artistForm, act: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:border-brand-acid focus:outline-none text-white uppercase tracking-[0.15em] text-[11px]"
                  >
                    <option value="Live Act">Live Act</option>
                    <option value="Live Set">Live Set</option>
                    <option value="Dj Set">Dj Set</option>
                    <option value="Dj Set / Live">Dj Set / Live</option>
                  </select>
                </div>

                {/* Country */}
                <div>
                  <label className="block text-white/60 uppercase tracking-[0.25em] text-[11px] mb-2">
                    <MapPin className="w-3 h-3 inline mr-1" />
                    Country *
                  </label>
                  <input
                    type="text"
                    value={artistForm.country}
                    onChange={(e) =>
                      setArtistForm({ ...artistForm, country: e.target.value })
                    }
                    placeholder="France, Portugal, Japan..."
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:border-brand-acid focus:outline-none text-white uppercase tracking-[0.15em] text-[11px]"
                  />
                </div>

                {/* Styles */}
                <div>
                  <label className="block text-white/60 uppercase tracking-[0.25em] text-[11px] mb-2">
                    Styles *
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {AVAILABLE_STYLES.map((style) => (
                      <button
                        key={style}
                        type="button"
                        onClick={() => handleStyleToggle(style)}
                        className={`px-3 py-1.5 rounded-full uppercase tracking-[0.15em] text-[10px] transition-all ${
                          artistForm.styles.includes(style)
                            ? "bg-brand-acid text-brand-900 font-bold"
                            : "bg-white/5 border border-white/20 text-white/60 hover:border-white/40"
                        }`}
                      >
                        {style}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Image URL */}
                <div>
                  <label className="block text-white/60 uppercase tracking-[0.25em] text-[11px] mb-2">
                    Image URL *
                  </label>
                  <input
                    type="text"
                    value={artistForm.image_url}
                    onChange={(e) =>
                      setArtistForm({ ...artistForm, image_url: e.target.value })
                    }
                    placeholder="/images/artistname.jpg"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:border-brand-acid focus:outline-none text-white tracking-[0.15em] text-[11px]"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-white/60 uppercase tracking-[0.25em] text-[11px] mb-2">
                    Biography
                  </label>
                  <textarea
                    value={artistForm.description}
                    onChange={(e) =>
                      setArtistForm({ ...artistForm, description: e.target.value })
                    }
                    placeholder="Artist biography..."
                    rows={4}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:border-brand-acid focus:outline-none text-white tracking-[0.15em] text-[11px] resize-none"
                  />
                </div>

                {/* Social Links */}
                <div className="space-y-3">
                  <label className="block text-white/60 uppercase tracking-[0.25em] text-[11px]">
                    Social Links
                  </label>

                  <div className="flex items-center gap-2">
                    <Music2 className="w-4 h-4 text-white/40" />
                    <input
                      type="text"
                      value={artistForm.soundcloud}
                      onChange={(e) =>
                        setArtistForm({ ...artistForm, soundcloud: e.target.value })
                      }
                      placeholder="https://soundcloud.com/..."
                      className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:border-brand-acid focus:outline-none text-white tracking-[0.15em] text-[11px]"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <Instagram className="w-4 h-4 text-white/40" />
                    <input
                      type="text"
                      value={artistForm.instagram}
                      onChange={(e) =>
                        setArtistForm({ ...artistForm, instagram: e.target.value })
                      }
                      placeholder="https://instagram.com/..."
                      className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:border-brand-acid focus:outline-none text-white tracking-[0.15em] text-[11px]"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <Facebook className="w-4 h-4 text-white/40" />
                    <input
                      type="text"
                      value={artistForm.facebook}
                      onChange={(e) =>
                        setArtistForm({ ...artistForm, facebook: e.target.value })
                      }
                      placeholder="https://facebook.com/..."
                      className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:border-brand-acid focus:outline-none text-white tracking-[0.15em] text-[11px]"
                    />
                  </div>
                </div>
              </div>

              {/* Right Column - Code Preview */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-white/60 uppercase tracking-[0.25em] text-[11px]">
                    Generated Code
                  </label>
                  <div className="flex gap-2">
                    <button
                      onClick={resetArtistForm}
                      className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-white/60 uppercase tracking-[0.15em] text-[10px] transition-colors"
                    >
                      Reset
                    </button>
                    <button
                      onClick={() => handleCopy(generateArtistCode())}
                      className="flex items-center gap-1 px-3 py-1.5 bg-brand-acid/20 hover:bg-brand-acid/30 border border-brand-acid/40 rounded-lg text-brand-acid uppercase tracking-[0.15em] text-[10px] transition-colors"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3 h-3" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          Copy
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <pre className="p-4 bg-brand-700/50 border border-white/10 rounded-lg overflow-x-auto text-[11px] text-brand-300 font-mono whitespace-pre-wrap">
                  {generateArtistCode()}
                </pre>

                <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
                  <p className="text-white/60 uppercase tracking-[0.25em] text-[10px]">
                    <strong className="text-white">Instructions:</strong>
                  </p>
                  <ol className="mt-2 space-y-1 text-white/50 uppercase tracking-[0.15em] text-[10px] list-decimal list-inside">
                    <li>Fill in the form above</li>
                    <li>Copy the generated code</li>
                    <li>Add it to <code className="text-brand-acid">src/data/artists.ts</code></li>
                    <li>Upload the image to <code className="text-brand-acid">/public/images/</code></li>
                  </ol>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Release Form */}
        {activeTab === "releases" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="grid md:grid-cols-2 gap-6">
              {/* Left Column - Form */}
              <div className="space-y-4">
                {/* Title */}
                <div>
                  <label className="block text-white/60 uppercase tracking-[0.25em] text-[11px] mb-2">
                    Release Title *
                  </label>
                  <input
                    type="text"
                    value={releaseForm.title}
                    onChange={(e) =>
                      setReleaseForm({ ...releaseForm, title: e.target.value })
                    }
                    placeholder="Artist Name - Album Title"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:border-brand-acid focus:outline-none text-white uppercase tracking-[0.15em] text-[11px]"
                  />
                </div>

                {/* Artist */}
                <div>
                  <label className="block text-white/60 uppercase tracking-[0.25em] text-[11px] mb-2">
                    Artist *
                  </label>
                  <input
                    type="text"
                    value={releaseForm.artist}
                    onChange={(e) =>
                      setReleaseForm({ ...releaseForm, artist: e.target.value })
                    }
                    placeholder="Artist name or Various Artists"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:border-brand-acid focus:outline-none text-white uppercase tracking-[0.15em] text-[11px]"
                  />
                </div>

                {/* Type & Year */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white/60 uppercase tracking-[0.25em] text-[11px] mb-2">
                      Type *
                    </label>
                    <select
                      value={releaseForm.type}
                      onChange={(e) =>
                        setReleaseForm({
                          ...releaseForm,
                          type: e.target.value as typeof RELEASE_TYPES[number],
                        })
                      }
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:border-brand-acid focus:outline-none text-white uppercase tracking-[0.15em] text-[11px]"
                    >
                      {RELEASE_TYPES.map((type) => (
                        <option key={type} value={type}>
                          {type.toUpperCase()}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-white/60 uppercase tracking-[0.25em] text-[11px] mb-2">
                      Year *
                    </label>
                    <input
                      type="text"
                      value={releaseForm.releaseDate}
                      onChange={(e) =>
                        setReleaseForm({ ...releaseForm, releaseDate: e.target.value })
                      }
                      placeholder="2025"
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:border-brand-acid focus:outline-none text-white uppercase tracking-[0.15em] text-[11px]"
                    />
                  </div>
                </div>

                {/* Cover URL */}
                <div>
                  <label className="block text-white/60 uppercase tracking-[0.25em] text-[11px] mb-2">
                    Cover URL *
                  </label>
                  <input
                    type="text"
                    value={releaseForm.coverUrl}
                    onChange={(e) =>
                      setReleaseForm({ ...releaseForm, coverUrl: e.target.value })
                    }
                    placeholder="https://f4.bcbits.com/img/..."
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:border-brand-acid focus:outline-none text-white tracking-[0.15em] text-[11px]"
                  />
                  <p className="mt-1 text-white/40 text-[10px]">
                    Get from Bandcamp: Right click cover → Copy image address
                  </p>
                </div>

                {/* Bandcamp URL */}
                <div>
                  <label className="block text-white/60 uppercase tracking-[0.25em] text-[11px] mb-2">
                    <Globe className="w-3 h-3 inline mr-1" />
                    Bandcamp URL *
                  </label>
                  <input
                    type="text"
                    value={releaseForm.bandcampUrl}
                    onChange={(e) =>
                      setReleaseForm({ ...releaseForm, bandcampUrl: e.target.value })
                    }
                    placeholder="https://transubtilrec.bandcamp.com/album/..."
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:border-brand-acid focus:outline-none text-white tracking-[0.15em] text-[11px]"
                  />
                </div>

                {/* Bandcamp ID */}
                <div>
                  <label className="block text-white/60 uppercase tracking-[0.25em] text-[11px] mb-2">
                    Bandcamp Embed ID *
                  </label>
                  <input
                    type="text"
                    value={releaseForm.bandcampId}
                    onChange={(e) =>
                      setReleaseForm({ ...releaseForm, bandcampId: e.target.value })
                    }
                    placeholder="1234567890"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:border-brand-acid focus:outline-none text-white tracking-[0.15em] text-[11px]"
                  />
                  <p className="mt-1 text-white/40 text-[10px]">
                    Get from embed code: album=XXXXXXXXXX or track=XXXXXXXXXX
                  </p>
                </div>

                {/* Catalog Number */}
                <div>
                  <label className="block text-white/60 uppercase tracking-[0.25em] text-[11px] mb-2">
                    Catalog Number (optional)
                  </label>
                  <input
                    type="text"
                    value={releaseForm.catalogNumber}
                    onChange={(e) =>
                      setReleaseForm({ ...releaseForm, catalogNumber: e.target.value })
                    }
                    placeholder="TR-001"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:border-brand-acid focus:outline-none text-white uppercase tracking-[0.15em] text-[11px]"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-white/60 uppercase tracking-[0.25em] text-[11px] mb-2">
                    Description (optional)
                  </label>
                  <textarea
                    value={releaseForm.description}
                    onChange={(e) =>
                      setReleaseForm({ ...releaseForm, description: e.target.value })
                    }
                    placeholder="Release description..."
                    rows={3}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:border-brand-acid focus:outline-none text-white tracking-[0.15em] text-[11px] resize-none"
                  />
                </div>
              </div>

              {/* Right Column - Code Preview */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-white/60 uppercase tracking-[0.25em] text-[11px]">
                    Generated Code
                  </label>
                  <div className="flex gap-2">
                    <button
                      onClick={resetReleaseForm}
                      className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-white/60 uppercase tracking-[0.15em] text-[10px] transition-colors"
                    >
                      Reset
                    </button>
                    <button
                      onClick={() => handleCopy(generateReleaseCode())}
                      className="flex items-center gap-1 px-3 py-1.5 bg-brand-acid/20 hover:bg-brand-acid/30 border border-brand-acid/40 rounded-lg text-brand-acid uppercase tracking-[0.15em] text-[10px] transition-colors"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3 h-3" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          Copy
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <pre className="p-4 bg-brand-700/50 border border-white/10 rounded-lg overflow-x-auto text-[11px] text-brand-300 font-mono whitespace-pre-wrap">
                  {generateReleaseCode()}
                </pre>

                {/* Cover Preview */}
                {releaseForm.coverUrl && (
                  <div className="space-y-2">
                    <label className="text-white/60 uppercase tracking-[0.25em] text-[11px]">
                      Cover Preview
                    </label>
                    <div className="aspect-square max-w-[200px] rounded-lg overflow-hidden border border-white/10">
                      <img
                        src={releaseForm.coverUrl}
                        alt="Cover preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = "none"
                        }}
                      />
                    </div>
                  </div>
                )}

                <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
                  <p className="text-white/60 uppercase tracking-[0.25em] text-[10px]">
                    <strong className="text-white">Instructions:</strong>
                  </p>
                  <ol className="mt-2 space-y-1 text-white/50 uppercase tracking-[0.15em] text-[10px] list-decimal list-inside">
                    <li>Fill in the form above</li>
                    <li>Copy the generated code</li>
                    <li>Add it to <code className="text-brand-acid">src/data/releases.ts</code></li>
                    <li>Add at the beginning of the array (newest first)</li>
                  </ol>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </>
  )
}
