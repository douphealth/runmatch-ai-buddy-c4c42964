# SEO Pre-rendering Plan — Indexable Public Result Pages

## Why this matters (the honest bit)

Today, every result URL like `/app/runmatch/neutral-10k-trail-high-arch?d=...` ships an **empty `<div id="root">`** to crawlers and social scrapers. Google can eventually JS-render it, but:
- Twitter/Facebook/LinkedIn/Slack/ChatGPT/Perplexity scrapers **don't run JS** → they see your generic site preview, not the per-shoe one
- The `?d=` base64 blob makes the slug effectively decorative — Google has no reason to crawl every variation
- JSON-LD (FAQ + Product schema) is injected *after* hydration → Google's first-pass indexer often misses it

After this plan: each canonical slug is a real static `.html` file with full content, per-page meta, OG image, and JSON-LD baked in. The quiz flow stays identical for users.

---

## Scope (approved)

- **Approach:** Full — static pre-rendering + slug-driven rendering + sitemap + OG fixes
- **Pages to pre-render (~50 canonical):**
  - All `distance × terrain` (5K/10K/half/marathon × road/trail) → ~8
  - All `pronation × distance` (4 × 5) → ~20
  - All `foot-type × terrain` (3 × 2) → ~6
  - High-value triples like `overpronation-marathon-road-flat`, `neutral-10k-trail-high-arch` → ~16
  - Total ~50 canonical URLs

---

## Step 1 — Make slugs lossless / self-sufficient

**File:** `src/lib/quiz-data.ts`

- Extend `generateSlug()` so the slug encodes enough to render without `?d=`. Current slug is `pronation-distance-terrain-footType` which is already enough for **a deterministic recommendation** if we add a new `answersFromSlug(slug)` function that fills sensible defaults for missing fields (mileage = 30, paceGoal = 'moderate', injuries = [], brand = [], budget = all).
- Add `answersFromSlug(slug: string): QuizAnswers | null` that parses the 4 known segments and returns a complete `QuizAnswers` object using defaults for the rest.
- Keep `encodeAnswers` / `decodeAnswers` exactly as-is for the quiz flow — `?d=` continues to override the slug-derived answers when present.

**File:** `src/pages/RunMatchResult.tsx`

- Update the `answers` `useMemo`: if `?d=` is present, use it (current behavior); **else** fall back to `answersFromSlug(slug)`. Pages now render with full content from the slug alone — no blank screen for crawlers or direct visitors.

## Step 2 — Per-page meta in HTML at build time

**Problem today:** `index.html` has hardcoded generic title/description/OG. JS swaps them in *after* render.

**Fix:** During pre-render (Step 4), generate one HTML file per canonical slug with:
- `<title>` from `generateMetaTitle(answers)`
- `<meta name="description">` from `generateMetaDescription(rec)`
- `<link rel="canonical" href="https://runmatch-ai-buddy.lovable.app/app/runmatch/{slug}">`
- Full OG + Twitter Card tags (`og:title`, `og:description`, `og:image` = recommended shoe image, `og:url`, `og:type=product`)
- Two `<script type="application/ld+json">` blocks: `FAQPage` + `Product` schema, generated from `generateFAQSchema` and `generateProductSchema` (already exist in `src/lib/seo.ts`)
- A `BreadcrumbList` JSON-LD block (already constructed in `RunMatchResult.tsx` — extract to `seo.ts`)

**File:** `src/lib/seo.ts` — add `generateBreadcrumbSchema(slug)` helper so both runtime and pre-render share the same source.

## Step 3 — Pre-rendered HTML body (real content, not empty root)

For each canonical slug, render the React tree to an HTML string at build time and inject it into `<div id="root">`. When a crawler fetches the URL it gets:
- Hero with shoe profile category + summary
- Top 5 shoes table (with brand, model, price, match score)
- Rotation (Daily/Speed/Long Run shoe names + reasoning)
- "Why this match works" prose
- FAQ block (visible Q&A — Google indexes both visible text and JSON-LD)
- Internal links to gearuptofit.com articles

