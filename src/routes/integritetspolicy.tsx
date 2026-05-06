import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export const Route = createFileRoute("/integritetspolicy")({
  head: () => ({
    meta: [
      { title: "Integritetspolicy — PoolList" },
      { name: "description", content: "Hur PoolList samlar in och hanterar personuppgifter." },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <section className="mx-auto max-w-3xl px-6 py-24">
        <p className="text-xs uppercase tracking-[0.35em] text-primary">Juridik</p>
        <h1 className="mt-4 font-display text-6xl leading-[0.9] tracking-wide md:text-7xl">
          Integritetspolicy
        </h1>
        <p className="mt-6 text-sm text-muted-foreground">Senast uppdaterad: april 2026</p>

        <div className="mt-10 space-y-8 text-lg leading-relaxed text-foreground/90">
          <div>
            <h2 className="font-display text-3xl tracking-wide text-primary">Personuppgiftsansvarig</h2>
            <p className="mt-3">
              PoolList AB är personuppgiftsansvarig för behandlingen av dina uppgifter på
              denna sajt. Kontakt:{" "}
              <a href="mailto:hej@poollist.se" className="text-primary underline">
                hej@poollist.se
              </a>.
            </p>
          </div>

          <div>
            <h2 className="font-display text-3xl tracking-wide text-primary">Vilka uppgifter samlar vi in?</h2>
            <ul className="mt-3 list-inside list-disc space-y-2">
              <li>
                <strong className="text-foreground">Analytics</strong> — anonymiserad
                besöksstatistik (vilka sidor som besöks, från vilken stad, enhetstyp).
              </li>
              <li>
                <strong className="text-foreground">Affiliate-cookies</strong> — när du
                klickar på en bok-länk sätter partners (Booking.com, Hotels.com) cookies
                så att vi får ersättning för bokningen.
              </li>
              <li>
                <strong className="text-foreground">E-post</strong> — om du skriver till
                oss sparar vi din mejl tills ärendet är löst.
              </li>
            </ul>
          </div>

          <div>
            <h2 className="font-display text-3xl tracking-wide text-primary">Rättslig grund</h2>
            <p className="mt-3">
              Vi behandlar uppgifter med stöd av samtycke (cookies) och berättigat intresse
              (anonymiserad statistik för att förbättra sajten).
            </p>
          </div>

          <div>
            <h2 className="font-display text-3xl tracking-wide text-primary">Dina rättigheter</h2>
            <p className="mt-3">
              Du har rätt att begära registerutdrag, rättelse, radering och invändning
              mot behandling. Mejla oss så fixar vi det inom 30 dagar.
            </p>
          </div>

          <div>
            <h2 className="font-display text-3xl tracking-wide text-primary">Mer info</h2>
            <p className="mt-3">
              Läs även våra{" "}
              <Link to="/cookies" className="text-primary underline">cookie-inställningar</Link>{" "}
              och{" "}
              <Link to="/disclosure" className="text-primary underline">disclosure</Link>.
            </p>
          </div>
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
