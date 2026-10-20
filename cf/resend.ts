// Sends one email with a published Resend template (by alias), through the REST API.
// Template copy lives in Resend, so the label can edit it without a deploy.

interface TemplateEmail {
  apiKey: string
  from: string
  to: string
  template: string // alias
  variables: Record<string, string>
  subject?: string // plain text; overrides the template's default subject
  replyTo?: string
  idempotencyKey?: string
}

export async function sendTemplate(email: TemplateEmail): Promise<{ id?: string; error?: string }> {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${email.apiKey}`,
      "Content-Type": "application/json",
      ...(email.idempotencyKey ? { "Idempotency-Key": email.idempotencyKey } : {}),
    },
    body: JSON.stringify({
      from: email.from,
      to: [email.to],
      ...(email.replyTo ? { reply_to: email.replyTo } : {}),
      ...(email.subject ? { subject: email.subject.replace(/[\r\n]+/g, " ").slice(0, 200) } : {}),
      template: { id: email.template, variables: email.variables },
    }),
  })
  const data = (await response.json().catch(() => ({}))) as { id?: string; message?: string }
  if (!response.ok) {
    console.error(`Resend ${email.template} failed (${response.status}): ${data.message ?? "unknown error"}`)
    return { error: data.message ?? `HTTP ${response.status}` }
  }
  console.log(`Resend ${email.template} sent: ${data.id}`)
  return { id: data.id }
}
