// Per-artist info carried over from the v1 catalogue (src/data/artists.ts / Supabase seed),
// keyed by the v2 roster slug. v1 data bugs fixed: Mekanorms' Facebook held a SoundCloud
// URL, and Warp Drive's SoundCloud/Facebook pointed to the label's own accounts.

export interface ArtistExtras {
  act: string
  country: string
  styles: string[]
  soundcloud: string | null
  instagram: string | null
  facebook: string | null
}

export const artistExtras: Record<string, ArtistExtras> = {
  thehorrids: { act: "Live Act", country: "France", styles: ["Darkpsy", "Forest"], soundcloud: "https://soundcloud.com/thehorrids", instagram: "https://www.instagram.com/the.horrids", facebook: "https://www.facebook.com/Thehorridspsy" },
  anchronorium: { act: "Live Act", country: "Portugal", styles: ["Darkpsy", "Hitech"], soundcloud: null, instagram: null, facebook: null },
  balku: { act: "Live Set", country: "Portugal", styles: ["Darkpsy", "Forest", "Hitech"], soundcloud: "https://on.soundcloud.com/TNCQQVhzVgu6LDcST", instagram: "https://www.instagram.com/balkumusic/", facebook: "https://www.facebook.com/share/1D5G5KEBah/" },
  lamarquise: { act: "Live Set", country: "France", styles: ["Twilight"], soundcloud: "https://soundcloud.com/m-t-0ryk", instagram: "https://www.instagram.com/angelolamarquise/", facebook: "https://www.facebook.com/DjLaMarquise" },
  opsuruus: { act: "Live Act", country: "Portugal", styles: ["Darkpsy", "Forest", "Hitech"], soundcloud: "https://soundcloud.com/opsuruus", instagram: "https://www.instagram.com/sandro_opsuruus/", facebook: "https://www.facebook.com/Opsuruus/" },
  warpdrive: { act: "Live Act", country: "Australia", styles: ["Twilight", "Darkpsy"], soundcloud: null, instagram: "https://www.instagram.com/engagethewarpdrive/", facebook: null },
  xipetotecs: { act: "Live Act", country: "Japan", styles: ["Twilight"], soundcloud: "https://soundcloud.com/xipetotecs", instagram: "https://www.instagram.com/xipe_totecs", facebook: "https://www.facebook.com/Xipetotecs" },
  zeo: { act: "Live Set", country: "France", styles: ["Darkpsy", "Forest"], soundcloud: "https://soundcloud.com/zeopsyrecord", instagram: "https://www.instagram.com/zeo_zeeoo/", facebook: "https://www.facebook.com/zeo.psyrec/" },
  agop: { act: "Dj Set", country: "France", styles: ["Twilight", "Forest"], soundcloud: "https://soundcloud.com/agop_psychedelic", instagram: "https://www.instagram.com/agop_transubtil", facebook: "https://www.facebook.com/profile.php?id=100092196862973" },
  akhaba: { act: "Dj Set / Live", country: "France", styles: ["Dark-Prog", "Psy Techno", "Twilight", "Darkpsy"], soundcloud: "https://soundcloud.com/akhaba", instagram: "https://www.instagram.com/akhaba_kubba/", facebook: "https://www.facebook.com/AkhabaSound" },
  art2fly: { act: "Dj Set", country: "Mexico", styles: ["Twilight"], soundcloud: "https://soundcloud.com/art2fly", instagram: "https://www.instagram.com/djart2fly", facebook: "https://www.facebook.com/DJArt2Fly" },
  lazzzy: { act: "Dj Set", country: "Japan", styles: ["Twilight"], soundcloud: null, instagram: "https://www.instagram.com/showurata_dj_lazzzy/", facebook: null },
  fiorenza: { act: "Dj Set", country: "Brazil", styles: ["Forest", "Darkpsy"], soundcloud: "https://soundcloud.com/fiorenzadj", instagram: "https://www.instagram.com/fiorenzacadore/", facebook: "https://www.facebook.com/fiorenzacadore" },
  heavyfawn: { act: "Dj Set", country: "France", styles: ["Darkpsy", "Forest", "Twilight"], soundcloud: "https://soundcloud.com/heavyfawn", instagram: "https://www.instagram.com/heavy_fawn/", facebook: "https://www.facebook.com/HeavyFawn/" },
  jive: { act: "Dj Set", country: "Australia", styles: ["Forest", "Darkpsy"], soundcloud: "https://soundcloud.com/jivepsy", instagram: "https://www.instagram.com/jairoyall", facebook: "https://www.facebook.com/share/18A2jTy5UN/" },
  kanaloa: { act: "Dj Set / Live", country: "England", styles: ["Twilight", "Forest", "Darkpsy"], soundcloud: "https://soundcloud.com/kanaloa_music", instagram: "https://www.instagram.com/kanaloa_music", facebook: "https://www.facebook.com/Kanaloa666" },
  mekanorms: { act: "Dj Set", country: "France", styles: ["Twilight"], soundcloud: "https://soundcloud.com/mekanorms", instagram: "https://www.instagram.com/mekanorms_transubtilrecords/", facebook: null },
  pakkun: { act: "Dj Set", country: "France", styles: ["Forest", "Darkpsy"], soundcloud: "https://soundcloud.com/pakkun-psy", instagram: "https://www.instagram.com/vincspakkun", facebook: null },
  rajax: { act: "Dj Set", country: "France", styles: ["Darkpsy", "Twilight"], soundcloud: "https://soundcloud.com/rajax-outrance", instagram: "https://www.instagram.com/rajax_outrance", facebook: "https://www.facebook.com/Rajaxsenoi" },
  wildtrack: { act: "Dj Set", country: "Morocco", styles: ["Twilight", "Forest"], soundcloud: "https://soundcloud.com/wild_track", instagram: "https://www.instagram.com/dj.wildtrack/", facebook: null },
  yagsa: { act: "Dj Set", country: "France", styles: ["Forest", "Twilight"], soundcloud: "https://soundcloud.com/yagsa", instagram: null, facebook: null },
}
