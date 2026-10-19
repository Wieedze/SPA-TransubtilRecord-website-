// schema.org JSON-LD builders. Search engines and AI assistants read these to know
// what the label is, who its artists are, what they play and what they released.
import { GENRES, LOGO_URL, SITE_NAME, SITE_URL, absoluteUrl } from "../config/seo"
import { SOCIAL_LINKS } from "../config/site"
import { roster, releasesByArtist, type RosterArtist } from "../data/roster"
import { releases } from "../data/releases"
import type { Release } from "../types/release"

const LABEL_ID = `${SITE_URL}/#label`
const labelRef = { "@type": "Organization", "@id": LABEL_ID, name: SITE_NAME, url: SITE_URL }
const labelSameAs = SOCIAL_LINKS.map((l) => l.href).filter((h): h is string => Boolean(h))

const RELEASE_TYPE: Record<Release["type"], string> = {
  album: "https://schema.org/AlbumRelease",
  ep: "https://schema.org/EPRelease",
  track: "https://schema.org/SingleRelease",
  compilation: "https://schema.org/AlbumRelease",
}

export function artistUrl(artist: RosterArtist) {
  return `${SITE_URL}/artists/${artist.slug}`
}

export function artistPlace(artist: RosterArtist) {
  return artist.location ?? artist.country
}

export function artistSummary(artist: RosterArtist) {
  const kind = artist.format === "Live" ? "live act" : "DJ"
  const place = artistPlace(artist)
  return `${artist.name} is a ${artist.style.toLowerCase()} ${kind}${place ? ` from ${place}` : ""} on Transubtil Records, a psytrance label from Marseille, France.`
}

export function labelLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": LABEL_ID,
    name: SITE_NAME,
    alternateName: ["Transubtil", "Transubtil Rec"],
    url: SITE_URL,
    logo: absoluteUrl(LOGO_URL),
    description:
      "Independent psychedelic trance label from Marseille, France, releasing psytrance, darkpsy, forest and night psy, and booking its DJs and live acts for parties and festivals.",
    address: { "@type": "PostalAddress", addressLocality: "Marseille", addressCountry: "FR" },
    areaServed: "Worldwide",
    knowsAbout: GENRES,
    sameAs: labelSameAs,
    member: roster.map((a) => ({ "@type": "MusicGroup", name: a.name, url: artistUrl(a) })),
  }
}

export function websiteLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    inLanguage: "en",
    publisher: { "@id": LABEL_ID },
  }
}

function releaseNode(release: Release) {
  return {
    "@type": "MusicAlbum",
    name: release.title,
    url: release.bandcampUrl,
    image: release.coverUrl,
    datePublished: release.releaseDate,
    byArtist: { "@type": "MusicGroup", name: release.artist },
    recordLabel: labelRef,
    albumReleaseType: RELEASE_TYPE[release.type],
    ...(release.type === "compilation" ? { albumProductionType: "https://schema.org/CompilationAlbum" } : {}),
    genre: "Psytrance",
  }
}

export function artistLd(artist: RosterArtist, photoUrl: string) {
  const place = artistPlace(artist)
  const sameAs = [artist.links.soundcloud, artist.links.instagram, artist.links.facebook, artist.links.bandcamp].filter(
    (h): h is string => Boolean(h)
  )
  return {
    "@context": "https://schema.org",
    "@type": "MusicGroup",
    "@id": `${artistUrl(artist)}#artist`,
    name: artist.name,
    url: artistUrl(artist),
    image: absoluteUrl(photoUrl),
    description: artist.bio?.split("\n")[0] ?? artistSummary(artist),
    genre: [...new Set([...artist.styles, artist.style, "Psytrance"])],
    ...(place ? { location: { "@type": "Place", name: place } } : {}),
    memberOf: labelRef,
    ...(sameAs.length ? { sameAs } : {}),
    album: releasesByArtist(artist).map(releaseNode),
  }
}

export function artistsListLd() {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Transubtil Records artists",
    numberOfItems: roster.length,
    itemListElement: roster.map((a, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: artistUrl(a),
      name: `${a.name} (${a.style}, ${a.format === "Live" ? "live act" : "DJ"})`,
    })),
  }
}

export function releasesListLd() {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Transubtil Records releases",
    numberOfItems: releases.length,
    itemListElement: releases.map((r, i) => ({ "@type": "ListItem", position: i + 1, item: releaseNode(r) })),
  }
}

export function breadcrumbLd(items: Array<{ name: string; path: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  }
}
