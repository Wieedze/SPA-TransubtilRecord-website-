// Public site address and defaults used for canonical URLs, social previews and
// structured data. Change SITE_URL here if the domain ever changes.
export const SITE_URL = "https://transubtil-record.com"
export const SITE_NAME = "Transubtil Records"
export const DEFAULT_OG_IMAGE = "/og-default.jpg" // 1200 × 630, in public/
export const LOGO_URL = "/logo.png" // dark logo on light, for search engines

export const GENRES = ["Psytrance", "Psychedelic trance", "Darkpsy", "Forest", "Night psy", "Twilight psy"]

export function absoluteUrl(pathOrUrl: string): string {
  return /^https?:\/\//.test(pathOrUrl) ? pathOrUrl : `${SITE_URL}${pathOrUrl.startsWith("/") ? "" : "/"}${pathOrUrl}`
}
