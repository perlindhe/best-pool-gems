import { Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { VerificationBadge } from "@/components/VerificationBadge";
import type { Collection } from "@/data/collections";

export type CollectionHotel = {
  id: string;
  slug: string;
  name: string;
  neighborhood: string | null;
  pool_score_0_10: number | null;
  meta_rating_0_100: number | null;
  hero_photo_url?: string | null;
  cover_image_url: string | null;
  verification_status: "verified" | "partially_verified" | "research_pending";
  last_verified_date: string | null;
  pool_type: string | null;
  season: string | null;
  why_included: string | null;
  editorial_notes: string | null;
};

export function CollectionPage({
  collection,
  hotels,
  total,
}: {
  collection: Collection;
  hotels: CollectionHotel[];
  total: number;
}) {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <article>
        <section className="border-b border-border/40 bg-surface/40">
          <div className="mx-auto max-w-5xl px-6 pb-14 pt-32">
            <nav className="text-xs uppercase tracking-[0.35em] text-primary">
              <Link to="/" className="hover:text-foreground">
                Home
              </Link>
              <span className="mx-2 text-muted-foreground">/</span>
              <Link
                to="/$citySlug"
                params={{ citySlug: collection.citySlug }}
                className="hover:text-foreground"
              >
                {collection.city}
              </Link>
              <span className="mx-2 text-muted-foreground">/</span>
              <span className="text-foreground">{collection.category}</span>
            </nav>
            <h1 className="mt-5 font-display text-[clamp(2.5rem,6vw,4.5rem)] leading-[0.95] tracking-tight text-balance">
              {collection.title}
            </h1>
            <p className="mt-5 max-w-2xl text-lg text-foreground/85">{collection.hero}</p>
            <p className="mt-6 text-xs uppercase tracking-[0.22em] text-muted-foreground">
              {total} hotels in our database · Updated{" "}
              {new Date(collection.lastUpdated).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-3xl px-6 py-14">
          <div className="space-y-4 text-lg leading-relaxed text-foreground/90">
            {collection.intro.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </section>

        <section className="border-t border-border/40 bg-surface/30">
          <div className="mx-auto max-w-5xl px-6 py-16">
            <h2 className="font-display text-4xl tracking-wide text-primary md:text-5xl">
              The ranking
            </h2>
            <div className="mt-10 space-y-5">
              {hotels.map((h, i) => (
                <Link
                  key={h.id}
                  to="/hotels/$slug"
                  params={{ slug: h.slug }}
                  className="group flex gap-5 rounded-lg border border-border/60 bg-background/60 p-5 transition hover:border-primary/60"
                >
                  {(h.hero_photo_url ?? h.cover_image_url) && (
                    <img
                      src={(h.hero_photo_url ?? h.cover_image_url) as string}
                      alt={`${h.name} pool`}
                      width={160}
                      height={160}
                      loading="lazy"
                      className="h-24 w-24 shrink-0 rounded-md object-cover md:h-32 md:w-32"
                    />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-baseline justify-between gap-x-4">
                      <h3 className="font-display text-2xl tracking-wide group-hover:text-primary md:text-3xl">
                        {i + 1}. {h.name}
                      </h3>
                      {typeof h.pool_score_0_10 === "number" && (
                        <span className="font-display text-2xl text-primary">
                          {h.pool_score_0_10.toFixed(1)}
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                      {[h.neighborhood, h.pool_type].filter(Boolean).join(" · ")}
                    </p>
                    {(h.why_included || h.editorial_notes) && (
                      <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-foreground/85">
                        {h.why_included ?? h.editorial_notes}
                      </p>
                    )}
                    <div className="mt-4 flex flex-wrap items-center gap-3">
                      <VerificationBadge
                        status={h.verification_status}
                        date={h.last_verified_date}
                      />
                      {h.season && (
                        <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                          {h.season}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            <Link
              to="/rankings"
              search={{ city: collection.citySlug, page: 1 }}
              className="mt-10 inline-block text-sm uppercase tracking-[0.25em] text-primary hover:text-foreground"
            >
              See all {collection.city} pools →
            </Link>
          </div>
        </section>

        <section className="mx-auto max-w-3xl px-6 py-16">
          <h2 className="font-display text-4xl tracking-wide text-primary md:text-5xl">
            Frequently asked
          </h2>
          <dl className="mt-8 space-y-8">
            {collection.faqs.map((f) => (
              <div key={f.question}>
                <dt className="font-display text-xl tracking-wide text-foreground">{f.question}</dt>
                <dd className="mt-2 leading-relaxed text-foreground/85">{f.answer}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-12 rounded-lg border border-primary/30 bg-primary/5 p-6 text-sm text-muted-foreground">
            <p className="text-xs uppercase tracking-[0.25em] text-primary">How this page works</p>
            <p className="mt-2">
              Hotels are selected automatically from our verified pool database and ordered by Pool
              Score — never by commercial relationship. Read the{" "}
              <Link to="/about" className="underline hover:text-primary">
                Pool Score methodology
              </Link>{" "}
              or our{" "}
              <Link to="/disclosure" className="underline hover:text-primary">
                affiliate disclosure
              </Link>
              .
            </p>
          </div>
        </section>
      </article>

      <SiteFooter />
    </div>
  );
}
