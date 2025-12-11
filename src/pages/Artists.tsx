import { useState, useMemo, useEffect } from "react"
import { Helmet } from "react-helmet-async"
import { getArtists, getAllStyles, getAllCountries, type Artist } from "../lib/catalogue"
import ArtistCard from "../components/artists/ArtistCard"
import ArtistFilters from "../components/artists/ArtistFilters"

export default function Artists() {
  const [artists, setArtists] = useState<Artist[]>([])
  const [allStyles, setAllStyles] = useState<string[]>([])
  const [allCountries, setAllCountries] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [searchQuery, setSearchQuery] = useState("")
  const [selectedStyle, setSelectedStyle] = useState("all")
  const [selectedCountry, setSelectedCountry] = useState("all")

  // Scroll to top and load data when component mounts
  useEffect(() => {
    window.scrollTo(0, 0)
    loadData()
  }, [])

  async function loadData() {
    try {
      setLoading(true)
      const [artistsData, stylesData, countriesData] = await Promise.all([
        getArtists(),
        getAllStyles(),
        getAllCountries(),
      ])
      setArtists(artistsData)
      setAllStyles(stylesData)
      setAllCountries(countriesData)
    } catch (err) {
      console.error("Error loading artists:", err)
      setError("Failed to load artists. Please try again later.")
    } finally {
      setLoading(false)
    }
  }

  const filteredArtists = useMemo(() => {
    return artists.filter((artist) => {
      const matchesSearch = artist.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase())

      const matchesStyle =
        selectedStyle === "all" || artist.style.includes(selectedStyle)

      const matchesCountry =
        selectedCountry === "all" || artist.country === selectedCountry

      return matchesSearch && matchesStyle && matchesCountry
    })
  }, [artists, searchQuery, selectedStyle, selectedCountry])

  if (loading) {
    return (
      <section className="mx-auto max-w-6xl">
        <div className="flex items-center justify-center py-24">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-500"></div>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="mx-auto max-w-6xl">
        <div className="text-center py-24">
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={loadData}
            className="px-6 py-2 border border-white/20 hover:border-white/40 rounded-lg text-sm uppercase tracking-wider transition-colors"
          >
            Retry
          </button>
        </div>
      </section>
    )
  }

  return (
    <>
      <Helmet>
        <title>Transubtil Records — Artists</title>
        <meta
          name="description"
          content="Discover our roster of psychedelic trance artists from around the world. Dark psy, forest, twilight and more."
        />
      </Helmet>

      <section className="mx-auto max-w-6xl space-y-8">
        {/* Header */}

        {/* Filters */}
        <ArtistFilters
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedStyle={selectedStyle}
          setSelectedStyle={setSelectedStyle}
          selectedCountry={selectedCountry}
          setSelectedCountry={setSelectedCountry}
          allStyles={allStyles}
          allCountries={allCountries}
          resultsCount={filteredArtists.length}
        />

        {/* Artists Grid */}
        {filteredArtists.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredArtists.map((artist) => (
              <ArtistCard key={artist.id} artist={artist} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-white/60">No artists found matching your filters.</p>
            <p className="text-sm text-white/40 mt-2">
              Try adjusting your search or clearing filters.
            </p>
          </div>
        )}
      </section>
    </>
  )
}
