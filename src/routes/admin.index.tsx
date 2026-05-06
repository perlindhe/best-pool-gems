import { useEffect, useMemo, useState } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader } from "@/components/SiteHeader";
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
} from "@/server/admin.functions";
import { googleSearchPlace, googleFetchRating } from "@/server/google-places.functions";

export const Route = createFileRoute("/admin/")({
  head: () => ({ meta: [{ title: "Admin – PoolList" }, { name: "robots", content: "noindex" }] }),
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

  const wrap = async (fn: () => Promise<unknown>, ok = "Sparat") => {
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

  if (!ready) return <div className="p-12 text-center text-muted-foreground">Laddar…</div>;

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
              Hotell
            </button>
            <button
              onClick={() => setTab("settings")}
              className={`rounded-full px-4 py-2 text-xs uppercase tracking-[0.2em] ${tab === "settings" ? "bg-primary text-primary-foreground" : "border border-border"}`}
            >
              Settings
            </button>
            <button
              onClick={() => wrap(async () => { const r = await adminRecomputeAll(); setMsg(`Räknat om ${r.processed} hotell`); })}
              className="rounded-full border border-primary/40 px-4 py-2 text-xs uppercase tracking-[0.2em]"
            >
              Räkna om alla
            </button>
            <button
              onClick={() => supabase.auth.signOut()}
              className="rounded-full border border-border px-4 py-2 text-xs uppercase tracking-[0.2em]"
            >
              Logga ut
            </button>
          </div>
        </div>

        {msg && (
          <div className="mt-4 rounded-md border border-primary/30 bg-primary/10 px-4 py-2 text-sm">{msg}</div>
        )}

        {tab === "settings" ? (
          <SettingsPanel onSaved={() => setMsg("Settings sparade")} />
        ) : (
          <div className="mt-8 grid gap-6 lg:grid-cols-[360px_1fr]">
            <aside className="rounded-lg border border-border/60 bg-surface/40 p-4">
              <input
                placeholder="Sök…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="mb-3 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
              />
              <button
                onClick={() => { setSelected(null); setDetail({ hotel: null, mappings: [], snapshots: [], meta: null, pool: null }); }}
                className="mb-3 w-full rounded-md bg-primary px-3 py-2 text-xs uppercase tracking-[0.2em] text-primary-foreground"
              >
                + Nytt hotell
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
                <p className="text-muted-foreground">Välj ett hotell eller skapa ett nytt.</p>
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
          Publikt API: <Link to="/api/public/hotels" className="text-primary underline">/api/public/hotels</Link>
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

  return (
    <div className="space-y-8">
      {/* Core */}
      <section className="rounded-lg border border-border/60 bg-surface/40 p-6">
        <h2 className="font-display text-2xl">Hotellinfo</h2>
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
          Spara hotell
        </button>
      </section>

      {!h.id ? null : (
        <>
          {/* Mappings */}
          <section className="rounded-lg border border-border/60 bg-surface/40 p-6">
            <h2 className="font-display text-2xl">Källor (Place IDs)</h2>
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
            <h2 className="font-display text-2xl">Manuell rating-import</h2>
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
              Lägg till + räkna om metascore
            </button>

            <h3 className="mt-6 text-xs uppercase tracking-[0.2em] text-muted-foreground">Senaste 50 snapshots</h3>
            <div className="mt-2 max-h-64 overflow-auto rounded border border-border/60">
              <table className="w-full text-xs">
                <thead className="bg-surface text-muted-foreground">
                  <tr><th className="p-2 text-left">datum</th><th className="text-left">källa</th><th className="text-left">rating</th><th className="text-left">count</th><th className="text-left">status</th></tr>
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
            <h2 className="font-display text-2xl">Pool Score (editorial)</h2>
            <p className="mt-1 text-xs text-muted-foreground">Varje komponent 0–2. Summa = Pool Score 0–10.</p>
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
              <p className="text-sm">Förhandsräknad Pool Score: <strong className="text-primary">{poolSum}</strong>/10</p>
              <button
                disabled={busy}
                onClick={() => onSavePool({ hotel_id: h.id, ...poolForm })}
                className="rounded-md bg-primary px-4 py-2 text-xs uppercase tracking-[0.2em] text-primary-foreground"
              >
                Spara Pool Score
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

  const doSearch = async () => {
    setSearching(true);
    setFetchMsg(null);
    try {
      const r = await googleSearchPlace({ data: { query: m._searchQuery || "" } });
      setResults(r.results);
    } catch (e) {
      setFetchMsg((e as Error).message);
    } finally {
      setSearching(false);
    }
  };

  const doFetch = async () => {
    setFetchMsg(null);
    try {
      const r = await googleFetchRating({ data: { hotel_id: m.hotel_id, place_id: m.source_place_id } });
      setFetchMsg(`✓ ${r.rating}★ (${r.count} reviews) — sparat & metascore omräknad`);
    } catch (e) {
      setFetchMsg((e as Error).message);
    }
  };

  return (
    <div className="rounded border border-border/40 p-2">
      <div className="grid items-center gap-2 sm:grid-cols-[120px_1fr_1fr_auto]">
        <span className="text-xs uppercase tracking-[0.2em] text-primary">{m.source}</span>
        {input({ placeholder: "place_id", value: m.source_place_id ?? "", onChange: (e) => setM({ ...m, source_place_id: e.target.value }) })}
        {input({ placeholder: "url", value: m.source_url ?? "", onChange: (e) => setM({ ...m, source_url: e.target.value }) })}
        <div className="flex gap-1">
          <button
            onClick={() => onSave({ id: m.id, hotel_id: m.hotel_id, source: m.source, source_place_id: m.source_place_id, source_url: m.source_url, is_active: m.is_active ?? true })}
            className="rounded bg-primary/20 px-3 py-1 text-xs uppercase tracking-[0.2em] text-primary"
          >Spara</button>
          {m.id && (
            <button onClick={() => onDelete(m.id)} className="rounded border border-destructive/40 px-3 py-1 text-xs uppercase tracking-[0.2em] text-destructive">×</button>
          )}
        </div>
      </div>
      {isGoogle && (
        <div className="mt-2 space-y-2">
          <div className="flex flex-wrap gap-2">
            {input({ placeholder: "Sök hotellnamn + stad…", value: m._searchQuery ?? "", onChange: (e) => setM({ ...m, _searchQuery: e.target.value }), className: "flex-1 min-w-48" })}
            <button onClick={doSearch} disabled={searching || !m._searchQuery} className="rounded border border-primary/40 px-3 py-1 text-xs uppercase tracking-[0.2em] text-primary">
              {searching ? "Söker…" : "Sök Place ID"}
            </button>
            {m.source_place_id && (
              <button onClick={doFetch} className="rounded bg-primary px-3 py-1 text-xs uppercase tracking-[0.2em] text-primary-foreground">
                Hämta Google-betyg
              </button>
            )}
          </div>
          {results && (
            <ul className="space-y-1 rounded border border-border/40 bg-background p-2 text-xs">
              {results.length === 0 && <li className="text-muted-foreground">Inga träffar</li>}
              {results.map((r: AnyRec) => (
                <li key={r.id} className="flex items-center justify-between gap-2">
                  <div>
                    <div className="font-medium">{r.displayName?.text} {r.rating && <span className="text-muted-foreground">· {r.rating}★ ({r.userRatingCount})</span>}</div>
                    <div className="text-muted-foreground">{r.formattedAddress}</div>
                    <div className="font-mono text-[10px] text-muted-foreground">{r.id}</div>
                  </div>
                  <button
                    onClick={() => { setM({ ...m, source_place_id: r.id, source_url: r.googleMapsUri ?? m.source_url }); setResults(null); }}
                    className="rounded bg-primary/20 px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-primary"
                  >Välj</button>
                </li>
              ))}
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
  if (!s) return <p className="mt-8 text-muted-foreground">Laddar…</p>;
  const w = s.weights;
  return (
    <div className="mt-8 max-w-xl rounded-lg border border-border/60 bg-surface/40 p-6">
      <h2 className="font-display text-2xl">Vikter & volume cap</h2>
      <p className="text-xs text-muted-foreground">Vikter behöver inte summera till 1; de viktas relativt.</p>
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
      >Spara</button>
    </div>
  );
}
