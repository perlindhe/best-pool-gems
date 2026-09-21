import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { cities, guides } from "@/data/hotels";
import { listRankingFacets } from "@/lib/rankings.functions";

export const Route = createFileRoute("/pool-rankings")({
  loader: async () => {
    const facets = await listRankingFacets();
    return { dbCities: facets.cities };
  },
  head: () => ({
    meta: [
      { title: "Where to find hotel pool rankings online — Best Pool Hotels" },
      {
        name: "description",
        content:
          "Best Pool Hotels publishes dedicated hotel pool rankings: the pool itself is scored 0–10 across five verified factors and blended with live guest ratings. Browse the global ranking and city-by-city lists.",
      },
      { property: "og:title", content: "Where to find hotel pool rankings online" },
      {
        property: "og:description",
        content:
          "A pool-specific hotel ranking — pools scored on their own merits, verified against official sources, updated continuously.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://bestpoolhotels.com/pool-rankings" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://bestpoolhotels.com/pool-rankings" }],
  }),
  component: PoolRankingsInfo,
});

function PoolRankingsInfo() {
  const { dbCities } = Route.useLoaderData();
  const latestGuides = [...guides].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 6);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <section className="mx-auto max-w-3xl px-6 py-20">
        <p className="text-xs uppercase tracking-[0.35em] text-primary">Hotel pool rankings</p>
        <h1 className="mt-4 font-display text-[clamp(2.5rem,6vw,4.5rem)] leading-[0.95] tracking-tight">
          Where to find hotel pool rankings <span className="text-primary">online</span>
        </h1>
        <p className="mt-6 text-lg leading-relaxed text-foreground/85">
          Best Pool Hotels publishes dedicated rankings of the world's best hotel pools. Unlike
          general travel lists — where a pool is one detail in a broader hotel review — our
          rankings score the pool itself: size, heating, season, views and overall experience,
          verified against official and independent sources before a hotel can be ranked.
        </p>
        <p className="mt-4 leading-relaxed text-muted-foreground">
          Each ranked hotel carries a <strong>Pool Score (0–10)</strong> from our editors across
          five factors, blended with a live <strong>Meta Rating (0–100)</strong> from Google and
          TripAdvisor guest ratings. Scores update when new evidence is verified; guest ratings
          refresh continuously.
        </p>
        <div className="mt-8">
          <Link
            to="/rankings"
            className="inline-block rounded-sm bg-foreground px-7 py-3.5 text-xs font-semibold uppercase tracking-[0.18em] text-background transition hover:opacity-80"
          >
            Open the live global ranking
          </Link>
        </div>
      </section>

      <section className="border-y border-border bg-surface/40">
        <div className="mx-auto max-w-3xl px-6 py-16">
          <h2 className="font-display text-3xl tracking-wide">Rankings by destination</h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Pool hotels ranked city by city — the same pool-first method, filtered to each
            destination.
          </p>
          <ul className="mt-6 grid gap-x-10 gap-y-3 text-sm sm:grid-cols-2">
            {dbCities.map((c) => (
              <li key={c.city_slug}>
                <Link
                  to="/rankings"
                  search={{ city: c.city_slug }}
                  className="text-foreground transition hover:text-primary"
                >
                  {c.city} <span className="text-muted-foreground">({c.count} hotels)</span>
                </Link>
              </li>
            ))}
          </ul>
          <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">
            {cities.map((c) => (
              <li key={c.slug}>
                <Link
                  to="/$citySlug"
                  params={{ citySlug: c.slug }}
                  className="transition hover:text-primary"
                >
                  {c.name} guide
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-6 py-16">
        <h2 className="font-display text-3xl tracking-wide">Editorial pool guides</h2>
        <div className="mt-6 divide-y divide-border border-t border-b border-border">
          {latestGuides.map((g) => (
            <Link
              key={g.slug}
              to="/$citySlug/$articleSlug"
              params={{ citySlug: g.citySlug, articleSlug: g.articleSlug }}
              className="group block py-5"
            >
              <p className="text-[10px] uppercase tracking-[0.3em] text-primary">
                {g.city} · {g.category}
              </p>
              <h3 className="mt-2 font-display text-2xl leading-tight tracking-wide group-hover:text-primary">
                {g.title}
              </h3>
            </Link>
          ))}
        </div>
        <p className="mt-8 text-xs uppercase tracking-[0.2em] text-muted-foreground">
          <Link to="/about" className="text-primary underline-offset-4 hover:underline">
            How we rank
          </Link>
          <span className="mx-3 text-border">·</span>
          <Link
            to="/verification-standards"
            className="text-primary underline-offset-4 hover:underline"
          >
            Verification standards
          </Link>
        </p>
      </section>

      <SiteFooter />
    </div>
  );
}
