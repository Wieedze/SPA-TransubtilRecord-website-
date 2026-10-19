// Server entry used at build time only (scripts/prerender.ts): renders each public
// route to static HTML so search engines and AI crawlers that don't run JavaScript
// still get the full content, titles, descriptions and structured data.
import { renderToString } from "react-dom/server"
import { StaticRouter } from "react-router-dom/server"
import { HelmetProvider, type HelmetServerState } from "react-helmet-async"
import App from "./App"
import { roster } from "./data/roster"
import { releases } from "./data/releases"
import { SITE_URL, SITE_NAME } from "./config/seo"
import { artistPlace, artistSummary } from "./lib/structuredData"

export { SITE_URL }

export const routes = [
  "/",
  "/artists",
  ...roster.map((a) => `/artists/${a.slug}`),
  "/releases",
  "/label",
  "/contact",
]

export function render(url: string) {
  const helmetContext: { helmet?: HelmetServerState } = {}
  const html = renderToString(
    <HelmetProvider context={helmetContext}>
      <StaticRouter location={url}>
        <App />
      </StaticRouter>
    </HelmetProvider>
  )
  const h = helmetContext.helmet
  const head = h ? [h.title, h.meta, h.link, h.script].map((part) => part.toString()).join("\n    ") : ""
  return { html, head }
}

// /llms.txt: a plain-text map of the site for AI assistants (llmstxt.org)
export function buildLlmsTxt() {
  const artists = roster
    .map((a) => {
      const place = artistPlace(a)
      return `- [${a.name}](${SITE_URL}/artists/${a.slug}): ${a.style}, ${a.format === "Live" ? "live act" : "DJ"}${place ? `, ${place}` : ""}. ${artistSummary(a)}`
    })
    .join("\n")
  const recent = releases
    .slice(0, 15)
    .map((r) => `- [${r.title}](${r.bandcampUrl}) by ${r.artist} (${r.type}, ${r.releaseDate})`)
    .join("\n")
  return `# ${SITE_NAME}

> Independent psychedelic trance (psytrance) label from Marseille, France. Transubtil Records releases darkpsy, forest, night psy and twilight psytrance, and books its DJs and live acts for festivals and parties worldwide.

- Genres: psytrance, psychedelic trance, darkpsy, forest, night psy, twilight
- Based in: Marseille, France
- Roster: ${roster.length} artists (DJs and live acts)
- Catalogue: ${releases.length} releases on Bandcamp (https://transubtilrec.bandcamp.com)
- Booking: each artist page has a booking form

## Pages

- [Artists](${SITE_URL}/artists): the full roster, filterable by live act or DJ set, style and country
- [Releases](${SITE_URL}/releases): the discography with Bandcamp players
- [Label](${SITE_URL}/label): the label's story and the demo submission form
- [Contact](${SITE_URL}/contact): press, partnerships and other questions

## Artists

${artists}

## Latest releases

${recent}
`
}
