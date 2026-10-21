// Per-artist info from the label's artist template (Template_artistes-v9.pdf, October 2026),
// keyed by the v2 roster slug: format, country (from the flag), styles and social links.

export interface ArtistExtras {
  act: string
  country: string
  styles: string[]
  soundcloud: string | null
  /** A set shown above the profile player on the artist page: a track, set or playlist
   *  URL, also on another account (e.g. a festival or label showcase the artist reposts) */
  featuredSet?: string
  instagram: string | null
  facebook: string | null
}

export const artistExtras: Record<string, ArtistExtras> = {
  thehorrids: { act: "Live Act", country: "France", styles: ["Darkpsy", "Forest"], soundcloud: "https://soundcloud.com/thehorrids", featuredSet: "https://soundcloud.com/mo_dem/the-horrids-the-hive-modem", instagram: "https://www.instagram.com/the.horrids/", facebook: "https://www.facebook.com/Thehorridspsy/" },
  anchronorium: { act: "Live Act", country: "Portugal", styles: ["Darkpsy", "Hitech"], soundcloud: "https://soundcloud.com/anchronorium", instagram: "https://www.instagram.com/rafyx_anchronorium", facebook: null },
  balku: { act: "Live Set", country: "Portugal", styles: ["Darkpsy", "Forest", "Hitech"], soundcloud: "https://soundcloud.com/balkumusic", instagram: "https://www.instagram.com/balkumusic/", facebook: "https://www.facebook.com/balkumusic" },
  drfractal: { act: "Live Act", country: "France", styles: ["Darkpsy", "Forest"], soundcloud: "https://soundcloud.com/theosantinacci", featuredSet: "https://soundcloud.com/user-211014637-830247290/bakubai-promo-mix-for-back-to-nature-festival-2025", instagram: "https://www.instagram.com/dr.fractal_bakubai", facebook: "https://www.facebook.com/dr.fractal/" },
  intrapsyche: { act: "Live Act", country: "Italy", styles: ["Twilight", "Darkpsy"], soundcloud: "https://soundcloud.com/francescointrapsyche", instagram: "https://www.instagram.com/intrapsyche_transubtil", facebook: "https://www.facebook.com/profile.php?id=61553932695541" },
  lamarquise: { act: "Live Set", country: "France", styles: ["Twilight"], soundcloud: "https://soundcloud.com/m-t-0ryk", instagram: "https://www.instagram.com/angelolamarquise", facebook: null },
  opsuruus: { act: "Live Act", country: "Portugal", styles: ["Darkpsy", "Forest", "Hitech"], soundcloud: "https://soundcloud.com/opsuruus", instagram: "https://www.instagram.com/opsuruus.music", facebook: "https://www.facebook.com/Opsuruus" },
  vakarm: { act: "Live Act", country: "France", styles: ["Darkpsy"], soundcloud: "https://soundcloud.com/vakarm-ts", instagram: "https://www.instagram.com/vakarm.music/", facebook: null },
  warpdrive: { act: "Live Act", country: "Australia", styles: ["Twilight", "Darkpsy"], soundcloud: "https://soundcloud.com/engagethewarpdrive", instagram: "https://www.instagram.com/engagethewarpdrive/", facebook: "https://www.facebook.com/engagethewarpdrive/" },
  xipetotecs: { act: "Live Act", country: "Japan", styles: ["Twilight"], soundcloud: "https://soundcloud.com/xipetotecs", instagram: "https://www.instagram.com/xipe_totecs", facebook: "https://www.facebook.com/Xipetotecs" },
  yellowmellow: { act: "Live Act", country: "Portugal", styles: ["Twilight", "Darkpsy"], soundcloud: "https://soundcloud.com/yellowmellow22", instagram: "https://www.instagram.com/yellow_mellow_sound/", facebook: null },
  zeo: { act: "Live Set", country: "France", styles: ["Darkpsy", "Forest"], soundcloud: "https://soundcloud.com/zeopsyrecord", instagram: "https://www.instagram.com/zeo_sound", facebook: "https://www.facebook.com/zeo.psyrec/" },
  agop: { act: "Dj Set", country: "France", styles: ["Twilight", "Forest"], soundcloud: "https://soundcloud.com/agop_psychedelic", instagram: "https://www.instagram.com/agop_transubtil", facebook: null },
  akhaba: { act: "Dj Set / Live", country: "France", styles: ["Dark-Prog", "Psy Techno", "Twilight", "Darkpsy"], soundcloud: "https://soundcloud.com/akhaba", instagram: "https://www.instagram.com/akhaba_kubba", facebook: "https://www.facebook.com/AkhabaSound/" },
  art2fly: { act: "Dj Set", country: "Mexico", styles: ["Twilight"], soundcloud: "https://soundcloud.com/art2fly", instagram: "https://www.instagram.com/djart2fly", facebook: "https://www.facebook.com/DJArt2Fly" },
  dirge: { act: "Dj Set", country: "Australia", styles: ["Twilight"], soundcloud: "https://soundcloud.com/dirgepsy", instagram: "https://www.instagram.com/dirgepsytrance", facebook: "https://www.facebook.com/dirgepsytrance" },
  fiorenza: { act: "Dj Set", country: "Brazil", styles: ["Forest", "Darkpsy"], soundcloud: "https://soundcloud.com/fiorenzadj", featuredSet: "https://soundcloud.com/fiorenzadj/dark-realm", instagram: "https://www.instagram.com/fiorenzacadore/", facebook: "https://www.facebook.com/fiorenzacadore" },
  heavyfawn: { act: "Dj Set", country: "France", styles: ["Darkpsy", "Forest", "Twilight"], soundcloud: "https://soundcloud.com/heavyfawn", instagram: "https://www.instagram.com/heavy_fawn", facebook: "https://www.facebook.com/HeavyFawn" },
  ingred: { act: "Dj Set", country: "Brazil", styles: ["Twilight", "Forest"], soundcloud: "https://soundcloud.com/user-858845385", featuredSet: "https://soundcloud.com/transubtil/transubtil-rec-showcase-25", instagram: "https://www.instagram.com/ingred.transubtil", facebook: null },
  jive: { act: "Dj Set", country: "Australia", styles: ["Forest", "Darkpsy"], soundcloud: "https://soundcloud.com/jivepsy", instagram: "https://www.instagram.com/jive_jai", facebook: "https://www.facebook.com/JivePsy" },
  kanaloa: { act: "Dj Set / Live", country: "England", styles: ["Twilight", "Forest", "Darkpsy"], soundcloud: "https://soundcloud.com/kanaloa_music", instagram: "https://www.instagram.com/kanaloa_music", facebook: "https://www.facebook.com/Kanaloa666" },
  mekanorms: { act: "Dj Set", country: "France", styles: ["Twilight"], soundcloud: "https://soundcloud.com/mekanorms", instagram: "https://www.instagram.com/mekanorms_transubtilrecords/", facebook: "https://www.facebook.com/mekanorms" },
  pakkun: { act: "Dj Set", country: "France", styles: ["Forest", "Darkpsy"], soundcloud: "https://soundcloud.com/pakkun-psy", instagram: "https://www.instagram.com/pakkun_transubtil", facebook: "https://www.facebook.com/Pakkunpsy" },
  rajax: { act: "Dj Set", country: "France", styles: ["Darkpsy", "Twilight"], soundcloud: "https://soundcloud.com/rajax-outrance", instagram: "https://www.instagram.com/rajax_outrance/", facebook: "https://www.facebook.com/pages/Rajax/1672419826335836" },
  uechi: { act: "Dj Set", country: "Japan", styles: ["Darkpsy", "Forest"], soundcloud: null, instagram: null, facebook: null },
  wildtrack: { act: "Dj Set", country: "Morocco", styles: ["Twilight", "Forest"], soundcloud: "https://soundcloud.com/wild_track", featuredSet: "https://soundcloud.com/transubtil/transubtil-rec-showcase-21-wild-track", instagram: "https://www.instagram.com/dj.wildtrack/", facebook: null },
  yagsa: { act: "Dj Set", country: "France", styles: ["Forest", "Twilight"], soundcloud: "https://soundcloud.com/yagsa", instagram: "https://www.instagram.com/yagsa_transubtil_rec", facebook: null },
}
