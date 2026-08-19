import { POOL_CRITERIA, POOL_WEIGHTS, toCanonicalComponents } from "@/lib/scoring";

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

export function PoolScoreBreakdown({
  total,
  components,
}: {
  total: number | null;
  components: Record<string, number> | null;
}) {
  if (!components) return null;
  const canonical = toCanonicalComponents(components);
  return (
    <div className="rounded-lg border border-border/60 bg-surface/40">
      <div className="flex items-baseline justify-between gap-4 border-b border-border/60 px-5 py-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.28em] text-primary">
            How the pool score is built
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Five criteria, each rated 0–10, combined with fixed weights into a final 0–10 Pool Score.
          </p>
        </div>
        <p className="font-display text-3xl text-primary">
          {total != null ? total.toFixed(1) : "—"}
          <span className="text-sm text-muted-foreground">/10</span>
        </p>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            <th className="px-5 py-3 font-normal">Criterion</th>
            <th className="px-5 py-3 font-normal">Score</th>
            <th className="px-5 py-3 font-normal">Weight</th>
          </tr>
        </thead>
        <tbody>
          {POOL_CRITERIA.map(({ key, label, hint }) => {
            const value = Number(canonical[key] ?? 0);
            const pct = Math.max(0, Math.min(100, (value / 10) * 100));
            const weightPct = Math.round(POOL_WEIGHTS[key] * 100);
            return (
              <tr key={key} className="border-t border-border/40 align-top">
                <td className="px-5 py-3">
                  <p className="text-foreground">{label}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>
                </td>
                <td className="w-[40%] px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-border/50">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="w-14 text-right tabular-nums text-foreground">
                      {value.toFixed(1)}
                      <span className="text-muted-foreground">/10</span>
                    </span>
                  </div>
                </td>
                <td className="px-5 py-3 text-muted-foreground">{weightPct}%</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

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
