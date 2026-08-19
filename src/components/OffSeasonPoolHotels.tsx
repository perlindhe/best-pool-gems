import { Link } from "@tanstack/react-router";
import type { Hotel } from "@/data/hotels";
import type { OffSeasonDbHotel } from "@/lib/off-season.functions";
import {
  MAX_OFF_SEASON,
  offSeasonExtras,
  rankedHotelIsHeatedOutdoor,
  type OffSeasonHotel,
} from "@/data/off-season";

type Props = {
  cityName: string;
  citySlug: string;
  rankedHotels: Hotel[];
  dbHotels: OffSeasonDbHotel[];
};

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

/** Merge ranked hotels, database rows and curated extras into one capped list. */
export function buildOffSeasonList(
  rankedHotels: Hotel[],
  dbHotels: OffSeasonDbHotel[],
  citySlug: string,
): OffSeasonHotel[] {
  const out: OffSeasonHotel[] = [];
  const seen = new Set<string>();

  const push = (h: OffSeasonHotel) => {
    const key = norm(h.name);
    if (seen.has(key) || out.length >= MAX_OFF_SEASON) return;
    seen.add(key);
    out.push(h);
  };

  for (const h of rankedHotels.filter(rankedHotelIsHeatedOutdoor)) {
    push({
      name: h.name,
      neighborhood: h.neighborhood,
      poolType: h.poolType,
      heatedMonths: h.bestTime,
      heatedPools: "Heated outdoor pool",
      note: h.highlight,
      score: h.score,
      fromRanking: true,
      source: "ranking",
    });
  }

  for (const h of dbHotels) {
    push({
      name: h.name,
      neighborhood: h.neighborhood ?? "—",
      poolType: h.poolType ?? "Heated outdoor pool",
      heatedMonths: h.yearRound ? "Year-round" : (h.season ?? "Shoulder season"),
      heatedPools:
        h.poolCount && h.poolCount > 1 ? `Heated pool · ${h.poolCount} pools total` : "Heated outdoor pool",
      note:
        h.verificationStatus === "verified"
          ? `Heating verified${h.lastVerified ? ` ${h.lastVerified}` : ""}.`
          : "Heating reported by our sources, verification in progress.",
      score: h.score ?? undefined,
      source: "database",
      slug: h.slug,
    });
  }

  for (const h of offSeasonExtras[citySlug] ?? []) push(h);

  return out;
}

export function OffSeasonPoolHotels({ cityName, citySlug, rankedHotels, dbHotels }: Props) {
  const list = buildOffSeasonList(rankedHotels, dbHotels, citySlug);
  if (list.length === 0) return null;

  const yearRound = list.filter((h) => /year-?round/i.test(h.heatedMonths)).length;
  const fromRanking = list.filter((h) => h.fromRanking).length;

  return (
    <section id="off-season" className="border-y border-border/40 bg-surface/30">
      <div className="mx-auto max-w-7xl px-6 py-20">
        <p className="text-xs uppercase tracking-[0.3em] text-primary">Off season</p>
        <h2 className="mt-3 font-display text-5xl tracking-wide">Off season pool hotels</h2>
        <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
          {cityName} hotels whose <strong className="text-foreground/90">outdoor</strong> pool is heated, so
          you can still swim outside the high season. It combines the hotels already in our {cityName}{" "}
          ranking with additional heated-pool properties we track — {list.length} in total (max{" "}
          {MAX_OFF_SEASON}).
        </p>

        <dl className="mt-8 grid gap-4 sm:grid-cols-3">
          {[
            { label: "Heated outdoor pools", value: String(list.length) },
            { label: "From our ranking", value: String(fromRanking) },
            { label: "Heated year-round", value: String(yearRound) },
          ].map((s) => (
            <div key={s.label} className="rounded-lg border border-border/60 bg-background/60 p-5">
              <dt className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">{s.label}</dt>
              <dd className="mt-2 font-display text-4xl tracking-wide text-primary">{s.value}</dd>
            </div>
          ))}
        </dl>

        <ul className="mt-10 grid gap-4 md:grid-cols-2">
          {list.map((h, i) => (
            <li
              key={`${h.name}-${i}`}
              className="rounded-xl border border-border/60 bg-background/60 p-5 transition hover:border-primary/60"
            >
              <div className="flex items-baseline justify-between gap-4">
                <h3 className="font-display text-2xl leading-tight tracking-wide text-foreground">
                  {h.slug ? (
                    <Link
                      to="/hotels/$slug"
                      params={{ slug: h.slug }}
                      className="hover:text-primary"
                    >
                      {h.name}
                    </Link>
                  ) : (
                    h.name
                  )}
                </h3>
                {typeof h.score === "number" && (
                  <span className="font-mono text-sm text-primary">{h.score.toFixed(1)}</span>
                )}
              </div>
              <p className="mt-1 text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                {h.neighborhood} · {h.poolType}
              </p>
              <p className="mt-3 text-sm text-muted-foreground">{h.note}</p>
              <div className="mt-4 flex flex-wrap gap-2 text-[10px] uppercase tracking-[0.2em]">
                <span className="rounded-full border border-primary/50 px-3 py-1 text-primary">
                  {h.heatedMonths}
                </span>
                <span className="rounded-full border border-border/70 px-3 py-1 text-muted-foreground">
                  {h.heatedPools}
                </span>
                {h.fromRanking && (
                  <span className="rounded-full border border-border/70 px-3 py-1 text-muted-foreground">
                    In our ranking
                  </span>
                )}
              </div>
            </li>
          ))}
        </ul>

        <p className="mt-8 text-xs uppercase tracking-[0.22em] text-muted-foreground">
          Heating months are hotel-stated and change year to year — confirm at booking.
        </p>
      </div>
    </section>
  );
}
