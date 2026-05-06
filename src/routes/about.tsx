import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About BestPoolHotels – Pool Score Method & How We Pick Hotels" },
      {
        name: "description",
        content:
          "We're pool-first: we review the pool experience (vibe, lounging space, service, uniqueness) and rank hotels using Pool Score.",
      },
      { property: "og:title", content: "About BestPoolHotels – Pool Score Method & How We Pick Hotels" },
      {
        property: "og:description",
        content:
          "We're pool-first: we review the pool experience (vibe, lounging space, service, uniqueness) and rank hotels using Pool Score.",
      },
    ],
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
            Every hotel gets a single Pool Score from 0 to 10, based on four
            equally weighted criteria:
          </p>
          <ol className="list-inside list-decimal space-y-3">
            <li>
              <strong className="text-foreground">Vibe & setting</strong> —
              views, greenery, atmosphere, light, and music. Does the pool
              have a soul?
            </li>
            <li>
              <strong className="text-foreground">Lounging space</strong> —
              loungers, cabanas, shade, and deck size. Does it feel roomy
              even at peak hours?
            </li>
            <li>
              <strong className="text-foreground">Service</strong> — bar and
              food service, towels, sunbeds, and the speed and friendliness
              of pool attendants.
            </li>
            <li>
              <strong className="text-foreground">Uniqueness</strong> — the
              wow factor. Skyline edge, mosaic floor, cliffside drop, jungle
              canopy — what makes it unlike anywhere else?
            </li>
            <li>
              <strong className="text-foreground">Overall pool-first feel</strong>{" "}
              — is the pool a real highlight of the stay, or just an amenity
              tucked in a basement?
            </li>
          </ol>
          <p>
            Each criterion is scored 0–10 and the Pool Score is the average,
            rounded to one decimal. We re-score every hotel before each summer
            season.
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
            <a href="mailto:hej@poollist.se" className="text-primary underline">
              hej@poollist.se
            </a>
            .
          </p>
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
