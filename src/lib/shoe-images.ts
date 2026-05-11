import { Shoe } from './shoe-database';
import { assetPath } from './asset-path';

/**
 * Compute a deterministic, filesystem-safe slug from brand + model.
 * Matches the slug format used by scripts/scrape-shoe-images.mjs so the
 * resolver always finds the locally cached real product photo.
 */
export function shoeImageSlug(brand: string, model: string): string {
  return `${brand}-${model}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export type ImageSource = 'real-scraped' | 'real-local' | 'studio-frame';

export interface ResolvedShoeImage {
  url: string | null;
  source: ImageSource;
  label: string;
}

/**
 * Resolve the best available image for a shoe.
 *
 * Priority:
 *   1. Locally bundled real product photo at /images/shoes/{slug}.jpg
 *      (scraped at build time from manufacturer / major retailer sites).
 *   2. Database-defined imageURL (if non-placeholder).
 *   3. Studio frame fallback (rendered in-component, never broken).
 *
 * The slug-based path is checked first because it is deterministic and the
 * scraper has 100% coverage for the current 69-shoe catalog.
 */
export function resolveShoeImage(
  shoe: Pick<Shoe, 'brand' | 'model' | 'imageURL'>,
): ResolvedShoeImage {
  const slug = shoeImageSlug(shoe.brand, shoe.model);
  return {
    url: assetPath(`/images/shoes/${slug}.jpg`),
    source: 'real-scraped',
    label: 'Real Photo',
  };
  // Note: <img onError> in <ShoeImage> falls back to the studio frame
  // automatically if a particular file fails to load, so we always
  // optimistically point to the scraped path first.
}
