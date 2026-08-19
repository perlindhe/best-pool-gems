import { useState } from "react";
import { adminRunIntegrityChecks } from "@/lib/integrity.functions";

type Issue = {
  check: string;
  severity: "critical" | "warning" | "info";
  hotelId: string | null;
  hotel: string;
  slug: string | null;
  detail: string;
};

type Result = {
  checkedHotels: number;
  counts: { critical: number; warning: number; info: number };
  issues: Issue[];
};

const severityClass: Record<Issue["severity"], string> = {
  critical: "bg-destructive/15 text-destructive",
  warning: "bg-primary/15 text-primary",
  info: "bg-muted text-muted-foreground",
};

export function IntegrityPanel() {
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);
  const [checkLinks, setCheckLinks] = useState(false);
  const [filter, setFilter] = useState<"all" | Issue["severity"]>("all");
  const [error, setError] = useState<string | null>(null);

  const run = async () => {
    setLoading(true);
    setError(null);
    try {
      const r = await adminRunIntegrityChecks({ data: { checkLinks } });
      setResult(r as Result);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const issues = (result?.issues ?? []).filter((i) => filter === "all" || i.severity === filter);

  return (
    <div className="mt-8 rounded-lg border border-border/60 bg-surface/40 p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl">Data integrity</h2>
          <p className="text-xs text-muted-foreground">
            Duplicates, closed hotels, contradictory pool facts, score mismatches and missing trust data.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-xs text-muted-foreground">
            <input
              type="checkbox"
              checked={checkLinks}
              onChange={(e) => setCheckLinks(e.target.checked)}
            />
            Also check booking links
          </label>
          <button
            onClick={run}
            disabled={loading}
            className="rounded-full bg-primary px-4 py-2 text-xs uppercase tracking-[0.2em] text-primary-foreground disabled:opacity-50"
          >
            {loading ? "Running…" : "Run checks"}
          </button>
        </div>
      </div>

      {error && <p className="mt-4 text-xs text-destructive">{error}</p>}

      {result && (
        <>
          <div className="mt-6 flex flex-wrap gap-2 text-xs">
            {(["all", "critical", "warning", "info"] as const).map((k) => (
              <button
                key={k}
                onClick={() => setFilter(k)}
                className={`rounded-full px-3 py-1 uppercase tracking-[0.2em] ${
                  filter === k ? "bg-primary text-primary-foreground" : "border border-border"
                }`}
              >
                {k}
                {k !== "all" ? ` ${result.counts[k]}` : ` ${result.issues.length}`}
              </button>
            ))}
            <span className="self-center text-muted-foreground">
              {result.checkedHotels} hotels checked
            </span>
          </div>

          {issues.length === 0 ? (
            <p className="mt-6 text-sm text-muted-foreground">No issues in this category.</p>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-surface text-muted-foreground">
                  <tr className="text-left">
                    <th className="p-2">Severity</th>
                    <th className="p-2">Check</th>
                    <th className="p-2">Hotel</th>
                    <th className="p-2">Detail</th>
                  </tr>
                </thead>
                <tbody>
                  {issues.map((i, idx) => (
                    <tr key={`${i.check}-${i.hotelId}-${idx}`} className="border-t border-border/40">
                      <td className="p-2">
                        <span className={`rounded-full px-2 py-0.5 ${severityClass[i.severity]}`}>
                          {i.severity}
                        </span>
                      </td>
                      <td className="p-2 font-medium">{i.check}</td>
                      <td className="p-2">
                        {i.slug ? (
                          <a
                            href={`/hotels/${i.slug}`}
                            target="_blank"
                            rel="noreferrer"
                            className="underline underline-offset-2"
                          >
                            {i.hotel}
                          </a>
                        ) : (
                          i.hotel
                        )}
                      </td>
                      <td className="p-2 text-muted-foreground">{i.detail}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
