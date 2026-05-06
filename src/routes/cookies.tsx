import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export const Route = createFileRoute("/cookies")({
  head: () => ({
    meta: [
      { title: "Cookies — PoolList" },
      { name: "description", content: "Hur PoolList använder cookies för analytics och affiliate-länkar." },
    ],
  }),
  component: CookiesPage,
});

function CookiesPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <section className="mx-auto max-w-3xl px-6 py-24">
        <p className="text-xs uppercase tracking-[0.35em] text-primary">Juridik</p>
        <h1 className="mt-4 font-display text-6xl leading-[0.9] tracking-wide md:text-7xl">
          Cookies
        </h1>
        <p className="mt-6 text-sm text-muted-foreground">Senast uppdaterad: april 2026</p>

        <div className="mt-10 space-y-8 text-lg leading-relaxed text-foreground/90">
          <p>
            PoolList använder cookies för att förstå hur sajten används och för att kunna
            tjäna pengar via affiliate-länkar. Vi använder inte cookies för riktad reklam.
          </p>

          <div>
            <h2 className="font-display text-3xl tracking-wide text-primary">Nödvändiga cookies</h2>
            <p className="mt-3">
              Sätts av sajten för att den ska fungera (sessionshantering, språk).
              Kräver inte samtycke.
            </p>
          </div>

          <div>
            <h2 className="font-display text-3xl tracking-wide text-primary">Statistik (anonymiserad)</h2>
            <p className="mt-3">
              Vi använder en integritetsvänlig analytics-tjänst (utan personlig spårning).
              Inga uppgifter delas med tredje part i marknadsföringssyfte.
            </p>
          </div>

          <div>
            <h2 className="font-display text-3xl tracking-wide text-primary">Affiliate-cookies</h2>
            <p className="mt-3">
              När du klickar på en bok-länk till t.ex. Booking.com sätter <em>de</em> en
              cookie i din webbläsare som gör att vi får ersättning om du bokar. Cookien
              sätts först <strong className="text-foreground">efter</strong> att du klickat
              — aldrig automatiskt vid sidladdning.
            </p>
          </div>

          <div>
            <h2 className="font-display text-3xl tracking-wide text-primary">Hantera cookies</h2>
            <p className="mt-3">
              Du kan när som helst rensa eller blockera cookies via din webbläsares
              inställningar. Det påverkar inte din möjlighet att läsa innehållet på sajten.
            </p>
          </div>

          <p className="text-sm text-muted-foreground">
            Frågor? Se vår{" "}
            <Link to="/integritetspolicy" className="text-primary underline">
              integritetspolicy
            </Link>{" "}
            eller mejla{" "}
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
