import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Clock, X, ArrowRight } from 'lucide-react';
import { getSavedMatches, removeMatch, type SavedMatch } from '@/lib/saved-matches';
import { track } from '@/lib/analytics';

/**
 * Renders the runner's recently-saved matches when localStorage has any.
 * Hidden entirely on first visit so the home page stays unchanged for new users.
 */
const SavedMatches = () => {
  const [matches, setMatches] = useState<SavedMatch[]>([]);

  useEffect(() => {
    const refresh = () => setMatches(getSavedMatches());
    refresh();
    window.addEventListener('runmatch:saved-changed', refresh);
    window.addEventListener('storage', refresh);
    return () => {
      window.removeEventListener('runmatch:saved-changed', refresh);
      window.removeEventListener('storage', refresh);
    };
  }, []);

  if (!matches.length) return null;

  return (
    <section
      className="relative z-10 px-4 md:px-8 py-10 bg-background border-t border-border/40"
      aria-label="Your saved matches"
    >
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-4 h-4 text-primary" />
          <h2 className="text-lg md:text-xl font-display font-bold uppercase tracking-wider">
            Pick up where you left off
          </h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {matches.map((m) => (
            <div
              key={m.slug}
              className="group relative rounded-xl p-4 bg-card/40 border border-border/60 hover:border-primary/40 hover:bg-card/60 transition-all"
            >
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  removeMatch(m.slug);
                }}
                aria-label={`Remove ${m.label}`}
                className="absolute top-2 right-2 w-6 h-6 rounded-full bg-background/60 border border-border/60 flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/40 opacity-0 group-hover:opacity-100 transition"
              >
                <X className="w-3 h-3" />
              </button>
              <Link
                to={m.url}
                onClick={() => track.ctaClick('saved_match_open', 'home_saved_matches')}
                className="block pr-6"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs uppercase tracking-wider text-muted-foreground">
                    {new Date(m.savedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </span>
                  {typeof m.matchPercent === 'number' && (
                    <span className="text-xs font-bold text-primary">{m.matchPercent}% match</span>
                  )}
                </div>
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <div className="font-semibold truncate group-hover:text-primary transition">{m.label}</div>
                    {m.subtitle && (
                      <div className="text-xs text-muted-foreground truncate">{m.subtitle}</div>
                    )}
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition flex-shrink-0" />
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SavedMatches;
