import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export const Route = createFileRoute("/cookies")({
  head: () => ({
    meta: [
      { title: "Cookies — PoolList" },
      { name: "description", content: "How PoolList uses cookies for analytics and affiliate links." },
    ],
  }),
  component: CookiesPage,
});

function CookiesPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <section className="mx-auto max-w-3xl px-6 py-24">
        <p className="text-xs uppercase tracking-[0.35em] text-primary">Legal</p>
        <h1 className="mt-4 font-display text-6xl leading-[0.9] tracking-wide md:text-7xl">
          Cookies
        </h1>
        <p className="mt-6 text-sm text-muted-foreground">Last updated: April 2026</p>

        <div className="mt-10 space-y-8 text-lg leading-relaxed text-foreground/90">
          <p>
            PoolList uses cookies to understand how the site is used and to earn
            money via affiliate links. We don't use cookies for targeted advertising.
          </p>

          <div>
            <h2 className="font-display text-3xl tracking-wide text-primary">Necessary cookies</h2>
            <p className="mt-3">
              Set by the site so it works (session handling, language).
              No consent required.
            </p>
          </div>

          <div>
            <h2 className="font-display text-3xl tracking-wide text-primary">Statistics (anonymized)</h2>
            <p className="mt-3">
              We use a privacy-friendly analytics service (no personal tracking).
              No data is shared with third parties for marketing purposes.
            </p>
          </div>

          <div>
            <h2 className="font-display text-3xl tracking-wide text-primary">Affiliate cookies</h2>
            <p className="mt-3">
              When you click a booking link to e.g. Booking.com, <em>they</em> set a
              cookie in your browser so we receive a commission if you book. The cookie
              is set only <strong className="text-foreground">after</strong> you click
              — never automatically on page load.
            </p>
          </div>

          <div>
            <h2 className="font-display text-3xl tracking-wide text-primary">Manage cookies</h2>
            <p className="mt-3">
              You can clear or block cookies at any time via your browser
              settings. It does not affect your ability to read the content on the site.
            </p>
          </div>

          <p className="text-sm text-muted-foreground">
            Questions? See our{" "}
            <Link to="/integritetspolicy" className="text-primary underline">
              privacy policy
            </Link>{" "}
            or email{" "}
            <a href="mailto:hej@poollist.se" className="text-primary underline">
              hej@poollist.se
            </a>.
          </p>
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
