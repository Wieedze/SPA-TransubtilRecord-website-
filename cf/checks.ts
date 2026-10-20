// Extra checks on what visitors send: real mail domain, no throwaway address,
// no link-stuffed messages, and a warning on demo links from unknown hosts.

const DISPOSABLE = new Set([
  "mailinator.com", "yopmail.com", "yopmail.fr", "guerrillamail.com", "guerrillamail.net", "sharklasers.com",
  "10minutemail.com", "10minutemail.net", "temp-mail.org", "tempmail.com", "tempmail.net", "trashmail.com",
  "trashmail.de", "getnada.com", "dispostable.com", "maildrop.cc", "mailnesia.com", "throwawaymail.com",
  "fakeinbox.com", "mohmal.com", "emailondeck.com", "mintemail.com", "spamgourmet.com", "jetable.org",
])

// Platforms artists normally share demos from (subdomains included)
const KNOWN_LINK_HOSTS = [
  "soundcloud.com", "on.soundcloud.com", "bandcamp.com", "dropbox.com", "drive.google.com", "docs.google.com",
  "wetransfer.com", "we.tl", "youtube.com", "youtu.be", "mega.nz", "box.com", "onedrive.live.com",
  "1drv.ms", "mixcloud.com", "hearthis.at", "audiomack.com", "disco.ac", "untitled.stream",
]

export type EmailProblem = "disposable_email" | "invalid_email_domain"

async function hasRecords(name: string, type: "MX" | "A" | "AAAA"): Promise<boolean> {
  const response = await fetch(`https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(name)}&type=${type}`, {
    headers: { accept: "application/dns-json" },
  })
  const data = (await response.json()) as { Status?: number; Answer?: unknown[] }
  return data.Status === 0 && Array.isArray(data.Answer) && data.Answer.length > 0
}

// null when the address looks deliverable. Fails open if DNS can't be reached.
export async function checkEmailDomain(email: string): Promise<EmailProblem | null> {
  const domain = email.split("@").pop()?.toLowerCase() ?? ""
  if (DISPOSABLE.has(domain)) return "disposable_email"
  try {
    if (await hasRecords(domain, "MX")) return null
    if (await hasRecords(domain, "A")) return null // a host can receive mail without MX
    return "invalid_email_domain"
  } catch {
    return null
  }
}

export function countLinks(text: string): number {
  return (text.match(/https?:\/\/|www\./gi) ?? []).length
}
export const MAX_LINKS = 3

export function isKnownLinkHost(url: string): boolean {
  try {
    const host = new URL(url).hostname.toLowerCase().replace(/^www\./, "")
    return KNOWN_LINK_HOSTS.some((known) => host === known || host.endsWith(`.${known}`))
  } catch {
    return false
  }
}
