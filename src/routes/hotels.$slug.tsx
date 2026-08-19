import { createFileRoute, Link, notFound, redirect } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { PoolFactsTable } from "@/components/PoolFactsTable";
import { PoolScoreBreakdown, MetaRatingBreakdown } from "@/components/ScoreBreakdown";
import { VerificationBadge } from "@/components/VerificationBadge";
import { VerificationMethodBadge, verificationMethodDetail } from "@/components/VerificationMethod";
import { CheckAvailability, OfficialSiteLink, StickyBookingBar } from "@/components/BookingCTA";
import { getHotelBySlug, getCanonicalHotelSlug } from "@/lib/hotel-detail.functions";
import type { HotelPhoto } from "@/server/hotel-detail.server";

export const Route = createFileRoute("/hotels/$slug")({
  loader: async ({ params }) => {
    const result = await getHotelBySlug({ data: { slug: params.slug } });
    if (!result) {
      const canonicalSlug = await getCanonicalHotelSlug({ data: { slug: params.slug } });
      if (canonicalSlug) {
        throw redirect({
          to: "/hotels/$slug",
          params: { slug: canonicalSlug },
          statusCode: 301,
        });
      }
      throw notFound();
    }
    return result;
  },
  head: ({ params, loaderData }) => {
    if (!loaderData) return {};
    const { hotel, photos } = loaderData;
    const title = `${hotel.name} — Pool review · Best Pool Hotels`;
    const description =
      hotel.editorial_notes?.slice(0, 155) ||
      `Pool review of ${hotel.name} in ${hotel.city}. Live guest ratings and pool facts.`;
    const image = photos[0]?.url || hotel.cover_image_url || undefined;
    const url = `https://bestpoolhotels.com/hotels/${params.slug}`;
    const google = hotel.sources_used?.find((s) => s.source === "google");
    const ratingValue =
      hotel.meta_rating_0_100 != null ? +(hotel.meta_rating_0_100 / 20).toFixed(2) : null;
    const reviewCount = google?.rating_count ?? 0;
    const jsonLd: Record<string, unknown> = {
      "@context": "https://schema.org",
      "@type": "Hotel",
      name: hotel.name,
      description: hotel.editorial_notes || description,
      url,
      ...(image ? { image } : {}),
      address: {
        "@type": "PostalAddress",
        addressLocality: hotel.city,
        addressCountry: hotel.country,
        ...(hotel.neighborhood ? { addressRegion: hotel.neighborhood } : {}),
      },
    };
    if (ratingValue != null) {
      jsonLd.aggregateRating = {
        "@type": "AggregateRating",
        ratingValue,
        bestRating: 5,
        ...(reviewCount > 0 ? { reviewCount } : { ratingCount: 1 }),
      };
    }
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "article" },
        { property: "og:url", content: url },
        ...(image
          ? [
              { property: "og:image", content: image },
              { name: "twitter:card", content: "summary_large_image" },
              { name: "twitter:image", content: image },
            ]
          : []),
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [
        { type: "application/ld+json", children: JSON.stringify(jsonLd) },
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: "https://bestpoolhotels.com/" },
              {
                "@type": "ListItem",
                position: 2,
                name: hotel.city,
                item: `https://bestpoolhotels.com/${hotel.city_slug ?? hotel.city.toLowerCase()}`,
              },
              { "@type": "ListItem", position: 3, name: hotel.name, item: url },
            ],
          }),
        },
      ],
    };
  },
  notFoundComponent: () => (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className="mx-auto max-w-3xl px-6 py-32 text-center">
        <h1 className="font-display text-6xl text-primary">Hotel not found</h1>
        <Link to="/rankings" className="mt-8 inline-block text-sm uppercase tracking-[0.25em] text-primary">
          ← Back to rankings
        </Link>
      </div>
      <SiteFooter />
    </div>
  ),
  errorComponent: ({ error }) => (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className="mx-auto max-w-3xl px-6 py-32 text-center">
        <h1 className="font-display text-5xl text-primary">Couldn't load hotel</h1>
        <p className="mt-4 text-muted-foreground">{error.message}</p>
      </div>
      <SiteFooter />
    </div>
  ),
  component: HotelDetailPage,
});

