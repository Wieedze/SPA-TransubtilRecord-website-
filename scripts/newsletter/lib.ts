// Shared helpers for the newsletter scripts: config, Resend API and D1 access.
// The email layout lives in cf/newsletter-email.ts (also used by the Worker).
import { readFileSync } from "node:fs"

const ROOT = new URL("../../", import.meta.url).pathname

export * from "../../cf/newsletter-email"
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
    html: html.replaceAll("{{{RESEND_UNSUBSCRIBE_URL}}}", "https://transubtil-record.com"),
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
