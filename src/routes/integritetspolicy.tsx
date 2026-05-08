import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export const Route = createFileRoute("/integritetspolicy")({
  head: () => ({
    meta: [
      { title: "Privacy policy — PoolList" },
      { name: "description", content: "How PoolList collects and handles personal data." },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <section className="mx-auto max-w-3xl px-6 py-24">
        <p className="text-xs uppercase tracking-[0.35em] text-primary">Legal</p>
        <h1 className="mt-4 font-display text-6xl leading-[0.9] tracking-wide md:text-7xl">
          Privacy policy
        </h1>
        <p className="mt-6 text-sm text-muted-foreground">Last updated: April 2026</p>

        <div className="mt-10 space-y-8 text-lg leading-relaxed text-foreground/90">
          <div>
            <h2 className="font-display text-3xl tracking-wide text-primary">Data controller</h2>
            <p className="mt-3">
              PoolList AB is the data controller for the processing of your data on
              this site. Contact:{" "}
              <a href="mailto:hej@poollist.se" className="text-primary underline">
                hej@poollist.se
              </a>.
            </p>
          </div>

          <div>
            <h2 className="font-display text-3xl tracking-wide text-primary">What data do we collect?</h2>
            <ul className="mt-3 list-inside list-disc space-y-2">
              <li>
                <strong className="text-foreground">Analytics</strong> — anonymized
                visitor statistics (which pages are visited, from which city, device type).
              </li>
              <li>
                <strong className="text-foreground">Affiliate cookies</strong> — when you
                click a booking link, partners (Booking.com, Hotels.com) set cookies
                so we receive a commission for the booking.
              </li>
              <li>
                <strong className="text-foreground">Email</strong> — if you write to
                us we keep your email until the matter is resolved.
              </li>
            </ul>
          </div>

          <div>
            <h2 className="font-display text-3xl tracking-wide text-primary">Legal basis</h2>
            <p className="mt-3">
              We process data based on consent (cookies) and legitimate interest
              (anonymized statistics to improve the site).
            </p>
          </div>

          <div>
            <h2 className="font-display text-3xl tracking-wide text-primary">Your rights</h2>
            <p className="mt-3">
              You have the right to request a data extract, correction, deletion and
              objection to processing. Email us and we'll handle it within 30 days.
            </p>
          </div>

          <div>
            <h2 className="font-display text-3xl tracking-wide text-primary">More info</h2>
            <p className="mt-3">
              Also read our{" "}
              <Link to="/cookies" className="text-primary underline">cookie settings</Link>{" "}
              and{" "}
              <Link to="/disclosure" className="text-primary underline">disclosure</Link>.
            </p>
          </div>
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
