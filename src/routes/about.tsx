import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { POOL_SCORE_CRITERIA, POOL_SCORE_MAX_POINTS, POOL_SCORE_VERSION } from "@/lib/pool-score-config";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "Pool Score method — How we rank hotel pools" },
      {
        name: "description",
        content:
          "BestPoolHotels uses one evidence-based Pool Score with explicit weightings. See the criteria, the weights and how Pool Score differs from Meta Rating.",
      },
      { property: "og:title", content: "Pool Score method — How we rank hotel pools" },
      {
        property: "og:description",
        content:
          "One evidence-based Pool Score with explicit weightings. Plus the difference between our editorial Pool Score and the external Meta Rating.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://bestpoolhotels.com/about" },
    ],
    links: [{ rel: "canonical", href: "https://bestpoolhotels.com/about" }],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <section className="mx-auto max-w-3xl px-6 py-24">
        <p className="text-xs uppercase tracking-[0.35em] text-primary">About</p>
        <h1 className="mt-4 font-display text-6xl leading-[0.9] tracking-wide md:text-7xl">
          About BestPoolHotels
        </h1>

        <div className="mt-10 space-y-6 text-lg leading-relaxed text-foreground/90">
          <p>
            BestPoolHotels is an independent editorial guide to the world's most
            memorable hotel pools. We don't rank hotels on thread count, lobby
            art, or breakfast buffets — we rank them on the one thing our readers
            actually came for: the pool.
          </p>
        </div>

        <h2 className="mt-16 font-display text-4xl tracking-wide text-primary">
          Our mission: pool-first stays
        </h2>
        <div className="mt-6 space-y-6 text-lg leading-relaxed text-foreground/90">
          <p>
            Most hotel guides treat the pool as an afterthought. We flip that.
            Every hotel on this site is selected and ranked because of how good
            its pool is — the view, the water, the loungers, the crowd, the
            sunset light. If the pool isn't worth a flight, it doesn't make our
            lists.
          </p>
          <p>
            We keep our city lists short — usually five to ten hotels — so every
            spot is one we'd genuinely book ourselves.
          </p>
        </div>

        <h2 className="mt-16 font-display text-4xl tracking-wide text-primary">
          Pool Score method (0–10)
        </h2>
        <div className="mt-6 space-y-6 text-lg leading-relaxed text-foreground/90">
          <p>
            Every hotel has exactly one Pool Score from 0 to 10 — the same
            number on every page. It is built from{" "}
            <strong className="text-foreground">{POOL_SCORE_CRITERIA.length} evidence-based criteria</strong>{" "}
            worth {POOL_SCORE_MAX_POINTS} points in total. A criterion we cannot
            document is left out rather than guessed, and the page says how many
            criteria the score is based on.
          </p>

          <div className="overflow-hidden rounded-lg border border-border/60 bg-surface/40">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/60 text-left text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                  <th className="px-5 py-3 font-normal">Criterion</th>
                  <th className="px-5 py-3 font-normal">What we look at</th>
                  <th className="px-5 py-3 font-normal text-right">Max points</th>
                </tr>
              </thead>
              <tbody className="text-base">
                {POOL_SCORE_CRITERIA.map((c) => (
                  <tr key={c.key} className="border-t border-border/40 align-top">
                    <td className="px-5 py-3 text-foreground">{c.label}{c.required ? " *" : ""}</td>
                    <td className="px-5 py-3 text-foreground/85">{c.hint}</td>
                    <td className="px-5 py-3 text-right tabular-nums">{c.max}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-sm text-muted-foreground">
            * Required — without it no score is published. Model version {POOL_SCORE_VERSION}; each hotel page shows when its score was last recalculated.
          </p>

          <h3 className="font-display text-2xl tracking-wide text-foreground">
            Pool Score vs. Meta Rating
          </h3>
          <p>
            <strong className="text-foreground">Pool Score (0–10)</strong> is our
            evidence-based assessment of the pool, built from the criteria
            above. <strong className="text-foreground">Meta Rating (0–100)</strong>
            is a separate, external signal — a weighted blend of guest ratings
            from Google and TripAdvisor for the hotel as a whole.
          </p>
          <p>
            The two often agree, but they measure different things: a beautiful
            pool can sit in a hotel with mixed service reviews (and vice versa).
            When a hotel has no usable third-party rating data,{" "}
            <strong className="text-foreground">we hide the Meta Rating</strong>{" "}
            rather than show a fake number.
          </p>
          <p>
            Scores are recalculated automatically once a month.
          </p>
          <p className="rounded-md border border-border/60 bg-surface/60 p-4 text-base text-muted-foreground">
            <strong className="text-foreground">A small note:</strong> pool
            details can be seasonal — opening dates, hours, and access for
            non-guests change year to year. Always double-check pool info on
            your booking page before you book.
          </p>
        </div>

        <h2 className="mt-16 font-display text-4xl tracking-wide text-primary">
          How we research
        </h2>
        <div className="mt-6 space-y-6 text-lg leading-relaxed text-foreground/90">
          <p>
            Our shortlists come from a mix of on-the-ground visits, the
            hotels' own websites, and a careful read of recent traveler reviews
            across major booking platforms.
          </p>
          <p>
            We never copy review text. Everything you read here is rewritten in
            our own words by our editors, with quotes and specifics
            cross-checked against multiple sources. If a hotel claims a "rooftop
            infinity pool" but real guests describe a small plunge tub, we go
            with the guests.
          </p>
          <p>
            Pricing, opening hours, and seasonal details are verified directly
            with the hotel before publishing and re-checked at least once per
            year.
          </p>
        </div>

        <h2 className="mt-16 font-display text-4xl tracking-wide text-primary">
          Disclosure
        </h2>
        <div className="mt-6 space-y-6 text-lg leading-relaxed text-foreground/90">
          <p>
            BestPoolHotels is funded by affiliate links. When you click a "Check
            availability" or "Book" link and complete a booking, we may earn a
            small commission at no extra cost to you. These commissions keep the
            site independent and ad-free.
          </p>
          <p>
            Affiliate relationships <strong className="text-foreground">never</strong>{" "}
            influence our Pool Score or which hotels we include. Rankings are
            decided by the editorial team before any booking links are added,
            and hotels cannot pay for placement.
          </p>
          <p>
            For full details, see our{" "}
            <Link to="/disclosure" className="text-primary underline">
              advertising disclosure
            </Link>
            . Questions? Email{" "}
            <a href="mailto:hello@bestpoolhotels.com" className="text-primary underline">
              hello@bestpoolhotels.com
            </a>
            .
          </p>
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
