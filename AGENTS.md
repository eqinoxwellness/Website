# AGENTS.md — Equinox Aesthetic & Wellness Centre website

Standing instructions for any AI agent working in this repository. Read this before changing anything.

## What this project is

Marketing website for a doctor-led aesthetic and wellness clinic in Satya Nagar, Bhubaneswar. It is the landing destination for Google Search ads, Meta ads, Google Maps and Instagram. Its one job: move a visitor to a WhatsApp message or a call-back request, while staying inside Indian healthcare advertising rules.

Stack: Astro (static output) + React islands only for the lead form and concern finder + vanilla CSS + vanilla TypeScript for tracking + one Vercel serverless route (`/api/lead`). No CSS framework, no state library, no UI kit.

## Commands

```bash
npm install
npm run dev          # http://localhost:4321
npm run preflight    # compliance check (also runs automatically before build)
npm run build        # must pass before any commit
npm run og           # regenerate social images (needs the brand fonts in fontconfig)
```

## Where things live

| Need | File |
|---|---|
| Clinic facts: address, hours, phone, doctor, fee | `src/config/site.ts` |
| All service page copy, FAQs, WhatsApp messages | `src/data/services.ts` |
| Home page FAQs | `src/data/faqs.ts` |
| Design tokens and all styling | `src/styles/global.css` |
| Tracking, consent, journey capture | `src/lib/analytics.ts` |
| Structured data (JSON-LD) | `src/lib/schema.ts` |
| Head, SEO tags, consent bootstrap | `src/layouts/Base.astro` |
| Lead endpoint: validation, Sheet, Meta CAPI | `src/pages/api/lead.ts` |
| Google Sheet + email backend | `apps-script/Code.gs` |
| Brand mark, wordmark, gradients | `src/components/Mark.astro`, `Wordmark.astro`, `SunMoon.astro`, `BrandDefs.astro` |

Service pages, the menu, the sitemap, `llms.txt` and structured data are all generated from `services.ts`. Add or remove a service there, never by creating a new page file.

## Hard rules

1. **Never write claim words into copy.** Banned: best, No.1, number one, guarantee, permanent, cure, miracle, painless, 100%, side-effect free, results assured, fairness, whitening. `npm run preflight` fails the build on these. Do not weaken or bypass the check. Describe the clinic's process, never promise an outcome.
2. **Never invent clinic facts.** Doctor's qualification, registration, fees, timings, services, testimonials and statistics come only from the client. Unconfirmed fields are `null` with a `// CONFIRM:` comment; leave them until a human fills them.
3. **No health detail ever goes to an ad platform.** Meta receives a hashed phone number only. Do not add the concern, service, page topic or form contents to any pixel, conversion or custom audience payload.
4. **Nothing third-party loads before consent.** All tags load inside `applyConsent()` in `analytics.ts`. Do not add a `<script src>` for any analytics, ads, chat, font or embed service anywhere else.
5. **Protect the Lighthouse scores** (100 across the board on mobile and desktop). That means: no web font requests to third-party domains, no UI or animation libraries, no map or video embeds, no React on pages that do not already have an island, explicit width and height on every image, and no layout that shifts after load. Run a Lighthouse check after any change to the layout, fonts or scripts.
6. **Secrets stay in env vars.** Never hardcode an ID, token or webhook URL. Public browser values use the `PUBLIC_` prefix; everything else is server-only in `src/pages/api/`.
7. **Accessibility is not optional.** Labelled inputs, visible focus, heading order, contrast at least 4.5:1 for body text. Gold (`--horizon`) is decorative only on ivory; use `--gold-deep` when gold must carry text.
8. **Keep edits surgical.** Change the smallest area that solves the task. Do not reformat, rename or restructure files you were not asked to touch, and do not upgrade dependencies as a side effect.

## Before you finish a task

- `npm run build` passes.
- New copy reads like the existing copy: plain, calm, process-focused, Indian English, sentence case.
- If you changed anything a visitor sees, say what to re-check manually.
- If a request conflicts with a rule above, stop and say so instead of working around it.
