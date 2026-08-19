import { createFileRoute, Link } from "@tanstack/react-router";
import heroImg from "@/assets/hero-pool.jpg";
import { cities, guides } from "@/data/hotels";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { VerificationBadge } from "@/components/VerificationBadge";
import { listRankedHotels, listRankingFacets } from "@/lib/rankings.functions";

const DISCOVERY_FILTERS = [
  { label: "Rooftop pools", search: { rooftop: true } },
  { label: "Infinity edges", search: { infinity: true } },
  { label: "Heated all year", search: { heated: true, yearRound: true } },
  { label: "Adults-only", search: { adultsOnly: true } },
  { label: "Family-friendly", search: { familyFriendly: true } },
  { label: "Beachfront", search: { beachfront: true } },
  { label: "Score 9+", search: { minScore: 9 } },
] as const;

export const Route = createFileRoute("/")({
  loader: async () => {
    const [top, facets] = await Promise.all([
      listRankedHotels({ data: { limit: 6, verifiedOnly: true } }),
      listRankingFacets(),
    ]);
    return { top: top.hotels, total: top.total, cities: facets.cities.slice(0, 8) };
  },
  errorComponent: ({ error }) => (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className="mx-auto max-w-3xl px-6 py-32 text-center">
        <h1 className="font-display text-5xl text-primary">Couldn't load the rankings</h1>
        <p className="mt-4 text-muted-foreground">{error.message}</p>
        <Link to="/rankings" className="mt-8 inline-block text-sm uppercase tracking-[0.25em] text-primary">
          Browse all pools →
        </Link>
      </div>
      <SiteFooter />
    </div>
  ),
  notFoundComponent: () => (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className="mx-auto max-w-3xl px-6 py-32 text-center">
        <h1 className="font-display text-5xl text-primary">Page not found</h1>
      </div>
      <SiteFooter />
    </div>
  ),
  head: () => ({
    meta: [
      { title: "Best hotel pools — Best Pool Hotels" },
      { name: "description", content: "Independent guide to the best hotel pools in the world's biggest travel cities. Rankings, guides and insider tips." },
      { property: "og:title", content: "Best hotel pools — Best Pool Hotels" },
      { property: "og:description", content: "Independent rankings of the world's most beautiful hotel pools." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://bestpoolhotels.com/" },
      { property: "og:image", content: `https://bestpoolhotels.com${heroImg}` },
      { name: "twitter:image", content: `https://bestpoolhotels.com${heroImg}` },
    ],
    links: [
      { rel: "canonical", href: "https://bestpoolhotels.com/" },
      { rel: "preload", as: "image", href: heroImg, fetchpriority: "high" } as unknown as Record<string, string>,
    ],
  }),
  component: Home,
});

function Home() {
  const latestGuides = [...guides].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 4);
  const { top, total, cities: dbCities } = Route.useLoaderData();

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      {/* Hero */}
      <section className="relative isolate overflow-hidden">
        <img
          src={heroImg}
          alt="Rooftop pool at sunset"
          width={1920}
          height={1280}
          fetchPriority="high"
          className="absolute inset-0 -z-10 h-full w-full object-cover"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-hero" />
        <div className="mx-auto flex min-h-[88vh] max-w-7xl flex-col justify-end px-6 pb-20 pt-32 md:pb-28">
          <p className="text-xs uppercase tracking-[0.4em] text-primary">Edition 01 · 2026</p>
          <h1 className="mt-6 max-w-5xl font-display text-[clamp(3.5rem,11vw,9rem)] leading-[0.85] tracking-tight text-balance">
            The best <span className="text-primary">hotel pools</span>, ranked.
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-foreground/85 md:text-xl">
            Independent rankings and guides to the world's most beautiful hotel pools — in Barcelona,
            Paris, London and New York. No sponsored placements.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link
              to="/$citySlug"
              params={{ citySlug: "barcelona" }}
              className="rounded-full bg-primary px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-primary-foreground transition hover:opacity-90"
            >
              Top 10 Barcelona
            </Link>
            <Link
              to="/about"
              className="rounded-full border border-primary/40 px-6 py-3 text-sm uppercase tracking-[0.2em] backdrop-blur transition hover:border-primary hover:bg-primary/10"
            >
              How we rank
            </Link>
          </div>
        </div>
      </section>

      {/* Discovery — live from the pool database */}
      <section className="border-b border-border/50 bg-surface/30">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-primary">Start exploring</p>
              <h2 className="mt-3 font-display text-5xl tracking-wide md:text-6xl">
                {total} pools, one database
              </h2>
              <p className="mt-4 max-w-xl text-sm text-muted-foreground">
                Every pool is scored on the same five criteria and marked with its verification
                state. Filter the full list, or jump straight into a destination.
              </p>
            </div>
            <Link
              to="/rankings"
              className="rounded-full border border-primary/40 px-6 py-3 text-sm uppercase tracking-[0.2em] transition hover:border-primary hover:bg-primary/10"
            >
              All rankings
            </Link>
          </div>

          <ul className="mt-8 flex flex-wrap gap-2">
            {DISCOVERY_FILTERS.map((f) => (
              <li key={f.label}>
                <Link
                  to="/rankings"
                  search={f.search}
                  className="inline-block rounded-full border border-border/70 px-4 py-2 text-[11px] uppercase tracking-[0.18em] text-foreground/85 transition hover:border-primary hover:text-primary"
                >
                  {f.label}
                </Link>
              </li>
            ))}
          </ul>

          {top.length > 0 && (
            <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {top.map((h) => (
                <Link
                  key={h.id}
                  to="/hotels/$slug"
                  params={{ slug: h.slug }}
                  className="group overflow-hidden rounded-xl border border-border/60 bg-surface/50 transition hover:border-primary/60"
                >
                  {(h.hero_photo_url || h.cover_image_url) && (
                    <img
                      src={(h.hero_photo_url || h.cover_image_url) as string}
                      alt={`Pool at ${h.name}`}
                      width={640}
                      height={420}
                      loading="lazy"
                      className="h-48 w-full object-cover transition duration-700 group-hover:scale-105"
                    />
                  )}
                  <div className="p-5">
                    <p className="text-[10px] uppercase tracking-[0.3em] text-primary">
                      {h.city}
                      {h.pool_score_0_10 != null ? ` · ${h.pool_score_0_10.toFixed(1)}/10` : ""}
                    </p>
                    <h3 className="mt-2 font-display text-2xl tracking-wide group-hover:text-primary">
                      {h.name}
                    </h3>
                    <VerificationBadge
                      className="mt-4"
                      status={h.verification_status}
                      date={h.last_verified_date}
                    />
                  </div>
                </Link>
              ))}
            </div>
          )}

          {dbCities.length > 0 && (
            <ul className="mt-10 flex flex-wrap gap-x-6 gap-y-3 text-sm text-muted-foreground">
              {dbCities.map((c) => (
                <li key={c.city_slug}>
                  <Link
                    to="/rankings"
                    search={{ city: c.city_slug }}
                    className="transition hover:text-primary"
                  >
                    {c.city} <span className="text-foreground/50">({c.count})</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* Latest guides */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="flex items-end justify-between gap-6">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-primary">Latest guides</p>
            <h2 className="mt-3 font-display text-5xl tracking-wide md:text-6xl">
              Fresh pool reports
            </h2>
          </div>
          <p className="hidden max-w-sm text-sm text-muted-foreground md:block">
            Curated tips from our editors' latest trips — updated weekly.
          </p>
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-12">
          {/* Featured */}
          <Link
            to="/$citySlug/$articleSlug"
            params={{ citySlug: latestGuides[0].citySlug, articleSlug: latestGuides[0].articleSlug }}
            className="group relative col-span-12 overflow-hidden rounded-xl shadow-card lg:col-span-7"
          >
            <img
              src={latestGuides[0].image}
              alt={latestGuides[0].title}
              width={1280}
              height={896}
              loading="lazy"
              className="h-[520px] w-full object-cover transition duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
            <div className="absolute inset-0 flex flex-col justify-end p-8 md:p-12">
              <p className="text-xs uppercase tracking-[0.3em] text-primary">
                {latestGuides[0].city} · {latestGuides[0].category}
              </p>
              <h3 className="mt-3 font-display text-5xl leading-tight tracking-wide md:text-6xl">
                {latestGuides[0].title}
              </h3>
              <p className="mt-4 max-w-lg text-base text-foreground/90">{latestGuides[0].excerpt}</p>
              <span className="mt-6 inline-flex w-fit items-center gap-2 text-sm uppercase tracking-[0.25em] text-primary">
                Read the guide <span aria-hidden>→</span>
              </span>
            </div>
          </Link>

          <div className="col-span-12 grid gap-8 lg:col-span-5">
            {latestGuides.slice(1).map((g) => (
              <Link
                key={g.slug}
                to="/$citySlug/$articleSlug"
                params={{ citySlug: g.citySlug, articleSlug: g.articleSlug }}
                className="group rounded-xl border border-border/60 bg-surface/60 p-6 transition hover:border-primary/60"
              >
                <p className="text-[10px] uppercase tracking-[0.3em] text-primary">
                  {g.city} · {g.category} · {g.readingTime}
                </p>
                <h3 className="mt-3 font-display text-3xl leading-tight tracking-wide group-hover:text-primary">
                  {g.title}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">{g.excerpt}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Cities row */}
      <section className="border-y border-border/50 bg-surface/40">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <p className="text-xs uppercase tracking-[0.3em] text-primary">Destinations</p>
          <h2 className="mt-3 font-display text-5xl tracking-wide">Explore by city</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {cities.map((c) => (
              <Link
                key={c.slug}
                to="/$citySlug"
                params={{ citySlug: c.slug }}
                className="group relative overflow-hidden rounded-xl shadow-card"
              >
                <img
                  src={c.image}
                  alt={`Pool in ${c.name}`}
                  width={1280}
                  height={896}
                  loading="lazy"
                  className="h-64 w-full object-cover transition duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
                <div className="absolute inset-0 flex flex-col justify-end p-5">
                  <p className="text-[10px] uppercase tracking-[0.3em] text-primary">{c.country}</p>
                  <h3 className="font-display text-3xl tracking-wide">{c.name}</h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
