import {
  FACTOR_LABELS,
  SCORE_PENDING_CONFIDENCE,
  SCORE_PENDING_DATA,
  formatPoints,
  type ConfidenceLevel,
} from "@/lib/evidence-score";

export type EvidenceScoreView = {
  guest_sentiment_points: number | null;
  heating_points: number | null;
  pool_count_points: number | null;
  pool_size_points: number | null;
  external_recognition_points: number | null;
  total_points: number | null;
  score_out_of_ten: number | null;
  confidence_level: ConfidenceLevel;
  score_version: string;
  approved_by: string | null;
  approved_at: string | null;
};

const CONFIDENCE_COPY: Record<ConfidenceLevel, string> = {
  high: "High",
  medium: "Medium",
  low: "Low",
};

function formatDate(value?: string | null) {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

/**
 * The one public presentation of the Evidence-based Pool Score.
 * It never prints null, unknown, NaN or a technical status name.
 */
export function EvidenceScorePanel({
  record,
  lastVerified,
}: {
  record: EvidenceScoreView | null;
  lastVerified?: string | null;
}) {
  const approved = Boolean(record?.approved_by && record?.approved_at);
  const total = record?.total_points ?? null;
  const outOfTen = record?.score_out_of_ten ?? null;
  const confidence = record?.confidence_level ?? "low";
  const published = approved && total != null && outOfTen != null && confidence !== "low";

  const values: Record<string, number | null> = {
    guestSentimentPoints: record?.guest_sentiment_points ?? null,
    heatingPoints: record?.heating_points ?? null,
    poolCountPoints: record?.pool_count_points ?? null,
    poolSizePoints: record?.pool_size_points ?? null,
    externalRecognitionPoints: record?.external_recognition_points ?? null,
  };
  const factorsUsed = Object.values(values).filter((v) => v != null).length;
  const factorsTotal = FACTOR_LABELS.length;

  return (
    <div
      data-derived="evidence-score"
      data-score-version={record?.score_version ?? "evidence-v1"}
      className="rounded-lg border border-border/60 bg-surface/40"
    >
      <div className="flex items-baseline justify-between gap-4 border-b border-border/60 px-5 py-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.28em] text-primary">
            Evidence-based Pool Score
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Five measurable factors, scored from documented evidence only.
          </p>
        </div>
        {published ? (
          <p className="font-display text-3xl text-primary" data-evidence-score>
            {outOfTen!.toFixed(1)}
            <span className="text-sm text-muted-foreground">/10</span>
            <span className="ml-2 text-xs text-muted-foreground">
              {Math.round(total!)}/100
            </span>
          </p>
        ) : (
          <p className="max-w-[16rem] text-right text-xs text-muted-foreground" data-evidence-pending>
            {confidence === "low" && total != null ? SCORE_PENDING_CONFIDENCE : SCORE_PENDING_DATA}
          </p>
        )}
      </div>

      <table className="w-full text-sm">
        <tbody>
          {FACTOR_LABELS.map(({ key, label, max, hint }) => {
            const value = values[key] ?? null;
            const shown = formatPoints(value);
            const pct = value != null ? Math.max(0, Math.min(100, (value / max) * 100)) : 0;
            return (
              <tr key={key} className="border-t border-border/40 align-top">
                <td className="px-5 py-3">
                  <p className="text-foreground">{label}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>
                </td>
                <td className="w-[40%] px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-border/50">
                      <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="w-20 text-right tabular-nums text-foreground">
                      {shown ? (
                        <>
                          {shown}
                          <span className="text-muted-foreground">/{max}</span>
                        </>
                      ) : (
                        <span className="text-xs text-muted-foreground">Not confirmed</span>
                      )}
                    </span>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className="space-y-1 border-t border-border/40 px-5 py-3 text-xs text-muted-foreground">
        <p>
          Confidence: <span className="text-foreground">{CONFIDENCE_COPY[confidence]}</span>
        </p>
        {formatDate(lastVerified) && <p>Last verified: {formatDate(lastVerified)}</p>}
        {record?.approved_by && <p>Checked by: {record.approved_by}</p>}
        <p>Score version: {record?.score_version ?? "evidence-v1"}</p>
      </div>
    </div>
  );
}
