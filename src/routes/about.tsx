import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "Pool Score method — How we rank hotel pools" },
      {
        name: "description",
        content:
          "BestPoolHotels uses a five-criterion Pool Score with explicit weightings. See the method, the example scoring table and how Pool Score differs from Meta Rating.",
      },
      { property: "og:title", content: "Pool Score method — How we rank hotel pools" },
      {
        property: "og:description",
        content:
          "Five criteria, explicit weightings and a worked example. Plus the difference between our editorial Pool Score and the external Meta Rating.",
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
            Every hotel earns a single Pool Score from 0 to 10, calculated from
            <strong className="text-foreground"> five weighted criteria</strong>.
            Each criterion is scored 0–10 by an editor, then the criteria are
            combined with the weightings below.
          </p>

          <div className="overflow-hidden rounded-lg border border-border/60 bg-surface/40">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/60 text-left text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                  <th className="px-5 py-3 font-normal">Criterion</th>
                  <th className="px-5 py-3 font-normal">What we look at</th>
                  <th className="px-5 py-3 font-normal text-right">Weight</th>
                </tr>
              </thead>
              <tbody className="text-base">
                <tr className="border-t border-border/40 align-top">
                  <td className="px-5 py-3 text-foreground">Pool design &amp; setting</td>
                  <td className="px-5 py-3 text-foreground/85">Architecture, materials, shape, integration with the building.</td>
                  <td className="px-5 py-3 text-right tabular-nums">25%</td>
                </tr>
                <tr className="border-t border-border/40 align-top">
                  <td className="px-5 py-3 text-foreground">View &amp; atmosphere</td>
                  <td className="px-5 py-3 text-foreground/85">What you see from the water, the crowd, the music, the light.</td>
                  <td className="px-5 py-3 text-right tabular-nums">25%</td>
                </tr>
                <tr className="border-t border-border/40 align-top">
                  <td className="px-5 py-3 text-foreground">Size &amp; lounging space</td>
                  <td className="px-5 py-3 text-foreground/85">Pool footprint, deck size, sunbeds, shade, room at peak hour.</td>
                  <td className="px-5 py-3 text-right tabular-nums">20%</td>
                </tr>
                <tr className="border-t border-border/40 align-top">
                  <td className="px-5 py-3 text-foreground">Access &amp; seasonality</td>
                  <td className="px-5 py-3 text-foreground/85">Guest-only vs. day-pass, season length, daily hours, heated / year-round.</td>
                  <td className="px-5 py-3 text-right tabular-nums">15%</td>
                </tr>
                <tr className="border-t border-border/40 align-top">
                  <td className="px-5 py-3 text-foreground">Service &amp; maintenance</td>
                  <td className="px-5 py-3 text-foreground/85">Cleanliness, water temperature, towel and bar service, attentiveness.</td>
                  <td className="px-5 py-3 text-right tabular-nums">15%</td>
                </tr>

              </tbody>
            </table>
          </div>

          <h3 className="font-display text-2xl tracking-wide text-foreground">
            Example scoring — Grand Hotel Central
          </h3>
          <div className="overflow-hidden rounded-lg border border-border/60 bg-surface/40">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/60 text-left text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                  <th className="px-5 py-3 font-normal">Criterion</th>
                  <th className="px-5 py-3 font-normal">Score (0–10)</th>
                  <th className="px-5 py-3 font-normal">Weight</th>
                  <th className="px-5 py-3 font-normal text-right">Contribution</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border/40"><td className="px-5 py-3">Pool design &amp; setting</td><td className="px-5 py-3 tabular-nums">9.5</td><td className="px-5 py-3 tabular-nums text-muted-foreground">25%</td><td className="px-5 py-3 text-right tabular-nums">2.38</td></tr>
                <tr className="border-t border-border/40"><td className="px-5 py-3">View &amp; atmosphere</td><td className="px-5 py-3 tabular-nums">9.5</td><td className="px-5 py-3 tabular-nums text-muted-foreground">25%</td><td className="px-5 py-3 text-right tabular-nums">2.38</td></tr>
                <tr className="border-t border-border/40"><td className="px-5 py-3">Size &amp; lounging space</td><td className="px-5 py-3 tabular-nums">9.0</td><td className="px-5 py-3 tabular-nums text-muted-foreground">20%</td><td className="px-5 py-3 text-right tabular-nums">1.80</td></tr>
                <tr className="border-t border-border/40"><td className="px-5 py-3">Access &amp; seasonality</td><td className="px-5 py-3 tabular-nums">8.5</td><td className="px-5 py-3 tabular-nums text-muted-foreground">15%</td><td className="px-5 py-3 text-right tabular-nums">1.28</td></tr>
                <tr className="border-t border-border/40"><td className="px-5 py-3">Service &amp; maintenance</td><td className="px-5 py-3 tabular-nums">9.0</td><td className="px-5 py-3 tabular-nums text-muted-foreground">15%</td><td className="px-5 py-3 text-right tabular-nums">1.35</td></tr>
                <tr className="border-t border-border/40 bg-primary/5"><td className="px-5 py-3 font-semibold text-foreground" colSpan={3}>Pool Score</td><td className="px-5 py-3 text-right font-display text-2xl text-primary">9.2</td></tr>

              </tbody>
            </table>
          </div>

          <h3 className="font-display text-2xl tracking-wide text-foreground">
            Pool Score vs. Meta Rating
          </h3>
          <p>
            <strong className="text-foreground">Pool Score (0–10)</strong> is our
            own editorial judgement of the pool, built from the five criteria
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
            We re-score every hotel before each summer season.
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
