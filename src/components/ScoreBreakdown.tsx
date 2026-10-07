
type SourceRow = { source: string; normalized: number; rating_count: number };

const SOURCE_LABELS: Record<string, string> = {
  google: "Google",
  tripadvisor: "TripAdvisor",
  booking: "Booking.com",
  hotels_com: "Hotels.com",
};

// Default weights from scoring_settings (renormalized over present sources)
const DEFAULT_META_WEIGHTS: Record<string, number> = {
  google: 0.35,
  tripadvisor: 0.25,
  booking: 0.25,
  hotels_com: 0.15,
};


export function MetaRatingBreakdown({
  metaRating,
  confidence,
  sources,
}: {
  metaRating: number | null;
  confidence: number | null;
  sources: SourceRow[];
}) {
  if (!sources.length) return null;

  const present = sources.filter((s) => s.normalized > 0);
  const totalWeight = present.reduce(
    (sum, s) => sum + (DEFAULT_META_WEIGHTS[s.source] ?? 0),
    0,
  );
  const rows = present.map((s) => {
    const baseWeight = DEFAULT_META_WEIGHTS[s.source] ?? 0;
    const weight = totalWeight > 0 ? baseWeight / totalWeight : 0;
    return {
      ...s,
      weight,
      contribution: s.normalized * weight,
    };
  });

  return (
    <div className="rounded-lg border border-border/60 bg-surface/40">
      <div className="flex items-baseline justify-between gap-4 border-b border-border/60 px-5 py-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.28em] text-primary">
            How the meta rating is built
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            A weighted blend of every guest-rating source we track, normalized
            to a 0–100 scale.
          </p>
        </div>
        <p className="font-display text-3xl text-primary">
          {metaRating != null ? Math.round(metaRating) : "—"}
          <span className="text-sm text-muted-foreground">/100</span>
        </p>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            <th className="px-5 py-3 font-normal">Source</th>
            <th className="px-5 py-3 font-normal">Rating</th>
            <th className="px-5 py-3 font-normal">Reviews</th>
            <th className="px-5 py-3 font-normal">Weight</th>
            <th className="px-5 py-3 font-normal text-right">Contribution</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.source} className="border-t border-border/40">
              <td className="px-5 py-3 text-foreground">
                {SOURCE_LABELS[r.source] ?? r.source}
              </td>
              <td className="px-5 py-3 tabular-nums text-foreground">
                {(r.normalized / 20).toFixed(1)}
                <span className="text-muted-foreground">★</span>
              </td>
              <td className="px-5 py-3 tabular-nums text-muted-foreground">
                {r.rating_count > 0 ? r.rating_count.toLocaleString("en-US") : "—"}
              </td>
              <td className="px-5 py-3 tabular-nums text-muted-foreground">
                {Math.round(r.weight * 100)}%
              </td>
              <td className="px-5 py-3 text-right tabular-nums text-foreground">
                {Math.round(r.contribution)}
                <span className="text-muted-foreground">/100</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {confidence != null && (
        <div className="border-t border-border/40 px-5 py-3 text-xs text-muted-foreground">
          Confidence in this rating:{" "}
          <span className="text-foreground">{Math.round(confidence)}/100</span>{" "}
          — based on review volume across sources.
        </div>
      )}
    </div>
  );
}
