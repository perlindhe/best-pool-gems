import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { PoolFactsTable } from "@/components/PoolFactsTable";
import { VerificationBadge } from "@/components/VerificationBadge";
import { listRankedHotels, listRankingFacets, type RankedHotel } from "@/lib/rankings.functions";

const PAGE_SIZE = 24;

const TOGGLES = [
  { key: "rooftop", label: "Rooftop" },
  { key: "infinity", label: "Infinity" },
  { key: "heated", label: "Heated" },
  { key: "yearRound", label: "Year-round" },
  { key: "indoor", label: "Indoor" },
  { key: "outdoor", label: "Outdoor" },
  { key: "adultsOnly", label: "Adults-only" },
  { key: "familyFriendly", label: "Family-friendly" },
  { key: "beachfront", label: "Beachfront" },
  { key: "saltwater", label: "Saltwater" },
  { key: "verifiedOnly", label: "Verified only" },
] as const;

type ToggleKey = (typeof TOGGLES)[number]["key"];

type Search = {
  city?: string;
  minScore?: number;
  page?: number;
} & Partial<Record<ToggleKey, boolean>>;

function bool(v: unknown) {
  return v === true || v === "1" || v === "true" ? true : undefined;
}

export const Route = createFileRoute("/rankings")({
  validateSearch: (search: Record<string, unknown>): Search => {
    const out: Search = {};
    if (typeof search.city === "string" && search.city) out.city = search.city.slice(0, 60);
    const min = Number(search.minScore);
    if (Number.isFinite(min) && min > 0 && min <= 10) out.minScore = min;
    const page = Number(search.page);
    if (Number.isFinite(page) && page > 1) out.page = Math.min(Math.floor(page), 200);
    for (const t of TOGGLES) {
      const v = bool(search[t.key]);
      if (v) out[t.key] = true;
    }
    return out;
  },
  loaderDeps: ({ search }) => search,
  loader: async ({ deps }) => {
    const page = deps.page ?? 1;
    const { city, minScore, ...rest } = deps;
    const filters: Record<string, unknown> = { limit: PAGE_SIZE, offset: (page - 1) * PAGE_SIZE };
    if (city) filters.city = city;
    if (minScore) filters.minScore = minScore;
    for (const t of TOGGLES) if (rest[t.key]) filters[t.key] = true;
    const [result, facets] = await Promise.all([
      listRankedHotels({ data: filters }),
      listRankingFacets(),
    ]);
    return { ...result, cities: facets.cities, page };
  },
  head: ({ match }) => {
    const s = (match.search ?? {}) as Search;
    const filtered = Object.keys(s).some((k) => k !== "page");
    const title = "Live pool rankings — Best Pool Hotels";
    return {
      meta: [
        { title },
        {
          name: "description",
          content:
            "Live ranking of hotel pools, scored by our editors and combined with real-time guest ratings from Google and TripAdvisor. Filter by rooftop, heated, infinity, adults-only and more.",
        },
        { property: "og:title", content: title },
        {
          property: "og:description",
          content:
            "Hotels ranked by pool score and live guest ratings, filterable by pool type, view and season.",
        },
        { property: "og:type", content: "website" },
        { property: "og:url", content: "https://bestpoolhotels.com/rankings" },
        { name: "twitter:card", content: "summary_large_image" },
        ...(filtered ? [{ name: "robots", content: "noindex, follow" }] : []),
      ],
      links: [{ rel: "canonical", href: "https://bestpoolhotels.com/rankings" }],
    };
  },
  errorComponent: ({ error }) => (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className="mx-auto max-w-3xl px-6 py-32 text-center">
        <h1 className="font-display text-5xl text-primary">Couldn't load rankings</h1>
        <p className="mt-4 text-muted-foreground">{error.message}</p>
      </div>
      <SiteFooter />
    </div>
  ),
  component: RankingsPage,
});

