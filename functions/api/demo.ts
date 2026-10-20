import type { Env } from "../../cf/env"
import { escapeHtml, escapeMultiline, field, hashIp, isBot, isEmail, isUrl, json, readJson } from "../../cf/http"
import { sendTemplate } from "../../cf/resend"
import { logSubmission } from "../../cf/submissions"

// POST /api/demo — demo submission from the Label page
export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const data = await readJson(request)
  if (!data) return json({ error: "invalid_request" }, 400)
  if (isBot(data)) return json({ ok: true })

  const form = {
    artist: field(data, "artist", 120),
    email: field(data, "email", 254),
    track: field(data, "track", 200),
    link: field(data, "link", 500),
    message: field(data, "message", 4000),
  }
  if (!form.artist || !isEmail(form.email) || !form.track || !isUrl(form.link)) {
    return json({ error: "missing_fields" }, 422)
  }

  const logged = await logSubmission(env, "demo", form.artist, form.email, await hashIp(request), form)
  if (!logged.ok) return json({ error: "rate_limited" }, 429)

  const notify = await sendTemplate({
    apiKey: env.RESEND_MAIL_KEY,
    from: env.MAIL_FROM,
    to: env.LABEL_EMAIL,
    replyTo: form.email,
    template: "demo-notification",
    subject: `New demo: ${form.track} by ${form.artist}`,
    idempotencyKey: `demo-${logged.id}-label`,
    variables: {
      ARTIST_NAME: escapeHtml(form.artist),
      SENDER_EMAIL: escapeHtml(form.email),
      TRACK: escapeHtml(form.track),
      LINK: `<a href="${escapeHtml(form.link)}">${escapeHtml(form.link)}</a>`,
      MESSAGE: escapeMultiline(form.message || "—"),
    },
  })
  if (notify.error) return json({ error: "send_failed" }, 502)

  await sendTemplate({
    apiKey: env.RESEND_MAIL_KEY,
    from: env.MAIL_FROM,
    to: form.email,
    template: "demo-confirmation",
    idempotencyKey: `demo-${logged.id}-receipt`,
    variables: { ARTIST_NAME: escapeHtml(form.artist), TRACK: escapeHtml(form.track) },
  })
  return json({ ok: true })
}
