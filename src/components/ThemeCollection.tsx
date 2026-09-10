import { Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { PoolFactsTable } from "@/components/PoolFactsTable";
import { VerificationBadge } from "@/components/VerificationBadge";
import { CheckAvailability } from "@/components/BookingCTA";
import { hasCompletePoolScore } from "@/lib/scoring";
import type { RankedHotel } from "@/lib/rankings.functions";
import type { PoolTheme } from "@/lib/pool-themes";

export function ThemeCollection({
  theme,
  hotels,
  total,
}: {
  theme: PoolTheme;
  hotels: RankedHotel[];
  total: number;
}) {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <nav aria-label="Breadcrumb" className="mx-auto max-w-5xl px-6 pt-24 text-xs uppercase tracking-[0.2em] text-muted-foreground">
        <Link to="/" className="hover:text-primary">
          Home
        </Link>{" "}
        / <span className="text-foreground">{theme.h1}</span>
      </nav>

      <header className="mx-auto max-w-5xl px-6 pb-8 pt-6">
        <h1 className="font-display text-[clamp(2.5rem,6vw,4.5rem)] leading-[0.95] tracking-tight">
          {theme.h1}
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-foreground/85">{theme.intro}</p>
        <p className="mt-4 text-xs uppercase tracking-[0.2em] text-muted-foreground">
          {total} verified hotel profile{total === 1 ? "" : "s"} · Pool Score is our own editorial
          assessment, not a guest rating
        </p>
      </header>

      <section className="mx-auto max-w-5xl space-y-4 px-6 pb-24">
        {hotels.length === 0 ? (
          <p className="rounded-lg border border-border/60 bg-surface/40 p-12 text-center text-muted-foreground">
            No verified hotels in this category yet. We publish a profile only once the pool facts
            are confirmed.
          </p>
        ) : (
          hotels.map((h, i) => {
            const score = hasCompletePoolScore(h.pool_components, h.pool_score_0_10, h.verification_status)
              ? h.pool_score_0_10
              : null;
            return (
              <article
                key={h.id}
                className="rounded-xl border border-border/60 bg-surface/50 p-6 transition hover:border-primary/60"
              >
                <div className="flex flex-wrap items-baseline gap-x-3">
                  <span className="font-display text-2xl text-primary">{i + 1}.</span>
                  <Link
                    to="/hotels/$slug"
                    params={{ slug: h.slug }}
                    className="font-display text-3xl tracking-wide hover:text-primary"
                  >
                    {h.name}
                  </Link>
                  {score != null && (
                    <span className="text-sm text-muted-foreground">
                      Pool Score <strong className="text-foreground">{score.toFixed(1)}</strong>/10
                    </span>
                  )}
                </div>
                <p className="mt-1 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  {h.city}
                  {h.country ? ` · ${h.country}` : ""}
                </p>
                <div className="mt-4">
                  <VerificationBadge
                    status={h.verification_status}
                    date={h.last_verified_date ?? h.pool_score_updated_at}
                  />
                </div>
                <div className="mt-4">
                  <PoolFactsTable facts={h.pool_facts} />
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-4 text-xs uppercase tracking-[0.18em]">
                  <Link
                    to="/hotels/$slug"
                    params={{ slug: h.slug }}
                    className="rounded-sm border border-primary/60 px-4 py-2 text-primary transition hover:bg-primary hover:text-primary-foreground"
                  >
                    View hotel →
                  </Link>
                  <CheckAvailability
                    url={h.affiliate_url ?? h.booking_url}
                    size="sm"
                    className="ml-auto"
                  />
                </div>
              </article>
            );
          })
        )}
      </section>

      <SiteFooter />
    </div>
  );
}

export function themeHead(theme: PoolTheme) {
  const url = `https://bestpoolhotels.com${theme.path}`;
  return {
    meta: [
      { title: theme.title },
      { name: "description", content: theme.description },
      { property: "og:title", content: theme.title },
      { property: "og:description", content: theme.description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: url },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: url }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: theme.h1,
          description: theme.description,
          url,
        }),
      },
    ],
  };
}