function RankingsPage() {
  const { hotels, total, cities, page } = Route.useLoaderData() as {
    hotels: RankedHotel[];
    total: number;
    cities: Array<{ city: string; city_slug: string; country: string; count: number }>;
    page: number;
  };
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const lastPage = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const activeCount = Object.keys(search).filter((k) => k !== "page").length;

  const setSearch = (next: Partial<Search>) =>
    navigate({ search: (prev) => ({ ...prev, ...next, page: undefined }) as Search });

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <section className="mx-auto max-w-7xl px-6 pb-8 pt-20">
        <p className="text-xs uppercase tracking-[0.35em] text-primary">Live rankings</p>
        <h1 className="mt-4 font-display text-[clamp(3rem,8vw,6rem)] leading-[0.9] tracking-tight">
          The world's best <span className="text-primary">hotel pools</span>
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-foreground/85">
          Each hotel earns a <strong>Pool Score (0–10)</strong> from our editors across five
          dimensions. We blend it with a live <strong>Meta Rating (0–100)</strong> built from{" "}
          Google and TripAdvisor guest ratings. Updated continuously.
        </p>
        <p className="mt-4 text-xs uppercase tracking-[0.25em] text-muted-foreground">
          {total} hotels · {cities.length} destinations
        </p>
      </section>

      {/* Filters */}
      <section className="mx-auto max-w-7xl px-6">
        <div className="rounded-xl border border-border/60 bg-surface/40 p-5">
          <div className="flex flex-wrap items-center gap-3">
            <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Destination
              <select
                value={search.city ?? ""}
                onChange={(e) => setSearch({ city: e.target.value || undefined })}
                className="ml-2 rounded-sm border border-border/60 bg-background px-2 py-1.5 text-xs uppercase tracking-[0.15em] text-foreground"
              >
                <option value="">All</option>
                {cities.map((c) => (
                  <option key={c.city_slug} value={c.city_slug}>
                    {c.city} ({c.count})
                  </option>
                ))}
              </select>
            </label>

            <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Min pool score
              <select
                value={search.minScore ?? ""}
                onChange={(e) =>
                  setSearch({ minScore: e.target.value ? Number(e.target.value) : undefined })
                }
                className="ml-2 rounded-sm border border-border/60 bg-background px-2 py-1.5 text-xs uppercase tracking-[0.15em] text-foreground"
              >
                <option value="">Any</option>
                {[7, 7.5, 8, 8.5, 9].map((v) => (
                  <option key={v} value={v}>
                    {v.toFixed(1)}+
                  </option>
                ))}
              </select>
            </label>

            {activeCount > 0 && (
              <button
                type="button"
                onClick={() => navigate({ search: {} as Search })}
                className="ml-auto text-xs uppercase tracking-[0.2em] text-primary underline-offset-4 hover:underline"
              >
                Clear filters ({activeCount})
              </button>
            )}
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {TOGGLES.map((t) => {
              const active = !!search[t.key];
              return (
                <button
                  key={t.key}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setSearch({ [t.key]: active ? undefined : true } as Partial<Search>)}
                  className={`rounded-sm border px-3 py-1.5 text-[11px] uppercase tracking-[0.18em] transition ${
                    active
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border/60 text-muted-foreground hover:border-primary/60 hover:text-primary"
                  }`}
                >
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl space-y-4 px-6 pb-12 pt-8">
        {hotels.length === 0 ? (
          <p className="rounded-lg border border-border/60 bg-surface/40 p-12 text-center text-muted-foreground">
            No hotels match these filters yet. Try removing one.
          </p>
        ) : (
          hotels.map((h: RankedHotel, i: number) => (
            <RankRow key={h.id} hotel={h} position={(page - 1) * PAGE_SIZE + i + 1} />
          ))
        )}
      </section>

      {lastPage > 1 && (
        <nav className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-6 pb-24 text-xs uppercase tracking-[0.2em]">
          {page > 1 ? (
            <Link
              to="/rankings"
              search={(prev) => ({ ...prev, page: page - 1 > 1 ? page - 1 : undefined })}
              className="rounded-sm border border-primary/60 px-4 py-2 text-primary hover:bg-primary hover:text-primary-foreground"
            >
              ← Previous
            </Link>
          ) : (
            <span />
          )}
          <span className="text-muted-foreground">
            Page {page} of {lastPage}
          </span>
          {page < lastPage ? (
            <Link
              to="/rankings"
              search={(prev) => ({ ...prev, page: page + 1 })}
              className="rounded-sm border border-primary/60 px-4 py-2 text-primary hover:bg-primary hover:text-primary-foreground"
            >
              Next →
            </Link>
          ) : (
            <span />
          )}
        </nav>
      )}

      <SiteFooter />
    </div>
  );
}

function RankRow({ hotel, position }: { hotel: RankedHotel; position: number }) {
  const pool = hotel.pool_score_0_10;
  const meta = hotel.meta_rating_0_100;
  const sources = hotel.sources_used ?? [];
  const google = sources.find((s) => s.source === "google");
  const tripadvisor = sources.find((s) => s.source === "tripadvisor");
  const hero = hotel.hero_photo_url;

  return (
    <article className="group overflow-hidden rounded-xl border border-border/60 bg-surface/50 transition hover:border-primary/60 hover:shadow-glow md:grid md:grid-cols-[minmax(0,420px)_1fr]">
      {/* Photo */}
      <Link
        to="/hotels/$slug"
        params={{ slug: hotel.slug }}
        className="relative block aspect-[4/3] overflow-hidden bg-background md:aspect-auto md:h-full md:min-h-[320px]"
      >
        {hero ? (
          <img
            src={hero}
            alt={`Pool at ${hotel.name}`}
            loading="lazy"
            className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-aqua/30 text-xs uppercase tracking-[0.25em] text-muted-foreground">
            No photo yet
          </div>
        )}
        <div className="absolute left-4 top-4 flex h-14 w-14 items-center justify-center rounded-md bg-gradient-aqua font-display text-2xl text-primary-foreground shadow-glow md:h-16 md:w-16 md:text-3xl">
          {position}
        </div>
        {pool != null && (
          <div className="absolute bottom-4 right-4 rounded-md bg-background/85 px-3 py-1.5 backdrop-blur">
            <span className="font-display text-2xl text-primary">{pool.toFixed(1)}</span>
            <span className="text-xs text-muted-foreground">/10</span>
          </div>
        )}
      </Link>

      {/* Content */}
      <div className="flex flex-col gap-4 p-6 md:p-8">
        <div>
          <div className="flex flex-wrap items-baseline gap-x-3">
            <Link
              to="/hotels/$slug"
              params={{ slug: hotel.slug }}
              className="font-display text-3xl tracking-wide transition hover:text-primary md:text-4xl"
            >
              {hotel.name}
            </Link>
          </div>
          <p className="mt-1 text-xs uppercase tracking-[0.2em] text-muted-foreground">
            {hotel.city}
            {hotel.neighborhood ? ` · ${hotel.neighborhood}` : ""}
            {hotel.country ? ` · ${hotel.country}` : ""}
          </p>
          {hotel.pool_type && (
            <p className="mt-2 text-xs uppercase tracking-[0.2em] text-primary/80">
              {hotel.pool_type}
              {hotel.best_time ? ` · best ${hotel.best_time}` : ""}
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.18em]">
          {google && (
            <SourceBadge label="Google" rating={google.normalized} count={google.rating_count} />
          )}
          {tripadvisor && (
            <SourceBadge
              label="TripAdvisor"
              rating={tripadvisor.normalized}
              count={tripadvisor.rating_count}
            />
          )}
          {meta != null && (
            <span className="rounded-sm border border-border/60 bg-background/40 px-2.5 py-1 text-muted-foreground">
              Meta <strong className="text-foreground">{Math.round(meta)}</strong>
              <span className="text-[10px]">/100</span>
            </span>
          )}
        </div>

        <PoolFactsTable facts={hotel.pool_facts} />

        <div className="mt-auto flex flex-wrap items-center gap-4 pt-2 text-xs uppercase tracking-[0.18em]">
          <Link
            to="/hotels/$slug"
            params={{ slug: hotel.slug }}
            className="rounded-sm border border-primary/60 px-4 py-2 text-primary transition hover:bg-primary hover:text-primary-foreground"
          >
            View hotel →
          </Link>
          {hotel.website_url && (
            <a
              href={hotel.website_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline-offset-4 hover:underline"
            >
              Website ↗
            </a>
          )}
          {hotel.booking_url && (
            <a
              href={hotel.booking_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline-offset-4 hover:underline"
            >
              Book ↗
            </a>
          )}
        </div>
      </div>
    </article>
  );
}


function SourceBadge({
  label,
  rating,
  count,
}: {
  label: string;
  rating: number;
  count: number;
}) {
  return (
    <span className="rounded-sm border border-border/60 bg-background/40 px-2.5 py-1 text-muted-foreground">
      {label}{" "}
      <strong className="text-foreground">{(rating / 20).toFixed(1)}★</strong>
      {count > 0 && (
        <span className="ml-1 text-[10px]">({count.toLocaleString("en-US")})</span>
      )}
    </span>
  );
}