function HotelDetailPage() {
  const { hotel, photos, quotes } = Route.useLoaderData() as NonNullable<
    Awaited<ReturnType<typeof getHotelBySlug>>
  >;
  const hero = photos[0]?.url || hotel.cover_image_url;
  const keyFacts: string[] = [
    hotel.rooftop ? "Rooftop" : null,
    hotel.infinity ? "Infinity edge" : null,
    hotel.heated_pool ? "Heated" : null,
    hotel.year_round ? "Year-round" : null,
    hotel.indoor && hotel.outdoor
      ? "Indoor + outdoor"
      : hotel.indoor
        ? "Indoor"
        : hotel.outdoor
          ? "Outdoor"
          : null,
    hotel.saltwater ? "Saltwater" : null,
    hotel.adults_only ? "Adults only" : hotel.family_friendly ? "Family friendly" : null,
    hotel.beachfront ? "Beachfront" : null,
    hotel.pool_view ? `${hotel.pool_view} view` : null,
    hotel.pool_count && hotel.pool_count > 1 ? `${hotel.pool_count} pools` : null,
  ].filter((f): f is string => Boolean(f));
  const gallery = photos.slice(1, 19);
  const sources = hotel.sources_used ?? [];
  const google = sources.find((s) => s.source === "google");
  const tripadvisor = sources.find((s) => s.source === "tripadvisor");

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      {/* Hero */}
      <section className="relative isolate overflow-hidden">
        {hero && (
          <img
            src={hero}
            alt={`Pool at ${hotel.name}`}
            className="absolute inset-0 -z-10 h-full w-full object-cover"
          />
        )}
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-background/40 via-background/60 to-background" />
        <div className="mx-auto flex min-h-[88vh] max-w-6xl flex-col justify-end px-6 pb-20 pt-28">
          <Link
            to="/rankings"
            className="text-xs uppercase tracking-[0.3em] text-primary hover:underline"
          >
            ← Rankings
          </Link>
          <p className="mt-6 text-xs uppercase tracking-[0.35em] text-primary">
            {hotel.city}
            {hotel.neighborhood ? ` · ${hotel.neighborhood}` : ""} · {hotel.country}
          </p>
          <h1 className="mt-3 font-display text-[clamp(3rem,9vw,7rem)] leading-[0.9] tracking-tight">
            {hotel.name}
          </h1>
          {hotel.pool_type && (
            <p className="mt-4 text-sm uppercase tracking-[0.25em] text-foreground/85">
              {hotel.pool_type}
              {hotel.best_time ? ` · best ${hotel.best_time}` : ""}
            </p>
          )}

          {/* Trust + key pool facts, above the fold */}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <VerificationBadge
              status={hotel.verification_status}
              date={hotel.last_verified_date}
            />
            {hotel.verification_method && hotel.verification_method !== "research_pending" && (
              <VerificationMethodBadge method={hotel.verification_method} />
            )}
            {hotel.pool_score_0_10 != null && (
              <span className="inline-flex items-center gap-1.5 rounded-sm border border-primary/60 bg-primary/10 px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-primary">
                Pool score {hotel.pool_score_0_10.toFixed(1)}/10
              </span>
            )}
          </div>
          {keyFacts.length > 0 && (
            <ul className="mt-4 flex flex-wrap gap-2">
              {keyFacts.map((f) => (
                <li
                  key={f}
                  className="rounded-full border border-border/70 bg-background/40 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-foreground/85 backdrop-blur"
                >
                  {f}
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* Scores at-a-glance */}
      <section className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid gap-4 rounded-lg border border-border/60 bg-surface/50 p-6 md:grid-cols-3 md:p-8">
          <ScoreBlock
            label="Pool score"
            value={hotel.pool_score_0_10 != null ? hotel.pool_score_0_10.toFixed(1) : "—"}
            suffix="/10"
            big
          />
          <ScoreBlock
            label="Meta rating"
            value={
              hotel.meta_rating_0_100 != null
                ? Math.round(hotel.meta_rating_0_100).toString()
                : "—"
            }
            suffix="/100"
          />
          <div className="flex flex-col justify-center gap-2 text-xs uppercase tracking-[0.18em]">
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
          </div>
        </div>
      </section>

      {/* Heated pool spotlight */}
      <HeatedPoolPanel
        hotelName={hotel.name}
        heated={hotel.heated_pool}
        indoor={hotel.indoor}
        outdoor={hotel.outdoor}
        yearRound={hotel.year_round}
        poolCount={hotel.pool_count}
        facts={hotel.pool_facts}
        quotes={quotes}
        verificationStatus={hotel.verification_status}
        verificationMethod={hotel.verification_method}
        lastVerifiedDate={hotel.last_verified_date}
        officialUrl={hotel.official_url ?? hotel.website_url}
      />

      {/* Score breakdown — explain how we got there */}

      <section className="mx-auto max-w-6xl px-6 pb-4">
        <p className="text-xs uppercase tracking-[0.3em] text-primary">Behind the numbers</p>
        <h2 className="mt-3 font-display text-3xl tracking-wide md:text-4xl">
          How we scored this hotel
        </h2>
        <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
          Two scores, two methods. The <strong className="text-foreground">pool score</strong>{" "}
          is our editorial judgement of the pool itself. The{" "}
          <strong className="text-foreground">meta rating</strong> is a weighted blend of every
          guest-rating source we track.
        </p>
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <PoolScoreBreakdown
            total={hotel.pool_score_0_10}
            components={hotel.pool_components}
          />
          <MetaRatingBreakdown
            metaRating={hotel.meta_rating_0_100}
            confidence={hotel.confidence_0_100}
            sources={sources}
          />
        </div>
      </section>

      {/* Editorial + Facts */}
      <section className="mx-auto grid max-w-6xl gap-10 px-6 pb-12 md:grid-cols-[1.4fr_1fr]">
        <div>
          {hotel.editorial_notes && (
            <>
              <p className="text-xs uppercase tracking-[0.3em] text-primary">Editor's note</p>
              <p className="mt-4 font-display text-2xl leading-snug tracking-wide text-foreground/95 md:text-3xl">
                {hotel.editorial_notes}
              </p>
            </>
          )}
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <CheckAvailability url={hotel.affiliate_url ?? hotel.booking_url} />
            <OfficialSiteLink url={hotel.official_url ?? hotel.website_url} />
          </div>
          <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
            {verificationMethodDetail(hotel.verification_method)} Booking links may earn us a
            commission; they never influence the Pool Score or the ranking order.
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-primary">Pool facts</p>
          <div className="mt-4">
            <PoolFactsTable facts={hotel.pool_facts} />
          </div>
        </div>
      </section>

      {/* Pool quotes from guests */}
      {quotes.length > 0 && (
        <section className="mx-auto max-w-7xl px-6 pb-20">
          <p className="text-xs uppercase tracking-[0.3em] text-primary">
            What guests say about the pool
          </p>
          <h2 className="mt-3 font-display text-4xl tracking-wide md:text-5xl">
            In their own words
          </h2>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {quotes.slice(0, 3).map((q, i) => (
              <figure
                key={i}
                className="relative flex flex-col rounded-2xl border border-border/60 bg-surface/50 p-7 shadow-elegant"
              >
                <span
                  aria-hidden
                  className="font-display text-7xl leading-none text-primary/40"
                >
                  &ldquo;
                </span>
                <blockquote className="mt-2 flex-1 text-base leading-relaxed text-foreground/90">
                  {q.quote}
                </blockquote>
                <figcaption className="mt-5 flex items-center justify-between text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                  <span>{q.author ? `— ${q.author}` : "— Verified guest"}</span>
                  {q.source_url ? (
                    <a
                      href={q.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      {sourceLabel(q.source)} ↗
                    </a>
                  ) : (
                    <span>{sourceLabel(q.source)}</span>
                  )}
                </figcaption>
              </figure>
            ))}
          </div>
        </section>
      )}

      {/* Gallery */}
      {gallery.length > 0 && (
        <section className="mx-auto max-w-7xl px-6 pb-20">
          <p className="text-xs uppercase tracking-[0.3em] text-primary">Gallery</p>
          <h2 className="mt-3 font-display text-4xl tracking-wide md:text-5xl">
            More from the property
          </h2>
          <div className="mt-8 columns-1 gap-4 sm:columns-2 md:columns-3 [&>figure]:mb-4 [&>figure]:break-inside-avoid">
            {gallery.map((p: HotelPhoto, i: number) => (
              <figure
                key={i}
                className="group overflow-hidden rounded-lg border border-border/50 bg-surface/40"
              >
                <img
                  src={p.url}
                  alt={`${hotel.name} — photo ${i + 2}`}
                  loading="lazy"
                  className="w-full object-cover transition duration-700 group-hover:scale-[1.03]"
                />
                {p.attribution && (
                  <figcaption className="px-3 py-2 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                    © {p.attribution}
                  </figcaption>
                )}
              </figure>
            ))}
          </div>
          <p className="mt-4 text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
            Photos via Google, TripAdvisor and the hotel's own website
          </p>
        </section>
      )}

      {/* Sources & verification */}
      <section className="mx-auto max-w-6xl px-6 pb-20">
        <div className="rounded-lg border border-border/60 bg-surface/40 p-6 md:p-8">
          <p className="text-xs uppercase tracking-[0.3em] text-primary">
            Sources &amp; verification
          </p>
          <h2 className="mt-3 font-display text-2xl tracking-wide md:text-3xl">
            How we verified this pool
          </h2>
          <div className="mt-5 grid gap-6 md:grid-cols-2">
            <div>
              <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                Last verified
              </p>
              <p className="mt-2 text-base text-foreground">
                {hotel.last_verified_date
                  ? new Date(hotel.last_verified_date).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })
                  : "Not yet verified — we are still checking this property."}
              </p>
              {hotel.why_included && (
                <>
                  <p className="mt-5 text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                    Why it's on the list
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-foreground/85">
                    {hotel.why_included}
                  </p>
                </>
              )}
              {hotel.why_not_higher && (
                <>
                  <p className="mt-5 text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                    Why it's not higher
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-foreground/85">
                    {hotel.why_not_higher}
                  </p>
                </>
              )}
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                Sources we used
              </p>
              {hotel.editorial_sources.length > 0 ? (
                <ul className="mt-3 space-y-2 text-sm">
                  {hotel.editorial_sources.map((s, i) => (
                    <li key={i} className="leading-relaxed">
                      {s.url ? (
                        <a
                          href={s.url}
                          target="_blank"
                          rel="noopener noreferrer nofollow"
                          className="text-primary hover:underline"
                        >
                          {s.label} ↗
                        </a>
                      ) : (
                        <span className="text-foreground/90">{s.label}</span>
                      )}
                      {s.note && (
                        <span className="ml-2 text-muted-foreground">— {s.note}</span>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-sm text-muted-foreground">
                  Editorial review based on the hotel's own website, recent guest reviews
                  on Google and TripAdvisor, and our notes from the property.
                </p>
              )}
              <p className="mt-6 text-[10px] uppercase tracking-[0.25em] text-muted-foreground/80">
                Affiliate disclosure: booking links may earn us a commission at no
                extra cost to you. Rankings are editorial and not paid placements.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Compared with — only renders for hotels with curated comparisons */}
      <ComparedWith slug={hotel.slug} />

      <SiteFooter />

      <StickyBookingBar
        name={hotel.name}
        score={hotel.pool_score_0_10}
        url={hotel.affiliate_url ?? hotel.booking_url}
      />
      <div className="h-20 md:hidden" aria-hidden="true" />
    </div>
  );
}

const COMPARISONS: Record<string, Array<{ pair: string; label: string }>> = {
  "barcelona-grand-hotel-central": [
    { pair: "grand-hotel-central-vs-barcelona-edition", label: "Grand Hotel Central vs The Barcelona EDITION" },
    { pair: "grand-hotel-central-vs-kimpton-vividora", label: "Grand Hotel Central vs Kimpton Vividora" },
  ],
  "barcelona-edition": [
    { pair: "grand-hotel-central-vs-barcelona-edition", label: "Grand Hotel Central vs The Barcelona EDITION" },
  ],
  "barcelona-kimpton-vividora": [
    { pair: "grand-hotel-central-vs-kimpton-vividora", label: "Grand Hotel Central vs Kimpton Vividora" },
  ],
  "barcelona-hotel-arts": [
    { pair: "hotel-arts-vs-w-barcelona", label: "Hotel Arts vs W Barcelona" },
  ],
  "barcelona-w": [
    { pair: "hotel-arts-vs-w-barcelona", label: "Hotel Arts vs W Barcelona" },
  ],
};

function ComparedWith({ slug }: { slug: string }) {
  const items = COMPARISONS[slug];
  if (!items?.length) return null;
  return (
    <section className="mx-auto max-w-6xl px-6 pb-20">
      <div className="rounded-lg border border-border/60 bg-surface/40 p-6 md:p-8">
        <p className="text-xs uppercase tracking-[0.3em] text-primary">Compared with</p>
        <h2 className="mt-3 font-display text-2xl tracking-wide md:text-3xl">
          Side-by-side comparisons
        </h2>
        <ul className="mt-5 space-y-2 text-sm">
          {items.map((c) => (
            <li key={c.pair}>
              <Link
                to="/compare/$pair"
                params={{ pair: c.pair }}
                className="text-primary underline-offset-2 hover:underline"
              >
                {c.label} →
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}


function ScoreBlock({
  label,
  value,
  suffix,
  big,
}: {
  label: string;
  value: string;
  suffix: string;
  big?: boolean;
}) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">{label}</p>
      <p
        className={
          big
            ? "mt-1 font-display text-5xl text-primary md:text-6xl"
            : "mt-1 font-display text-4xl text-foreground"
        }
      >
        {value}
        <span className="text-base text-muted-foreground">{suffix}</span>
      </p>
    </div>
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
      {label} <strong className="text-foreground">{(rating / 20).toFixed(1)}★</strong>
      {count > 0 && (
        <span className="ml-1 text-[10px]">({count.toLocaleString("en-US")})</span>
      )}
    </span>
  );
}

function sourceLabel(s: string) {
  if (s === "tripadvisor") return "TripAdvisor";
  if (s === "google") return "Google";
  if (s === "web") return "Web";
  return s;
}

