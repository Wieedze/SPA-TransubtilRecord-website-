// Small helpers shared by the form and newsletter endpoints

export function json(data: unknown, status = 200): Response {
  return Response.json(data, { status })
}

export async function readJson(request: Request): Promise<Record<string, unknown> | null> {
  if (!request.headers.get("content-type")?.includes("application/json")) return null
  const text = await request.text()
  if (text.length > 20_000) return null
  try {
    const data = JSON.parse(text)
    return data && typeof data === "object" ? (data as Record<string, unknown>) : null
  } catch {
    return null
  }
}

// Trimmed string field, capped in length; "" when missing
export function field(data: Record<string, unknown>, name: string, max = 500): string {
  const value = data[name]
  return typeof value === "string" ? value.trim().slice(0, max) : ""
}

export function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value) && value.length <= 254
}

export function isUrl(value: string): boolean {
  try {
    const url = new URL(value)
    return url.protocol === "https:" || url.protocol === "http:"
  } catch {
    return false
  }
}

// Resend template variables are inserted unescaped: escape everything visitors type
export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

export function escapeMultiline(value: string): string {
  return escapeHtml(value).replace(/\r?\n/g, "<br>")
}

// Hidden "website" field that people never fill in; bots usually do
export function isBot(data: Record<string, unknown>): boolean {
  return field(data, "website") !== ""
}

export async function hashIp(request: Request): Promise<string> {
  const ip = request.headers.get("cf-connecting-ip") ?? "unknown"
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(`transubtil:${ip}`))
  return [...new Uint8Array(digest)].slice(0, 12).map((b) => b.toString(16).padStart(2, "0")).join("")
}
