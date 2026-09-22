# Equinox Aesthetic & Wellness Centre — website

Static Astro site with React islands, a consent-gated measurement layer, and one serverless route that sends leads to a Google Sheet and email. Lighthouse 13: 100 in Performance, Accessibility, Best Practices and SEO on mobile and desktop.

The full spec the site was built against is in [`BUILD_PROMPT.md`](BUILD_PROMPT.md).

## Run locally

```bash
npm install
npm run dev          # http://localhost:4321  (form works in dev mode without Apps Script)
npm run build        # preflight → build → security headers
```

`npm run preflight` runs automatically before every build. It **fails** on high-risk claim words (best, guarantee, permanent, cure, 100% …) and **lists** facts Equinox has not confirmed yet. For the production go-live run `STRICT=1 npm run build`, which fails until every item is cleared.

## Deploy: GitHub → Vercel

```bash
git remote add origin https://github.com/<you>/equinox-website.git
git push -u origin main
```

1. vercel.com → Add New → Project → import the repo. Framework preset: **Astro** (auto-detected). No build settings to change.
2. Settings → Environment Variables: add the variables below, then Redeploy.
3. Settings → Domains: add the clinic domain. Then set `SITE_URL=https://www.<domain>` and redeploy so canonicals, sitemap and Open Graph URLs use it. Until then the site uses the Vercel production URL automatically.

## Environment variables

| Variable | Where it comes from | Needed for |
|---|---|---|
| `APPS_SCRIPT_URL` | Apps Script → Deploy → Web app URL (`/exec`) | Leads to Sheet + email |
| `APPS_SCRIPT_SECRET` | Any long random string, same as the Script property `SECRET` | Leads |
| `PUBLIC_GA4_ID` | GA4 → Admin → Data streams → Web → Measurement ID (`G-…`) | Analytics |
| `PUBLIC_CLARITY_ID` | clarity.microsoft.com → Settings → Setup → Project ID | Heatmaps, recordings |
| `PUBLIC_GADS_ID` | Google Ads → Goals → Conversions → tag setup (`AW-…`) | Ads conversions |
| `PUBLIC_GADS_LEAD_LABEL` | Label of the "Website lead" conversion action | Form conversion |
| `PUBLIC_GADS_WHATSAPP_LABEL` | Label of the "WhatsApp click" conversion action | WhatsApp conversion |
| `PUBLIC_GADS_CALL_LABEL` | Label of the "Call click" conversion action | Call conversion |
| `PUBLIC_META_PIXEL_ID` | Meta Events Manager → Data source ID | Pixel |
| `META_CAPI_TOKEN` | Events Manager → Settings → Conversions API → Generate access token | Server-side Lead |
| `META_TEST_EVENT_CODE` | Events Manager → Test events (remove after testing) | Testing only |
| `PUBLIC_GSC_VERIFICATION` | Search Console → HTML tag method → `content` value | Search Console |
| `PUBLIC_BING_VERIFICATION` | Bing Webmaster → HTML meta tag → `content` value | Bing |
| `PUBLIC_CLINIC_EMAIL`, `PUBLIC_INSTAGRAM_URL` | Equinox | Footer, schema, privacy policy |
| `PUBLIC_GTM_ID` | Optional. Only if you want GTM too; do not add GA4/Ads/Pixel inside it or they will double count | Extra tags |
| `SITE_URL` | Your final domain | Canonical URLs |

Any tool whose ID is empty is simply switched off.

## Lead inbox: Google Sheet + email

Follow the steps at the top of [`apps-script/Code.gs`](apps-script/Code.gs). In short: new Google Sheet → Extensions → Apps Script → paste → set Script properties `SECRET` and `NOTIFY_EMAIL` → run `setup()` once → Deploy as Web app (Execute as: Me, Access: Anyone) → put the URL in `APPS_SCRIPT_URL`.

Each lead lands as one row with 36 columns: lead ID (`EQX-YYMM-NNN`), name, mobile, consultation, preferred time, last-touch source / medium / campaign / keyword / ad content / GCLID / FBCLID, first-touch source and landing page, pages viewed, sections read, max scroll, seconds on site, device, then Status / Grade / Owner / reply and appointment columns for the team. The clinic gets an email with a one-tap WhatsApp reply button. If the Sheet is unreachable, the form tells the visitor to use WhatsApp and the full lead is written to the Vercel function log (`LEAD_SHEET_FAILED`).

