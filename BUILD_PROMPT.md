# Build prompt — Equinox Aesthetic & Wellness Centre website

Use this prompt as-is to rebuild or extend the site with any capable AI coding agent.

---

## Role

You are a senior front-end engineer and conversion-focused designer building the official website of **Equinox Aesthetic & Wellness Centre**, a doctor-led aesthetic and wellness clinic in Satya Nagar, Bhubaneswar, Odisha, India. The site is the landing destination for Google Search ads, Meta ads, Google Maps and Instagram traffic. Its one job: move a visitor from "who is this clinic?" to "I'll message them on WhatsApp for a consultation", while staying fully compliant with Indian healthcare advertising law.

## Verified business facts (do not invent anything beyond these)

- Name: EQUINOX Aesthetic and Wellness Centre
- Address: Plot No. 69, 1st Floor, Kali Mandir Road, Satya Nagar, Bhubaneswar, Odisha 751007. Landmark: above Sweekruti Creations
- Coordinates: 20.2829335, 85.8464242
- Phone / WhatsApp: +91 63725 28534
- Hours: 11:00–20:00, open Saturday to Thursday, **closed Friday**
- Clinician named in public Google reviews: Dr Heena (full name, qualification and registration **not yet confirmed**)
- Service categories (all **unconfirmed** until Equinox signs off): acne, pigmentation, skin rejuvenation, hair fall and scalp, women's and hormonal wellness, weight management, general wellness, mental wellness, homeopathy

Anything unconfirmed lives in one config file with an explicit flag, and a preflight script lists it before every build. Never fabricate a qualification, registration number, fee, testimonial, statistic or result.

## Stack

- **Astro** (static output, zero JavaScript by default) + **React islands** only where interactivity earns it (lead form, concern finder)
- **Vanilla CSS** with design tokens as custom properties — no CSS framework
- **Vanilla TypeScript** for analytics, consent, scroll and section tracking
- **Vercel** adapter: every page prerendered; one on-demand serverless route `/api/lead`
- Self-hosted fonts via Fontsource (no Google Fonts request)
- Deployed from GitHub to Vercel; site URL taken from `VERCEL_PROJECT_PRODUCTION_URL` automatically

## Pages

`/` home · `/acne` · `/pigmentation` · `/skin-rejuvenation` · `/hair` · `/womens-wellness` · `/weight-management` · `/homeopathy` · `/wellness` (general + mental wellness) · `/about-the-doctor` · `/contact` · `/thank-you` (noindex, fires conversions once) · `/privacy-policy` · `/terms` · `/404`

Service pages are generated from a single data file so every page follows the same order: what the consultation covers → who you will see → what it costs → what happens next → honest expectations → FAQ → location and hours.

## Design direction

The name is the idea: an equinox is the moment day and night are equal. The site is literally half light, half dusk.

- Palette: Porcelain `#F5F6F3` (day), Dusk `#1E2240` (night), Twilight `#5B5F8A`, Horizon brass `#D9A55B` (the equinox line, used sparingly), Ink text `#2C3048`, WhatsApp green `#1D6B52` (functional only)
- Type: Marcellus (inscriptional serif, display only) + Source Sans 3 (body). Sentence case everywhere. No all-caps labels, no arrows appended to links, no middle-dot meta strings
- Hero: split field — day side carries the headline and CTAs, dusk side carries a half-lit disc and the clinic's facts. One orchestrated motion: the disc's terminator line settles into balance on load; disabled under reduced motion
- Services shown as a typographic index grouped by category, not a grid of identical cards
- Mobile first; sticky WhatsApp + Call bar on small screens

## Performance and quality targets

- Lighthouse 100 in Performance, Accessibility, Best Practices and SEO on mobile and desktop
- No third-party script loads before consent; trackers load after consent and after the page is idle
- LCP under 1.5s on the lab mobile profile, CLS 0, no render-blocking font or CSS beyond the critical inline CSS
- Native HTML for interaction wherever possible: `<details>` for FAQs, `popover` for the mobile menu
- WCAG AA contrast, visible focus, skip link, landmarks, labelled form controls

## Search, answer-engine and generative-engine optimisation

- Unique title and description per page, canonical, Open Graph and Twitter cards with a 1200×630 image per page (SMO)
- JSON-LD: `MedicalClinic` (address, geo, hours with Friday closed, phone, area served), `WebSite`, `BreadcrumbList`, `FAQPage` per page, `Service` per service page, `Physician` only once credentials are confirmed
- AEO: every FAQ answer opens with a one-sentence direct answer, questions phrased the way people ask them
- GEO: `/llms.txt` generated from the same service data; `robots.txt` explicitly allows AI crawlers (GPTBot, ClaudeBot, PerplexityBot, Google-Extended, Applebot-Extended) and lists the sitemap
- `sitemap-index.xml` via the Astro sitemap integration
- Local SEO: identical name, address and phone everywhere; service area described in prose; **no thin per-locality doorway pages**
- Search Console and Bing Webmaster verification via env-driven meta tags

## Measurement

- Consent banner (Digital Personal Data Protection Act, 2023): necessary / analytics / marketing, default off, choice remembered, changeable from the footer
- After consent: GA4, Google Ads (with enhanced conversions), Meta Pixel, Microsoft Clarity (heatmaps and recordings with inputs masked), optional Google Tag Manager — all IDs from env vars
- Events: `whatsapp_click`, `call_click`, `directions_click`, `form_start`, `generate_lead`, `scroll_depth` (25/50/75/90), `section_read` (section visible 50%+ for 3s+, with seconds), `faq_open`, `concern_finder_result`
- First-party journey capture in `sessionStorage`: first-touch and last-touch UTMs, gclid/fbclid/msclkid, referrer, landing page, pages viewed, max scroll, sections read, time to lead. Sent **only** when a visitor submits the form with explicit consent
- `/thank-you` fires the Google Ads and Meta Lead conversions exactly once, deduplicated with the server-side Meta Conversions API event via a shared `event_id`

## Lead pipeline

Form (name, mobile, concern, preferred time, consent) → `/api/lead` on Vercel → validates, honeypot + timing spam check → Google Apps Script web app appends a row to a Google Sheet (with the full journey) and emails the clinic a summary with a one-tap WhatsApp reply link → Meta Conversions API `Lead` with hashed phone only. **No health detail ever goes to an ad platform.**

## Compliance rules (enforced by `npm run preflight`, which runs before every build)

- Banned in all copy: best, No.1, number one, guarantee/guaranteed, permanent, cure, miracle, painless, 100%, side-effect free, results assured, fairness, whitening
- Describe the clinic's process, never the visitor's body. No "Do you have…", "Are you suffering…"
- Every service page carries an honest-expectations block: outcomes vary from person to person
- No before-and-after images, no testimonials without written consent
- Build fails on a banned word; unconfirmed facts produce warnings, and `STRICT=1` turns them into failures for the production go-live
