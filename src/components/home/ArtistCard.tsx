import { Link } from "react-router-dom"
import { styleLine, type RosterArtist } from "../../data/roster"

export default function ArtistCard({ artist }: { artist: RosterArtist }) {
  return (
    <Link to={`/artists/${artist.slug}`} className="group flex flex-col gap-3.5 text-bone hover:text-bone">
      <div className="relative aspect-[4/5] overflow-hidden rounded-photo bg-brand-800">
        <img
          src={artist.photo}
          alt={artist.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.04]"
        />
        <span className="absolute right-2.5 top-2.5 rounded-full bg-brand-950/85 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-bone">
          {artist.format === "Live" ? "Live" : "DJ"}
        </span>
      </div>
      <div className="flex flex-col gap-1.5">
        <span className="font-display text-[15px] font-semibold uppercase transition-colors group-hover:text-accent md:text-[19px]">
          {artist.name}
        </span>
        <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-accent md:text-label">
          {styleLine(artist)}
        </span>
      </div>
    </Link>
  )
}
