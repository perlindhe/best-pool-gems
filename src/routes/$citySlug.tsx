import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import { z } from "zod";
import { getCity, cities, getCityGuides, type Hotel, type Guide } from "@/data/hotels";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { HotelCard } from "@/components/HotelCard";
import { getCityHotelPhotos } from "@/lib/city-hotel-photos.functions";
import { getCityHubSummaryFn } from "@/lib/city-hub.functions";

const PAGE_SIZE = 10;

const citySearchSchema = z.object({
  page: fallback(z.number().int().min(1).max(20), 1).default(1),
});

export const Route = createFileRoute("/$citySlug")({
  validateSearch: zodValidator(citySearchSchema),
  loader: async ({ params }) => {
    const city = getCity(params.citySlug);
    if (!city) throw notFound();
    const cityGuides = getCityGuides(city.slug);
    const [hotelInfo, summary] = await Promise.all([
      getCityHotelPhotos({ data: { citySlug: city.slug } }),
      getCityHubSummaryFn({ data: { citySlug: city.slug } }).catch(() => null),
    ]);
    return { city, cityGuides, hotelInfo, summary };
  },

  head: ({ params, loaderData }) => {
    const city = loaderData?.city;
    if (!city) return {};
    const title = `Best pool hotels in ${city.name} — Best Pool Hotels`;
    const description = `Rankings and guides to hotels with the best pools in ${city.name}. ${city.tagline}.`;
    const url = `https://bestpoolhotels.com/${params.citySlug}`;
    const ld = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "CollectionPage",
          name: title,
          description,
          url,
          inLanguage: "en",
          isPartOf: { "@type": "WebSite", name: "Best Pool Hotels", url: "https://bestpoolhotels.com/" },
        },
        {
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: "https://bestpoolhotels.com/" },
            { "@type": "ListItem", position: 2, name: city.name, item: url },
          ],
        },
        ...(city.hotels.length
          ? [
              {
                "@type": "ItemList",
                name: `Top ${city.hotels.length} pool hotels in ${city.name}`,
                itemListElement: city.hotels.slice(0, 10).map((h, i) => ({
                  "@type": "ListItem",
                  position: i + 1,
                  name: h.name,
                })),
              },
            ]
          : []),
      ],
    };
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { property: "og:url", content: url },
        { property: "og:image", content: city.image },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:image", content: city.image },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [{ type: "application/ld+json", children: JSON.stringify(ld) }],
    };
  },

  notFoundComponent: () => (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className="mx-auto max-w-3xl px-6 py-32 text-center">
        <h1 className="font-display text-6xl text-primary">Page missing</h1>
        <p className="mt-4 text-muted-foreground">We don't cover that destination yet.</p>
        <Link to="/" className="mt-8 inline-block text-sm uppercase tracking-[0.25em] text-primary">
          ← Back to home
        </Link>
      </div>
      <SiteFooter />
    </div>
  ),
  errorComponent: ({ error }) => (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className="mx-auto max-w-3xl px-6 py-32 text-center">
        <h1 className="font-display text-5xl text-primary">Something went wrong</h1>
        <p className="mt-4 text-muted-foreground">{error.message}</p>
      </div>
    </div>
  ),
  component: CityHub,
});

