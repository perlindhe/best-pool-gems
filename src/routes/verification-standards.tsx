import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

const TITLE = "Verification standards — How we check pool facts";
const DESCRIPTION =
  "The exact rules behind every pool fact on Best Pool Hotels: source requirements, verification states, what we never claim and when a hotel may be called verified.";

export const Route = createFileRoute("/verification-standards")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://bestpoolhotels.com/verification-standards" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: "https://bestpoolhotels.com/verification-standards" }],
  }),
  component: VerificationStandards,
});

function VerificationStandards() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <section className="mx-auto max-w-3xl px-6 py-24">
        <p className="text-xs uppercase tracking-[0.35em] text-primary">Editorial standards</p>
        <h1 className="mt-4 font-display text-6xl leading-[0.9] tracking-wide md:text-7xl">
          Verification standards
        </h1>

        <div className="mt-10 space-y-6 text-lg leading-relaxed text-foreground/90">
          <p>
            Pool facts age badly. Heating gets switched off, seasons shift, day passes
            disappear. This page describes exactly what we check, what we require before
            publishing a fact, and what the labels on a hotel page mean.
          </p>
        </div>

        <h2 className="mt-16 font-display text-4xl tracking-wide text-primary">Source requirements</h2>
        <div className="mt-6 space-y-6 text-lg leading-relaxed text-foreground/90">
          <p>
            A pool fact — pool count, type, size, depth, heating, season, opening hours,
            access rules — is only published when it is either stated on the hotel's own
            website, or confirmed by at least two independent sources. If neither applies,
            the page says <strong className="text-foreground">"Not confirmed"</strong>. We
            never fill a gap with a plausible guess.
          </p>
          <p>
            Every hotel profile we call verified carries a primary source and a secondary
            source, both linked on the page, plus the date of the last check and the name of
            the person who made it.
          </p>
        </div>

        <h2 className="mt-16 font-display text-4xl tracking-wide text-primary">Verification states</h2>
        <div className="mt-6 overflow-hidden rounded-lg border border-border/60 bg-surface/40">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/60 text-left text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                <th className="px-5 py-3 font-normal">State</th>
                <th className="px-5 py-3 font-normal">What it means</th>
                <th className="px-5 py-3 font-normal">In search results</th>
              </tr>
            </thead>
            <tbody className="text-base">
              <tr className="border-t border-border/40 align-top">
                <td className="px-5 py-3 text-foreground">Verified</td>
                <td className="px-5 py-3 text-foreground/85">
                  Two documented sources, a named checker and a check date. Eligible for
                  rankings and for a final Pool Score.
                </td>
                <td className="px-5 py-3 text-foreground/85">Indexed</td>
              </tr>
              <tr className="border-t border-border/40 align-top">
                <td className="px-5 py-3 text-foreground">Partially verified</td>
                <td className="px-5 py-3 text-foreground/85">
                  Some facts confirmed, others still open. Shown to readers and clearly
                  labelled as preliminary; no final ranking value.
                </td>
                <td className="px-5 py-3 text-foreground/85">Not indexed</td>
              </tr>
              <tr className="border-t border-border/40 align-top">
                <td className="px-5 py-3 text-foreground">Research pending</td>
                <td className="px-5 py-3 text-foreground/85">
                  Collected but not yet checked by an editor.
                </td>
                <td className="px-5 py-3 text-foreground/85">Not indexed</td>
              </tr>
              <tr className="border-t border-border/40 align-top">
                <td className="px-5 py-3 text-foreground">Draft / in review</td>
                <td className="px-5 py-3 text-foreground/85">
                  Work in progress. Never counted, never scored.
                </td>
                <td className="px-5 py-3 text-foreground/85">Hidden from search</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h2 className="mt-16 font-display text-4xl tracking-wide text-primary">
          Words we only use when we can prove them
        </h2>
        <div className="mt-6 space-y-6 text-lg leading-relaxed text-foreground/90">
          <ul className="list-inside list-disc space-y-2">
            <li>
              <strong className="text-foreground">Verified</strong> — only on hotels that meet
              the source requirements above.
            </li>
            <li>
              <strong className="text-foreground">Personally visited</strong> — only where an
              editor has actually stayed at or visited the property, and says so by name.
            </li>
            <li>
              <strong className="text-foreground">Tested</strong> — only for a pool an editor
              has swum in. Desk research is called desk research.
            </li>
          </ul>
          <p>
            Guest ratings shown on hotel pages come from Google and Tripadvisor. They are
            third-party signals, always labelled as such, and never presented as our own
            reviews.
          </p>
        </div>

        <h2 className="mt-16 font-display text-4xl tracking-wide text-primary">Re-checking</h2>
        <div className="mt-6 space-y-6 text-lg leading-relaxed text-foreground/90">
          <p>
            Seasonal facts — opening dates, heating months, day-pass availability — are
            re-checked before each summer season. Every profile shows the date of its last
            verification, so you can judge how fresh the information is.
          </p>
          <p>
            Found something wrong? See our{" "}
            <Link to="/corrections" className="text-primary underline">
              corrections policy
            </Link>{" "}
            — or read how scores are built on the{" "}
            <Link to="/about" className="text-primary underline">
              Pool Score method page
            </Link>
            .
          </p>
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
