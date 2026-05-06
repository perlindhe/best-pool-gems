import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { getCity, cities, type Hotel } from "@/data/hotels";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { HotelCard } from "@/components/HotelCard";

export const Route = createFileRoute("/cities/$slug")({
  loader: ({ params }) => {
    const city = getCity(params.slug);
    if (!city) throw notFound();
    return { city };
  },
  head: ({ loaderData }) => {
    const city = loaderData?.city;
    if (!city) return {};
    const title = `De bästa pool-hotellen i ${city.name} — PoolList`;
    const description = `Topp 5 hotell med pool i ${city.name}. ${city.tagline}.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:image", content: city.image },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:image", content: city.image },
      ],
    };
  },
  notFoundComponent: () => (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className="mx-auto max-w-3xl px-6 py-32 text-center">
        <h1 className="font-display text-6xl text-primary">Stad saknas</h1>
        <p className="mt-4 text-muted-foreground">Vi täcker inte den här destinationen ännu.</p>
        <Link to="/" className="mt-8 inline-block text-sm uppercase tracking-[0.25em] text-primary">
          ← Till startsidan
        </Link>
      </div>
    </div>
  ),
  component: CityPage,
});

function CityPage() {
  const { city } = Route.useLoaderData();
  const otherCities = cities.filter((c) => c.slug !== city.slug);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      {/* Hero */}
      <section className="relative isolate overflow-hidden">
        <img
          src={city.image}
          alt={`Pool i ${city.name}`}
          width={1280}
          height={896}
          className="absolute inset-0 -z-10 h-full w-full object-cover"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-hero" />
        <div className="mx-auto flex min-h-[64vh] max-w-7xl flex-col justify-end px-6 pb-16 pt-28">
          <p className="text-xs uppercase tracking-[0.35em] text-primary">{city.country} · Topp 5</p>
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

      {/* Hotels list */}
      <section className="mx-auto max-w-5xl space-y-6 px-6 pb-24">
        {city.hotels.map((h: Hotel) => (
          <HotelCard key={h.rank} hotel={h} />
        ))}
      </section>

      {/* Other cities */}
      <section className="border-t border-border/50 bg-surface/40">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <p className="text-xs uppercase tracking-[0.3em] text-primary">Fortsätt utforska</p>
          <h2 className="mt-3 font-display text-5xl tracking-wide">Andra städer</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {otherCities.map((c) => (
              <Link
                key={c.slug}
                to="/cities/$slug"
                params={{ slug: c.slug }}
                className="group relative overflow-hidden rounded-xl shadow-card"
              >
                <img
                  src={c.image}
                  alt={`Pool i ${c.name}`}
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
