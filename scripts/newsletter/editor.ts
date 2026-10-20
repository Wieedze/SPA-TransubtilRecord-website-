// Newsletter editor: bun run newsletter, then open http://localhost:4321.
// Fields on the left, live preview of the branded email on the right. "Send me a test"
// mails one copy to you; "Create draft in Resend" prepares the broadcast to the
// Newsletter list, which you then send from resend.com (nothing goes out from here).
// Runs on your machine only (127.0.0.1) with the RESEND_API_KEY from .dev.vars.
import { releases } from "../../src/data/releases"
import { createBroadcast, newsletterHtml, sendTest, type NewsletterFields } from "./lib"

const PORT = 4321
const page = Bun.file(new URL("./editor.html", import.meta.url).pathname)

function fieldsFrom(body: Partial<NewsletterFields>): NewsletterFields {
  const str = (v: unknown) => (typeof v === "string" ? v.trim() : "")
  return {
    subject: str(body.subject),
    eyebrow: str(body.eyebrow),
    title: str(body.title),
    image: str(body.image),
    imageLink: str(body.imageLink),
    text: str(body.text),
    button: str(body.button),
    buttonLink: str(body.buttonLink),
    preheader: str(body.preheader),
  }
}

const json = (data: unknown, status = 200) => Response.json(data, { status })

Bun.serve({
  hostname: "127.0.0.1",
  port: PORT,
  async fetch(req) {
    const { pathname } = new URL(req.url)
    if (req.method === "GET" && pathname === "/") return new Response(page, { headers: { "Content-Type": "text/html; charset=utf-8" } })
    if (req.method === "GET" && pathname === "/releases") {
      return json(releases.map((r) => ({ title: r.title, artist: r.artist, cover: r.coverUrl, link: r.bandcampUrl })))
    }
    if (req.method !== "POST") return json({ error: "not_found" }, 404)

    const body = (await req.json().catch(() => ({}))) as Partial<NewsletterFields> & { to?: string }
    const fields = fieldsFrom(body)
    const html = newsletterHtml(fields)
    try {
      if (pathname === "/render") return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8" } })
      if (!fields.subject || !fields.title) return json({ error: "Subject and title are required." }, 400)
      if (pathname === "/test") {
        if (!body.to || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.to)) return json({ error: "Enter the email for the test." }, 400)
        await sendTest(body.to, fields.subject, html)
        return json({ message: `Test sent to ${body.to}.` })
      }
      if (pathname === "/draft") {
        const { url } = await createBroadcast({ name: fields.subject, subject: fields.subject, html, send: false })
        return json({ message: "Draft created in Resend.", url })
      }
    } catch (e) {
      return json({ error: e instanceof Error ? e.message : String(e) }, 500)
    }
    return json({ error: "not_found" }, 404)
  },
})

console.log(`Newsletter editor: http://localhost:${PORT}  (Ctrl+C to stop)`)
