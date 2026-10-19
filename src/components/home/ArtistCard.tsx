import { Link } from "react-router-dom"
import type { RosterArtist } from "../../data/roster"

export default function ArtistCard({ artist, showLocation = false }: { artist: RosterArtist; showLocation?: boolean }) {
  return (
    <Link to={`/artists/${artist.slug}`} className="group flex flex-col gap-3.5 text-bone hover:text-bone">
      <div className="relative aspect-[4/5] overflow-hidden rounded-photo bg-brand-800">
        <img
          src={artist.photo}
          alt={artist.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.04]"
        />
        <span className="absolute right-2.5 top-2.5 rounded bg-accent px-[9px] py-[5px] text-[11px] font-bold uppercase tracking-[0.12em] text-brand-950">
          {artist.format}
        </span>
      </div>
      <div className="flex flex-col gap-1.5">
        <span className="font-display text-[15px] font-semibold uppercase transition-colors group-hover:text-accent md:text-[19px]">
          {artist.name}
        </span>
        <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-accent md:text-xs">{artist.style}</span>
        {showLocation && artist.location && <span className="text-small text-brand-300">{artist.location}</span>}
      </div>
    </Link>
  )
}
