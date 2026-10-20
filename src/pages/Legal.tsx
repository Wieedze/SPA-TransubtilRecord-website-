import type { ReactNode } from "react"
import Seo from "../components/site/Seo"
import { breadcrumbLd } from "../lib/structuredData"
import PageHeader from "../components/site/PageHeader"
import { useConsent } from "../contexts/ConsentContext"

// Legal notice (French LCEN) and privacy policy (GDPR) on one page.
// Publisher details: the label owner's micro-enterprise. Update the date below on any change.
const UPDATED = "20 October 2026"
const EMAIL = "transubtilrec@gmail.com"

function Section({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section id={id} className="flex scroll-mt-28 flex-col gap-4">
      <h2 className="font-display text-lg leading-tight md:text-[22px]">{title}</h2>
      {children}
    </section>
  )
}

function Facts({ rows }: { rows: [string, ReactNode][] }) {
  return (
    <dl className="grid grid-cols-1 gap-x-8 gap-y-2 border-y border-brand-700 py-4 sm:grid-cols-[200px_minmax(0,1fr)]">
      {rows.map(([label, value]) => (
        <div key={label} className="contents">
          <dt className="text-xs uppercase tracking-[0.12em] text-brand-300 sm:pt-0.5">{label}</dt>
          <dd className="mb-2 text-bone sm:mb-0">{value}</dd>
        </div>
      ))}
    </dl>
  )
}

const Mail = () => (
  <a href={`mailto:${EMAIL}`} className="text-link">
    {EMAIL}
  </a>
)

export default function Legal() {
  const { openSettings } = useConsent()

  return (
    <div className="flex flex-col gap-12">
      <Seo
        title="Legal notice and privacy — Transubtil Records"
        description="Legal notice, privacy policy and cookies of transubtil-record.com, the website of Transubtil Records."
        path="/legal"
        jsonLd={breadcrumbLd([{ name: "Home", path: "/" }, { name: "Legal notice and privacy", path: "/legal" }])}
      />
      <PageHeader title="Legal notice & privacy" meta={`Last updated ${UPDATED}`} />

      <div className="flex max-w-[72ch] flex-col gap-14 text-[15px] leading-relaxed text-body md:text-base">
        <Section id="legal-notice" title="Legal notice (mentions légales)">
          <p>transubtil-record.com is published by:</p>
          <Facts
            rows={[
              ["Publisher", "Julien Cachia, sole trader (entrepreneur individuel, micro-entreprise), trading as Transubtil Records"],
              ["Address", "27 avenue François Bernard, 83110 Sanary-sur-Mer, France"],
              ["SIREN / SIRET", "752 413 500 / 752 413 500 00014"],
              ["Activity (NAF)", "5920Z, sound recording and music publishing"],
              ["Email", <Mail key="mail" />],
              ["Publication director", "Julien Cachia"],
            ]}
          />
          <p>The website is hosted by:</p>
          <Facts
            rows={[
              ["Host", "Cloudflare, Inc."],
              ["Address", "101 Townsend Street, San Francisco, CA 94107, United States"],
              [
                "Website",
                <a key="cf" href="https://www.cloudflare.com" target="_blank" rel="noreferrer" className="text-link">
                  cloudflare.com
                </a>,
              ],
            ]}
          />
          <p>
            Music, artwork, photos and texts on this site belong to Transubtil Records and to the artists and designers
            who made them. Do not reuse them without permission.
          </p>
        </Section>

        <Section id="privacy" title="Privacy policy">
          <p>
            The data controller is the publisher named above. We collect only what you send us through the forms, and
            we never sell it.
          </p>

          <h3 className="text-bone">What we collect and why</h3>
          <ul className="flex list-disc flex-col gap-2 pl-5 marker:text-accent">
            <li>
              <strong className="text-bone">Booking requests:</strong> your name, email, event, date, venue, capacity,
              budget and message, to answer you and organise the booking. The details may be passed on to the artist
              you ask for.
            </li>
            <li>
              <strong className="text-bone">Demos:</strong> your artist name, email, track title, listening link and
              message, to listen to your music and reply.
            </li>
            <li>
              <strong className="text-bone">Contact messages:</strong> your name, email and message, to reply.
            </li>
            <li>
              <strong className="text-bone">Newsletter:</strong> your email, to send you releases, gifts and free
              downloads. You subscribe with a confirmation link, and every email has an unsubscribe link.
            </li>
            <li>
              <strong className="text-bone">Anti-spam:</strong> when you send a form, a one-way fingerprint of your IP
              address (not the address itself) limits the number of messages per hour, and Cloudflare Turnstile checks
              that you are not a bot.
            </li>
          </ul>
          <p>
            Legal bases: answering your request (booking, demo, contact), your consent (newsletter, music players) and
            our legitimate interest in protecting the site from spam.
          </p>

          <h3 className="text-bone">How long we keep it</h3>
          <ul className="flex list-disc flex-col gap-2 pl-5 marker:text-accent">
            <li>Booking and contact requests: 3 years after our last exchange.</li>
            <li>Demos: 1 year.</li>
            <li>Newsletter: until you unsubscribe, or after 3 years without opening any email.</li>
          </ul>

          <h3 className="text-bone">Who processes it</h3>
          <ul className="flex list-disc flex-col gap-2 pl-5 marker:text-accent">
            <li>Cloudflare (United States): hosting, database, Turnstile and email forwarding.</li>
            <li>Resend (United States, emails sent from Ireland): confirmation emails and the newsletter.</li>
            <li>Google (United States): the label's Gmail inbox, where your messages arrive.</li>
          </ul>
          <p>
            These companies may process data outside the European Union. They are covered by the EU-US Data Privacy
            Framework or by the European Commission's standard contractual clauses.
          </p>

          <h3 className="text-bone">Your rights</h3>
          <p>
            You can ask to see, correct, delete or export your data, object to its use, or withdraw your consent at any
            time. Email <Mail /> and we reply within a month. If you are not satisfied, you can complain to the French
            data protection authority,{" "}
            <a href="https://www.cnil.fr" target="_blank" rel="noreferrer" className="text-link">
              the CNIL
            </a>
            .
          </p>
        </Section>

        <Section id="cookies" title="Cookies">
          <p>
            This site sets no advertising or tracking cookies and uses no audience analytics. Its fonts are hosted on
            the site itself.
          </p>
          <ul className="flex list-disc flex-col gap-2 pl-5 marker:text-accent">
            <li>
              <strong className="text-bone">Music players:</strong> the Bandcamp and SoundCloud players set their own
              cookies, so they load only if you allow them. Without your consent, you can still open the music on
              Bandcamp or SoundCloud.
            </li>
            <li>
              <strong className="text-bone">Your browser:</strong> the site remembers your choice about the players for
              6 months, and whether you have already seen the home intro during this visit.
            </li>
            <li>
              <strong className="text-bone">Cloudflare Turnstile:</strong> the anti-spam check on forms. It is needed
              for the site's security, so it does not require consent.
            </li>
          </ul>
          <button type="button" onClick={openSettings} className="btn-secondary self-start">
            Change cookie settings
          </button>
        </Section>
      </div>
    </div>
  )
}