function CityHub() {
  const { city, cityGuides, hotelInfo } = Route.useLoaderData();
  const { page } = Route.useSearch();
  const otherCities = cities.filter((c) => c.slug !== city.slug);
  const totalPages = Math.max(1, Math.ceil(city.hotels.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const startIdx = (currentPage - 1) * PAGE_SIZE;
  const pagedHotels = city.hotels.slice(startIdx, startIdx + PAGE_SIZE);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      {/* Hero */}
      <section className="relative isolate overflow-hidden">
        <img
          src={city.image}
          alt={`Pool in ${city.name}`}
          width={1280}
          height={896}
          className="absolute inset-0 -z-10 h-full w-full object-cover"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-hero" />
        <div className="mx-auto flex min-h-[64vh] max-w-7xl flex-col justify-end px-6 pb-16 pt-28">
          <p className="text-xs uppercase tracking-[0.35em] text-primary">{city.country} · Hub</p>
          <h1 className="mt-5 font-display text-[clamp(3.5rem,12vw,9rem)] leading-[0.85] tracking-tight">
            {city.name}
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-foreground/85 md:text-xl">{city.tagline}</p>
        </div>
      </section>

      {/* Intro */}
      <section className="mx-auto max-w-3xl px-6 py-16">
        <p className="font-display text-3xl leading-tight tracking-wide text-foreground/95 md:text-4xl">
          {city.intro}
        </p>
      </section>

      {/* Guides for this city */}
      {cityGuides.length > 0 && (
        <section className="mx-auto max-w-7xl px-6 pb-20">
          <p className="text-xs uppercase tracking-[0.3em] text-primary">Guides</p>
          <h2 className="mt-3 font-display text-5xl tracking-wide">All {city.name} guides</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {cityGuides.map((g: Guide) => (
              <Link
                key={g.slug}
                to="/$citySlug/$articleSlug"
                params={{ citySlug: g.citySlug, articleSlug: g.articleSlug }}
                className="group rounded-xl border border-border/60 bg-surface/60 p-6 transition hover:border-primary/60"
              >
                <p className="text-[10px] uppercase tracking-[0.3em] text-primary">
                  {g.category} · {g.readingTime}
                </p>
                <h3 className="mt-3 font-display text-3xl leading-tight tracking-wide group-hover:text-primary">
                  {g.title}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">{g.excerpt}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Top hotels list (if any) */}
      {city.hotels.length > 0 && (
        <section className="mx-auto max-w-5xl space-y-6 px-6 pb-24">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-primary">Ranking</p>
              <h2 className="mt-2 font-display text-5xl tracking-wide">
                Top {city.hotels.length}
              </h2>
            </div>
            {totalPages > 1 && (
              <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
                #{startIdx + 1}–{startIdx + pagedHotels.length} · Page {currentPage} of {totalPages}
              </p>
            )}
          </div>
          {pagedHotels.map((h: Hotel) => {
            const info = hotelInfo[h.name.toLowerCase()];
            return (
              <HotelCard
                key={h.rank}
                hotel={h}
                slug={info?.slug ?? null}
                photoUrl={info?.url ?? null}
              />
            );
          })}
          {totalPages > 1 && (
            <nav className="mt-10 flex items-center justify-between border-t border-border/40 pt-8">
              {currentPage > 1 ? (
                <Link
                  to="/$citySlug"
                  params={{ citySlug: city.slug }}
                  search={{ page: currentPage - 1 }}
                  className="text-sm uppercase tracking-[0.25em] text-primary hover:underline"
                >
                  ← Page {currentPage - 1}
                </Link>
              ) : (
                <span />
              )}
              <div className="flex gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <Link
                    key={p}
                    to="/$citySlug"
                    params={{ citySlug: city.slug }}
                    search={{ page: p }}
                    className={`rounded-full px-4 py-2 text-xs uppercase tracking-[0.25em] transition ${
                      p === currentPage
                        ? "bg-primary text-primary-foreground"
                        : "border border-border text-muted-foreground hover:border-primary/60 hover:text-foreground"
                    }`}
                  >
                    {p}
                  </Link>
                ))}
              </div>
              {currentPage < totalPages ? (
                <Link
                  to="/$citySlug"
                  params={{ citySlug: city.slug }}
                  search={{ page: currentPage + 1 }}
                  className="text-sm uppercase tracking-[0.25em] text-primary hover:underline"
                >
                  Page {currentPage + 1} →
                </Link>
              ) : (
                <span />
              )}
            </nav>
          )}
        </section>
      )}

      {/* Themed mini-rankings */}
      {city.hotels.length > 0 && (() => {
        const themes: { key: string; label: string; intro: string; pick: (h: Hotel) => boolean }[] = [
          { key: "rooftop", label: "Best rooftop pools", intro: "Skyline views, sunset DJs, plunge pools above the city.", pick: (h) => !!h.tags?.includes("rooftop") },
          { key: "resort", label: "Resort & beachfront", intro: "Big-water, full-cabana hotels — closest thing to a beach resort in town.", pick: (h) => !!h.tags?.includes("resort") },
          { key: "quiet", label: "Quiet & grown-up", intro: "Low-key crowd, no party soundtrack, real swimming space.", pick: (h) => !!h.tags?.includes("quiet") },
          { key: "spa", label: "Pool + serious spa", intro: "Where the pool comes with a proper wellness floor.", pick: (h) => !!h.tags?.includes("spa") },
        ];
        const slices = themes
          .map((t) => ({ ...t, items: city.hotels.filter(t.pick).slice(0, 3) }))
          .filter((t) => t.items.length > 0);
        if (slices.length === 0) return null;
        return (
          <section className="border-t border-border/40 bg-surface/30">
            <div className="mx-auto max-w-7xl px-6 py-20">
              <p className="text-xs uppercase tracking-[0.3em] text-primary">By style</p>
              <h2 className="mt-3 font-display text-5xl tracking-wide">Pick your vibe</h2>
              <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
                The Top 10 in {city.name} ranks every pool by overall score. These shortlists narrow it down by what kind of afternoon you want.
              </p>
              <div className="mt-10 grid gap-6 md:grid-cols-2">
                {slices.map((s) => (
                  <div key={s.key} className="rounded-xl border border-border/60 bg-background/60 p-6">
                    <h3 className="font-display text-2xl tracking-wide text-primary">{s.label}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{s.intro}</p>
                    <ol className="mt-5 space-y-3">
                      {s.items.map((h: Hotel) => (
                        <li key={h.rank} className="flex items-baseline justify-between gap-4 border-t border-border/30 pt-3 first:border-none first:pt-0">
                          <div>
                            <p className="font-display text-lg tracking-wide text-foreground">{h.name}</p>
                            <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">{h.neighborhood} · {h.poolType}</p>
                          </div>
                          <span className="font-mono text-sm text-primary">{h.score.toFixed(1)}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                ))}
              </div>
            </div>
          </section>
        );
      })()}

      {/* Neighborhood snapshot */}
      {city.hotels.length > 0 && (() => {
        const byHood = new Map<string, Hotel[]>();
        for (const h of city.hotels) {
          const list = byHood.get(h.neighborhood) ?? [];
          list.push(h);
          byHood.set(h.neighborhood, list);
        }
        const hoods = Array.from(byHood.entries())
          .sort((a, b) => b[1].length - a[1].length)
          .slice(0, 6);
        if (hoods.length < 2) return null;
        return (
          <section className="mx-auto max-w-7xl px-6 py-20">
            <p className="text-xs uppercase tracking-[0.3em] text-primary">Neighborhoods</p>
            <h2 className="mt-3 font-display text-5xl tracking-wide">Where to stay</h2>
            <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
              A quick map of which {city.name} neighborhoods have the most pool hotels — and what to expect from each.
            </p>
            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {hoods.map(([hood, list]) => (
                <div key={hood} className="rounded-lg border border-border/60 bg-surface/40 p-5">
                  <h3 className="font-display text-xl tracking-wide text-foreground">{hood}</h3>
                  <p className="mt-1 text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                    {list.length} hotel{list.length === 1 ? "" : "s"}
                  </p>
                  <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
                    {list.slice(0, 3).map((h) => (
                      <li key={h.rank} className="flex justify-between gap-2">
                        <span className="truncate text-foreground/80">{h.name}</span>
                        <span className="font-mono text-xs text-primary">{h.score.toFixed(1)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        );
      })()}

      {/* Other cities */}

      <section className="border-t border-border/50 bg-surface/40">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <p className="text-xs uppercase tracking-[0.3em] text-primary">Keep exploring</p>
          <h2 className="mt-3 font-display text-5xl tracking-wide">Other cities</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {otherCities.map((c) => (
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
                  className="h-56 w-full object-cover transition duration-700 group-hover:scale-105"
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

      {city.slug === "barcelona" && (
        <section className="border-t border-border/40 bg-surface/30">
          <div className="mx-auto max-w-6xl px-6 py-16">
            <p className="text-xs uppercase tracking-[0.3em] text-primary">Head to head</p>
            <h2 className="mt-3 font-display text-4xl tracking-wide md:text-5xl">
              Side-by-side comparisons
            </h2>
            <ul className="mt-8 grid gap-4 md:grid-cols-3">
              {[
                { pair: "grand-hotel-central-vs-barcelona-edition", label: "Grand Hotel Central vs The Barcelona EDITION" },
                { pair: "grand-hotel-central-vs-kimpton-vividora", label: "Grand Hotel Central vs Kimpton Vividora" },
                { pair: "hotel-arts-vs-w-barcelona", label: "Hotel Arts vs W Barcelona" },
              ].map((c) => (
                <li key={c.pair}>
                  <Link
                    to="/compare/$pair"
                    params={{ pair: c.pair }}
                    className="block rounded-lg border border-border/60 bg-background/60 p-5 transition hover:border-primary/60"
                  >
                    <p className="font-display text-lg tracking-wide text-foreground">{c.label}</p>
                    <p className="mt-2 text-xs uppercase tracking-[0.2em] text-primary">Compare →</p>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <SiteFooter />
    </div>

  );
}
