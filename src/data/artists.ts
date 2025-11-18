import type { Artist } from "../types/artist"
import { slugify } from "../utils/slugify"

const artistsData = [
  {
    id: 1,
    name: "the horrids",
    act: "Live Act",
    description:
      "The project has been created in the year 2019 in France. Radikal Moodz & Shred'er, combines the top of their imagination into a fresh style with energic basslines and grooves, all surrounded by organic textures broken by digital rhythms that create a full 3D world to travel inside, unique of its kind. A fairy tale journey with twisted sounds, off beat sequences and crazy sound design are some of their elements.",
    style: ["Darkpsy", "Forest"],
    social: {
      soundcloud: "https://soundcloud.com/thehorrids",
      instagram: "https://www.instagram.com/the.horrids",
      facebook: "https://www.facebook.com/Thehorridspsy",
    },
    country: "France",
    image_url: "/images/the-horrids.png",
  },
  {
    id: 2,
    name: "dr fractal",
    act: "Live Act",
    description:
      "Dr Fractal, real name Théo Santinacci, is a French psytrance artist affiliated with Transubtil Records. A musician since childhood and a former drummer in various bands, he launched the Dr Fractal project in 2013. His music blends groovy rhythms, deep atmospheres, and high-energy vibes. Notable releases include the album Smooth Lobotomy (2021) and the Red Spicy EP (2023), featuring collaborations with Karev and The Horrids. Dr Fractal has performed at international festivals, including the OZORA Festival in 2024.",
    style: ["Darkpsy", "Forest", "Hitech"],
    social: {
      soundcloud: "https://soundcloud.com/theosantinacci",
      facebook: "https://www.facebook.com/dr.fractal",
      instagram: "https://www.instagram.com/dr.fractal_bakubai/",
    },
    country: "France",
    image_url: "/images/drfractal.jpg",
  },
  {
    id: 3,
    name: "Opsuruus",
    act: "Live Act",
    description:
      "Opsuruus, real name Sandro Viegas, is a psytrance artist from Oliveira de Azeméis, Portugal, signed to Transubtil Records. His album Surreal Contrast, released in April 2024, features collaborations with artists like Noctune, Karev, and The Horrids. Opsuruus has also performed at international festivals, including the Psycristrance Festival 2023 in Mexico.",
    style: ["Darkpsy", "Forest", "Hitech"],
    social: {
      soundcloud: "https://soundcloud.com/opsuruus",
      instagram: "https://www.instagram.com/sandro_opsuruus/",
      facebook: "https://www.facebook.com/Opsuruus/",
    },
    country: "Portugal",
    image_url: "/images/opsuruus.jpg",
  },
  {
    id: 4,
    name: "Balku",
    act: "Live Set",
    description:
      "André grew up in a family of various artists, including many musicians. He was first introduced to electronic music at a young age and quickly developed a connection to the darker and more psychedelic genres. A few years later, he felt the urge to create his own sound to express his ideas and emotions. At just 22 years old, he was already performing his live set at some of the top parties in his country. Balku's sound is defined by a strong bassline, along with obscure, immersive, and electric sounds that aim to take the listener on an intense journey. He is constantly searching for power and darkness in his music. From his soul to your mind, Balku is André Varandas, Portugal.",
    style: ["Darkpsy", "Forest", "Hitech"],
    social: {
      soundcloud: "https://on.soundcloud.com/TNCQQVhzVgu6LDcST",
      instagram:
        "https://www.instagram.com/balkumusic/profilecard/?igsh=MWFpY2NyYTk2dnIxOQ==",
      facebook: "https://www.facebook.com/share/1D5G5KEBah/?mibextid=wwXIfr",
    },
    country: "Portugal",
    image_url: "/images/balku.png",
  },
  {
    id: 5,
    name: "La Marquise",
    act: "Live Set",
    description: "",
    style: ["Twilight"],
    social: {
      soundcloud: "https://soundcloud.com/m-t-0ryk",
      instagram: "https://www.instagram.com/angelolamarquise/",
      facebook: "https://www.facebook.com/DjLaMarquise",
    },
    country: "France",
    image_url: "/images/lamarquise.png",
  },
  {
    id: 6,
    name: "Dj Art2Fly",
    act: "Dj Set",
    description:
      "Eduardo Ramírez Herrera a.k.a Art2Fly. He started as a DJ in 2010, he is originally from Tabasco based in Yucatan, Mexico. In 2020 he joins the French label Transubtil Records.",
    style: ["Twilight"],
    social: {
      soundcloud: "https://soundcloud.com/art2fly",
      instagram: "https://www.instagram.com/djart2fly",
      facebook: "https://www.facebook.com/DJArt2Fly",
    },
    country: "Mexico",
    image_url: "/images/art2fly.png",
  },
  {
    id: 7,
    name: "Akhaba",
    act: "Dj Set / Live",
    description:
      "Propagator of music & passionate about modern psychedelic music for 10 years, Antoine alias Akhaba is a DJ, producer and sound engineer from the south of France. Today, Akhaba is a DJ Producer in the broad sense. His performances adapt to the moment, to the dancefloor & knows how to seduce the most underground audiences and make his music accessible to as many people as possible. His DJ sets are dancefloor, complex, original and personal. Now, with Transubtil Records, Akhaba plays night psytrance : groovy, dark, and always introspective.",
    style: ["Dark-Prog", "Psy Techno", "Twilight", "Darkpsy"],
    social: {
      soundcloud: "https://soundcloud.com/akhaba",
      instagram: "https://www.instagram.com/akhaba_kubba/",
      facebook: "https://www.facebook.com/AkhabaSound",
    },
    country: "France",
    image_url: "/images/akhaba.jpg",
  },
  {
    id: 8,
    name: "Kanaloa",
    act: "Dj Set / Live",
    description:
      "Marcus is the DJ and Producer behind the psychedelic trance project Kanaloa. Kanaloa drives atmospheric and deep sounds, combining distorted textures with forest friendly elements and organic soundscapes, enveloping imagination into a fresh new style, connecting mind and body through unique sound storytelling.",
    style: ["Twilight", "Forest", "Darkpsy"],
    social: {
      soundcloud: "https://soundcloud.com/kanaloa_music",
      instagram: "https://www.instagram.com/kanaloa_music",
      facebook: "https://www.facebook.com/Kanaloa666",
    },
    country: "England",
    image_url: "/images/kanaloa.webp",
  },
  {
    id: 9,
    name: "Mekanorms",
    act: "Dj Set",
    description:
      "Originally from punk rock and hard rock, Mekanorms discovered the world of Psytrance in 2010. The seduction was immediate, the turntables attracted him instantly. That's when he bought his first set-up and started mixing. He then had time to perfect himself and find his style that makes his DJ sets unique: groovy nightpsytrance with high-frequency mechanical sounds! He joined Transubtil Rec at the creation of the label and plays on dancefloors with international artists.",
    style: ["Twilight"],
    social: {
      soundcloud: "https://soundcloud.com/mekanorms",
      instagram: "https://www.instagram.com/mekanorms_transubtilrecords/",
      facebook: "https://soundcloud.com/mekanorms",
    },
    country: "France",
    image_url: "/images/mekanorms.png",
  },
  {
    id: 10,
    name: "Jive",
    act: "Dj Set",
    description:
      "Jive is the DJ project of Jai Royall from Australia. Representing Transubtil Records. Spawning in 2017, the project was developed as a tool to research and further understand the symbiosis between organic yet unearthly sonic textures and deep rhythmic structures. Jai is also the co-founder of the Murky Collective and the event director of the event Swampy Conscience which started in 2020.",
    style: ["Forest", "Darkpsy"],
    social: {
      soundcloud: "https://soundcloud.com/jivepsy",
      instagram: "https://www.instagram.com/jairoyall?igsh=Nm5kZWprcWNqaXRw",
      facebook: "https://www.facebook.com/share/18A2jTy5UN/",
    },
    country: "Australia",
    image_url: "/images/jive.png",
  },
  {
    id: 11,
    name: "Xipe Totecs",
    act: "Live Act",
    description:
      "Xipe Totecs is the Psytrance project from Japan, who started in 2018. They decided to keep exploring music from the rave scene, producing powerful sounds. Their universe encompasses epic themes and colorful frenzied drums, to create trance music full of new sonorities. They signed to the French label Transubtil Records in 2020.",
    style: ["Twilight"],
    social: {
      soundcloud: "https://soundcloud.com/xipetotecs",
      instagram: "https://www.instagram.com/xipe_totecs",
      facebook: "https://www.facebook.com/Xipetotecs",
    },
    country: "Japan",
    image_url: "/images/xipetotecs.png",
  },
  {
    id: 12,
    name: "Dj Lazzy",
    act: "Dj Set",
    description: "",
    style: ["Twilight"],
    social: {
      instagram: "https://www.instagram.com/showurata_dj_lazzzy/",
    },
    country: "Japan",
    image_url: "/images/placeholder.webp",
  },
  {
    id: 13,
    name: "Pakkun",
    act: "Dj Set",
    description: "",
    style: ["Forest", "Darkpsy"],
    social: {
      soundcloud: "https://soundcloud.com/pakkun-psy",
      instagram: "https://www.instagram.com/vincspakkun",
    },
    country: "France",
    image_url: "/images/placeholder.webp",
  },
]

// Add slugs to all artists
export const artists: Artist[] = artistsData.map((artist) => ({
  ...artist,
  slug: slugify(artist.name),
  videos: [],
}))

// Helper functions
export function getArtistBySlug(slug: string): Artist | undefined {
  return artists.find((artist) => artist.slug === slug)
}

export function getArtistById(id: number): Artist | undefined {
  return artists.find((artist) => artist.id === id)
}

export function getAllStyles(): string[] {
  const styles = new Set<string>()
  artists.forEach((artist) => {
    artist.style.forEach((s) => styles.add(s))
  })
  return Array.from(styles).sort()
}

export function getAllCountries(): string[] {
  const countries = new Set<string>()
  artists.forEach((artist) => countries.add(artist.country))
  return Array.from(countries).sort()
}
