// Bindings and settings available to every Pages Function (see wrangler.toml and secrets)
export interface Env {
  DB: D1Database
  // Secrets (Cloudflare Pages secrets in production, .dev.vars locally)
  RESEND_MAIL_KEY: string // sending-only, restricted to mail.transubtil-record.com
  RESEND_NEWS_KEY: string // sending-only, restricted to news.transubtil-record.com
  RESEND_CONTACTS_KEY?: string // optional full-access key: adds confirmed subscribers to the Resend segment
  TURNSTILE_SECRET?: string // anti-bot check on forms; unset locally = check skipped
  // Plain settings ([vars] in wrangler.toml)
  LABEL_EMAIL: string
  BOOKING_EMAIL: string
  DEMOS_EMAIL: string
  CONTACT_EMAIL: string
  SITE_URL: string
  MAIL_FROM: string
  NEWS_FROM: string
  RESEND_SEGMENT_ID: string
}
