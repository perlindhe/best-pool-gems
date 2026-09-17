import { Fragment, useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { installServerFnAuth } from "@/integrations/supabase/server-fn-auth";
import { SiteHeader } from "@/components/SiteHeader";
import { adminQaOverview, type QaRow } from "@/lib/qa.functions";

installServerFnAuth();

export const Route = createFileRoute("/admin/qa")({
  head: () => ({
    meta: [
      { title: "Data QA – Best Pool Hotels" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: QaPage,
});

const TEST_GROUP = [
  "bangkok-the-siam",
  "los-angeles-hotel-june-west-la",
  "barcelona-1898",
  "mallorca-hotel-can-bordoy-grand-house-and-garden",
  "sydney-park-hyatt-sydney",
];

type Scope =
  | "test"
  | "all"
  | "errors"
  | "conflicting"
  | "partial"
  | "pending"
  | "no_pool"
  | "hidden_score"
  | "no_source";

const SCOPES: Array<{ key: Scope; label: string }> = [
  { key: "test", label: "Test group (5)" },
  { key: "errors", label: "Blocking errors" },
  { key: "conflicting", label: "Conflicting" },
  { key: "partial", label: "Partially verified" },
  { key: "pending", label: "Research pending" },
  { key: "no_pool", label: "No pool" },
  { key: "hidden_score", label: "Score hidden" },
  { key: "no_source", label: "Missing official source" },
  { key: "all", label: "All hotels" },
];

function QaPage() {
  const [rows, setRows] = useState<QaRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [scope, setScope] = useState<Scope>("test");
  const [query, setQuery] = useState("");

  useEffect(() => {
    adminQaOverview()
      .then((r) => setRows(r.rows))
      .catch((e) => setError((e as Error).message));
  }, []);

  const visible = useMemo(() => {
    let list = rows;
    if (scope === "test") list = list.filter((r) => TEST_GROUP.includes(r.slug));
    if (scope === "errors") list = list.filter((r) => r.errors.length > 0);
    if (scope === "conflicting") list = list.filter((r) => r.status === "conflicting_data");
    if (scope === "partial") list = list.filter((r) => r.status === "partially_verified");
    if (scope === "pending") list = list.filter((r) => r.status === "research_pending");
    if (scope === "no_pool") list = list.filter((r) => r.status === "no_active_pool");
    if (scope === "hidden_score") list = list.filter((r) => r.score == null);
    if (scope === "no_source") list = list.filter((r) => !r.official_url);
    if (query.trim())
      list = list.filter((r) =>
        `${r.name} ${r.city} ${r.slug}`.toLowerCase().includes(query.toLowerCase()),
      );
    return list;
  }, [rows, scope, query]);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className="mx-auto max-w-[1400px] px-6 py-24">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-4xl">Data QA</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Internal overview of pool data, verification and score status. Not indexed.
            </p>
          </div>
          <Link to="/admin" className="text-xs uppercase tracking-[0.2em] text-primary">
            ← Admin
          </Link>
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-3 text-xs">
          {SCOPES.map(({ key: k, label }) => (
            <button
              key={k}
              onClick={() => setScope(k)}
              className={`rounded-full px-3 py-1 uppercase tracking-[0.2em] ${
                scope === k ? "bg-primary text-primary-foreground" : "border border-border"
              }`}
            >
              {label}
            </button>
          ))}
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search hotel"
            className="rounded-full border border-border bg-background px-3 py-1"
          />
          <span className="text-muted-foreground">{visible.length} shown</span>
        </div>

        {error && <p className="mt-6 text-sm text-destructive">{error}</p>}

        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-surface text-muted-foreground">
              <tr className="text-left">
                <th className="p-2">Hotel</th>
                <th className="p-2">Status</th>
                <th className="p-2">Pool status</th>
                <th className="p-2">Shared</th>
                <th className="p-2">Spa</th>
                <th className="p-2">Kids</th>
                <th className="p-2">Private</th>
                <th className="p-2">Jacuzzi</th>
                <th className="p-2">Heating</th>
                <th className="p-2">Season</th>
                <th className="p-2">Score</th>
                <th className="p-2">Ranked</th>
                <th className="p-2">Checked</th>
                <th className="p-2">Sources</th>
                <th className="p-2">Index</th>
                <th className="p-2">Missing</th>
                <th className="p-2">Blocking errors</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((r) => (
                <Fragment key={r.id}>
                <tr className="border-t border-border/40 align-top">
                  <td className="p-2">
                    <a
                      href={`/hotels/${r.slug}`}
                      target="_blank"
                      rel="noreferrer"
                      className="underline underline-offset-2"
                    >
                      {r.name}
                    </a>
                    <div className="text-muted-foreground">{r.city}</div>
                  </td>
                  <td className="p-2">{r.status.replace(/_/g, " ")}</td>
                  <td className="p-2">
                    {r.pool_status}
                    {r.qa_blocked ? " · blocked" : ""}
                  </td>
                  <td className="p-2">{r.derived_counts.sharedSwimmingPools}</td>
                  <td className="p-2">{r.derived_counts.spaPools}</td>
                  <td className="p-2">{r.derived_counts.childrenPools}</td>
                  <td className="p-2">{r.derived_counts.privatePoolCategories}</td>
                  <td className="p-2">{r.derived_counts.jacuzzis}</td>
                  <td className="p-2">{r.derived_heating}</td>
                  <td className="p-2">{r.derived_season}</td>
                  <td className="p-2">{r.score != null ? r.score.toFixed(1) : "pending"}</td>
                  <td className="p-2">{r.can_rank ? "yes" : "no"}</td>
                  <td className="p-2">{r.last_verified_date ?? "—"}</td>
                  <td className="p-2">
                    {r.official_url ? "official" : "—"}
                    {r.secondary_source_url ? " + second" : ""}
                  </td>
                  <td className="p-2">
                    {r.can_index ? "index" : "noindex, follow"}
                    {r.in_sitemap ? " · sitemap" : ""}
                    {r.can_publish ? "" : " · publish blocked"}
                  </td>
                  <td className="p-2 text-muted-foreground">{r.missing.join(", ") || "—"}</td>
                  <td className="p-2 text-destructive">{r.errors.join("; ") || "—"}</td>
                </tr>
                {/* Raw pool records, so a conflict can be traced to its source */}
                <tr className="border-t border-border/20 bg-surface/40">
                  <td className="p-2 text-muted-foreground" colSpan={17}>
                    {r.pools.length === 0
                      ? "No pool records"
                      : r.pools
                          .map(
                            (p) =>
                              `${p.pool_name || "(unnamed)"} · ${p.pool_category} · ${p.shared_or_private ?? "?"} · ${p.indoor ? "indoor" : p.outdoor ? "outdoor" : "location ?"} · heating ${p.heating_state ?? "?"} · season ${p.season_state ?? "?"}`,
                          )
                          .join("   |   ")}
                  </td>
                </tr>
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
