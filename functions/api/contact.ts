import type { Env } from "../../cf/env"
import { escapeHtml, escapeMultiline, field, hashIp, isBot, isEmail, json, readJson } from "../../cf/http"
import { sendTemplate } from "../../cf/resend"
import { verifyTurnstile } from "../../cf/turnstile"
import { logSubmission } from "../../cf/submissions"

const SUBJECTS = new Set(["Press", "Partnership", "Booking", "Shop", "Other"])

// POST /api/contact — Contact page form
export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const data = await readJson(request)
  if (!data) return json({ error: "invalid_request" }, 400)
  if (isBot(data)) return json({ ok: true })
  if (!(await verifyTurnstile(request, data, env))) return json({ error: "captcha_failed" }, 403)

  const form = {
    subject: field(data, "subject", 40),
    name: field(data, "name", 120),
    email: field(data, "email", 254),
    message: field(data, "message", 4000),
  }
  if (!SUBJECTS.has(form.subject) || !form.name || !isEmail(form.email) || !form.message) {
    return json({ error: "missing_fields" }, 422)
  }

  const logged = await logSubmission(env, "contact", form.name, form.email, await hashIp(request), form)
  if (!logged.ok) return json({ error: "rate_limited" }, 429)

  const notify = await sendTemplate({
    apiKey: env.RESEND_MAIL_KEY,
    from: env.MAIL_FROM,
    to: env.LABEL_EMAIL,
    replyTo: form.email,
    template: "contact-notification",
    subject: `Contact (${form.subject}) from ${form.name}`,
    idempotencyKey: `contact-${logged.ref}-label`,
    variables: {
      SUBJECT: escapeHtml(form.subject),
      NAME: escapeHtml(form.name),
      SENDER_EMAIL: escapeHtml(form.email),
      MESSAGE: escapeMultiline(form.message),
    },
  })
  if (notify.error) return json({ error: "send_failed" }, 502)

  await sendTemplate({
    apiKey: env.RESEND_MAIL_KEY,
    from: env.MAIL_FROM,
    to: form.email,
    template: "contact-confirmation",
    idempotencyKey: `contact-${logged.ref}-receipt`,
    variables: { NAME: escapeHtml(form.name) },
  })
  return json({ ok: true })
}
