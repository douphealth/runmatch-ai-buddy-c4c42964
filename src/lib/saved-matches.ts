/**
 * Saved matches — local-first persistence of a runner's previous quiz results.
 *
 * Stored in localStorage under a single versioned key. Each entry is a slug
 * plus a minimal label/timestamp so the home page can offer one-tap recall
 * without any backend round-trip. Bounded to 5 most-recent entries.
 */

const STORAGE_KEY = 'runmatch.saved.v1';
const MAX_ENTRIES = 5;

export interface SavedMatch {
  slug: string;
  url: string;          // full path incl. ?d= payload when available
  label: string;        // human-readable e.g. "Nike Pegasus 41"
  subtitle?: string;    // e.g. "Daily Trainer · Half Marathon"
  matchPercent?: number;
  savedAt: number;      // epoch ms
}

const isBrowser = () => typeof window !== 'undefined' && !!window.localStorage;

function read(): SavedMatch[] {
  if (!isBrowser()) return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? (arr as SavedMatch[]) : [];
  } catch {
    return [];
  }
}

function write(entries: SavedMatch[]) {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries.slice(0, MAX_ENTRIES)));
    window.dispatchEvent(new CustomEvent('runmatch:saved-changed'));
  } catch {
    /* quota / private mode — silently ignore */
  }
}

export function getSavedMatches(): SavedMatch[] {
  return read().sort((a, b) => b.savedAt - a.savedAt);
}

export function saveMatch(entry: Omit<SavedMatch, 'savedAt'>): void {
  const existing = read().filter((m) => m.slug !== entry.slug);
  write([{ ...entry, savedAt: Date.now() }, ...existing]);
}

export function removeMatch(slug: string): void {
  write(read().filter((m) => m.slug !== slug));
}

export function clearSavedMatches(): void {
  if (!isBrowser()) return;
  window.localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new CustomEvent('runmatch:saved-changed'));
}
