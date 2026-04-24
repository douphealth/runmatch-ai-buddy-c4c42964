import { Shoe } from './shoe-database';

/**
 * Deterministic Amazon product image CDN URL from an ASIN.
 * Format documented by Amazon Associates: images-na.ssl-images-amazon.com/images/P/{ASIN}.01._SL500_.jpg
 * Variants: SL500 (500px), SL300, SL160. Always returns the same URL for the same ASIN.
 */
export function amazonImageFromASIN(asin: string, size: 300 | 500 | 800 = 500): string {
  return `https://images-na.ssl-images-amazon.com/images/P/${asin}.01._SL${size}_.jpg`;
}

export type ImageSource = 'real-amazon' | 'real-local' | 'studio-frame';

export interface ResolvedShoeImage {
  url: string | null;
  source: ImageSource;
  label: string;
}

/**
 * Resolve the best available image for a shoe in priority order:
 *  1. Amazon CDN via ASIN (deterministic, accurate product photo)
 *  2. Local imageURL bundled with the project
 *  3. Studio frame (rendered fallback, no broken images)
 */
export function resolveShoeImage(shoe: Pick<Shoe, 'amazonASIN' | 'imageURL'>): ResolvedShoeImage {
  if (shoe.amazonASIN && shoe.amazonASIN.length >= 10) {
    return {
      url: amazonImageFromASIN(shoe.amazonASIN),
      source: 'real-amazon',
      label: 'Real Photo',
    };
  }
  if (shoe.imageURL && !shoe.imageURL.includes('placeholder')) {
    return {
      url: shoe.imageURL,
      source: 'real-local',
      label: 'Real Photo',
    };
  }
  return { url: null, source: 'studio-frame', label: 'Studio Frame' };
}
