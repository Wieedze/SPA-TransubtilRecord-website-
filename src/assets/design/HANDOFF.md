# Transubtil Records — design handoff

Brief for the agent that will code the site. The design was approved in Claude Design. Everything needed is in this `design/` folder.

## Goal

Rebuild the Transubtil Records website (psychedelic music label, Marseille, 10 years old) as a label showcase plus a booking tool for its artists.

Audience, in priority order:

1. Party and festival promoters who want to book an artist. They must find the info in 10 seconds.
2. Fans following releases and joining the newsletter.
3. Artists sending a demo to the label.

## Stack and constraints

1. React + Tailwind CSS. Merge `tailwind.config.js` into the project config.
2. **The whole site is in English.**
3. Mobile first. Text contrast WCAG AA (already validated by the palette). Light animations, all disabled under `prefers-reduced-motion`.
4. Navigation: Home, Artists, Releases, Label, Contact, plus a yellow "Book an artist" button. No account, no login.
5. Fonts from Google Fonts: `Unbounded` (400, 600, 700, 800) and `Instrument Sans` (400, 500, 600, 700). Eras ITC and Acumin are no longer used.

## Folder contents

| Path | What it is |
|---|---|
| `tailwind.config.js` | Colour, type, radius and animation tokens |
| `artists.json` | The 21 artists: slug, name, format (Live or DJ), style, location, photo, bio. `null` fields are still to be filled in |
| `assets/brandmark-white.png` | The new logo (white brandmark, transparent background). Use it everywhere |
| `assets/artwork-10-years.jpg` | "10 Years of Transubtil" compilation artwork: home background and latest release |
| `assets/hub-artiste.svg` | Yellow hub that frames the artist photo (the only mecha element on the site) |
| `assets/hub-circle.svg` | Ring that turns behind the hub |
| `assets/artists/*.jpg` | Artist photos cropped to 4:5 (640×800) |
| `assets/the-horrids-square.jpg` | Square photo used inside the hub for the template page |
| `reference/*.dc.html` | The approved mockups as HTML source: read them for exact layout, spacing, colours and copy (they do not render on their own outside Claude Design). They use Design Component syntax (`<x-dc>`, `{{holes}}`, `<sc-for>`, `<sc-if>`): read them as markup, do not reuse that syntax |

## Visual rules

1. Background `brand-950`. Text `bone`, paragraphs `body`, secondary text `brand-300`.
2. **Yellow `accent` is only for actions and landmarks**: primary buttons, links, active nav item, small uppercase labels. Never for large surfaces, except the newsletter band.
3. Buttons are pills (`rounded-full`), 48 to 56 px high. Primary: yellow background, `brand-950` text, hover `accent-hover`. Secondary: 1.5 px `bone` outline, hover yellow outline and text. Disabled: `brand-700` background, `brand-500` text.
4. Fields: 52 px high, `rounded-field`, `brand-900` or `brand-950` background, 1.5 px `brand-700` border. Error: `error` border plus a message under the field. Success: `success` border. Labels always visible above the field.
5. Artist cards: 4:5 photo, `rounded-photo`, Live/DJ badge top right. Hover: photo zooms 4% (`scale-[1.04]`, 200 ms) and the name turns yellow.
6. Headings in Unbounded. Page titles and artist names in uppercase.
7. **No other mecha elements** (HUD branches, lines, frames, corner brackets). They were tried and removed. Only the hub on the artist page stays.
8. Keyboard focus: `outline-2 outline-accent outline-offset-[3px]`. Touch targets at least 44 px.

## Pages

Mockups are in `reference/`. Desktop width 1440, content max 1280 (`max-w-page`), 24 px side padding.

1. **Home** (`01-home`): full-height hero with the artwork rotating very slowly in the background (`animate-spin-slow`, opacity about 0.38, dark radial overlay), breathing brandmark (`animate-breathe`) over a pulsing yellow halo, title, 3 quick-access tiles (Artists, Releases, yellow Booking). Then the latest release (artwork, player, Buy on Bandcamp), 4 featured artists, a booking call to action for promoters, and the newsletter + footer.
2. **Artists** (`02-artists`): grid of 4 columns on desktop, 2 on mobile, filters All / Live acts / DJ sets, data from `artists.json`.
3. **Artist page** (`03-artist-page`, template = The Horrids): photo inside the hub (positioning below), style label, name, short pitch, 3 facts (format, set length, base), Book and Press kit (ZIP) buttons. Then Bio, Listen (SoundCloud or Bandcamp embed), Technical rider, Upcoming dates, and the `#booking` form: name, email, event, date, venue, capacity, fee budget (select), message. Mobile: sticky bottom bar with a "Book" button.
4. **Releases** (`04-releases`): grid of releases (artwork, type and date, title, artist, Listen and Buy links), sort select, "Load more".
5. **Label** (`05-label`): label story, 3 stats (10 years, n releases, 21 artists), demo form `#demo` (artist name, email, listening link, message).
6. **Contact** (`06-contact`): subject chips (Booking, Press, Partnership, Shop, Other) that change the message placeholder, name, email, message.
7. **Reusable components**: navigation (`component-nav`, mobile menu in `mobile-menu`) and the newsletter + footer block (`component-footer-newsletter`). Newsletter title: "Stay in touch."

### Hub positioning (artist page)

Square container with ratio `487 / 649`, `relative`, max width 460 px:

1. Ring `hub-circle.svg`: `absolute left-[1%] top-0 w-[97%] opacity-15 animate-spin-hub`.
2. Photo: `absolute left-[9.4%] top-[7.7%] w-[80.2%] aspect-square object-cover rounded-full`.
3. Hub `hub-artiste.svg` on top: `absolute inset-x-0 top-0 w-full`, `aria-hidden`.
4. Label "LIVE ACT" or "DJ SET": `absolute left-1/2 top-[88.5%]`, 11 px, uppercase, yellow, wide letter spacing.

## Content still missing

1. Releases other than "10 Years of Transubtil" (titles, dates, artworks, links).
2. The label story text.
3. Locations for artists marked `null` in `artists.json`.
4. Mekanorms' bio (the press kit has a copy of Kanaloa's).
5. Each artist's links, press kit ZIP, rider and dates.
6. Booking reply time (shown as [48 h] in the mockups) and the contact email.

Everything shown between [square brackets] in the mockups is a placeholder: do not invent content to fill it.
