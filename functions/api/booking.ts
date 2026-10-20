import type { Env } from "../../cf/env"
import { escapeHtml, escapeMultiline, field, hashIp, isBot, isEmail, json, readJson } from "../../cf/http"
import { sendTemplate } from "../../cf/resend"
import { verifyTurnstile } from "../../cf/turnstile"
import { logSubmission } from "../../cf/submissions"

// POST /api/booking — booking request from an artist page
export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const data = await readJson(request)
  if (!data) return json({ error: "invalid_request" }, 400)
  if (isBot(data)) return json({ ok: true }) // silently drop
  if (!(await verifyTurnstile(request, data, env))) return json({ error: "captcha_failed" }, 403)

  const form = {
    artist: field(data, "artist", 120),
    name: field(data, "name", 120),
    email: field(data, "email", 254),
    event: field(data, "event", 200),
    date: field(data, "date", 40),
    venue: field(data, "venue", 200),
    capacity: field(data, "capacity", 20),
    budget: field(data, "budget", 60),
    message: field(data, "message", 4000),
  }
  if (!form.artist || !form.name || !isEmail(form.email) || !form.event || !form.date || !form.venue) {
    return json({ error: "missing_fields" }, 422)
  }

  const logged = await logSubmission(env, "booking", form.name, form.email, await hashIp(request), form)
  if (!logged.ok) return json({ error: "rate_limited" }, 429)

  const notify = await sendTemplate({
    apiKey: env.RESEND_MAIL_KEY,
    from: env.MAIL_FROM,
    to: env.LABEL_EMAIL,
    replyTo: form.email,
    template: "booking-notification",
    subject: `New booking request: ${form.artist}`,
    idempotencyKey: `booking-${logged.id}-label`,
    variables: {
      ARTIST_NAME: escapeHtml(form.artist),
      NAME: escapeHtml(form.name),
      SENDER_EMAIL: escapeHtml(form.email),
      EVENT: escapeHtml(form.event),
      DATE: escapeHtml(form.date),
      VENUE: escapeHtml(form.venue),
      CAPACITY: escapeHtml(form.capacity || "—"),
      BUDGET: escapeHtml(form.budget || "—"),
      MESSAGE: escapeMultiline(form.message || "—"),
    },
  })
  if (notify.error) return json({ error: "send_failed" }, 502)

  await sendTemplate({
    apiKey: env.RESEND_MAIL_KEY,
    from: env.MAIL_FROM,
    to: form.email,
    template: "booking-confirmation",
    subject: `We received your booking request for ${form.artist}`,
    idempotencyKey: `booking-${logged.id}-receipt`,
    variables: {
      NAME: escapeHtml(form.name),
      ARTIST_NAME: escapeHtml(form.artist),
      EVENT: escapeHtml(form.event),
      DATE: escapeHtml(form.date),
    },
  })
  return json({ ok: true })
}
