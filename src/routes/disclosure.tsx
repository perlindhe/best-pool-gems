import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export const Route = createFileRoute("/disclosure")({
  head: () => ({
    meta: [
      { title: "Affiliate links & disclosure — Best Pool Hotels" },
      { name: "description", content: "How affiliate links and partnerships work on Best Pool Hotels. Transparency is central to us." },
    ],
  }),
  component: Disclosure,
});

function Disclosure() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <section className="mx-auto max-w-3xl px-6 py-24">
        <p className="text-xs uppercase tracking-[0.35em] text-primary">Transparency</p>
        <h1 className="mt-4 font-display text-6xl leading-[0.9] tracking-wide md:text-7xl">
          Affiliate links & disclosure
        </h1>

        <div className="mt-10 space-y-6 text-lg leading-relaxed text-foreground/90">
          <p>
            Best Pool Hotels is funded by <strong className="text-foreground">affiliate links</strong>.
            When you click a link to e.g. Booking.com, Hotels.com or directly to a
            hotel and book a stay, we may receive a small commission. You don't pay extra for it.
          </p>

          <h2 className="font-display text-3xl tracking-wide text-primary">Does it affect rankings?</h2>
          <p>
            <strong className="text-foreground">No.</strong> Our ranking is decided by the editors
            before any affiliate links are added. A hotel can't buy a placement, a
            review or a spot in any of our guides. We also don't accept free
            nights, press junkets or PR offers.
          </p>

          <h2 className="font-display text-3xl tracking-wide text-primary">What counts as an ad?</h2>
          <ul className="list-inside list-disc space-y-2">
            <li>Booking buttons and "See prices" links in hotel lists.</li>
            <li>Some text links in guides — clearly marked in the article's disclosure box.</li>
            <li>
              Any sponsored articles are published separately and always labeled
              "Sponsored" at the top — we have no sponsored articles at this time.
            </li>
          </ul>

          <h2 className="font-display text-3xl tracking-wide text-primary">Questions?</h2>
          <p>
            Email{" "}
            <a href="mailto:hej@poollist.se" className="text-primary underline">hej@poollist.se</a>{" "}
            with any questions. Also see our{" "}
            <Link to="/integritetspolicy" className="text-primary underline">
              privacy policy
            </Link>{" "}
            and{" "}
            <Link to="/cookies" className="text-primary underline">
              cookies
            </Link>
            .
          </p>
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
