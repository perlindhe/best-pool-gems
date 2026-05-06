import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "Om PoolList — Vår metod" },
      { name: "description", content: "Så rankar vi världens bästa hotellpooler. Oberoende, opartiskt och baserat på riktiga besök." },
      { property: "og:title", content: "Om PoolList" },
      { property: "og:description", content: "Hur vi väljer ut och rankar världens bästa hotellpooler." },
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
            Vi listar bara fem hotell per stad — för att en lång lista hjälper ingen.
          </p>
          <p>
            Varje hotell besöks personligen av redaktionen. Vi betalar våra egna nätter,
            tar inte emot sponsrade placeringar och uppdaterar listorna inför varje sommar.
          </p>
          <p className="font-display text-3xl tracking-wide text-primary">
            Tre kriterier: utsikt, vatten, vibe.
          </p>
          <p>
            Utsikten ska få dig att tappa hakan. Vattnet ska vara rent, lagom svalt och
            tillräckligt stort för att simma i. Vibet — solstolar, musik, drinkar — ska
            få dig att vilja stanna hela dagen.
          </p>
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
