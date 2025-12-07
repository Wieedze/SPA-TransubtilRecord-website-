import { Search, X } from "lucide-react"

interface ArtistFiltersProps {
  searchQuery: string
  setSearchQuery: (query: string) => void
  selectedStyle: string
  setSelectedStyle: (style: string) => void
  selectedCountry: string
  setSelectedCountry: (country: string) => void
  allStyles: string[]
  allCountries: string[]
  resultsCount: number
}

export default function ArtistFilters({
  searchQuery,
  setSearchQuery,
  selectedStyle,
  setSelectedStyle,
  selectedCountry,
  setSelectedCountry,
  allStyles,
  allCountries,
  resultsCount,
}: ArtistFiltersProps) {
  const hasActiveFilters = searchQuery || selectedStyle !== "all" || selectedCountry !== "all"

  const clearFilters = () => {
    setSearchQuery("")
    setSelectedStyle("all")
    setSelectedCountry("all")
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
        <input
          type="text"
          placeholder="SEARCH ARTISTS..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-brand-700/30 border border-white/10 rounded-lg uppercase tracking-[0.25em] text-[11px] text-white placeholder:text-white/40 focus:outline-none focus:border-brand-300/60 transition-colors"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Style Filter */}
        <select
          value={selectedStyle}
          onChange={(e) => setSelectedStyle(e.target.value)}
          className="flex-1 px-4 py-2 bg-brand-700/30 border border-white/10 rounded-lg uppercase tracking-[0.25em] text-[11px] text-white focus:outline-none focus:border-brand-300/60 transition-colors cursor-pointer"
        >
          <option value="all">ALL STYLES</option>
          {allStyles.map((style) => (
            <option key={style} value={style}>
              {style.toUpperCase()}
            </option>
          ))}
        </select>

        {/* Country Filter */}
        <select
          value={selectedCountry}
          onChange={(e) => setSelectedCountry(e.target.value)}
          className="flex-1 px-4 py-2 bg-brand-700/30 border border-white/10 rounded-lg uppercase tracking-[0.25em] text-[11px] text-white focus:outline-none focus:border-brand-300/60 transition-colors cursor-pointer"
        >
          <option value="all">ALL COUNTRIES</option>
          {allCountries.map((country) => (
            <option key={country} value={country}>
              {country.toUpperCase()}
            </option>
          ))}
        </select>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="px-4 py-2 border border-white/20 rounded-lg uppercase tracking-[0.25em] text-[11px] text-white/80 hover:text-white hover:border-brand-300/60 transition-colors whitespace-nowrap"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Results Count */}
      <p className="text-xs text-white/50">
        {resultsCount} {resultsCount === 1 ? "artist" : "artists"} found
      </p>
    </div>
  )
}
