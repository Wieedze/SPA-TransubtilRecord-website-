// Release watcher: an Email Worker on releases@transubtil-record.com.
//
// A Bandcamp fan account registered with that address follows the label, so Bandcamp
// mails it whenever the label publishes a release. For each such email this Worker:
//   1. finds the release link (https://transubtilrec.bandcamp.com/album|track/…),
//      its cover and its title,
//   2. skips it if D1 announced_releases already has it,
//   3. creates the branded announcement as a DRAFT broadcast to the Newsletter list,
//   4. mails the label "new release detected, review and send" with a link to the draft.
// Every incoming email is also forwarded to the label inbox, so Bandcamp's account
// emails (sign-up confirmation…) and anything unrecognised still arrive.
import PostalMime from "postal-mime"
import { layout, releaseEmail, escapeHtml, button, type ReleaseInfo } from "../../cf/newsletter-email"

interface Env {
  DB: D1Database
  RESEND_API_KEY: string // full access: creating broadcasts needs it
  LABEL_EMAIL: string
  MAIL_FROM: string
  NEWS_FROM: string
  REPLY_TO: string
  RESEND_SEGMENT_ID: string
  BANDCAMP_HOST: string // only releases on the label's own Bandcamp page count
}

type Parsed = Awaited<ReturnType<typeof PostalMime.parse>>

const decode = (s: string) =>
  s
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&#x27;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
const clean = (s: string) => decode(s.replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim()
const titleFromSlug = (slug: string) => slug.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")

// Words used by Bandcamp around links; never a release title
const NOT_A_TITLE = /^(buy|listen|play|stream|download|preorder|pre-order|check it out|view|see|more|bandcamp|new release|here)\b/i

export function findRelease(mail: Parsed, host: string): ReleaseInfo | null {
  const html = mail.html ?? ""
  const text = mail.text ?? ""
  const hostRe = host.replace(/\./g, "\\.")
  const urlRe = new RegExp(`https?://${hostRe}/(album|track)/([a-z0-9-]+)`, "i")
  const match = html.match(urlRe) ?? text.match(urlRe)
  if (!match) return null
  const [, kind, slug] = match
  const bandcampUrl = `https://${host}/${kind.toLowerCase()}/${slug.toLowerCase()}`

  // Cover: first Bandcamp artwork image ("a" prefix), at its 1200 px size
  const cover = html.match(/https?:\/\/f\d+\.bcbits\.com\/img\/a(\d+)_\d+\.(?:jpg|png)/i)
  const coverUrl = cover ? `https://f4.bcbits.com/img/a${cover[1]}_10.jpg` : undefined

  // Title: text of a link to the release, else the cover's alt text, else the slug
  const candidates: string[] = []
  const linkRe = new RegExp(`<a[^>]+href=["'][^"']*${hostRe}/${kind}/${slug}[^"']*["'][^>]*>([\\s\\S]*?)</a>`, "gi")
  for (const m of html.matchAll(linkRe)) candidates.push(clean(m[1]))
  const alt = html.match(/<img[^>]+bcbits\.com\/img\/a\d+[^>]*alt=["']([^"']+)["']/i) ?? html.match(/<img[^>]+alt=["']([^"']+)["'][^>]*bcbits\.com\/img\/a\d+/i)
  if (alt) candidates.push(clean(alt[1]))
  const title = candidates.find((c) => c.length >= 2 && c.length <= 120 && !NOT_A_TITLE.test(c)) ?? titleFromSlug(slug)

  // Artist: "<title> by <artist>" in the plain text, when Bandcamp writes it that way
  const by = text.match(new RegExp(`${title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*(?:\\n\\s*)?by\\s+([^\\n]{2,60})`, "i"))
  const artist = by ? by[1].trim() : undefined

  return { title, artist, kind: kind.toLowerCase() === "track" ? "Single" : undefined, coverUrl, bandcampUrl }
}

function fromBandcamp(mail: Parsed, headers: Headers) {
  const from = (mail.from?.address ?? "").toLowerCase()
  if (!/@([a-z0-9-]+\.)*bandcamp\.com$/.test(from)) return false
  // Reject when the receiving server says the From domain was spoofed
  const auth = (headers.get("Authentication-Results") ?? "").toLowerCase()
  return !/dmarc=fail/.test(auth)
}

async function resend<T>(env: Env, path: string, body: unknown): Promise<T> {
  const res = await fetch("https://api.resend.com" + path, {
    method: "POST",
    headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
  const data = (await res.json().catch(() => ({}))) as T
  if (!res.ok) throw new Error(`Resend ${path} ${res.status}: ${JSON.stringify(data)}`)
  return data
}

async function notifyLabel(env: Env, subject: string, title: string, bodyHtml: string) {
  await resend(env, "/emails", {
    from: env.MAIL_FROM,
    to: env.LABEL_EMAIL,
    subject,
    html: layout({ title, body: bodyHtml }).replaceAll("{{{RESEND_UNSUBSCRIBE_URL}}}", "https://transubtil-record.com"),
  })
}

async function announce(release: ReleaseInfo, env: Env) {
  const seen = await env.DB.prepare("SELECT 1 FROM announced_releases WHERE url = ?1 OR bandcamp_id = ?1")
    .bind(release.bandcampUrl)
    .first()
  if (seen) return

  const { id } = await resend<{ id: string }>(env, "/broadcasts", {
    segment_id: env.RESEND_SEGMENT_ID,
    from: env.NEWS_FROM,
    reply_to: env.REPLY_TO,
    name: `Release: ${release.title}`,
    subject: `New release: ${release.title}`,
    html: releaseEmail(release),
    send: false,
  })
  await env.DB.prepare("INSERT INTO announced_releases (bandcamp_id, title, broadcast_id, url) VALUES (?1, ?2, ?3, ?1)")
    .bind(release.bandcampUrl, release.title, id)
    .run()

  await notifyLabel(
    env,
    `New release detected: ${release.title}`,
    "Newsletter ready to send",
    `<p style="margin:0 0 12px">Bandcamp just announced <strong style="color:#F3EFE4">${escapeHtml(release.title)}</strong>. ` +
      `The newsletter for it is ready as a draft: check the title, the cover and the text, then press Send.</p>` +
      `<p style="margin:0;color:#A8A5B0;font-size:13px">Nothing has been sent to subscribers yet.</p>` +
      button("Review and send", `https://resend.com/broadcasts/${id}`)
  )
}

export default {
  async email(message: ForwardableEmailMessage, env: Env, ctx: ExecutionContext) {
    const raw = await new Response(message.raw).arrayBuffer()
    try {
      const mail = await PostalMime.parse(raw)
      const release = fromBandcamp(mail, message.headers) ? findRelease(mail, env.BANDCAMP_HOST) : null
      if (release) await announce(release, env)
    } catch (error) {
      console.error("release-watcher", error)
      ctx.waitUntil(
        notifyLabel(
          env,
          "Release watcher: could not prepare the newsletter",
          "Something went wrong",
          `<p style="margin:0">A Bandcamp email arrived but the newsletter draft failed: ${escapeHtml(String(error))}. ` +
            `The original email is forwarded with this one.</p>`
        ).catch(() => {})
      )
    }
    await message.forward(env.LABEL_EMAIL)
  },
} satisfies ExportedHandler<Env>
