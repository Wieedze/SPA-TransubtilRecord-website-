import { useState, useEffect } from "react"
import { Helmet } from "react-helmet-async"
import { motion, AnimatePresence } from "framer-motion"
import { useAuth } from "../../contexts/AuthContext"
import {
  Users,
  Disc3,
  Plus,
  Check,
  Music2,
  MapPin,
  Globe,
  Loader2,
  AlertCircle,
  Pencil,
  Trash2,
  X,
  Search,
  Upload,
  Image as ImageIcon,
} from "lucide-react"
import {
  getArtists,
  getReleases,
  createArtist,
  updateArtist,
  deleteArtist,
  createRelease,
  updateRelease,
  deleteRelease,
  uploadImage,
  type Artist,
  type Release,
} from "../../lib/catalogue"

type TabType = "artists" | "releases"
type ModalMode = "add" | "edit" | null

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
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  // Data
  const [artists, setArtists] = useState<Artist[]>([])
  const [releases, setReleases] = useState<Release[]>([])

  // Modal state
  const [modalMode, setModalMode] = useState<ModalMode>(null)
  const [editingArtist, setEditingArtist] = useState<Artist | null>(null)
  const [editingRelease, setEditingRelease] = useState<Release | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<{
    type: "artist" | "release"
    id: number
    name: string
  } | null>(null)

  // Image upload state
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<string | null>(null)

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
    type: "ep" as (typeof RELEASE_TYPES)[number],
    releaseDate: new Date().getFullYear().toString(),
    catalogNumber: "",
    coverUrl: "",
    bandcampUrl: "",
    bandcampId: "",
    description: "",
  })

  // Load data
  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setIsLoading(true)
    try {
      const [artistsData, releasesData] = await Promise.all([
        getArtists(),
        getReleases(),
      ])
      setArtists(artistsData)
      setReleases(releasesData)
    } catch (err) {
      setError("Failed to load data")
    } finally {
      setIsLoading(false)
    }
  }

  const handleStyleToggle = (style: string) => {
    setArtistForm((prev) => ({
      ...prev,
      styles: prev.styles.includes(style)
        ? prev.styles.filter((s) => s !== style)
        : [...prev.styles, style],
    }))
  }

  // Handle image upload for artists
  const handleArtistImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!artistForm.name) {
      setError("Please enter artist name first")
      return
    }

    setIsUploading(true)
    setUploadProgress("Uploading image...")
    setError(null)

    try {
      const imageUrl = await uploadImage(file, "artist", artistForm.name)
      setArtistForm((prev) => ({ ...prev, image_url: imageUrl }))
      setUploadProgress("Image uploaded successfully!")
      setTimeout(() => setUploadProgress(null), 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload image")
    } finally {
      setIsUploading(false)
    }
  }

  // Handle image upload for releases
  const handleReleaseImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!releaseForm.title) {
      setError("Please enter release title first")
      return
    }

    setIsUploading(true)
    setUploadProgress("Uploading cover...")
    setError(null)

    try {
      const imageUrl = await uploadImage(file, "release", releaseForm.title)
      setReleaseForm((prev) => ({ ...prev, coverUrl: imageUrl }))
      setUploadProgress("Cover uploaded successfully!")
      setTimeout(() => setUploadProgress(null), 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload cover")
    } finally {
      setIsUploading(false)
    }
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

  const openAddArtistModal = () => {
    resetArtistForm()
    setEditingArtist(null)
    setModalMode("add")
  }

  const openEditArtistModal = (artist: Artist) => {
    setArtistForm({
      name: artist.name,
      act: artist.act,
      description: artist.description || "",
      styles: artist.style,
      country: artist.country,
      image_url: artist.image_url,
      soundcloud: artist.social?.soundcloud || "",
      instagram: artist.social?.instagram || "",
      facebook: artist.social?.facebook || "",
    })
    setEditingArtist(artist)
    setModalMode("edit")
  }

  const openAddReleaseModal = () => {
    resetReleaseForm()
    setEditingRelease(null)
    setModalMode("add")
  }

  const openEditReleaseModal = (release: Release) => {
    setReleaseForm({
      title: release.title,
      artist: release.artist,
      type: release.type,
      releaseDate: release.release_date,
      catalogNumber: release.catalog_number || "",
      coverUrl: release.cover_url,
      bandcampUrl: release.bandcamp_url,
      bandcampId: release.bandcamp_id,
      description: release.description || "",
    })
    setEditingRelease(release)
    setModalMode("edit")
  }

  const closeModal = () => {
    setModalMode(null)
    setEditingArtist(null)
    setEditingRelease(null)
    setError(null)
  }

  const handleSubmitArtist = async () => {
    if (
      !artistForm.name ||
      !artistForm.act ||
      !artistForm.country ||
      !artistForm.image_url ||
      artistForm.styles.length === 0
    ) {
      setError("Please fill in all required fields")
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const artistData = {
        name: artistForm.name.toLowerCase(),
        act: artistForm.act,
        description: artistForm.description,
        style: artistForm.styles,
        social: {
          ...(artistForm.soundcloud && { soundcloud: artistForm.soundcloud }),
          ...(artistForm.instagram && { instagram: artistForm.instagram }),
          ...(artistForm.facebook && { facebook: artistForm.facebook }),
        },
        country: artistForm.country,
        image_url: artistForm.image_url,
        videos: editingArtist?.videos || [],
      }

      if (editingArtist) {
        await updateArtist(editingArtist.id, artistData)
        setSuccess(`Artist "${artistForm.name}" updated successfully!`)
      } else {
        await createArtist(artistData)
        setSuccess(`Artist "${artistForm.name}" added successfully!`)
      }

      await loadData()
      closeModal()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save artist")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSubmitRelease = async () => {
    if (
      !releaseForm.title ||
      !releaseForm.artist ||
      !releaseForm.coverUrl ||
      !releaseForm.bandcampUrl ||
      !releaseForm.bandcampId
    ) {
      setError("Please fill in all required fields")
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const releaseData = {
        title: releaseForm.title,
        artist: releaseForm.artist,
        type: releaseForm.type,
        release_date: releaseForm.releaseDate,
        catalog_number: releaseForm.catalogNumber,
        cover_url: releaseForm.coverUrl,
        bandcamp_url: releaseForm.bandcampUrl,
        bandcamp_id: releaseForm.bandcampId,
        description: releaseForm.description || undefined,
      }

      if (editingRelease) {
        await updateRelease(editingRelease.id, releaseData)
        setSuccess(`Release "${releaseForm.title}" updated successfully!`)
      } else {
        await createRelease(releaseData)
        setSuccess(`Release "${releaseForm.title}" added successfully!`)
      }

      await loadData()
      closeModal()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save release")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteConfirm) return

    setIsSubmitting(true)
    try {
      if (deleteConfirm.type === "artist") {
        await deleteArtist(deleteConfirm.id)
        setSuccess(`Artist "${deleteConfirm.name}" deleted successfully!`)
      } else {
        await deleteRelease(deleteConfirm.id)
        setSuccess(`Release "${deleteConfirm.name}" deleted successfully!`)
      }
      await loadData()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete")
    } finally {
      setIsSubmitting(false)
      setDeleteConfirm(null)
    }
  }

  // Filter data
  const filteredArtists = artists.filter(
    (a) =>
      a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.country.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredReleases = releases.filter(
    (r) =>
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.artist.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-6xl text-center py-20">
        <h1 className="text-3xl font-bold mb-4">Access Denied</h1>
        <p className="text-white/60">
          You don't have permission to access this page.
        </p>
      </div>
    )
  }

  return (
    <>
      <Helmet>
        <title>Artist / Release Manager — Admin — Transubtil Records</title>
      </Helmet>

      <div className="mx-auto max-w-6xl space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
        >
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold uppercase tracking-[0.25em]">
              Artist / Release Manager
            </h1>
            <p className="text-white/60 uppercase tracking-[0.25em] text-[11px]">
              Manage artists and releases
            </p>
          </div>

          <button
            onClick={() =>
              activeTab === "artists"
                ? openAddArtistModal()
                : openAddReleaseModal()
            }
            className="flex items-center gap-2 px-6 py-3 bg-brand-acid hover:bg-brand-acid/90 rounded-lg text-brand-900 font-bold uppercase tracking-[0.15em] text-[11px] transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add {activeTab === "artists" ? "Artist" : "Release"}
          </button>
        </motion.div>

        {/* Success / Error Messages */}
        <AnimatePresence>
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-3 p-4 bg-green-500/20 border border-green-500/40 rounded-lg"
            >
              <Check className="w-5 h-5 text-green-400" />
              <span className="text-green-400 uppercase tracking-[0.15em] text-[11px]">
                {success}
              </span>
              <button
                onClick={() => setSuccess(null)}
                className="ml-auto text-green-400 hover:text-green-300"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tabs & Search */}
        <div className="flex flex-col sm:flex-row gap-4">
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
              Artists ({artists.length})
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
              Releases ({releases.length})
            </button>
          </div>

          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:border-brand-acid focus:outline-none text-white tracking-[0.15em] text-[11px]"
            />
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-brand-acid" />
          </div>
        ) : (
          <>
            {/* Artists List */}
            {activeTab === "artists" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid gap-3"
              >
                {filteredArtists.map((artist) => (
                  <div
                    key={artist.id}
                    className="flex items-center gap-4 p-4 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <img
                      src={artist.image_url}
                      alt={artist.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold capitalize truncate">
                        {artist.name}
                      </h3>
                      <p className="text-white/60 text-[11px] uppercase tracking-[0.15em]">
                        {artist.act} • {artist.country}
                      </p>
                    </div>
                    <div className="hidden sm:flex gap-1">
                      {artist.style.slice(0, 2).map((s) => (
                        <span
                          key={s}
                          className="px-2 py-1 bg-white/10 rounded text-[10px] uppercase tracking-[0.1em]"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEditArtistModal(artist)}
                        className="p-2 text-white/60 hover:text-brand-acid transition-colors"
                        title="Edit"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() =>
                          setDeleteConfirm({
                            type: "artist",
                            id: artist.id,
                            name: artist.name,
                          })
                        }
                        className="p-2 text-white/60 hover:text-red-400 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}

                {filteredArtists.length === 0 && (
                  <p className="text-center text-white/40 py-10">
                    No artists found
                  </p>
                )}
              </motion.div>
            )}

            {/* Releases List */}
            {activeTab === "releases" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid gap-3"
              >
                {filteredReleases.map((release) => (
                  <div
                    key={release.id}
                    className="flex items-center gap-4 p-4 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <img
                      src={release.cover_url}
                      alt={release.title}
                      className="w-12 h-12 rounded object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold truncate">{release.title}</h3>
                      <p className="text-white/60 text-[11px] uppercase tracking-[0.15em]">
                        {release.artist} • {release.release_date}
                      </p>
                    </div>
                    <span className="hidden sm:block px-2 py-1 bg-white/10 rounded text-[10px] uppercase tracking-[0.1em]">
                      {release.type}
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEditReleaseModal(release)}
                        className="p-2 text-white/60 hover:text-brand-acid transition-colors"
                        title="Edit"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() =>
                          setDeleteConfirm({
                            type: "release",
                            id: release.id,
                            name: release.title,
                          })
                        }
                        className="p-2 text-white/60 hover:text-red-400 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}

                {filteredReleases.length === 0 && (
                  <p className="text-center text-white/40 py-10">
                    No releases found
                  </p>
                )}
              </motion.div>
            )}
          </>
        )}
      </div>

      {/* Artist Modal */}
      <AnimatePresence>
        {modalMode && activeTab === "artists" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-brand-900 border border-white/10 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-white/10 flex items-center justify-between">
                <h2 className="text-xl font-bold uppercase tracking-[0.25em]">
                  {modalMode === "add" ? "Add Artist" : "Edit Artist"}
                </h2>
                <button
                  onClick={closeModal}
                  className="p-2 text-white/60 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                {error && (
                  <div className="flex items-center gap-3 p-4 bg-red-500/20 border border-red-500/40 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-red-400" />
                    <span className="text-red-400 text-[11px]">{error}</span>
                  </div>
                )}

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white/60 uppercase tracking-[0.25em] text-[11px] mb-2">
                      Name *
                    </label>
                    <input
                      type="text"
                      value={artistForm.name}
                      onChange={(e) =>
                        setArtistForm({ ...artistForm, name: e.target.value })
                      }
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:border-brand-acid focus:outline-none text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-white/60 uppercase tracking-[0.25em] text-[11px] mb-2">
                      Act Type *
                    </label>
                    <select
                      value={artistForm.act}
                      onChange={(e) =>
                        setArtistForm({ ...artistForm, act: e.target.value })
                      }
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:border-brand-acid focus:outline-none text-white"
                    >
                      <option value="Live Act">Live Act</option>
                      <option value="Live Set">Live Set</option>
                      <option value="Dj Set">Dj Set</option>
                      <option value="Dj Set / Live">Dj Set / Live</option>
                    </select>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
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
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:border-brand-acid focus:outline-none text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-white/60 uppercase tracking-[0.25em] text-[11px] mb-2">
                      <ImageIcon className="w-3 h-3 inline mr-1" />
                      Image *
                    </label>
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={artistForm.image_url}
                          onChange={(e) =>
                            setArtistForm({
                              ...artistForm,
                              image_url: e.target.value,
                            })
                          }
                          placeholder="URL or upload"
                          className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:border-brand-acid focus:outline-none text-white text-sm"
                        />
                        <label className={`flex items-center gap-2 px-4 py-3 rounded-lg cursor-pointer transition-colors ${isUploading ? 'bg-white/5 text-white/40' : 'bg-brand-acid/20 hover:bg-brand-acid/30 text-brand-acid'}`}>
                          {isUploading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Upload className="w-4 h-4" />
                          )}
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleArtistImageUpload}
                            disabled={isUploading}
                            className="hidden"
                          />
                        </label>
                      </div>
                      {uploadProgress && (
                        <p className="text-brand-acid text-[10px] uppercase tracking-[0.15em]">{uploadProgress}</p>
                      )}
                      {artistForm.image_url && (
                        <img
                          src={artistForm.image_url}
                          alt="Preview"
                          className="w-16 h-16 rounded-full object-cover border border-white/20"
                          onError={(e) => (e.currentTarget.style.display = "none")}
                        />
                      )}
                    </div>
                  </div>
                </div>

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
                            : "bg-white/5 border border-white/20 text-white/60"
                        }`}
                      >
                        {style}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-white/60 uppercase tracking-[0.25em] text-[11px] mb-2">
                    Biography
                  </label>
                  <textarea
                    value={artistForm.description}
                    onChange={(e) =>
                      setArtistForm({
                        ...artistForm,
                        description: e.target.value,
                      })
                    }
                    rows={4}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:border-brand-acid focus:outline-none text-white resize-none"
                  />
                </div>

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
                        setArtistForm({
                          ...artistForm,
                          soundcloud: e.target.value,
                        })
                      }
                      placeholder="SoundCloud URL"
                      className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:border-brand-acid focus:outline-none text-white text-sm"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-white/40" />
                    <input
                      type="text"
                      value={artistForm.instagram}
                      onChange={(e) =>
                        setArtistForm({
                          ...artistForm,
                          instagram: e.target.value,
                        })
                      }
                      placeholder="Instagram URL"
                      className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:border-brand-acid focus:outline-none text-white text-sm"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-white/40" />
                    <input
                      type="text"
                      value={artistForm.facebook}
                      onChange={(e) =>
                        setArtistForm({
                          ...artistForm,
                          facebook: e.target.value,
                        })
                      }
                      placeholder="Facebook URL"
                      className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:border-brand-acid focus:outline-none text-white text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-white/10 flex justify-end gap-3">
                <button
                  onClick={closeModal}
                  className="px-6 py-3 bg-white/5 hover:bg-white/10 rounded-lg text-white/60 uppercase tracking-[0.15em] text-[11px]"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitArtist}
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-6 py-3 bg-brand-acid hover:bg-brand-acid/90 rounded-lg text-brand-900 font-bold uppercase tracking-[0.15em] text-[11px] disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  {modalMode === "add" ? "Add Artist" : "Save Changes"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Release Modal */}
      <AnimatePresence>
        {modalMode && activeTab === "releases" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-brand-900 border border-white/10 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-white/10 flex items-center justify-between">
                <h2 className="text-xl font-bold uppercase tracking-[0.25em]">
                  {modalMode === "add" ? "Add Release" : "Edit Release"}
                </h2>
                <button
                  onClick={closeModal}
                  className="p-2 text-white/60 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                {error && (
                  <div className="flex items-center gap-3 p-4 bg-red-500/20 border border-red-500/40 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-red-400" />
                    <span className="text-red-400 text-[11px]">{error}</span>
                  </div>
                )}

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white/60 uppercase tracking-[0.25em] text-[11px] mb-2">
                      Title *
                    </label>
                    <input
                      type="text"
                      value={releaseForm.title}
                      onChange={(e) =>
                        setReleaseForm({ ...releaseForm, title: e.target.value })
                      }
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:border-brand-acid focus:outline-none text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-white/60 uppercase tracking-[0.25em] text-[11px] mb-2">
                      Artist *
                    </label>
                    <input
                      type="text"
                      value={releaseForm.artist}
                      onChange={(e) =>
                        setReleaseForm({
                          ...releaseForm,
                          artist: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:border-brand-acid focus:outline-none text-white"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-white/60 uppercase tracking-[0.25em] text-[11px] mb-2">
                      Type *
                    </label>
                    <select
                      value={releaseForm.type}
                      onChange={(e) =>
                        setReleaseForm({
                          ...releaseForm,
                          type: e.target.value as (typeof RELEASE_TYPES)[number],
                        })
                      }
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:border-brand-acid focus:outline-none text-white"
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
                        setReleaseForm({
                          ...releaseForm,
                          releaseDate: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:border-brand-acid focus:outline-none text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-white/60 uppercase tracking-[0.25em] text-[11px] mb-2">
                      Catalog #
                    </label>
                    <input
                      type="text"
                      value={releaseForm.catalogNumber}
                      onChange={(e) =>
                        setReleaseForm({
                          ...releaseForm,
                          catalogNumber: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:border-brand-acid focus:outline-none text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-white/60 uppercase tracking-[0.25em] text-[11px] mb-2">
                    <ImageIcon className="w-3 h-3 inline mr-1" />
                    Cover *
                  </label>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={releaseForm.coverUrl}
                        onChange={(e) =>
                          setReleaseForm({ ...releaseForm, coverUrl: e.target.value })
                        }
                        placeholder="URL or upload"
                        className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:border-brand-acid focus:outline-none text-white text-sm"
                      />
                      <label className={`flex items-center gap-2 px-4 py-3 rounded-lg cursor-pointer transition-colors ${isUploading ? 'bg-white/5 text-white/40' : 'bg-brand-acid/20 hover:bg-brand-acid/30 text-brand-acid'}`}>
                        {isUploading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Upload className="w-4 h-4" />
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleReleaseImageUpload}
                          disabled={isUploading}
                          className="hidden"
                        />
                      </label>
                    </div>
                    {uploadProgress && (
                      <p className="text-brand-acid text-[10px] uppercase tracking-[0.15em]">{uploadProgress}</p>
                    )}
                    {releaseForm.coverUrl && (
                      <img
                        src={releaseForm.coverUrl}
                        alt="Cover preview"
                        className="w-20 h-20 rounded object-cover border border-white/20"
                        onError={(e) => (e.currentTarget.style.display = "none")}
                      />
                    )}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white/60 uppercase tracking-[0.25em] text-[11px] mb-2">
                      Bandcamp URL *
                    </label>
                    <input
                      type="text"
                      value={releaseForm.bandcampUrl}
                      onChange={(e) =>
                        setReleaseForm({
                          ...releaseForm,
                          bandcampUrl: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:border-brand-acid focus:outline-none text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-white/60 uppercase tracking-[0.25em] text-[11px] mb-2">
                      Bandcamp ID *
                    </label>
                    <input
                      type="text"
                      value={releaseForm.bandcampId}
                      onChange={(e) =>
                        setReleaseForm({
                          ...releaseForm,
                          bandcampId: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:border-brand-acid focus:outline-none text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-white/60 uppercase tracking-[0.25em] text-[11px] mb-2">
                    Description
                  </label>
                  <textarea
                    value={releaseForm.description}
                    onChange={(e) =>
                      setReleaseForm({
                        ...releaseForm,
                        description: e.target.value,
                      })
                    }
                    rows={3}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:border-brand-acid focus:outline-none text-white resize-none"
                  />
                </div>

                </div>

              <div className="p-6 border-t border-white/10 flex justify-end gap-3">
                <button
                  onClick={closeModal}
                  className="px-6 py-3 bg-white/5 hover:bg-white/10 rounded-lg text-white/60 uppercase tracking-[0.15em] text-[11px]"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitRelease}
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-6 py-3 bg-brand-acid hover:bg-brand-acid/90 rounded-lg text-brand-900 font-bold uppercase tracking-[0.15em] text-[11px] disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  {modalMode === "add" ? "Add Release" : "Save Changes"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50"
            onClick={() => setDeleteConfirm(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-brand-900 border border-white/10 rounded-lg w-full max-w-md p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl font-bold mb-4">Confirm Delete</h2>
              <p className="text-white/60 mb-6">
                Are you sure you want to delete{" "}
                <strong className="text-white">"{deleteConfirm.name}"</strong>?
                This action cannot be undone.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="px-6 py-3 bg-white/5 hover:bg-white/10 rounded-lg text-white/60 uppercase tracking-[0.15em] text-[11px]"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-6 py-3 bg-red-500 hover:bg-red-600 rounded-lg text-white font-bold uppercase tracking-[0.15em] text-[11px] disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
