import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import { z } from "zod";
import { getCity, cities, getCityGuides, type Hotel, type Guide } from "@/data/hotels";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { HotelCard } from "@/components/HotelCard";
import { getCityHotelPhotos } from "@/lib/city-hotel-photos.functions";

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
    const hotelInfo = await getCityHotelPhotos({ data: { citySlug: city.slug } });
    return { city, cityGuides, hotelInfo };
  },
  head: ({ params, loaderData }) => {
    const city = loaderData?.city;
    if (!city) return {};
    const title = `Best pool hotels in ${city.name} — Best Pool Hotels`;
    const description = `Rankings and guides to hotels with the best pools in ${city.name}. ${city.tagline}.`;
    const url = `https://bestpoolhotels.com/${params.citySlug}`;
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

      <SiteFooter />
    </div>
  );
}