When a real user lands, React hydrates on top — same UX, instant FCP.

## Step 4 — Build pipeline

**File:** `scripts/prerender.mjs` (new)

A Node script run after `vite build`:

1. Read `dist/index.html` template
2. Read `dist/assets/index-*.js` (the built React bundle)
3. For each canonical slug in `scripts/canonical-slugs.ts` (new — list of ~50 slugs):
   - Compute `answers = answersFromSlug(slug)`
   - Compute `recommendation`, `rotation`, `topShoes`, `faqs`
   - Use `react-dom/server`'s `renderToString` to render the `<RunMatchResult>` tree (route-mocked via `StaticRouter`)
   - Substitute the rendered HTML, per-page meta, and JSON-LD into the template
   - Write to `dist/app/runmatch/{slug}/index.html`
4. Generate `dist/sitemap.xml` listing all pre-rendered URLs + the homepage with `<lastmod>` = build date
5. Generate `dist/robots.txt` (extend existing) with `Sitemap: https://runmatch-ai-buddy.lovable.app/sitemap.xml`

**File:** `scripts/canonical-slugs.ts` (new)

Exports a typed array of the ~50 slug strings. Easy to extend later.

**File:** `package.json`

Update build script: `"build": "vite build && node scripts/prerender.mjs"`

**Dependencies to add:** none new — `react-dom/server` ships with React; `react-router-dom` already exports `StaticRouter`.

## Step 5 — Hosting behavior

Lovable's static host already serves `dist/app/runmatch/{slug}/index.html` directly when the path matches a real file (per the SPA-routing docs in the useful context). For unknown slugs (long-tail combos not in the canonical list), the SPA fallback serves `dist/index.html` and React renders client-side from the slug — same as today, just no longer reliant on `?d=` being present.

## Step 6 — Verification

After deploy:
1. `curl https://runmatch-ai-buddy.lovable.app/app/runmatch/overpronation-marathon-road-flat` — confirm full HTML body, meta tags, JSON-LD all present in raw response
2. Google Rich Results Test on 2–3 pre-rendered URLs — confirm FAQ + Product schema parse cleanly
3. Twitter Card Validator + Facebook Sharing Debugger on one URL — confirm per-shoe OG image
4. Submit `sitemap.xml` to Google Search Console
5. Smoke test the live quiz flow — confirm `?d=` still overrides slug defaults when a user completes the quiz

---

## Files touched

**Modified:**
- `src/lib/quiz-data.ts` — add `answersFromSlug()`
- `src/lib/seo.ts` — extract `generateBreadcrumbSchema()`
- `src/pages/RunMatchResult.tsx` — fall back to slug-derived answers when `?d=` missing
- `package.json` — chain prerender into build
- `public/robots.txt` — add `Sitemap:` directive

**New:**
- `scripts/prerender.mjs` — build-time renderer
- `scripts/canonical-slugs.ts` — list of ~50 indexable slugs

## Out of scope (deliberate)

- Migration to Next.js / Vike — overkill, large rewrite with no incremental benefit over static pre-render for this use case
- Pre-rendering all 10,000+ permutations — diminishing returns; long-tail combos still work via client render
- Edge-side on-demand SSR — adds infra complexity without measurable indexing benefit over static pre-render

## Risk / honest caveats

- Build time will increase by ~10–30s for 50 pages (acceptable).
- If the recommendation engine changes, re-running `vite build` regenerates all pre-rendered pages — no manual maintenance.
- Pre-rendered HTML reflects the engine's output **at build time**. If you tweak scoring weights, redeploy to refresh the static pages.
- The `?d=` blob staying in URLs from the live quiz means Google may see two URLs for the same logical page. Mitigation: the `<link rel="canonical">` we inject in Step 2 always points to the clean slug URL — Google will consolidate.
