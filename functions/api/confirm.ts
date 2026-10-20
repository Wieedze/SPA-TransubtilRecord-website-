import type { Env } from "../../cf/env"

// GET /api/confirm?token=… — confirmation link from the double opt-in email.
// Marks the subscriber active in D1 and adds them to the Resend "Newsletter" segment.
export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const confirmToken = new URL(request.url).searchParams.get("token") ?? ""
  const back = (state: string) => Response.redirect(`${env.SITE_URL}/?newsletter=${state}#newsletter`, 303)
  if (!/^[a-f0-9]{32}$/.test(confirmToken)) return back("invalid")

  const subscriber = await env.DB.prepare("SELECT email FROM subscribers WHERE confirm_token = ?")
    .bind(confirmToken)
    .first<{ email: string }>()
  if (!subscriber) return back("invalid")

  await env.DB.prepare(
    "UPDATE subscribers SET status = 'active', confirmed_at = datetime('now'), confirm_token = NULL WHERE confirm_token = ?"
  )
    .bind(confirmToken)
    .run()

  // Needs a full-access key; without it the subscriber stays in D1 for a later sync
  if (env.RESEND_CONTACTS_KEY) {
    const response = await fetch("https://api.resend.com/contacts", {
      method: "POST",
      headers: { Authorization: `Bearer ${env.RESEND_CONTACTS_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ email: subscriber.email, unsubscribed: false, segments: [{ id: env.RESEND_SEGMENT_ID }] }),
    })
    if (!response.ok) console.error(`Resend contact create failed (${response.status}): ${await response.text()}`)
  }
  return back("confirmed")
}
