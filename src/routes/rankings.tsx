import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { PoolFactsTable } from "@/components/PoolFactsTable";
import { listRankedHotels, type RankedHotel } from "@/lib/rankings.functions";

export const Route = createFileRoute("/rankings")({
  loader: () => listRankedHotels({ data: {} }),
  head: () => ({
    meta: [
      { title: "Live pool rankings — Best Pool Hotels" },
      {
        name: "description",
        content:
          "Live ranking of hotel pools, scored by our editors and combined with real-time guest ratings from Google and TripAdvisor.",
      },
      { property: "og:title", content: "Live pool rankings — Best Pool Hotels" },
      {
        property: "og:description",
        content:
          "Hotels ranked by pool score and live guest ratings from Google and TripAdvisor.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://bestpoolhotels.com/rankings" },
    ],
    links: [{ rel: "canonical", href: "https://bestpoolhotels.com/rankings" }],
  }),
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
  const { hotels } = Route.useLoaderData() as { hotels: RankedHotel[] };
  const cities = Array.from(new Set(hotels.map((h: RankedHotel) => h.city))).filter(Boolean);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <section className="mx-auto max-w-7xl px-6 pb-12 pt-20">
        <p className="text-xs uppercase tracking-[0.35em] text-primary">Live rankings</p>
        <h1 className="mt-4 font-display text-[clamp(3rem,8vw,6rem)] leading-[0.9] tracking-tight">
          The world's best <span className="text-primary">hotel pools</span>
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-foreground/85">
          Each hotel earns a <strong>Pool Score (0–10)</strong> from our editors across five
          dimensions. We blend it with a live <strong>Meta Rating (0–100)</strong> built from{" "}
          Google and TripAdvisor guest ratings. Updated continuously.
        </p>
        {cities.length > 1 && (
          <p className="mt-4 text-xs uppercase tracking-[0.25em] text-muted-foreground">
            {hotels.length} hotels · {cities.length} cities
          </p>
        )}
      </section>

      <section className="mx-auto max-w-5xl space-y-4 px-6 pb-24">
        {hotels.length === 0 ? (
          <p className="rounded-lg border border-border/60 bg-surface/40 p-12 text-center text-muted-foreground">
            No published hotels yet. Add some in the admin to see them ranked here.
          </p>
        ) : (
          hotels.map((h: RankedHotel, i: number) => <RankRow key={h.id} hotel={h} position={i + 1} />)
        )}
      </section>

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
