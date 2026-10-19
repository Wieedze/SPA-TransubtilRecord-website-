// Build step after `vite build` + `vite build --ssr src/entry-server.tsx`:
// writes one static HTML file per public route (full content + <head> tags),
// plus sitemap.xml and llms.txt, into dist/.
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "fs"
import { dirname, join, resolve } from "path"
import { pathToFileURL } from "url"

const dist = resolve("dist")
const ssrEntry = pathToFileURL(resolve("dist-ssr/entry-server.js")).href
const { render, routes, buildLlmsTxt, SITE_URL } = await import(ssrEntry)

const template = readFileSync(join(dist, "index.html"), "utf8")
if (!template.includes('<div id="root"></div>')) throw new Error("dist/index.html has no empty #root to fill")

for (const route of routes as string[]) {
  const { html, head } = render(route)
  const page = template
    .replace("</head>", `    ${head}\n  </head>`)
    .replace('<div id="root"></div>', `<div id="root">${html}</div>`)
  // "/artists/x" -> artists/x.html: Cloudflare Pages serves it at /artists/x with no
  // trailing-slash redirect, matching the canonical URLs
  const file = route === "/" ? join(dist, "index.html") : join(dist, `${route.slice(1)}.html`)
  mkdirSync(dirname(file), { recursive: true })
  writeFileSync(file, page)
}

const today = new Date().toISOString().slice(0, 10)
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${(routes as string[])
  .map((r) => `  <url><loc>${SITE_URL}${r === "/" ? "/" : r}</loc><lastmod>${today}</lastmod><priority>${r === "/" ? "1.0" : r.split("/").length > 2 ? "0.8" : "0.9"}</priority></url>`)
  .join("\n")}
</urlset>
`
writeFileSync(join(dist, "sitemap.xml"), sitemap)
writeFileSync(join(dist, "llms.txt"), buildLlmsTxt())

rmSync(resolve("dist-ssr"), { recursive: true, force: true })
console.log(`Prerendered ${routes.length} pages, sitemap.xml and llms.txt`)
