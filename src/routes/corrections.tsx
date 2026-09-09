import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

const TITLE = "Corrections policy & contact — Best Pool Hotels";
const DESCRIPTION =
  "How to report a wrong pool fact, how fast we respond, how we log corrections, and how to reach the Best Pool Hotels editorial desk.";

export const Route = createFileRoute("/corrections")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://bestpoolhotels.com/corrections" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: "https://bestpoolhotels.com/corrections" }],
  }),
  component: Corrections,
});

function Corrections() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <section className="mx-auto max-w-3xl px-6 py-24">
        <p className="text-xs uppercase tracking-[0.35em] text-primary">Accountability</p>
        <h1 className="mt-4 font-display text-6xl leading-[0.9] tracking-wide md:text-7xl">
          Corrections policy &amp; contact
        </h1>

        <div className="mt-10 space-y-6 text-lg leading-relaxed text-foreground/90">
          <p>
            We publish pool facts that change with the season, so some of them will
            eventually be wrong. When that happens we want to hear about it, fix it quickly
            and say what we changed.
          </p>
        </div>

        <h2 className="mt-16 font-display text-4xl tracking-wide text-primary">
          How to report an error
        </h2>
        <div className="mt-6 space-y-6 text-lg leading-relaxed text-foreground/90">
          <p>
            Email{" "}
            <a href="mailto:hello@bestpoolhotels.com" className="text-primary underline">
              hello@bestpoolhotels.com
            </a>{" "}
            with the page address and what is wrong. A link or a photo that backs up the
            correct information helps us act faster.
          </p>
          <p>
            Hotels are welcome to write in directly. We treat a hotel's own website and
            written confirmation as a primary source — but a correction request never buys a
            better placement, a higher score or a spot in a guide.
          </p>
        </div>

        <h2 className="mt-16 font-display text-4xl tracking-wide text-primary">What happens next</h2>
        <div className="mt-6 space-y-4 text-lg leading-relaxed text-foreground/90">
          <ul className="list-inside list-disc space-y-2">
            <li>We confirm receipt within three working days.</li>
            <li>
              We re-check the fact against the sources required by our{" "}
              <Link to="/verification-standards" className="text-primary underline">
                verification standards
              </Link>
              .
            </li>
            <li>
              If we can't confirm the new information, the fact is set to "Not confirmed"
              rather than swapped for another unsourced claim.
            </li>
            <li>
              A corrected page gets a new verification date, and a factual correction is
              noted on the page itself rather than silently overwritten.
            </li>
          </ul>
        </div>

        <h2 className="mt-16 font-display text-4xl tracking-wide text-primary">Contact</h2>
        <div className="mt-6 space-y-6 text-lg leading-relaxed text-foreground/90">
          <p>
            Editorial, corrections, press and partnership questions all go to{" "}
            <a href="mailto:hello@bestpoolhotels.com" className="text-primary underline">
              hello@bestpoolhotels.com
            </a>
            . Best Pool Hotels is an independent editorial site run by{" "}
            <Link to="/editors/$slug" params={{ slug: "per-lindhe" }} className="text-primary underline">
              Per Lindhe
            </Link>{" "}
            with a small research desk. See our{" "}
            <Link to="/disclosure" className="text-primary underline">
              affiliate disclosure
            </Link>{" "}
            for how the site is funded.
          </p>
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
