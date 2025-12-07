import { useState, useMemo, useEffect } from "react"
import { Helmet } from "react-helmet-async"
import { artists, getAllStyles, getAllCountries } from "../data/artists"
import ArtistCard from "../components/artists/ArtistCard"
import ArtistFilters from "../components/artists/ArtistFilters"

export default function Artists() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedStyle, setSelectedStyle] = useState("all")
  const [selectedCountry, setSelectedCountry] = useState("all")

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const allStyles = useMemo(() => getAllStyles(), [])
  const allCountries = useMemo(() => getAllCountries(), [])

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
  }, [searchQuery, selectedStyle, selectedCountry])

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
