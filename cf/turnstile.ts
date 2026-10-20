import type { Env } from "./env"
import { field } from "./http"

// Server-side check of the Turnstile anti-bot token sent with each form.
// Skipped when TURNSTILE_SECRET is not configured (local development).
export async function verifyTurnstile(request: Request, data: Record<string, unknown>, env: Env): Promise<boolean> {
  if (!env.TURNSTILE_SECRET) return true
  const token = field(data, "cf-turnstile-response", 2048)
  if (!token) return false
  const body = new FormData()
  body.append("secret", env.TURNSTILE_SECRET)
  body.append("response", token)
  const ip = request.headers.get("cf-connecting-ip")
  if (ip) body.append("remoteip", ip)
  const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", { method: "POST", body })
  const result = (await response.json().catch(() => ({}))) as { success?: boolean; "error-codes"?: string[] }
  if (!result.success) console.warn(`Turnstile rejected: ${(result["error-codes"] ?? []).join(", ")}`)
  return result.success === true
}
