import { Helmet } from "react-helmet-async"
import { DEFAULT_OG_IMAGE, SITE_NAME, absoluteUrl } from "../../config/seo"

interface SeoProps {
  title: string
  description: string
  path: string // e.g. "/artists/thehorrids"
  image?: string
  imageAlt?: string
  type?: "website" | "profile" | "music.album"
  noindex?: boolean
  jsonLd?: object | object[]
}

// Every page's <head>: title, description, canonical URL, Open Graph / Twitter previews
// and schema.org JSON-LD. Rendered into static HTML at build time (scripts/prerender.ts).
export default function Seo({ title, description, path, image, imageAlt, type = "website", noindex = false, jsonLd }: SeoProps) {
  const url = absoluteUrl(path)
  const img = absoluteUrl(image ?? DEFAULT_OG_IMAGE)
  const data = jsonLd ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd]) : []

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      {noindex && <meta name="robots" content="noindex" />}

      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content="en_US" />
      <meta property="og:type" content={type} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={img} />
      {imageAlt && <meta property="og:image:alt" content={imageAlt} />}

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={img} />

      {data.map((item, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(item)}
        </script>
      ))}
    </Helmet>
  )
}
