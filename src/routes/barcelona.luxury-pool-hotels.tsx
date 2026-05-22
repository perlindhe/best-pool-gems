import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { barcelonaTop10, type Hotel, type HotelTag } from "@/data/hotels";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import barcelonaImg from "@/assets/barcelona.jpg";
import { getCityHotelPhotos } from "@/lib/city-hotel-photos.functions";

const TITLE = "Top 10 pool hotels in Barcelona (Pool Score 2026) — Best Pool Hotels";
const DESCRIPTION =
  "Pool-first ranking of Barcelona's ten best hotel pools 2026. Pool Score, pool type, vibe, best time to visit, neighborhood guide and FAQ.";

export const Route = createFileRoute("/barcelona/luxury-pool-hotels")({
  loader: async () => ({
    photos: await getCityHotelPhotos({ data: { citySlug: "barcelona" } }),
  }),
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:image", content: barcelonaImg },
      { property: "og:type", content: "article" },
      { property: "og:url", content: "https://bestpoolhotels.com/barcelona/luxury-pool-hotels" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: barcelonaImg },
    ],
    links: [{ rel: "canonical", href: "https://bestpoolhotels.com/barcelona/luxury-pool-hotels" }],
  }),
  component: LuxuryPoolHotels,
});

const FILTERS: { key: HotelTag | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "rooftop", label: "Rooftop" },
  { key: "resort", label: "Resort" },
  { key: "quiet", label: "Quiet" },
  { key: "spa", label: "Spa" },
];

const NEIGHBORHOODS = [
  {
    name: "Barceloneta",
    angle: "Beachfront resort",
    body: "Closest to the sea — large pools, palm trees and sunsets over the Mediterranean. Pick this if you want to combine beach and pool. Hotel Arts and W are the anchors.",
  },
  {
    name: "Eixample · Passeig de Gràcia",
    angle: "Discreet rooftop luxury",
    body: "Gaudí's blocks. Discreet plunge pools on top of turn-of-the-century palaces. Best for adult couples who want a calmer vibe and Michelin food at the same address.",
  },
  {
    name: "El Born & Gòtic",
    angle: "Pool in the Old Town",
    body: "Smaller pools but unbeatable atmosphere among medieval lanes. Edition has the city's coolest rooftop, Vividora gives you stars over Gòtic.",
  },
  {
    name: "Diagonal & Poblenou",
    angle: "Skyline without the tourist crush",
    body: "Calmer, more modern hotels just outside the center. Sky Bar 26 at Sofia and Meliá Sky offer 360° views without the crowds.",
  },
];

const FAQS = [
  {
    q: "What is Pool Score?",
    a: "A weighted 0–10 score based on five criteria: vibe & setting, lounging space, service, uniqueness and overall pool-first feel. We re-score before each summer season.",
  },
  {
    q: "When are Barcelona's rooftop pools open?",
    a: "Season runs roughly May 15 to September 30. June–August is hottest (water 24–27°C). Mandarin Oriental and Hotel Arts have heated pools year-round.",
  },
  {
    q: "Can non-guests visit the rooftop pools?",
    a: "Many hotels sell day passes or have a minimum spend (€50–80). Edition, Mandarin and SOFIA are popular — book ahead via the hotel's website.",
  },
  {
    q: "Which hotel has the best pool for families?",
    a: "Hotel Arts has two large outdoor pools, family-friendly service and a direct beachfront location. W suits older teens thanks to its party vibe.",
  },
  {
    q: "What's the calmest pool choice?",
    a: "Mandarin Oriental Terrat, Cotton House and Almanac. Small crowds, adult clientele, no DJ.",
  },
  {
    q: "Which hotel has the best view?",
    a: "Hotel SOFIA Sky Bar 26 has the broadest 360° view. Mandarin Oriental sits lower but has Eixample's skyline right in front of it.",
  },
  {
    q: "Which pools are open year-round?",
    a: "Mandarin Oriental (heated rooftop pool), Hotel Arts (indoor spa) and most 5-star spa facilities in Eixample.",
  },
  {
    q: "How often is the ranking updated?",
    a: "Before every summer (April–May). Price and seasonal info is verified directly with the hotels and double-checked against fresh guest reviews.",
  },
];

const TAG_LABEL: Record<HotelTag, string> = {
  rooftop: "Rooftop",
  resort: "Resort",
  quiet: "Quiet",
  spa: "Spa",
};

