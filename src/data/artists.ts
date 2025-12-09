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
    image_url: "/images/the-horrids.jpg",
    videos: [
      "https://soundcloud.com/thehorrids/sets/example-album"
    ],
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
    image_url: "/images/balku.jpg",
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
    image_url: "/images/lamarquise.jpg",
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
    image_url: "/images/kanaloa.jpg",
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
    image_url: "/images/mekanorms.jpg",
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
    image_url: "/images/jive.jpg",
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
    image_url: "/images/xipetotecs.jpg",
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
    image_url: "/images/djlazzzy.jpg",
  },
  {
    id: 13,
    name: "Pakkun",
    act: "Dj Set",
    description: "Pakkun alias Vincent has always been passionate about music, playing drums and bass guitar at a young age. Discovering electronic music through techno and d'n'b, he soon became in love with Psytrance. Learning the art of djing with the Transubtil crew led him to integrate the label at the end of 2019 and play in Japan in summer 2022. Constantly evolving, his sets range from groovy psytrance to darkpsy. Now working a lot on the production side, he's eager to show you his own vision of psytrance on his first releases. He released his first compilation 'Chaos Simulator' containing his first release with Dr Fractal, more coming this year.",
    style: ["Forest", "Darkpsy"],
    social: {
      soundcloud: "https://soundcloud.com/pakkun-psy",
      instagram: "https://www.instagram.com/vincspakkun",
    },
    country: "France",
    image_url: "/images/pakkun.jpg",
  },
  {
    id: 14,
    name: "Agop",
    act: "Dj Set",
    description: "AGOP is a DJ, producer and sound engineer who grew up within alternative artistic communities and was exposed to electronic music from an early age. This environment sparked a lasting fascination for psychedelic sounds, leading him to start DJing as a teenager. His first steps behind the decks took place at private parties — a formative playground where he refined his technique and developed his connection with a passionate crowd. Today, his project explores the many facets of the psytrance spectrum, blending groove, energy and hypnotic atmospheres. As a professional sound technician, he also holds a strong interest in the technical side of music, working on live sound for bands as well as several electronic and psytrance festivals. In 2025, he played at Hadra Trance Festival and joined Transubtil Records.",
    style: ["Twilight", "Forest"],
    social: {
      soundcloud: "https://soundcloud.com/agop_psychedelic",
      instagram: "https://www.instagram.com/agop_transubtil",
      facebook: "https://www.facebook.com/profile.php?id=100092196862973",
    },
    country: "France",
    image_url: "/images/agop.jpg",
  },
  {
    id: 15,
    name: "Fiorenza",
    act: "Dj Set",
    description: "Integrating the feminine underground scene of the Cerrado, Fiorenza transforms nocturnal sound into a powerful expression of feeling. Moving between 155 and 170 BPM, her sets traverse the textures of Forest and Dark, crafting a psychedelic sonic journey with heavy basslines and immersive atmospheres.",
    style: ["Forest", "Darkpsy"],
    social: {
      soundcloud: "https://soundcloud.com/fiorenzadj",
      instagram: "https://www.instagram.com/fiorenzacadore/",
      facebook: "https://www.facebook.com/fiorenzacadore",
    },
    country: "Brazil",
    image_url: "/images/fiorenza.jpg",
  },
  {
    id: 16,
    name: "Heavy Fawn",
    act: "Dj Set",
    description: "Heavy Fawn is the Nightpsy DJ project of Hugo, originally from Marseille, France. He discovered the world of psytrance and free parties in 2009, where he instantly fell in love with the music. In 2017, he met Tantra Music, began collaborating with them as a DJ and organizer, and together they made some of the best darkpsy festivals in southern France. In 2020, he joined the French label Transubtil Records and played in Mexico and Costa Rica. He later joined the Brazilian label Resina Records in 2024, from which he had drawn major inspiration for years. His first VA is set to be released in early 2026, a collaboration between Resina and Transubtil Records featuring only exclusive tracks. His goal is to create DJ sets that are neither forest, nor dark, nor twilight, nor hightech, but a perfect blend that is purely psychedelic.",
    style: ["Darkpsy", "Forest", "Twilight"],
    social: {
      soundcloud: "https://soundcloud.com/heavyfawn",
      instagram: "https://www.instagram.com/heavy_fawn/",
      facebook: "https://www.facebook.com/HeavyFawn/",
    },
    country: "France",
    image_url: "/images/heavyfawn.jpg",
  },
  {
    id: 17,
    name: "Rajax",
    act: "Dj Set",
    description: "Since 2013, William really dived into the psytrance world, quickly a passion borned and his project RAJAX was born. His debut on stage was in 2015 with the Outrance association. In 2017, he joined the Senoï Project association, In March 2019, supported by this association, he launched his first compilation titled 'GENOME'. In 2023, he joined the growing label Transubtil Records, and starts delivering darker and faster DJ sets, yet his love for the groove remains intact. Each of his performances is unique and makes a strong impact on the dancefloors, confirming his place in the psytrance scene and creating unforgettable moments for the audience.",
    style: ["Darkpsy", "Twilight"],
    social: {
      soundcloud: "https://soundcloud.com/rajax-outrance",
      instagram: "https://www.instagram.com/rajax_outrance",
      facebook: "https://www.facebook.com/Rajaxsenoi",
    },
    country: "France",
    image_url: "/images/rajax.jpg",
  },
  {
    id: 18,
    name: "Wild Track",
    act: "Dj Set",
    description: "Wild Track is a Moroccan DJ, formerly known as DJ Gender Fluid. He is always crafting tailored DJ sets based on the vibe of the dancefloor, staying fully tuned in to its energy. Groovy and psychedelic, his mixes become the ideal soundtrack for active meditation, trance, and free-form dance. Immersed in the global psytrance scene as a festival traveler and party organizer long before stepping behind the decks, he developed an endless curiosity for digging the most powerful, groovy, and mind-shifting tracks. His mission: channel that same magic he once felt in the crowd and deliver it back to the dancefloor. Deeply engaged in music, he is also the founder of Yaz Records and Universitek, an educational organization dedicated to sharing knowledge and nurturing creativity within the musical community.",
    style: ["Twilight", "Forest"],
    social: {
      soundcloud: "https://soundcloud.com/wild_track",
      instagram: "https://www.instagram.com/dj.wildtrack/",
    },
    country: "Morocco",
    image_url: "/images/wildtrack.jpeg",
  },
  {
    id: 19,
    name: "Yagsa",
    act: "Dj Set",
    description: "Yagsa started mixing in 2010 after his discovery of trance in Hadra Festival. In 2014 he joined the Transubil association and started performing in big dancefloors. Now in the Transubtil Records Label, he released a compilation in collaboration with Mekanorms 'Transsiberian'. Come and discover his universe with forest and psychedelic atmospheres.",
    style: ["Forest", "Twilight"],
    social: {
      soundcloud: "https://soundcloud.com/yagsa",
    },
    country: "France",
    image_url: "/images/yagsa.jpg",
  },
  {
    id: 20,
    name: "Anachronorium",
    act: "Live Act",
    description: "Anchronorium is the DarkPsy project of Portuguese producer Rafyx, exploring high-intensity soundscapes built on dissonant textures, immersive atmospheres, and fast, driving rhythms. His music blends detailed sound design with a cinematic sense of darkness, creating deep mental journeys and powerful nighttime energy on the dancefloor. With a signature style marked by high BPMs, hypnotic storytelling and dense psychedelic layers, Anchronorium delivers a modern and impactful interpretation of the dark psychedelic spectrum. The project continues to evolve with new releases and performances, establishing a strong and distinctive presence within contemporary DarkPsy.",
    style: ["Darkpsy", "Hitech"],
    social: {},
    country: "Portugal",
    image_url: "/images/anachronorium.jpg",
  },
  {
    id: 21,
    name: "Veheme",
    act: "Live Act",
    description: "",
    style: ["Darkpsy"],
    social: {
      soundcloud: "https://soundcloud.com/veheme",
    },
    country: "France",
    image_url: "/images/placeholder.webp",
  },
  {
    id: 22,
    name: "Warp Drive",
    act: "Live Act",
    description: "Tim aka Warp Drive is a psytrance project hailing from the sunny shores of Sydney, Australia. Bootstrapped in the late 2010's following many sleepless nights in the woods, it is a mince of cultural influences packed into a night psy skin. Bon appétit!",
    style: ["Twilight", "Darkpsy"],
    social: {
      soundcloud: "https://soundcloud.com/transubtil",
      instagram: "https://www.instagram.com/engagethewarpdrive/",
      facebook: "https://www.facebook.com/Transubtilrec",
    },
    country: "Australia",
    image_url: "/images/warpdrive.jpg",
  },
  {
    id: 23,
    name: "Zeo",
    act: "Live Set",
    description: "Candice aka Zeo started mixing Pystrance in 2016. Reasoning influences Dark, Forest but also very Groovy. It was in 2018 that she embarked on music production. Keeping the aim of making his audience travel through his emotions, his influences and his musical perception. What she likes about this style is its side, both dark but colorful, hypnotic, absorbing but also very energetic. That we can live introspectively or on the contrary, hyper communicative and synergistic. After a few years of preparation for her Live, today she is finally ready to reveal the plots of her little universe.",
    style: ["Darkpsy", "Forest"],
    social: {
      soundcloud: "https://soundcloud.com/zeopsyrecord",
      instagram: "https://www.instagram.com/zeo_zeeoo/",
      facebook: "https://www.facebook.com/zeo.psyrec/",
    },
    country: "France",
    image_url: "/images/zeo.jpg",
  },
]

// Add slugs to all artists
export const artists: Artist[] = artistsData.map((artist) => ({
  ...artist,
  slug: slugify(artist.name),
  videos: artist.videos || [],
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
