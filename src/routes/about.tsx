import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "Om PoolList — Vilka vi är & hur vi rankar" },
      { name: "description", content: "PoolList är en oberoende redaktionell guide. Lär känna teamet och läs vår rankningsmetod." },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <section className="mx-auto max-w-3xl px-6 py-24">
        <p className="text-xs uppercase tracking-[0.35em] text-primary">Om oss</p>
        <h1 className="mt-4 font-display text-6xl leading-[0.9] tracking-wide md:text-7xl">
          Vi rankar pooler. Inget annat.
        </h1>

        <div className="mt-10 space-y-6 text-lg leading-relaxed text-foreground/90">
          <p>
            PoolList är en oberoende redaktionell guide till världens bästa hotellpooler.
            Vi grundades 2026 av två reseskribenter som tröttnade på sponsrade ”topp 50”-listor
            där alla hotell kändes likadana.
          </p>
          <p>
            Vi listar bara fem till tio hotell per stad — för att en lång lista hjälper ingen.
            Varje hotell besöks personligen av redaktionen. Vi betalar våra egna nätter,
            tar inte emot sponsrade placeringar och uppdaterar listorna inför varje sommar.
          </p>
        </div>

        <h2 className="mt-16 font-display text-4xl tracking-wide text-primary">Vilka står bakom?</h2>
        <div className="mt-6 space-y-6 text-lg leading-relaxed text-foreground/90">
          <p>
            <strong className="text-foreground">Redaktionen</strong> består av två
            heltidsskribenter och ett nätverk av frilansare i de städer vi täcker. All
            ranking görs av redaktionen — inga AI-genererade listor, inga branschkontakter.
          </p>
          <p>
            Har du frågor, tips eller vill korrigera något? Mejla{" "}
            <a href="mailto:hej@poollist.se" className="text-primary underline">hej@poollist.se</a>.
          </p>
        </div>

        <h2 className="mt-16 font-display text-4xl tracking-wide text-primary">Så rankar vi</h2>
        <div className="mt-6 space-y-6 text-lg leading-relaxed text-foreground/90">
          <p>Tre kriterier vägs lika tungt i vår poäng (1–10):</p>
          <ol className="list-inside list-decimal space-y-3">
            <li>
              <strong className="text-foreground">Utsikt & atmosfär</strong> — vad ser du
              från vattnet? Har platsen en själ?
            </li>
            <li>
              <strong className="text-foreground">Vatten & storlek</strong> — temperatur,
              renhet, möjligheten att faktiskt simma.
            </li>
            <li>
              <strong className="text-foreground">Vibe & service</strong> — solstolar,
              musik, personal, drinkar, mat.
            </li>
          </ol>
          <p>
            Slutpoängen är medelvärdet, avrundat till en decimal. Vi besöker alla hotell
            anonymt och betalar fullt pris.
          </p>
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
