import { useEffect, useMemo, useRef, useState } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { installServerFnAuth } from "@/integrations/supabase/server-fn-auth";
import { SiteHeader } from "@/components/SiteHeader";

installServerFnAuth();
import {
  adminListHotels,
  adminGetHotel,
  adminUpsertHotel,
  adminUpsertMapping,
  adminDeleteMapping,
  adminAddSnapshot,
  adminUpsertPoolScore,
  adminGetSettings,
  adminUpdateSettings,
  adminRecomputeAll,
  adminFetchAllRatings,
  adminAutoScoreHotel,
} from "@/server/admin.functions";
import { googleSearchPlace, googleFetchRating } from "@/server/google-places.functions";
import { tripadvisorSearchLocation, tripadvisorFetchRating } from "@/server/tripadvisor.functions";

export const Route = createFileRoute("/admin/")({
  head: () => ({ meta: [{ title: "Admin – Best Pool Hotels" }, { name: "robots", content: "noindex" }] }),
  component: AdminPage,
});

const SOURCES = ["google", "tripadvisor", "booking", "hotels_com"] as const;

type AnyRec = Record<string, any>;

function AdminPage() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [tab, setTab] = useState<"hotels" | "settings">("hotels");
  const [hotels, setHotels] = useState<AnyRec[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [detail, setDetail] = useState<AnyRec | null>(null);
  const [search, setSearch] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  type BatchResult = { id: string; name: string; ok: boolean; score?: number; confidence?: string; msg: string };
  const [batchRunning, setBatchRunning] = useState(false);
  const [batchCancel, setBatchCancel] = useState(false);
  const batchCancelRef = useRef(false);
  const [batchProgress, setBatchProgress] = useState<{ done: number; total: number }>({ done: 0, total: 0 });
  const [batchResults, setBatchResults] = useState<BatchResult[]>([]);

  const runBatchAutoScore = async () => {
    if (batchRunning) return;
    setBatchRunning(true);
    setBatchCancel(false);
    batchCancelRef.current = false;
    setBatchResults([]);
    setBatchProgress({ done: 0, total: hotels.length });
    setMsg(null);
    let cancelled = false;
    for (let i = 0; i < hotels.length; i++) {
      if (batchCancelRef.current) break;
      const h = hotels[i];
      try {
        const r = await adminAutoScoreHotel({ data: { hotel_id: h.id } });
        await adminUpsertPoolScore({
          data: {
            hotel_id: h.id,
            components: r.components,
            pool_type: r.pool_type,
            best_time: r.best_time,
            editorial_notes: r.editorial_notes,
            facts: r.facts ?? null,
          },
        });
        setBatchResults((prev) => [
          ...prev,
          { id: h.id, name: h.name, ok: true, score: r.pool_score_0_10, confidence: r.confidence, msg: `${r.reviews_analyzed} reviews · ${r.reasoning}` },
        ]);
      } catch (e) {
        const errMsg = (e as Error).message;
        setBatchResults((prev) => [...prev, { id: h.id, name: h.name, ok: false, msg: errMsg }]);
        if (errMsg.includes("rate limit") || errMsg.includes("credits exhausted")) {
          batchCancelRef.current = true;
          setMsg(errMsg);
        }
      }
      setBatchProgress({ done: i + 1, total: hotels.length });
      // Throttle slightly to be polite to the AI gateway
      await new Promise((res) => setTimeout(res, 400));
    }
    setBatchRunning(false);
    if (selected) await loadDetail(selected);
  };

  useEffect(() => {
    let unsub: (() => void) | undefined;
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        navigate({ to: "/admin/login" });
        return;
      }
      setReady(true);
      const sub = supabase.auth.onAuthStateChange((_e, sess) => {
        if (!sess) navigate({ to: "/admin/login" });
      });
      unsub = () => sub.data.subscription.unsubscribe();
    });
    return () => unsub?.();
  }, [navigate]);

  const reloadHotels = async () => {
    const r = await adminListHotels();
    setHotels(r.hotels);
  };
  const loadDetail = async (id: string) => {
    setSelected(id);
    const r = await adminGetHotel({ data: { id } });
    setDetail(r);
  };

  useEffect(() => {
    if (ready) reloadHotels().catch((e) => setMsg(e.message));
  }, [ready]);

  const filtered = useMemo(
    () =>
      hotels.filter(
        (h) =>
          !search ||
          h.name?.toLowerCase().includes(search.toLowerCase()) ||
          h.city?.toLowerCase().includes(search.toLowerCase()),
      ),
    [hotels, search],
  );

  const wrap = async (fn: () => Promise<unknown>, ok = "Saved") => {
    setBusy(true);
    setMsg(null);
    try {
      await fn();
      setMsg(ok);
    } catch (e) {
      setMsg((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  if (!ready) return <div className="p-12 text-center text-muted-foreground">Loading…</div>;

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="font-display text-5xl tracking-wide">Admin</h1>
          <div className="flex gap-2">
            <button
              onClick={() => setTab("hotels")}
              className={`rounded-full px-4 py-2 text-xs uppercase tracking-[0.2em] ${tab === "hotels" ? "bg-primary text-primary-foreground" : "border border-border"}`}
            >
              Hotels
            </button>
            <button
              onClick={() => setTab("settings")}
              className={`rounded-full px-4 py-2 text-xs uppercase tracking-[0.2em] ${tab === "settings" ? "bg-primary text-primary-foreground" : "border border-border"}`}
            >
              Settings
            </button>
            <button
              onClick={() => wrap(async () => { const r = await adminFetchAllRatings(); setMsg(`Fetched ratings: ${r.ok} ok, ${r.errors} errors (${r.processed} mappings)`); if (selected) await loadDetail(selected); })}
              className="rounded-full border border-primary/40 px-4 py-2 text-xs uppercase tracking-[0.2em]"
            >
              Fetch all ratings
            </button>
            <button
              onClick={() => wrap(async () => { const r = await adminRecomputeAll(); setMsg(`Recomputed ${r.processed} hotels`); })}
              className="rounded-full border border-primary/40 px-4 py-2 text-xs uppercase tracking-[0.2em]"
            >
              Recompute all
            </button>
            <button
              onClick={runBatchAutoScore}
              disabled={batchRunning || hotels.length === 0}
              className="rounded-full border border-primary/60 bg-primary/10 px-4 py-2 text-xs uppercase tracking-[0.2em] text-primary disabled:opacity-50"
            >
              {batchRunning ? `AI scoring ${batchProgress.done}/${batchProgress.total}…` : "✨ Auto-score ALL"}
            </button>
            {batchRunning && (
              <button
                onClick={() => { batchCancelRef.current = true; setBatchCancel(true); }}
                className="rounded-full border border-destructive/40 px-4 py-2 text-xs uppercase tracking-[0.2em] text-destructive"
              >
                Stop
              </button>
            )}
            <button
              onClick={() => supabase.auth.signOut()}
              className="rounded-full border border-border px-4 py-2 text-xs uppercase tracking-[0.2em]"
            >
              Sign out
            </button>
          </div>
        </div>

        {msg && (
          <div className="mt-4 rounded-md border border-primary/30 bg-primary/10 px-4 py-2 text-sm">{msg}</div>
        )}

        {(batchRunning || batchResults.length > 0) && (
          <div className="mt-4 rounded-lg border border-primary/30 bg-surface/40 p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs uppercase tracking-[0.2em] text-primary">
                Batch AI scoring · {batchProgress.done}/{batchProgress.total}
                {!batchRunning && batchResults.length > 0 && " · done"}
              </h3>
              {!batchRunning && (
                <button
                  onClick={() => setBatchResults([])}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  Clear
                </button>
              )}
            </div>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-border/50">
              <div
                className="h-full bg-primary transition-all"
                style={{ width: `${batchProgress.total ? (batchProgress.done / batchProgress.total) * 100 : 0}%` }}
              />
            </div>
            <ul className="mt-3 max-h-72 space-y-1 overflow-auto text-xs">
              {batchResults.map((r) => (
                <li
                  key={r.id}
                  className={`rounded border px-2 py-1.5 ${r.ok ? "border-primary/20 bg-primary/5" : "border-destructive/30 bg-destructive/5"}`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium">{r.name}</span>
                    {r.ok ? (
                      <span className="font-display text-primary">
                        {r.score?.toFixed(1)}/10 · {r.confidence}
                      </span>
                    ) : (
                      <span className="text-destructive">✕</span>
                    )}
                  </div>
                  <div className="mt-0.5 text-muted-foreground line-clamp-2">{r.msg}</div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {tab === "settings" ? (
          <SettingsPanel onSaved={() => setMsg("Settings saved")} />
        ) : (
          <div className="mt-8 grid gap-6 lg:grid-cols-[360px_1fr]">
            <aside className="rounded-lg border border-border/60 bg-surface/40 p-4">
              <input
                placeholder="Search…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="mb-3 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
              />
              <button
                onClick={() => { setSelected(null); setDetail({ hotel: null, mappings: [], snapshots: [], meta: null, pool: null }); }}
                className="mb-3 w-full rounded-md bg-primary px-3 py-2 text-xs uppercase tracking-[0.2em] text-primary-foreground"
              >
                + New hotel
              </button>
              <ul className="max-h-[70vh] space-y-1 overflow-auto">
                {filtered.map((h) => (
                  <li key={h.id}>
                    <button
                      onClick={() => loadDetail(h.id)}
                      className={`w-full rounded px-3 py-2 text-left text-sm transition ${selected === h.id ? "bg-primary/15 text-primary" : "hover:bg-surface"}`}
                    >
                      <div className="font-medium">{h.name}</div>
                      <div className="text-xs text-muted-foreground">
                        #{h.rank_position ?? "—"} · {h.city}
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            </aside>

            <main>
              {!detail ? (
                <p className="text-muted-foreground">Select a hotel or create a new one.</p>
              ) : (
                <HotelDetail
                  data={detail}
                  busy={busy}
                  onSaveHotel={(payload) =>
                    wrap(async () => {
                      const r = await adminUpsertHotel({ data: payload });
                      await reloadHotels();
                      await loadDetail(r.hotel.id);
                    })
                  }
                  onSaveMapping={(payload) =>
                    wrap(async () => {
                      await adminUpsertMapping({ data: payload });
                      if (detail.hotel) await loadDetail(detail.hotel.id);
                    })
                  }
                  onDeleteMapping={(id) =>
                    wrap(async () => {
                      await adminDeleteMapping({ data: { id } });
                      if (detail.hotel) await loadDetail(detail.hotel.id);
                    })
                  }
                  onAddSnapshot={(payload) =>
                    wrap(async () => {
                      await adminAddSnapshot({ data: payload });
                      if (detail.hotel) await loadDetail(detail.hotel.id);
                    })
                  }
                  onSavePool={(payload) =>
                    wrap(async () => {
                      await adminUpsertPoolScore({ data: payload });
                      if (detail.hotel) await loadDetail(detail.hotel.id);
                    })
                  }
                />
              )}
            </main>
          </div>
        )}

        <p className="mt-12 text-xs text-muted-foreground">
          Public API: <Link to="/api/public/hotels" className="text-primary underline">/api/public/hotels</Link>
        </p>
      </div>
    </div>
  );
}

function input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={"w-full rounded-md border border-border bg-background px-3 py-2 text-sm " + (props.className ?? "")} />;
}

function HotelDetail({
  data, busy, onSaveHotel, onSaveMapping, onDeleteMapping, onAddSnapshot, onSavePool,
}: {
  data: AnyRec;
  busy: boolean;
  onSaveHotel: (p: AnyRec) => void;
  onSaveMapping: (p: AnyRec) => void;
  onDeleteMapping: (id: string) => void;
  onAddSnapshot: (p: AnyRec) => void;
  onSavePool: (p: AnyRec) => void;
}) {
  const h = data.hotel ?? {};
  const [form, setForm] = useState<AnyRec>(h);
  useEffect(() => setForm(h), [h.id]);
  const set = (k: string, v: unknown) => setForm((s) => ({ ...s, [k]: v }));

  const [snap, setSnap] = useState({ source: "google", rating_value: 4.5, rating_scale: 5, rating_count: 100 });
  const pool = data.pool?.components ?? { vibe: 1.5, lounging_space: 1.5, service: 1.5, uniqueness: 1.5, pool_first_feel: 1.5 };
  const [poolForm, setPoolForm] = useState({
    components: pool,
    best_time: data.pool?.best_time ?? "",
    pool_type: data.pool?.pool_type ?? "",
    editorial_notes: data.pool?.editorial_notes ?? "",
  });
  useEffect(() => {
    setPoolForm({
      components: data.pool?.components ?? pool,
      best_time: data.pool?.best_time ?? "",
      pool_type: data.pool?.pool_type ?? "",
      editorial_notes: data.pool?.editorial_notes ?? "",
    });
  }, [h.id]);
  const poolSum = Object.values(poolForm.components).reduce((a: number, b: any) => a + Number(b || 0), 0).toFixed(1);

  const [aiBusy, setAiBusy] = useState(false);
  const [aiMsg, setAiMsg] = useState<string | null>(null);
  const runAutoScore = async () => {
    setAiBusy(true);
    setAiMsg(null);
    try {
      const r = await adminAutoScoreHotel({ data: { hotel_id: h.id } });
      setPoolForm({
        components: r.components,
        pool_type: r.pool_type,
        best_time: r.best_time,
        editorial_notes: r.editorial_notes,
      });
      setAiMsg(`✓ Scored ${r.pool_score_0_10}/10 (confidence: ${r.confidence}, ${r.reviews_analyzed} reviews). ${r.reasoning} — Review and click Save.`);
    } catch (e) {
      setAiMsg((e as Error).message);
    } finally {
      setAiBusy(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Core */}
      <section className="rounded-lg border border-border/60 bg-surface/40 p-6">
        <h2 className="font-display text-2xl">Hotelsinfo</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {input({ placeholder: "slug", value: form.slug ?? "", onChange: (e) => set("slug", e.target.value) })}
          {input({ placeholder: "name", value: form.name ?? "", onChange: (e) => set("name", e.target.value) })}
          {input({ placeholder: "city", value: form.city ?? "", onChange: (e) => set("city", e.target.value) })}
          {input({ placeholder: "city_slug", value: form.city_slug ?? "", onChange: (e) => set("city_slug", e.target.value) })}
          {input({ placeholder: "country", value: form.country ?? "", onChange: (e) => set("country", e.target.value) })}
          {input({ placeholder: "neighborhood", value: form.neighborhood ?? "", onChange: (e) => set("neighborhood", e.target.value) })}
          {input({ placeholder: "address", value: form.address ?? "", onChange: (e) => set("address", e.target.value) })}
          {input({ placeholder: "website_url", value: form.website_url ?? "", onChange: (e) => set("website_url", e.target.value) })}
          {input({ placeholder: "booking_url", value: form.booking_url ?? "", onChange: (e) => set("booking_url", e.target.value) })}
          {input({ placeholder: "rank_position", type: "number", value: form.rank_position ?? "", onChange: (e) => set("rank_position", e.target.value ? Number(e.target.value) : null) })}
        </div>
        <button
          disabled={busy}
          onClick={() => onSaveHotel({ ...form, id: form.id || undefined })}
          className="mt-4 rounded-md bg-primary px-4 py-2 text-xs uppercase tracking-[0.2em] text-primary-foreground"
        >
          Save hotel
        </button>
      </section>

      {!h.id ? null : (
        <>
          {/* Mappings */}
          <section className="rounded-lg border border-border/60 bg-surface/40 p-6">
            <h2 className="font-display text-2xl">Sources (Place IDs)</h2>
            <div className="mt-4 space-y-2">
              {SOURCES.map((src) => {
                const m = data.mappings.find((x: AnyRec) => x.source === src) ?? { source: src, hotel_id: h.id };
                return (
                  <MappingRow
                    key={src}
                    mapping={m}
                    onSave={(p) => onSaveMapping(p)}
                    onDelete={(id) => onDeleteMapping(id)}
                  />
                );
              })}
            </div>
          </section>

          {/* Snapshots */}
          <section className="rounded-lg border border-border/60 bg-surface/40 p-6">
            <h2 className="font-display text-2xl">Manual rating import</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-4">
              <select
                value={snap.source}
                onChange={(e) => setSnap({ ...snap, source: e.target.value })}
                className="rounded-md border border-border bg-background px-3 py-2 text-sm"
              >
                {SOURCES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              {input({ type: "number", step: "0.1", placeholder: "rating", value: snap.rating_value, onChange: (e) => setSnap({ ...snap, rating_value: Number(e.target.value) }) })}
              {input({ type: "number", step: "0.1", placeholder: "scale", value: snap.rating_scale, onChange: (e) => setSnap({ ...snap, rating_scale: Number(e.target.value) }) })}
              {input({ type: "number", placeholder: "count", value: snap.rating_count, onChange: (e) => setSnap({ ...snap, rating_count: Number(e.target.value) }) })}
            </div>
            <button
              disabled={busy}
              onClick={() => onAddSnapshot({ hotel_id: h.id, ...snap })}
              className="mt-3 rounded-md bg-primary px-4 py-2 text-xs uppercase tracking-[0.2em] text-primary-foreground"
            >
              Add + recompute metascore
            </button>

            <h3 className="mt-6 text-xs uppercase tracking-[0.2em] text-muted-foreground">Last 50 snapshots</h3>
            <div className="mt-2 max-h-64 overflow-auto rounded border border-border/60">
              <table className="w-full text-xs">
                <thead className="bg-surface text-muted-foreground">
                  <tr><th className="p-2 text-left">date</th><th className="text-left">source</th><th className="text-left">rating</th><th className="text-left">count</th><th className="text-left">status</th></tr>
                </thead>
                <tbody>
                  {data.snapshots.map((s: AnyRec) => (
                    <tr key={s.id} className="border-t border-border/40">
                      <td className="p-2">{new Date(s.captured_at).toISOString().slice(0, 10)}</td>
                      <td>{s.source}</td>
                      <td>{s.rating_value}/{s.rating_scale}</td>
                      <td>{s.rating_count ?? "—"}</td>
                      <td>{s.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {data.meta && (
              <div className="mt-4 rounded border border-primary/30 bg-primary/5 p-3 text-sm">
                <strong>Metascore:</strong> {data.meta.meta_rating_0_100}/100 · <strong>Confidence:</strong> {data.meta.confidence_0_100}/100
                <div className="mt-1 text-xs text-muted-foreground">
                  Senast: {new Date(data.meta.computed_at).toLocaleString()}
                </div>
              </div>
            )}
          </section>

          {/* Pool Score */}
          <section className="rounded-lg border border-border/60 bg-surface/40 p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-display text-2xl">Pool Score (editorial)</h2>
                <p className="mt-1 text-xs text-muted-foreground">Each component 0–2. Sum = Pool Score 0–10.</p>
              </div>
              <button
                disabled={aiBusy}
                onClick={runAutoScore}
                className="rounded-full border border-primary/40 bg-primary/10 px-4 py-2 text-xs uppercase tracking-[0.2em] text-primary disabled:opacity-50"
              >
                {aiBusy ? "Analyzing reviews…" : "✨ Auto-score with AI"}
              </button>
            </div>
            {aiMsg && (
              <div className="mt-3 rounded-md border border-primary/30 bg-primary/5 px-3 py-2 text-xs">{aiMsg}</div>
            )}
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {(["vibe","lounging_space","service","uniqueness","pool_first_feel"] as const).map((k) => (
                <label key={k} className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  {k.replace(/_/g, " ")}
                  {input({
                    type: "number", step: "0.1", min: 0, max: 2,
                    value: poolForm.components[k] ?? 0,
                    onChange: (e) => setPoolForm((p) => ({ ...p, components: { ...p.components, [k]: Number(e.target.value) } })),
                  })}
                </label>
              ))}
              {input({ placeholder: "best_time", value: poolForm.best_time, onChange: (e) => setPoolForm((p) => ({ ...p, best_time: e.target.value })) })}
              {input({ placeholder: "pool_type", value: poolForm.pool_type, onChange: (e) => setPoolForm((p) => ({ ...p, pool_type: e.target.value })) })}
              <textarea
                placeholder="editorial_notes"
                value={poolForm.editorial_notes}
                onChange={(e) => setPoolForm((p) => ({ ...p, editorial_notes: e.target.value }))}
                className="sm:col-span-2 min-h-24 rounded-md border border-border bg-background px-3 py-2 text-sm"
              />
            </div>
            <div className="mt-3 flex items-center justify-between">
              <p className="text-sm">Preview Pool Score: <strong className="text-primary">{poolSum}</strong>/10</p>
              <button
                disabled={busy}
                onClick={() => onSavePool({ hotel_id: h.id, ...poolForm })}
                className="rounded-md bg-primary px-4 py-2 text-xs uppercase tracking-[0.2em] text-primary-foreground"
              >
                Save Pool Score
              </button>
            </div>
          </section>
        </>
      )}
    </div>
  );
}

function MappingRow({ mapping, onSave, onDelete }: { mapping: AnyRec; onSave: (p: AnyRec) => void; onDelete: (id: string) => void }) {
  const [m, setM] = useState(mapping);
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<AnyRec[] | null>(null);
  const [fetchMsg, setFetchMsg] = useState<string | null>(null);
  useEffect(() => setM(mapping), [mapping.id, mapping.source]);

  const isGoogle = m.source === "google";
  const isTripadvisor = m.source === "tripadvisor";

  const doSearch = async () => {
    setSearching(true);
    setFetchMsg(null);
    try {
      if (isTripadvisor) {
        const r = await tripadvisorSearchLocation({ data: { query: m._searchQuery || "" } });
        setResults(r.results);
      } else {
        const r = await googleSearchPlace({ data: { query: m._searchQuery || "" } });
        setResults(r.results);
      }
    } catch (e) {
      setFetchMsg((e as Error).message);
    } finally {
      setSearching(false);
    }
  };

  const doFetch = async () => {
    setFetchMsg(null);
    try {
      if (isTripadvisor) {
        const r = await tripadvisorFetchRating({ data: { hotel_id: m.hotel_id, location_id: m.source_place_id } });
        setFetchMsg(`✓ ${r.rating}★ (${r.count} reviews) — saved & metascore recomputed`);
      } else {
        const r = await googleFetchRating({ data: { hotel_id: m.hotel_id, place_id: m.source_place_id } });
        setFetchMsg(`✓ ${r.rating}★ (${r.count} reviews) — saved & metascore recomputed`);
      }
    } catch (e) {
      setFetchMsg((e as Error).message);
    }
  };

  const supportsLookup = isGoogle || isTripadvisor;
  const placeholderId = isTripadvisor ? "location_id" : "place_id";
  const searchPlaceholder = isTripadvisor ? "Search hotel name + city…" : "Search hotel name + city…";
  const searchBtnLabel = isTripadvisor ? "Search Location ID" : "Search Place ID";
  const fetchBtnLabel = isTripadvisor ? "Fetch TripAdvisor rating" : "Fetch Google rating";

  return (
    <div className="rounded border border-border/40 p-2">
      <div className="grid items-center gap-2 sm:grid-cols-[120px_1fr_1fr_auto]">
        <span className="text-xs uppercase tracking-[0.2em] text-primary">{m.source}</span>
        {input({ placeholder: placeholderId, value: m.source_place_id ?? "", onChange: (e) => setM({ ...m, source_place_id: e.target.value }) })}
        {input({ placeholder: "url", value: m.source_url ?? "", onChange: (e) => setM({ ...m, source_url: e.target.value }) })}
        <div className="flex gap-1">
          <button
            onClick={() => onSave({ id: m.id, hotel_id: m.hotel_id, source: m.source, source_place_id: m.source_place_id, source_url: m.source_url, is_active: m.is_active ?? true })}
            className="rounded bg-primary/20 px-3 py-1 text-xs uppercase tracking-[0.2em] text-primary"
          >Save</button>
          {m.id && (
            <button onClick={() => onDelete(m.id)} className="rounded border border-destructive/40 px-3 py-1 text-xs uppercase tracking-[0.2em] text-destructive">×</button>
          )}
        </div>
      </div>
      {supportsLookup && (
        <div className="mt-2 space-y-2">
          <div className="flex flex-wrap gap-2">
            {input({ placeholder: searchPlaceholder, value: m._searchQuery ?? "", onChange: (e) => setM({ ...m, _searchQuery: e.target.value }), className: "flex-1 min-w-48" })}
            <button onClick={doSearch} disabled={searching || !m._searchQuery} className="rounded border border-primary/40 px-3 py-1 text-xs uppercase tracking-[0.2em] text-primary">
              {searching ? "Searching…" : searchBtnLabel}
            </button>
            {m.source_place_id && (
              <button onClick={doFetch} className="rounded bg-primary px-3 py-1 text-xs uppercase tracking-[0.2em] text-primary-foreground">
                {fetchBtnLabel}
              </button>
            )}
          </div>
          {results && (
            <ul className="space-y-1 rounded border border-border/40 bg-background p-2 text-xs">
              {results.length === 0 && <li className="text-muted-foreground">No results</li>}
              {results.map((r: AnyRec) => {
                const id = isTripadvisor ? r.location_id : r.id;
                const name = isTripadvisor ? r.name : r.displayName?.text;
                const addr = isTripadvisor ? r.address_obj?.address_string : r.formattedAddress;
                const url = isTripadvisor ? r.web_url : r.googleMapsUri;
                return (
                  <li key={id} className="flex items-center justify-between gap-2">
                    <div>
                      <div className="font-medium">{name} {!isTripadvisor && r.rating && <span className="text-muted-foreground">· {r.rating}★ ({r.userRatingCount})</span>}</div>
                      <div className="text-muted-foreground">{addr}</div>
                      <div className="font-mono text-[10px] text-muted-foreground">{id}</div>
                    </div>
                    <button
                      onClick={() => { setM({ ...m, source_place_id: id, source_url: url ?? m.source_url }); setResults(null); }}
                      className="rounded bg-primary/20 px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-primary"
                    >Select</button>
                  </li>
                );
              })}
            </ul>
          )}
          {fetchMsg && <div className="text-xs text-muted-foreground">{fetchMsg}</div>}
        </div>
      )}
    </div>
  );
}

function SettingsPanel({ onSaved }: { onSaved: () => void }) {
  const [s, setS] = useState<AnyRec | null>(null);
  useEffect(() => { adminGetSettings().then((r) => setS(r.settings)); }, []);
  if (!s) return <p className="mt-8 text-muted-foreground">Loading…</p>;
  const w = s.weights;
  return (
    <div className="mt-8 max-w-xl rounded-lg border border-border/60 bg-surface/40 p-6">
      <h2 className="font-display text-2xl">Weights & volume cap</h2>
      <p className="text-xs text-muted-foreground">Weights don't need to sum to 1; they're weighted relatively.</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {SOURCES.map((src) => (
          <label key={src} className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            {src}
            {input({ type: "number", step: "0.05", min: 0, max: 1, value: w[src] ?? 0, onChange: (e) => setS({ ...s, weights: { ...w, [src]: Number(e.target.value) } }) })}
          </label>
        ))}
        <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
          volume_cap
          {input({ type: "number", value: s.volume_cap, onChange: (e) => setS({ ...s, volume_cap: Number(e.target.value) }) })}
        </label>
      </div>
      <button
        onClick={async () => { await adminUpdateSettings({ data: { weights: s.weights, volume_cap: s.volume_cap } }); onSaved(); }}
        className="mt-4 rounded-md bg-primary px-4 py-2 text-xs uppercase tracking-[0.2em] text-primary-foreground"
      >Save</button>
    </div>
  );
}
