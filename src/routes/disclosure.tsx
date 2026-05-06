import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export const Route = createFileRoute("/disclosure")({
  head: () => ({
    meta: [
      { title: "Annonslänkar & disclosure — PoolList" },
      { name: "description", content: "Så fungerar annonslänkar och affiliate-relationer på PoolList. Transparens är centralt för oss." },
    ],
  }),
  component: Disclosure,
});

function Disclosure() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <section className="mx-auto max-w-3xl px-6 py-24">
        <p className="text-xs uppercase tracking-[0.35em] text-primary">Transparens</p>
        <h1 className="mt-4 font-display text-6xl leading-[0.9] tracking-wide md:text-7xl">
          Annonslänkar & disclosure
        </h1>

        <div className="mt-10 space-y-6 text-lg leading-relaxed text-foreground/90">
          <p>
            PoolList finansieras av <strong className="text-foreground">affiliate-länkar</strong>.
            När du klickar på en länk till t.ex. Booking.com, Hotels.com eller direkt till ett
            hotell och bokar en vistelse kan vi få en liten ersättning. Du betalar inte mer för det.
          </p>

          <h2 className="font-display text-3xl tracking-wide text-primary">Påverkar det rankingen?</h2>
          <p>
            <strong className="text-foreground">Nej.</strong> Vår ranking görs av redaktionen
            innan affiliate-länkar läggs till. Ett hotell kan inte köpa sig en placering, en
            recension eller en plats i någon av våra guider. Vi tar heller inte emot gratis
            nätter, presskonferenser eller PR-erbjudanden.
          </p>

          <h2 className="font-display text-3xl tracking-wide text-primary">Vad räknas som annons?</h2>
          <ul className="list-inside list-disc space-y-2">
            <li>Bok-knappar och ”Se priser”-länkar i hotellistor.</li>
            <li>Vissa textlänkar i guider — märkta tydligt i artikelns disclosure-ruta.</li>
            <li>
              Eventuella sponsrade artiklar publiceras separat och märks alltid med
              ”Annonsspecial” i toppen — vi har inga sponsrade artiklar i dagsläget.
            </li>
          </ul>

          <h2 className="font-display text-3xl tracking-wide text-primary">Frågor?</h2>
          <p>
            Mejla{" "}
            <a href="mailto:hej@poollist.se" className="text-primary underline">hej@poollist.se</a>{" "}
            om du undrar över något. Läs också gärna mer i vår{" "}
            <Link to="/integritetspolicy" className="text-primary underline">
              integritetspolicy
            </Link>{" "}
            och om{" "}
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
