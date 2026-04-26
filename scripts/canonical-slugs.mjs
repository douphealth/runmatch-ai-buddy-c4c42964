/**
 * Canonical pre-rendered URLs.
 *
 * Each entry is a slug in the form `{pronation}-{distance}-{terrain}-{footType}`
 * matching `generateSlug()` / `answersFromSlug()` in src/lib/quiz-data.ts.
 *
 * Goal: cover the highest-search-volume runner archetypes without bloating
 * the build. ~50 pages is the sweet spot for canonical SEO surface area.
 *
 * Long-tail combinations not listed here still work — they fall back to the
 * SPA shell and React renders client-side from the slug.
 */

export const CANONICAL_SLUGS: string[] = [
  // === Distance × Terrain (broad searcher intent) ===
  'neutral-5k-road-neutral',
  'neutral-10k-road-neutral',
  'neutral-half-marathon-road-neutral',
  'neutral-marathon-road-neutral',
  'neutral-5k-trail-neutral',
  'neutral-10k-trail-neutral',
  'neutral-half-marathon-trail-neutral',
  'neutral-marathon-trail-neutral',

  // === Pronation × Distance (biomechanics-driven searches) ===
  'overpronation-5k-road-neutral',
  'overpronation-10k-road-neutral',
  'overpronation-half-marathon-road-neutral',
  'overpronation-marathon-road-neutral',
  'overpronation-ultra-trail-neutral',

  'underpronation-5k-road-neutral',
  'underpronation-10k-road-neutral',
  'underpronation-half-marathon-road-neutral',
  'underpronation-marathon-road-neutral',
  'underpronation-10k-trail-neutral',

  'neutral-ultra-trail-neutral',
  'neutral-mixed-mixed-neutral',

  // === Foot type × Terrain (shoe-fit searches) ===
  'neutral-10k-road-flat',
  'neutral-half-marathon-road-flat',
  'neutral-marathon-road-flat',
  'neutral-10k-road-high-arch',
  'neutral-half-marathon-road-high-arch',
  'neutral-marathon-road-high-arch',
  'neutral-10k-road-wide',
  'neutral-half-marathon-road-wide',
  'neutral-marathon-road-wide',
  'neutral-10k-trail-wide',

  // === High-value triples (real-world archetypes) ===
  'overpronation-marathon-road-flat',
  'overpronation-half-marathon-road-flat',
  'overpronation-10k-road-flat',
  'underpronation-marathon-road-high-arch',
  'underpronation-half-marathon-road-high-arch',
  'underpronation-10k-road-high-arch',
  'neutral-10k-trail-high-arch',
  'neutral-marathon-trail-high-arch',
  'neutral-ultra-trail-high-arch',
  'neutral-marathon-road-wide',
  'overpronation-marathon-road-wide',
  'neutral-half-marathon-trail-neutral',
  'neutral-mixed-road-neutral',
  'neutral-mixed-trail-neutral',

  // === Track / speed-focused ===
  'neutral-5k-track-neutral',
  'neutral-10k-track-neutral',
  'neutral-5k-track-high-arch',

  // === Treadmill / mixed ===
  'neutral-mixed-mixed-flat',
  'overpronation-mixed-mixed-neutral',
];
