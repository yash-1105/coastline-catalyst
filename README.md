# Coastline Catalyst

Marketing website for Coastline Catalyst, an early-stage investment firm partnering with founders
across India, with a long-term vision of connecting innovation between India and the GCC.

Built from the design handoff in `design_handoff_coastline_catalyst/`. Mobile-first: most visitors
arrive from LinkedIn on a phone.

## Stack

- **Next.js 16** (App Router, TypeScript, Turbopack)
- **CSS Modules** over a token layer in `src/app/globals.css`. The palette is closed, so tokens
  rather than a utility framework keeps it that way.
- **Motion is hand-rolled**: one rAF-throttled scroll loop plus IntersectionObserver, mirroring the
  prototypes. No animation dependency.
- `next/font/google` self-hosts Manrope and Inter, so there is no render-blocking font request.

## Getting started

```bash
npm install
cp .env.example .env.local   # optional in development
npm run dev                  # http://localhost:3000
```

```bash
npm run build      # production build
npm run start      # serve the production build
npm run typecheck  # tsc --noEmit
```

## Routes

| Route           | Page                | Notes                                       |
| --------------- | ------------------- | ------------------------------------------- |
| `/`             | Home                | Hero choreography, pinned portfolio, spine  |
| `/about`        | About               | `Person` JSON-LD per partner                |
| `/portfolio`    | Portfolio           | Client-side filtering                       |
| `/submit-pitch` | Founder application | Three-step form, PDF upload                 |
| `/thank-you`    | Received            | `noindex`                                   |
| `/contact`      | Contact             | Never used for pitches                      |
| `/privacy`      | Privacy policy      | Sticky table of contents                    |
| _anything else_ | 404                 | `noindex`, footer hidden                    |

`/privacy-policy` permanently redirects to `/privacy`.

## Editing content

**Everything lives in `src/lib/site.ts`.** Portfolio companies, partner profiles, investment focus,
"what we look for", "why partner", privacy copy, contact details. Adding a company to the
`companies` array flows through to the Home track, the Portfolio grid, and the filter options, which
derive their values from the data. Editing content never requires touching layout code.

Placeholders still to be replaced, all marked in square brackets in the copy:

- Portfolio company descriptions and URLs (`[Description to be added]`, `[Industry]`)
- Partner bios (`[Bio to be added]`) and headshots (set `photo` to a path under `public/`)
- `site.location`, `site.linkedinUrl`
- `privacyLastUpdated`, `privacyPostalAddress`

## Logo

One asset drives every appearance: `src/assets/logo.png`, a 512px transparent PNG rendered through
`src/components/Logo.tsx` (32px in the header, 30px in the footer). `src/app/icon.png` is the
favicon, cropped tighter because a browser tab is only 16-32px. `src/app/apple-icon.png` bakes in a
Paper background, since iOS composites touch icons on black and a transparent one would go dark.
The open graph card inlines the same PNG as a data URI, because `ImageResponse` cannot use
`next/image`.

