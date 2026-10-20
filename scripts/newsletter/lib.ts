// Shared helpers for the newsletter scripts: config, Resend API, D1 access and the
// branded email layout (same look as the transactional templates in
// scripts/resend-templates.py: dark background, logo, flame side bands).
import { readFileSync } from "node:fs"
import type { Release } from "../../src/types/release"

const ROOT = new URL("../../", import.meta.url).pathname

export const SITE = "https://transubtil-record.com"
export const NEWS_FROM = "Transubtil Records <news@news.transubtil-record.com>"
export const REPLY_TO = "contact@transubtil-record.com"
export const SEGMENT_ID = "0dcad3d1-427d-4f0d-be5c-b9f782ae8a8c" // Resend "Newsletter"

// .dev.vars holds the full-access RESEND_API_KEY (never committed)
export function devVar(name: string): string | undefined {
  try {
    const match = readFileSync(ROOT + ".dev.vars", "utf8").match(new RegExp(`^${name}=(.*)$`, "m"))
    return match?.[1].trim().replace(/^["']|["']$/g, "") || undefined
  } catch {
    return undefined
  }
}

export async function resend<T = Record<string, unknown>>(method: string, path: string, body?: unknown): Promise<T> {
  const key = devVar("RESEND_API_KEY")
  if (!key) throw new Error("RESEND_API_KEY (full access) is missing from .dev.vars")
  const res = await fetch("https://api.resend.com" + path, {
    method,
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json", "User-Agent": "transubtil-newsletter" },
    body: body === undefined ? undefined : JSON.stringify(body),
  })
  const data = (await res.json().catch(() => ({}))) as T
  if (!res.ok) throw new Error(`Resend ${method} ${path} → ${res.status}: ${JSON.stringify(data)}`)
  return data
}

/** Creates a broadcast to the Newsletter segment; sends it right away only when `send` is true. */
export async function createBroadcast(opts: { name: string; subject: string; html: string; send: boolean }) {
  const { id } = await resend<{ id: string }>("POST", "/broadcasts", {
    segment_id: SEGMENT_ID,
    from: NEWS_FROM,
    reply_to: REPLY_TO,
    name: opts.name,
    subject: opts.subject,
    html: opts.html,
    send: opts.send,
  })
  return { id, url: `https://resend.com/broadcasts/${id}` }
}

/** Sends one copy to a single address, to check the email before the real broadcast. */
export async function sendTest(to: string, subject: string, html: string) {
  await resend("POST", "/emails", {
    from: NEWS_FROM,
    to,
    subject: `[Test] ${subject}`,
    html: html.replaceAll("{{{RESEND_UNSUBSCRIBE_URL}}}", SITE),
  })
}

/** Runs SQL on the production D1 database through wrangler and returns the rows. */
export function d1<T = Record<string, unknown>>(sql: string): T[] {
  const run = Bun.spawnSync(
    ["bunx", "wrangler", "d1", "execute", "transubtil-db", "--remote", "--json", "--command", sql],
    { cwd: ROOT, stderr: "pipe" }
  )
  if (run.exitCode !== 0) throw new Error("wrangler d1 failed: " + run.stderr.toString() + run.stdout.toString())
  const out = JSON.parse(run.stdout.toString()) as { results: T[] }[]
  return out[0]?.results ?? []
}

export function sqlString(value: string) {
  return "'" + value.replaceAll("'", "''") + "'"
}

export function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!)
}

// Tiny Markdown subset for newsletter bodies: paragraphs, **bold**, *italic*, [links](url)
export function markdownToHtml(md: string) {
  return md
    .trim()
    .split(/\n\s*\n/)
    .map((block) => {
      const html = escapeHtml(block.trim())
        .replace(/\*\*(.+?)\*\*/g, '<strong style="color:#F3EFE4">$1</strong>')
        .replace(/\*(.+?)\*/g, "<em>$1</em>")
        .replace(/\[(.+?)\]\((https?:\/\/[^)\s]+)\)/g, '<a href="$2" style="color:#F9BC14">$1</a>')
        .replace(/\n/g, "<br>")
      return `<p style="margin:0 0 14px">${html}</p>`
    })
    .join("")
}

export function button(label: string, href: string) {
  return (
    `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:26px 0 0"><tr><td style="border:1px solid #F9BC14;border-radius:2px">` +
    `<a href="${escapeHtml(href)}" style="display:inline-block;padding:12px 22px;font-family:Helvetica,Arial,sans-serif;font-size:12px;font-weight:600;letter-spacing:.16em;text-transform:uppercase;color:#F9BC14;text-decoration:none">${escapeHtml(label)}</a></td></tr></table>`
  )
}

export function image(src: string, alt: string, href?: string) {
  const img = `<img src="${escapeHtml(src)}" alt="${escapeHtml(alt)}" width="440" style="display:block;border:0;width:100%;max-width:440px;height:auto;margin:0 0 24px">`
  return href ? `<a href="${escapeHtml(href)}">${img}</a>` : img
}

