import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { installServerFnAuth } from "@/integrations/supabase/server-fn-auth";
import { SiteHeader } from "@/components/SiteHeader";
import {
  approveEvidenceScore,
  collectPoolComments,
  getEvidenceOverview,
  listPoolComments,
  recalculateEvidenceScore,
  runEvidenceAutomationForTestGroup,
  updatePoolComment,
  upsertExternalMention,
} from "@/lib/evidence.functions";
import { FACTOR_LABELS, formatPoints } from "@/lib/evidence-score";

installServerFnAuth();

export const Route = createFileRoute("/admin/evidence")({
  head: () => ({
    meta: [
      { title: "Evidence-based Pool Score – review" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: EvidencePage,
});

type Report = Record<string, unknown> & {
  hotelId?: string;
  slug?: string;
  name?: string;
  city?: string;
  error?: string;
};

type Comment = {
  id: string;
  source: string;
  comment_text: string;
  author: string | null;
  published_at: string | null;
  relevance: string | null;
  sentiment: string | null;
  editor_relevance: string | null;
  editor_sentiment: string | null;
  is_owner_content: boolean | null;
  excluded_reason: string | null;
  source_url: string | null;
};

function num(v: unknown): number | null {
  return typeof v === "number" ? v : null;
}

function errText(e: unknown): string {
  if (e instanceof Response) {
    return e.status === 401 || e.status === 403
      ? "You need to be signed in as an admin."
      : `Request failed (${e.status}).`;
  }
  const msg = e instanceof Error ? e.message : String(e);
  return msg === "[object Response]" ? "Request failed. Please sign in again." : msg;
}

function EvidencePage() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [reports, setReports] = useState<Report[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [open, setOpen] = useState<string | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);

  const load = () =>
    getEvidenceOverview()
      .then((r) => setReports((r?.reports as Report[]) ?? []))
      .catch((e) => {
        setReports([]);
        setError(errText(e));
      });

  useEffect(() => {
    let unsub: (() => void) | undefined;
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        navigate({ to: "/admin/login" });
        return;
      }
      setReady(true);
      load();
      const sub = supabase.auth.onAuthStateChange((_e, sess) => {
        if (!sess) navigate({ to: "/admin/login" });
      });
      unsub = () => sub.data.subscription.unsubscribe();
    });
    return () => unsub?.();
  }, [navigate]);


  const run = async (id: string, fn: () => Promise<unknown>) => {
    setBusy(id);
    setError(null);
    try {
      await fn();
      await load();
      if (open) setComments(((await listPoolComments({ data: { hotel_id: open } })).comments as unknown as Comment[]) ?? []);
    } catch (e) {
      setError(errText(e));
    } finally {
      setBusy(null);
    }
  };

  const openComments = async (hotelId: string) => {
    if (open === hotelId) {
      setOpen(null);
      setComments([]);
      return;
    }
    setOpen(hotelId);
    try {
      const r = await listPoolComments({ data: { hotel_id: hotelId } });
      setComments((r.comments as unknown as Comment[]) ?? []);
    } catch (e) {
      setError(errText(e));
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-6 py-12">
        <h1 className="font-display text-4xl text-primary">Evidence-based Pool Score</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Internal review for the ten test hotels. The system collects evidence,
          recalculates every factor and approves a score by itself when all five factors
          are evidence-backed and no QA error remains. Everything else stays pending.
          No other hotel uses this model yet.
        </p>
        <button
          className="mt-4 rounded border border-border px-3 py-1.5 text-xs"
          disabled={busy === "__auto__"}
          onClick={() => run("__auto__", () => runEvidenceAutomationForTestGroup())}
        >
          {busy === "__auto__" ? "Running automation…" : "Run automation for all ten hotels"}
        </button>
        {error && (
          <p className="mt-4 rounded border border-destructive/40 p-3 text-sm text-destructive">
            {error}
          </p>
        )}

        {!ready && (
          <p className="mt-6 text-sm text-muted-foreground">Checking your sign-in…</p>
        )}

        <div className="mt-8 space-y-4">
          {reports.map((r) => {
            const hotelId = String(r.hotelId ?? "");
            const factors = (r.factors ?? {}) as Record<string, number | null>;
            const total = num(r.totalPoints);
            const ten = num(r.scoreOutOfTen);
            const blockers = (r.blockingReasons as string[]) ?? [];
            const qa = (r.qaErrors as string[]) ?? [];
            return (
              <section key={hotelId || r.slug} className="rounded-lg border border-border/60 p-5">
                <div className="flex flex-wrap items-baseline justify-between gap-3">
                  <div>
                    <h2 className="font-display text-2xl">{String(r.name ?? r.slug)}</h2>
                    <p className="text-xs text-muted-foreground">
                      {String(r.city ?? "")} · {String(r.slug ?? "")}
                    </p>
                  </div>
                  <p className="tabular-nums">
                    {ten != null && total != null ? (
                      <>
                        <span className="font-display text-2xl text-primary">{ten.toFixed(1)}</span>
                        <span className="text-xs text-muted-foreground"> /10 · {Math.round(total)}/100</span>
                      </>
                    ) : (
                      <span className="text-xs text-muted-foreground">Pending — not enough verified data</span>
                    )}
                  </p>
                </div>

                {r.error ? (
                  <p className="mt-3 text-sm text-destructive">{r.error}</p>
                ) : (
                  <>
                    <div className="mt-4 grid gap-2 text-sm md:grid-cols-5">
                      {FACTOR_LABELS.map((f) => (
                        <div key={f.key} className="rounded border border-border/40 p-2">
                          <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                            {f.label}
                          </p>
                          <p className="tabular-nums">
                            {formatPoints(factors[f.key] ?? null) ?? "—"}
                            <span className="text-muted-foreground">/{f.max}</span>
                          </p>
                        </div>
                      ))}
                    </div>

                    <p className="mt-3 text-xs text-muted-foreground">
                      Status: {String(r.verificationStatus ?? "—")} · Confidence:{" "}
                      {String(r.confidenceLevel ?? "—")} · Comments used:{" "}
                      {String(r.usedCommentCount ?? 0)} · Duplicates removed:{" "}
                      {String(r.duplicateCount ?? 0)}
                    </p>

                    {(blockers.length > 0 || qa.length > 0) && (
                      <ul className="mt-2 list-disc pl-5 text-xs text-muted-foreground">
                        {[...qa, ...blockers].map((b) => (
                          <li key={b}>{b}</li>
                        ))}
                      </ul>
                    )}

                    <div className="mt-4 flex flex-wrap gap-2 text-xs">
                      <button
                        className="rounded border border-border px-3 py-1.5"
                        disabled={busy === hotelId}
                        onClick={() => run(hotelId, () => collectPoolComments({ data: { hotel_id: hotelId } }))}
                      >
                        Collect & classify comments
                      </button>
                      <button
                        className="rounded border border-border px-3 py-1.5"
                        disabled={busy === hotelId}
                        onClick={() => run(hotelId, () => recalculateEvidenceScore({ data: { hotel_id: hotelId } }))}
                      >
                        Recalculate
                      </button>
                      <button
                        className="rounded border border-border px-3 py-1.5"
                        onClick={() => openComments(hotelId)}
                      >
                        {open === hotelId ? "Hide comments" : "Review comments"}
                      </button>
                      <button
                        className="rounded border border-border px-3 py-1.5"
                        disabled={busy === hotelId}
                        onClick={() => {
                          const url = window.prompt("External mention URL");
                          if (!url) return;
                          const tier = window.prompt("Tier (A, B or C)", "A");
                          run(hotelId, () =>
                            upsertExternalMention({
                              data: {
                                hotel_id: hotelId,
                                url,
                                tier: (tier?.toUpperCase() as "A" | "B" | "C") ?? "C",
                                is_about_pool: true,
                                is_positive: true,
                                approve: true,
                              },
                            }),
                          );
                        }}
                      >
                        Add approved mention
                      </button>
                      <button
                        className="rounded border border-primary px-3 py-1.5 text-primary"
                        disabled={busy === hotelId}
                        onClick={() => {
                          const editor = window.prompt("Approve as (editor name)");
                          if (!editor) return;
                          run(hotelId, () => approveEvidenceScore({ data: { hotel_id: hotelId, editor } }));
                        }}
                      >
                        Approve score
                      </button>
                      <button
                        className="rounded border border-border px-3 py-1.5"
                        disabled={busy === hotelId}
                        onClick={() => run(hotelId, () => approveEvidenceScore({ data: { hotel_id: hotelId, editor: null } }))}
                      >
                        Withdraw approval
                      </button>
                    </div>

                    {open === hotelId && (
                      <div className="mt-4 space-y-2">
                        {comments.length === 0 && (
                          <p className="text-xs text-muted-foreground">No comments collected yet.</p>
                        )}
                        {comments.map((c) => (
                          <div key={c.id} className="rounded border border-border/40 p-3 text-xs">
                            <p className="text-foreground">{c.comment_text}</p>
                            <p className="mt-1 text-muted-foreground">
                              {c.source} · {c.author ?? "anonymous"} · {c.published_at ?? "no date"} ·
                              relevance {c.editor_relevance ?? c.relevance ?? "—"} · sentiment{" "}
                              {c.editor_sentiment ?? c.sentiment ?? "—"}
                              {c.is_owner_content ? " · owner content" : ""}
                              {c.excluded_reason ? ` · excluded: ${c.excluded_reason}` : ""}
                            </p>
                            <div className="mt-2 flex flex-wrap gap-1">
                              {(["positive", "neutral", "negative", "unclear", "irrelevant"] as const).map((s) => (
                                <button
                                  key={s}
                                  className="rounded border border-border px-2 py-0.5"
                                  onClick={() =>
                                    run(hotelId, () =>
                                      updatePoolComment({ data: { id: c.id, editor_sentiment: s } }),
                                    )
                                  }
                                >
                                  {s}
                                </button>
                              ))}
                              <button
                                className="rounded border border-border px-2 py-0.5"
                                onClick={() =>
                                  run(hotelId, () =>
                                    updatePoolComment({
                                      data: { id: c.id, editor_relevance: "not_pool", excluded_reason: "not about the pool" },
                                    }),
                                  )
                                }
                              >
                                not about pool
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </section>
            );
          })}
        </div>
      </main>
    </div>
  );
}