The supplied artwork was a JPEG of the mark on a warm off-white (242,241,237). Compositing that
directly would have shown a visible square against Paper (#FBFBF9), so the background was keyed out
with per-pixel alpha unmixing and the mark cropped to fill ~92.5% of its box, matching the optical
size of the placeholder it replaced. To swap in new artwork, replace these three files at the same
dimensions; nothing else needs to change.

If the mark is ever needed on a dark background, note that its internal separator strokes are
transparent, so they would show the dark colour through. Everywhere it currently appears is Paper.

## Design system

Tokens are CSS custom properties in `src/app/globals.css`:

| Token         | Value     | Use                                        |
| ------------- | --------- | ------------------------------------------ |
| `--paper`     | `#FBFBF9` | Page background                            |
| `--ink`       | `#0C1116` | Headings, body                             |
| `--navy`      | `#0F3350` | Buttons, links, horizon lines, eyebrows    |
| `--tide`      | `#2A6E96` | Hover and active states only               |
| `--rule`      | `#E4E4E0` | Hairlines, card borders                    |
| `--muted`     | `#6B7280` | Captions, labels, metadata                 |
| `--error`     | `#A5453C` | Form errors only                           |
| `--hairline`  | 12% navy  | The Home hairlines                         |
| `--ease`      | `cubic-bezier(0.22, 1, 0.36, 1)` | All motion              |

House rules the code enforces: Manrope 500/700 for headings, Inter 400/500 for body, no italics
anywhere (`globals.css` resets `em`/`i`), `·` as the title separator, no em or en dashes in copy,
sentence case, no second accent colour, no gradients over large areas, no dark mode.

## Motion

- `RevealObserver` drives every `data-reveal="<ms>"` element: fade in and rise 24px at 15% viewport
  entry, the attribute value as its stagger delay, fired **once** and then unobserved.
- `HomeScrollFX` owns the Home effects in a single rAF loop: hero parallax, crescent at 0.3x, waves
  at 1.15x, the word fill, the numbered rows, and the left-gutter spine.
- `PinnedPortfolio` picks its mode: **pin** at 900px and up, **swipe** carousel below, **grid**
  under reduced motion.
- `PageTransition` wipes a navy panel up and away on route change, 500ms.

`prefers-reduced-motion: reduce` disables all of it. No parallax, wave drift, pinning, word fill or
spine; content sits at its final state.

Without JavaScript nothing stays hidden: a `<noscript>` style in the root layout unhides every
reveal and fills every word.

## Video

Three 8-second clips, all scroll-linked, all on Home only. `ScrollVideo` has two modes:

| Clip | Section | Mode | Treatment |
| --- | --- | --- | --- |
| `hero-coastline.mp4` | Hero | `pinned`, 250vh | Navy scrim, theme inverted |
| `tide-edge.mp4` | 03 Investment focus | `inline` | `mix-blend-mode: screen` at 0.30 |
| `open-water.mp4` | 07 Ready to build | `inline` | opacity 0.45 plus a 0.35 navy scrim |

Only the hero is pinned. Pinning all three would add several viewport heights to a page that
already reads long, and section 07 is the conversion moment, so it keeps its natural height.

**Preparing clips.** `scripts/prepare-video.sh IN OUT [width] [crf] [precrop]` crops the Veo
watermark and re-encodes with a keyframe on every frame. That second part is not optional: without
it the decoder replays intermediate frames on every seek and scrubbing stutters no matter how good
the component is. It is also why 8-second clips run to 8MB.

```bash
./scripts/prepare-video.sh raw-video/hero-coastline.mp4 public/video/hero-coastline.mp4 1280 23
./scripts/prepare-video.sh raw-video/tide-edge.mp4      public/video/tide-edge.mp4      1280 22
# open-water arrives letterboxed and its watermark sits on the bottom bar,
# so removing the bars removes the watermark and no further inset is needed
./scripts/prepare-video.sh raw-video/open-water.mp4 public/video/open-water.mp4 1600 22 "crop=1920:816:0:132"
```

Always verify the crop rather than assuming it worked: export the first, middle and last frames and
look at all four corners. Posters are frame 0 for the hero and the midpoint for the other two, since
`open-water` opens on a black fade-in.

**Why `screen` on section 03.** Measured against the band's own navy: `screen` lifts mean luminance
to 0.273 so the foam reads as light traces, while `overlay` (0.165) and `soft-light` (0.169) both
come out *darker* than bare navy (0.178). Both preserve the backdrop's tonality, so a dark band
stays dark and the pale foam cannot lift through.

**Scrim contrast.** The hero clip is bright, not dark: its sky peaks near white. The copy column
needs scrim alpha of at least 0.65 to clear AA 4.5:1 against Paper text, so the hero scrim runs
0.86 to 0.38 rather than the 0.72 to 0.35 first specified. Re-measure if the clip is ever replaced.

**Fallbacks.** No video mounts under `prefers-reduced-motion: reduce` or below 900px, where iOS
Safari does not honour programmatic `currentTime` reliably enough to risk a frozen hero. Both paths
render the poster, drop the hero pin to `100vh`, and keep the theme inversion. The poster also sits
under the video permanently, so it carries the LCP and a slow connection never shows black.

`raw-video/` holds the source clips and is gitignored.

## Forms

Both forms post to an API route that re-validates everything server side. Client validation fires on
blur, never per keystroke, and an error clears the moment its field becomes valid.

- `POST /api/submit-pitch` — multipart. Required fields, email shape, 40-character description
  minimum, consent, PDF type and the 25MB ceiling are all re-checked on the server.
- `POST /api/contact` — JSON.

### Wiring up delivery

`src/lib/delivery.ts` picks the first configured transport:

1. `PITCH_WEBHOOK_URL` / `CONTACT_WEBHOOK_URL` — POSTs JSON, the deck as
   `{ deck: { filename, contentType, base64 } }`.
2. `RESEND_API_KEY` + `NOTIFY_EMAIL` + `FROM_EMAIL` — emails the submission with the deck attached.
3. Neither, in development — writes to `.submissions/` (gitignored) and logs a warning.

In production with nothing configured the route returns 503 and the founder sees an error telling
them to email the deck instead. A submission is never silently dropped.

**Deploying to Vercel:** serverless functions cap request bodies at 4.5MB, well under the 25MB the
form accepts. Before launch either raise that on your plan or move the upload to direct-to-storage
(Vercel Blob client upload, or a signed S3 URL) and send only the resulting key through the API
route. Everything else is ready as-is.

`RECAPTCHA_SECRET_KEY` and `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` switch on the reCAPTCHA v2 checkbox and
its server-side verification. With them unset the form shows the placeholder slot and skips the
check. A small in-memory rate limit sits in front of both routes; it is per instance on serverless,
so add a platform rate limit for anything stronger.

## SEO

Per-page title, description, canonical and OG tags. `Organization` JSON-LD on Home, `Person` on each
partner card. `sitemap.xml` and `robots.txt` generate from `src/lib/site.ts`. The OG image is
generated at build time by `src/app/opengraph-image.tsx` from the Manrope files in `src/assets/`.

Set `NEXT_PUBLIC_SITE_URL` in production, otherwise metadata falls back to
`https://coastlinecatalyst.com`.

`NEXT_PUBLIC_GA_ID` and `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` are slots; nothing loads and no
cookies are written while they are blank.

## Accessibility

Semantic landmarks, one H1 per page, skip link, visible `2px` navy focus rings on every interactive
element, `aria-invalid` and `aria-describedby` wiring on form errors, `aria-current` on the active
nav item, full keyboard operation of the drag-and-drop upload zone, and the mobile panel closes on
Escape while locking the page behind it.

## Known deviation from the prototype

The hero H1 carries `max-width: 16ch` from the design file, so on a wide viewport
"generation of businesses." wraps and the headline sets on four lines rather than the three the
handoff describes. This matches the prototype exactly. Raising it to `max-width: 20ch` in
`src/components/home/Hero.module.css` gives the three-line setting if that was the intent.
