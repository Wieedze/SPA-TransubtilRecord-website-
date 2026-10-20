// Announces new releases to the newsletter. Run it after a production deploy that
// adds a release (bun run newsletter:releases): each release in src/data/releases.ts that is not yet in the
// D1 table announced_releases gets a branded broadcast (cover, title, Bandcamp link).
//
// By default the broadcast is a draft in Resend that you review and send yourself.
// Set NEWSLETTER_AUTO_SEND=true in .dev.vars (or pass --send) to send it right away.
//
//   bun run newsletter:releases            → drafts for new releases
//   bun run newsletter:releases --dry-run  → only lists what would be announced
//   bun run newsletter:releases --mark-all → marks every release as announced, sends nothing
import { releases } from "../../src/data/releases"
import { createBroadcast, d1, devVar, releaseEmail, sqlString } from "./lib"

const dryRun = process.argv.includes("--dry-run")
const markAll = process.argv.includes("--mark-all")
const send = process.argv.includes("--send") || devVar("NEWSLETTER_AUTO_SEND") === "true"

const announced = new Set(d1<{ bandcamp_id: string }>("SELECT bandcamp_id FROM announced_releases").map((r) => r.bandcamp_id))
const fresh = releases.filter((r) => r.bandcampId && !announced.has(r.bandcampId))

if (fresh.length === 0) {
  console.log("Newsletter: no new release to announce.")
  process.exit(0)
}
if (fresh.length > 3 && !markAll && !dryRun) {
  // Safety net: a reset table or a bulk import should not mail the whole catalogue
  console.log(`Newsletter: ${fresh.length} unannounced releases, more than expected. Nothing sent.`)
  console.log("Check with --dry-run, then mark them as announced with --mark-all.")
  process.exit(1)
}

for (const release of fresh) {
  if (dryRun) {
    console.log(`Would announce: ${release.title}`)
    continue
  }
  let broadcastId = "skipped"
  if (!markAll) {
    const { id, url } = await createBroadcast({
      name: `Release: ${release.title}`,
      subject: `New release: ${release.title}`,
      html: releaseEmail(release),
      send,
    })
    broadcastId = id
    console.log(send ? `Sent: ${release.title} (${url})` : `Draft ready for ${release.title}: ${url}`)
  }
  d1(
    `INSERT INTO announced_releases (bandcamp_id, title, broadcast_id) VALUES (${sqlString(release.bandcampId)}, ${sqlString(release.title)}, ${sqlString(broadcastId)})`
  )
}
