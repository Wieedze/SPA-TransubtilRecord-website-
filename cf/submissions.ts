import type { Env } from "./env"

const MAX_PER_HOUR = 5

// Logs a form submission in D1 and refuses more than MAX_PER_HOUR per visitor
export async function logSubmission(
  env: Env,
  type: "booking" | "demo" | "contact",
  name: string,
  email: string,
  ipHash: string,
  payload: Record<string, string>
): Promise<{ ok: true; id: number } | { ok: false; reason: "rate_limited" }> {
  const recent = await env.DB.prepare(
    "SELECT COUNT(*) AS n FROM submissions WHERE json_extract(payload, '$.ip') = ? AND created_at > datetime('now', '-1 hour')"
  )
    .bind(ipHash)
    .first<{ n: number }>()
  if ((recent?.n ?? 0) >= MAX_PER_HOUR) return { ok: false, reason: "rate_limited" }

  const result = await env.DB.prepare("INSERT INTO submissions (type, name, email, payload) VALUES (?, ?, ?, ?)")
    .bind(type, name, email, JSON.stringify({ ...payload, ip: ipHash }))
    .run()
  return { ok: true, id: Number(result.meta.last_row_id) }
}