## Connect the tools

**Search Console.** Add a Domain property (DNS TXT at the registrar) or a URL-prefix property with the HTML tag (`PUBLIC_GSC_VERIFICATION`). Submit `https://<domain>/sitemap-index.xml`. Then Bing Webmaster → Import from Search Console.

**GA4.** Create the property (time zone India, currency INR). Mark `generate_lead`, `whatsapp_click` and `call_click` as key events. Link GA4 to Google Ads (Admin → Product links). Link Clarity to GA4 from Clarity settings.

**Google Ads.** Create three website conversion actions: Website lead (primary, count One), WhatsApp click (primary during the no-website-form phase, count One), Call click (secondary). Put each label in its env var. Turn on enhanced conversions for leads; the site sends the visitor's phone number with the lead conversion. Because the site fires Ads conversions directly, do **not** also import the same GA4 key events as primary, or leads will be counted twice. Final URL suffix for every campaign:

```
utm_source=google&utm_medium=cpc&utm_campaign={campaignid}&utm_term={keyword}&utm_content={creative}
```

**Meta.** Create the Pixel, generate a Conversions API token, and verify the domain in Business settings → Brand safety → Domains. Browser `Lead` and server `Lead` share one `event_id`, so Meta deduplicates them. Test with `META_TEST_EVENT_CODE`, then remove it. URL parameters for every ad:

```
utm_source=meta&utm_medium=paid&utm_campaign={{campaign.name}}&utm_term={{adset.name}}&utm_content={{ad.name}}
```

**Clarity.** Settings → Masking → Strict. The form is already marked `data-clarity-mask`.

## What gets measured

| Question | Where to see it |
|---|---|
| Where did they come from? | GA4 Traffic acquisition; Sheet columns Source / Medium / Campaign / Keyword. AI assistants (ChatGPT, Perplexity, Gemini, Copilot, Claude) appear with medium `ai-assistant` |
| How far did they scroll, what did they read? | GA4 events `scroll_depth` (25/50/75/90) and `section_read` (section in view 3s+); Clarity heatmaps and recordings |
| What did they click? | `whatsapp_click`, `call_click`, `directions_click`, `faq_open`, `outbound_click`, each with `cta_location` |
| Which visitor became which lead? | The Sheet row carries that visitor's full journey |
| What is happening right now? | GA4 → Reports → Realtime, and Clarity live recordings. Google Ads conversion columns update with a delay of a few hours, not in real time |

Visitors stay anonymous unless they submit the form. Nothing optional loads before consent, which is also why Lighthouse scores 100: lab runs never grant consent. Real visitors who allow tracking load the extra tags a moment after the page is idle.

## Privacy rules built in

- Ad platforms never receive the consultation topic, form contents or any health detail. Meta Conversions API gets a hashed phone number only, and only if the visitor allowed marketing cookies.
- `concern_finder_result` (which concern a visitor picked) goes to GA4 and Clarity only. Do not use it to build Google Ads or Meta audiences; both platforms restrict personalised ads based on health information. Check their current policies before building remarketing lists from service-page visitors.
- Never upload patient or lead lists as custom audiences.

## Before running ads

1. Fill every `// CONFIRM:` line in `src/config/site.ts`: doctor's full name, qualification, registration, a one-line focus, a real photo (`/public/doctor.jpg`, 800×1000), consultation fee and length, clinic email, retention period.
2. In `src/data/services.ts`, set `verified: true` on each service Equinox confirms. Delete any service they do not offer; its page, sitemap entry, menu link and `llms.txt` line disappear with it.
3. `STRICT=1 npm run build` must pass.
4. Have the privacy policy and terms reviewed by a lawyer.

## Editing content

All clinic facts live in `src/config/site.ts`; all service copy, FAQs and WhatsApp messages live in `src/data/services.ts`; home FAQs in `src/data/faqs.ts`. Every page, the structured data, `llms.txt` and the Open Graph images read from these files. After changing a service name, regenerate social images with `npm run og` (needs the Marcellus and Source Sans 3 TTF fonts available to fontconfig).

## Re-running Lighthouse

```bash
npm run build
npx serve .vercel/output/static -l 4400
npx lighthouse http://localhost:4400/ --view
npx lighthouse http://localhost:4400/ --preset=desktop --view
```