/** Full email: logo, yellow rule, optional eyebrow, title, body, footer with unsubscribe link. */
export function layout(opts: { title: string; eyebrow?: string; body: string; preheader?: string }) {
  const band = (side: "left" | "right") =>
    `<td class="band" width="70" valign="top" background="${SITE}/email/band-${side}.png" bgcolor="#07060B" ` +
    `style="width:70px;background-color:#07060B;background-image:url(${SITE}/email/band-${side}.png);background-repeat:repeat-y;background-size:70px auto;background-position:top ${side}">&nbsp;</td>`
  const eyebrow = opts.eyebrow
    ? `<p style="margin:0 0 10px;font-size:12px;letter-spacing:.16em;text-transform:uppercase;color:#F9BC14">${escapeHtml(opts.eyebrow)}</p>`
    : ""
  const preheader = opts.preheader
    ? `<div style="display:none;max-height:0;overflow:hidden;opacity:0">${escapeHtml(opts.preheader)}</div>`
    : ""
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="dark"><meta name="supported-color-schemes" content="dark">
<link href="https://fonts.googleapis.com/css2?family=Michroma&display=swap" rel="stylesheet">
<style>@media (max-width:520px){.band{display:none!important;width:0!important} .main{padding:28px 20px!important}}</style></head>
<body style="margin:0;padding:0;background:#07060B">${preheader}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="#07060B" style="background:#07060B"><tr><td align="center">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;background:#07060B"><tr>
${band("left")}
<td class="main" valign="top" style="padding:36px 30px 32px;font-family:Helvetica,Arial,sans-serif;color:#D6D2C8;font-size:15px;line-height:1.65">
<a href="${SITE}" style="text-decoration:none"><img src="${SITE}/email/logo-white.png" alt="Transubtil Records" width="210" style="display:block;border:0;width:210px;max-width:100%;height:auto"></a>
<div style="height:1px;background:#F9BC14;opacity:.6;margin:26px 0 28px;line-height:1px;font-size:1px">&nbsp;</div>
${eyebrow}<h1 style="margin:0 0 20px;font-family:Michroma,Helvetica,Arial,sans-serif;font-weight:400;font-size:21px;line-height:1.35;letter-spacing:.02em;text-transform:uppercase;color:#F3EFE4">${escapeHtml(opts.title)}</h1>
${opts.body}
<div style="height:1px;background:#2C2A36;margin:34px 0 16px;line-height:1px;font-size:1px">&nbsp;</div>
<p style="margin:0 0 8px;font-size:12px;line-height:1.6;color:#A8A5B0">Transubtil Records · International psytrance label from France<br>
<a href="${SITE}/artists" style="color:#A8A5B0">Artists</a> · <a href="${SITE}/releases" style="color:#A8A5B0">Releases</a> · <a href="https://transubtilrec.bandcamp.com" style="color:#A8A5B0">Bandcamp</a> · <a href="https://soundcloud.com/transubtil" style="color:#A8A5B0">SoundCloud</a></p>
<p style="margin:0;font-size:12px;line-height:1.6;color:#6F6C78">You get this email because you subscribed on transubtil-record.com. <a href="{{{RESEND_UNSUBSCRIBE_URL}}}" style="color:#A8A5B0">Unsubscribe</a></p>
</td>
${band("right")}
</tr></table></td></tr></table></body></html>`
}

const TYPE_LABEL: Record<Release["type"], string> = { album: "Album", ep: "EP", track: "Single", compilation: "Compilation" }

export function releaseEmail(release: Release) {
  const by = release.artist === "Various Artists" ? "A Transubtil Records compilation" : `By ${release.artist}`
  const body =
    image(release.coverUrl, release.title, release.bandcampUrl) +
    `<p style="margin:0 0 14px">${escapeHtml(by)}, out now on Bandcamp.</p>` +
    (release.description ? `<p style="margin:0 0 14px">${escapeHtml(release.description)}</p>` : "") +
    button("Listen on Bandcamp", release.bandcampUrl) +
    `<p style="margin:18px 0 0;font-size:13px"><a href="${SITE}/releases" style="color:#A8A5B0">All releases</a></p>`
  return layout({
    eyebrow: `New release · ${TYPE_LABEL[release.type]}`,
    title: release.title,
    preheader: `${by}, out now on Bandcamp.`,
    body,
  })
}

export interface NewsletterFields {
  subject: string
  eyebrow?: string
  title: string
  image?: string
  imageLink?: string
  text: string
  button?: string
  buttonLink?: string
  preheader?: string
}

/** Free-form newsletter written in the editor (bun run newsletter). */
export function newsletterHtml(f: NewsletterFields) {
  return layout({
    title: f.title,
    eyebrow: f.eyebrow,
    preheader: f.preheader,
    body:
      (f.image ? image(f.image, f.title, f.imageLink || f.buttonLink) : "") +
      markdownToHtml(f.text) +
      (f.button && f.buttonLink ? button(f.button, f.buttonLink) : ""),
  })
}
