import type { Env } from "../../cf/env"
import { escapeHtml, escapeMultiline, field, hashIp, isBot, isEmail, isUrl, json, readJson } from "../../cf/http"
import { sendTemplate } from "../../cf/resend"
import { verifyTurnstile } from "../../cf/turnstile"
import { MAX_LINKS, checkEmailDomain, countLinks, isKnownLinkHost } from "../../cf/checks"
import { logSubmission } from "../../cf/submissions"

// POST /api/demo — demo submission from the Label page
export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const data = await readJson(request)
  if (!data) return json({ error: "invalid_request" }, 400)
  if (isBot(data)) return json({ ok: true })
  if (!(await verifyTurnstile(request, data, env))) return json({ error: "captcha_failed" }, 403)

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
  if (countLinks(form.message) > MAX_LINKS) return json({ error: "too_many_links" }, 422)
  const emailProblem = await checkEmailDomain(form.email)
  if (emailProblem) return json({ error: emailProblem }, 422)

  const logged = await logSubmission(env, "demo", form.artist, form.email, await hashIp(request), form)
  if (!logged.ok) return json({ error: "rate_limited" }, 429)

  const notify = await sendTemplate({
    apiKey: env.RESEND_MAIL_KEY,
    from: env.MAIL_FROM,
    to: env.LABEL_EMAIL,
    replyTo: form.email,
    template: "demo-notification",
    subject: `New demo: ${form.track} by ${form.artist}`,
    idempotencyKey: `demo-${logged.ref}-label`,
    variables: {
      ARTIST_NAME: escapeHtml(form.artist),
      SENDER_EMAIL: escapeHtml(form.email),
      TRACK: escapeHtml(form.track),
      LINK:
        `<a href="${escapeHtml(form.link)}" style="color:#F9BC14">${escapeHtml(form.link)}</a>` +
        (isKnownLinkHost(form.link)
          ? ""
          : `<br><span style="color:#FF7A66">⚠ Not a usual music platform (${escapeHtml(new URL(form.link).hostname)}). Check before opening.</span>`),
      MESSAGE: escapeMultiline(form.message || "—"),
    },
  })
  if (notify.error) return json({ error: "send_failed" }, 502)

  await sendTemplate({
    apiKey: env.RESEND_MAIL_KEY,
    from: env.MAIL_FROM,
    to: form.email,
    template: "demo-confirmation",
    replyTo: env.DEMOS_EMAIL,
    idempotencyKey: `demo-${logged.ref}-receipt`,
    variables: { ARTIST_NAME: escapeHtml(form.artist), TRACK: escapeHtml(form.track) },
  })
  return json({ ok: true })
}
