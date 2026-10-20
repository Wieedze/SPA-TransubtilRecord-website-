import type { Env } from "../../cf/env"
import { field, isBot, isEmail, json, readJson } from "../../cf/http"
import { sendTemplate } from "../../cf/resend"
import { checkEmailDomain } from "../../cf/checks"
import { verifyTurnstile } from "../../cf/turnstile"

const token = () => crypto.randomUUID().replace(/-/g, "")

// POST /api/subscribe — newsletter sign-up, double opt-in: stores the address as
// pending in D1 and emails a confirmation link (/api/confirm)
export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const data = await readJson(request)
  if (!data) return json({ error: "invalid_request" }, 400)
  if (isBot(data)) return json({ ok: true })
  if (!(await verifyTurnstile(request, data, env))) return json({ error: "captcha_failed" }, 403)

  const email = field(data, "email", 254).toLowerCase()
  const source = field(data, "source", 40) || "site"
  if (!isEmail(email)) return json({ error: "invalid_email" }, 422)
  const emailProblem = await checkEmailDomain(email)
  if (emailProblem) return json({ error: emailProblem }, 422)

  const existing = await env.DB.prepare(
    "SELECT status, confirm_token, created_at > datetime('now', '-10 minutes') AS recent FROM subscribers WHERE email = ?"
  )
    .bind(email)
    .first<{ status: string; confirm_token: string | null; recent: number }>()

  if (existing?.status === "active") return json({ ok: true, already: true })
  if (existing?.status === "pending" && existing.recent) return json({ ok: true }) // confirmation just sent

  const confirmToken = token()
  if (existing) {
    await env.DB.prepare(
      "UPDATE subscribers SET status = 'pending', confirm_token = ?, source = ?, created_at = datetime('now'), unsubscribed_at = NULL WHERE email = ?"
    )
      .bind(confirmToken, source, email)
      .run()
  } else {
    await env.DB.prepare(
      "INSERT INTO subscribers (email, status, source, confirm_token, unsubscribe_token) VALUES (?, 'pending', ?, ?, ?)"
    )
      .bind(email, source, confirmToken, token())
      .run()
  }

  const sent = await sendTemplate({
    apiKey: env.RESEND_NEWS_KEY,
    from: env.NEWS_FROM,
    to: email,
    template: "newsletter-confirm",
    idempotencyKey: `subscribe-${confirmToken}`,
    variables: { CONFIRM_URL: `${env.SITE_URL}/api/confirm?token=${confirmToken}` },
  })
  if (sent.error) return json({ error: "send_failed" }, 502)
  return json({ ok: true })
}
