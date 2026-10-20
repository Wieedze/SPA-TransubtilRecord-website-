// Turns a newsletter file (newsletters/*.md) into a branded Resend broadcast.
//
//   bun run newsletter newsletters/2026-11-gift.md                 → draft in Resend (you review and press Send)
//   bun run newsletter newsletters/2026-11-gift.md --test me@x.com → one test copy to that address only
//   bun run newsletter newsletters/2026-11-gift.md --send          → sends to the whole list now
//   bun run newsletter newsletters/2026-11-gift.md --preview       → writes the HTML next to the file, sends nothing
//
// File format: a few "key: value" lines between --- (subject, title, eyebrow, image,
// image_link, button, button_link, preheader), then the text in simple Markdown.
import { readFileSync, writeFileSync } from "node:fs"
import { basename } from "node:path"
import { button, createBroadcast, image, layout, markdownToHtml, sendTest } from "./lib"

const args = process.argv.slice(2)
const file = args.find((a) => !a.startsWith("--") && !args[args.indexOf(a) - 1]?.startsWith("--test"))
const testIndex = args.indexOf("--test")
const testTo = testIndex >= 0 ? args[testIndex + 1] : undefined
const send = args.includes("--send")

if (!file || (testIndex >= 0 && !testTo)) {
  console.log("Usage: bun run newsletter <newsletters/file.md> [--preview | --test you@email.com | --send]")
  process.exit(1)
}

const raw = readFileSync(file, "utf8")
const match = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/)
if (!match) throw new Error(`${file}: missing the --- header block`)
const meta: Record<string, string> = {}
for (const line of match[1].split("\n")) {
  const kv = line.match(/^(\w+):\s*(.*)$/)
  if (kv && kv[2].trim()) meta[kv[1]] = kv[2].trim()
}
if (!meta.subject || !meta.title) throw new Error(`${file}: "subject" and "title" are required`)

const html = layout({
  title: meta.title,
  eyebrow: meta.eyebrow,
  preheader: meta.preheader,
  body:
    (meta.image ? image(meta.image, meta.title, meta.image_link ?? meta.button_link) : "") +
    markdownToHtml(match[2]) +
    (meta.button && meta.button_link ? button(meta.button, meta.button_link) : ""),
})

if (args.includes("--preview")) {
  const out = file.replace(/\.md$/, ".preview.html")
  writeFileSync(out, html)
  console.log(`Preview written to ${out}, open it in your browser.`)
} else if (testTo) {
  await sendTest(testTo, meta.subject, html)
  console.log(`Test sent to ${testTo}.`)
} else {
  const { url } = await createBroadcast({ name: basename(file, ".md"), subject: meta.subject, html, send })
  console.log(send ? `Sent to the Newsletter list: ${url}` : `Draft ready, review and press Send: ${url}`)
}