function LuxuryPoolHotels() {
  const [filter, setFilter] = useState<HotelTag | "all">("all");
  const { photos } = Route.useLoaderData();

  const visible = useMemo(
    () =>
      filter === "all"
        ? barcelonaTop10
        : barcelonaTop10.filter((h) => h.tags?.includes(filter)),
    [filter],
  );

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      {/* Hero */}
      <section className="relative isolate overflow-hidden">
        <img
          src={barcelonaImg}
          alt="Rooftop pool in Barcelona"
          width={1920}
          height={1280}
          className="absolute inset-0 -z-10 h-full w-full object-cover"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-hero" />
        <div className="mx-auto flex min-h-[72vh] max-w-7xl flex-col justify-end px-6 pb-16 pt-28">
          <nav className="mb-6 text-xs uppercase tracking-[0.3em] text-primary">
            <Link to="/" className="hover:text-foreground">Best Pool Hotels</Link>
            <span className="mx-2 text-muted-foreground">/</span>
            <Link to="/$citySlug" params={{ citySlug: "barcelona" }} className="hover:text-foreground">
              Barcelona
            </Link>
            <span className="mx-2 text-muted-foreground">/</span>
            <span className="text-foreground">Top 10</span>
          </nav>
          <p className="text-xs uppercase tracking-[0.35em] text-primary">Pool Score 2026 · Big guide</p>
          <h1 className="mt-5 max-w-5xl font-display text-[clamp(3rem,9vw,7.5rem)] leading-[0.85] tracking-tight text-balance">
            Top 10 pool hotels in Barcelona
          </h1>
          <p className="mt-4 text-sm uppercase tracking-[0.3em] text-muted-foreground">
            Pool Score 2026 · updated for summer
          </p>
        </div>
      </section>

      {/* Intro */}
      <section className="mx-auto max-w-3xl px-6 py-20">
        <p className="font-display text-3xl leading-tight tracking-wide text-foreground/95 md:text-4xl">
          We don't rank hotels on bedding, breakfast buffets or lobby art.
          We rank them on the <span className="text-primary">pool</span>.
        </p>
        <div className="mt-8 space-y-5 text-lg leading-relaxed text-foreground/90">
          <p>
            Barcelona is a pool city. Between the Mediterranean breeze, Gaudí's
            skyline and the city's 270+ days of sunshine, hotels have spent a
            decade competing to build the most beautiful rooftop plunge, the
            boldest mosaic floor, the most Instagrammed sunset moment. This guide
            is the result of four seasons of visits, 200+ hours in lounge chairs
            and just as many poolside cocktails.
          </p>
          <p>
            Every hotel gets a Pool Score from 0–10 based on vibe & setting,
            lounging space, service, uniqueness and overall pool-first feel. We
            don't accept payment for placement, and the ranking is set by the
            editorial team before any booking links are added. You can trust
            that a 7 here is a 7 no matter who advertises.
          </p>
          <p>
            Use the quick filters below if you're after a specific vibe — a
            quieter pool morning, a beachfront party resort or a spa with
            heated water in April.
          </p>
        </div>
      </section>

      {/* Quick filter */}
      <section className="sticky top-[64px] z-40 border-y border-border/40 bg-background/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-2 px-6 py-4">
          <span className="mr-3 text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
            Filter
          </span>
          {FILTERS.map((f) => {
            const active = filter === f.key;
            return (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`rounded-full border px-4 py-2 text-xs uppercase tracking-[0.2em] transition ${
                  active
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border/60 text-muted-foreground hover:border-primary/60 hover:text-foreground"
                }`}
              >
                {f.label}
              </button>
            );
          })}
          <span className="ml-auto text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
            {visible.length} hotels
          </span>
        </div>
      </section>

      {/* Top 10 list */}
      <section className="mx-auto max-w-5xl space-y-6 px-6 py-16">
        {visible.length === 0 && (
          <p className="rounded-md border border-border/60 bg-surface/60 p-8 text-center text-muted-foreground">
            No hotel matches that filter. Try a different vibe.
          </p>
        )}
        {visible.map((h: Hotel) => {
          const info = photos[h.name.toLowerCase()];
          const photo = info?.url ?? null;
          const slug = info?.slug ?? null;
          const CardInner = (
          <article
            className="group relative overflow-hidden rounded-lg border border-border/60 bg-surface/60 shadow-card transition hover:border-primary/60"
          >
            <div className="grid gap-0 md:grid-cols-[18rem_1fr]">
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-gradient-aqua md:aspect-auto md:h-full">
                {photo ? (
                  <img
                    src={photo}
                    alt={`${h.name} pool`}
                    loading="lazy"
                    className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center font-display text-5xl text-primary-foreground/70">
                    {h.rank}
                  </div>
                )}
                <div className="absolute left-3 top-3 flex h-12 w-12 items-center justify-center rounded-md bg-background/85 font-display text-2xl text-primary shadow-glow backdrop-blur">
                  {h.rank}
                </div>
              </div>
              <div className="flex-1 p-6 md:p-8">
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                  <h2 className="font-display text-3xl tracking-wide md:text-4xl group-hover:text-primary">
                    {h.name}
                  </h2>
                  <span className="font-display text-2xl text-primary">
                    {h.score.toFixed(1)}
                    <span className="ml-1 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                      Pool Score
                    </span>
                  </span>
                </div>
                <p className="mt-1 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  {h.neighborhood} · {h.poolType}
                </p>
                <p className="mt-4 text-base leading-relaxed text-foreground/90">{h.description}</p>

                <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-3">
                  <div>
                    <dt className="text-[10px] uppercase tracking-[0.2em] text-primary">Vibe</dt>
                    <dd className="mt-1 text-foreground/90">{h.vibe}</dd>
                  </div>
                  <div>
                    <dt className="text-[10px] uppercase tracking-[0.2em] text-primary">Best time</dt>
                    <dd className="mt-1 text-foreground/90">{h.bestTime}</dd>
                  </div>
                  <div>
                    <dt className="text-[10px] uppercase tracking-[0.2em] text-primary">Price</dt>
                    <dd className="mt-1 text-foreground/90">{h.pricePerNight}</dd>
                  </div>
                </dl>

                {h.tags && h.tags.length > 0 && (
                  <div className="mt-5 flex flex-wrap gap-2">
                    {h.tags.map((t) => (
                      <span
                        key={t}
                        className="rounded-sm border border-primary/40 bg-primary/10 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-primary"
                      >
                        {TAG_LABEL[t]}
                      </span>
                    ))}
                  </div>
                )}

                {slug && (
                  <p className="mt-5 text-xs uppercase tracking-[0.25em] text-primary">
                    View hotel →
                  </p>
                )}
              </div>
            </div>
          </article>
          );
          return slug ? (
            <Link key={h.rank} to="/hotels/$slug" params={{ slug }} className="block">
              {CardInner}
            </Link>
          ) : (
            <div key={h.rank}>{CardInner}</div>
          );
        })}
      </section>

      {/* Areas / map section */}
      <section className="border-t border-border/40 bg-surface/40">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <p className="text-xs uppercase tracking-[0.3em] text-primary">Map</p>
          <h2 className="mt-3 font-display text-5xl tracking-wide md:text-6xl">
            Best neighborhoods for pools
          </h2>
          <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
            Where you stay decides the kind of pool you get. Here are the four
            neighborhoods where pool life is best — and what they're good at.
          </p>

          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {NEIGHBORHOODS.map((n) => (
              <div
                key={n.name}
                className="rounded-xl border border-border/60 bg-background/60 p-7 transition hover:border-primary/60"
              >
                <p className="text-[10px] uppercase tracking-[0.3em] text-primary">{n.angle}</p>
                <h3 className="mt-3 font-display text-3xl tracking-wide md:text-4xl">{n.name}</h3>
                <p className="mt-4 text-base leading-relaxed text-foreground/90">{n.body}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 overflow-hidden rounded-xl border border-border/60">
            <iframe
              title="Map of Barcelona"
              src="https://www.openstreetmap.org/export/embed.html?bbox=2.1450%2C41.3700%2C2.2050%2C41.4050&amp;layer=mapnik"
              loading="lazy"
              className="h-[420px] w-full"
            />
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-6 py-24">
        <p className="text-xs uppercase tracking-[0.3em] text-primary">FAQ</p>
        <h2 className="mt-3 font-display text-5xl tracking-wide md:text-6xl">
          Frequently asked
        </h2>
        <div className="mt-10 divide-y divide-border/50 border-y border-border/50">
          {FAQS.map((f) => (
            <details key={f.q} className="group py-5">
              <summary className="flex cursor-pointer list-none items-start justify-between gap-4 font-display text-2xl tracking-wide transition hover:text-primary">
                {f.q}
                <span className="mt-1 shrink-0 text-primary transition group-open:rotate-45">＋</span>
              </summary>
              <p className="mt-3 text-base leading-relaxed text-foreground/85">{f.a}</p>
            </details>
          ))}
        </div>
        <p className="mt-8 rounded-md border border-border/60 bg-surface/60 p-4 text-sm text-muted-foreground">
          Pool details can be seasonal. Always double-check pool info on your
          booking page before you book.
        </p>
      </section>

      {/* CTA + how we rank */}
      <section className="border-t border-border/40 bg-gradient-hero">
        <div className="mx-auto max-w-5xl px-6 py-24 text-center">
          <p className="text-xs uppercase tracking-[0.35em] text-primary">Pool-first stays</p>
          <h2 className="mt-4 font-display text-5xl leading-tight tracking-wide md:text-6xl">
            Find your pool in Barcelona
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-foreground/85">
            Ten hotels, one list, no sponsorship. Use the guide, read our method —
            and if you want to dive deeper into rooftop or beach options we have
            separate guides for that too.
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Link
              to="/$citySlug/$articleSlug"
              params={{ citySlug: "barcelona", articleSlug: "rooftop-pool-hotels" }}
              className="rounded-full bg-primary px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-primary-foreground transition hover:opacity-90"
            >
              Best rooftop pools
            </Link>
            <Link
              to="/$citySlug/$articleSlug"
              params={{ citySlug: "barcelona", articleSlug: "pool-hotels-near-beach" }}
              className="rounded-full border border-primary/40 px-6 py-3 text-sm uppercase tracking-[0.2em] backdrop-blur transition hover:border-primary hover:bg-primary/10"
            >
              Pools by the beach
            </Link>
            <Link
              to="/about"
              className="rounded-full border border-border/60 px-6 py-3 text-sm uppercase tracking-[0.2em] transition hover:border-primary hover:bg-primary/10"
            >
              How we rank →
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
