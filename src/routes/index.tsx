import { createFileRoute, Link } from "@tanstack/react-router";
import heroImg from "@/assets/hero-pool.jpg";
import { cities } from "@/data/hotels";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PoolList — Världens bästa hotellpooler, rankade" },
      { name: "description", content: "Vi rankar de snyggaste pool-hotellen i Barcelona, Paris, London och New York. Oberoende, opartiskt och uppdaterat." },
    ],
  }),
  component: Home,
});

function Home() {
  const featured = cities[0];
  const rest = cities.slice(1);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      {/* Hero */}
      <section className="relative isolate overflow-hidden">
        <img
          src={heroImg}
          alt="Takpool i solnedgång"
          width={1920}
          height={1280}
          className="absolute inset-0 -z-10 h-full w-full object-cover"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-hero" />
        <div className="mx-auto flex min-h-[88vh] max-w-7xl flex-col justify-end px-6 pb-20 pt-32 md:pb-28">
          <p className="text-xs uppercase tracking-[0.4em] text-primary">Edition 01 · 2026</p>
          <h1 className="mt-6 max-w-5xl font-display text-[clamp(3.5rem,11vw,9rem)] leading-[0.85] tracking-tight text-balance">
            Världens bästa <span className="text-primary">hotellpooler</span>, rankade.
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-foreground/85 md:text-xl">
            Vi har simmat, druckit och solat oss igenom hundratals hotell i världens största turiststäder.
            Här är listan över pooler som faktiskt är värda hypen.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            {cities.map((c) => (
              <Link
                key={c.slug}
                to="/cities/$slug"
                params={{ slug: c.slug }}
                className="rounded-full border border-primary/40 bg-background/30 px-5 py-2.5 text-sm uppercase tracking-[0.2em] backdrop-blur transition hover:border-primary hover:bg-primary/10"
              >
                {c.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Magazine: featured + grid */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="flex items-end justify-between gap-6">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-primary">Destinationer</p>
            <h2 className="mt-3 font-display text-5xl tracking-wide md:text-6xl">
              Fyra städer. Tjugo pooler.
            </h2>
          </div>
          <p className="hidden max-w-sm text-sm text-muted-foreground md:block">
            Varje stad har sin egen poolpersonlighet. Klicka in dig och hitta din nästa simdestination.
          </p>
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-12">
          {/* Featured */}
          <Link
            to="/cities/$slug"
            params={{ slug: featured.slug }}
            className="group relative col-span-12 overflow-hidden rounded-xl shadow-card lg:col-span-7"
          >
            <img
              src={featured.image}
              alt={`Pool i ${featured.name}`}
              width={1280}
              height={896}
              loading="lazy"
              className="h-[520px] w-full object-cover transition duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
            <div className="absolute inset-0 flex flex-col justify-end p-8 md:p-12">
              <p className="text-xs uppercase tracking-[0.3em] text-primary">Featured · {featured.country}</p>
              <h3 className="mt-3 font-display text-6xl tracking-wide md:text-8xl">{featured.name}</h3>
              <p className="mt-3 max-w-lg text-base text-foreground/90">{featured.tagline}</p>
              <span className="mt-6 inline-flex w-fit items-center gap-2 text-sm uppercase tracking-[0.25em] text-primary">
                Se topplistan
                <span aria-hidden>→</span>
              </span>
            </div>
          </Link>

          {/* Side stack */}
          <div className="col-span-12 grid gap-8 lg:col-span-5">
            {rest.map((c) => (
              <Link
                key={c.slug}
                to="/cities/$slug"
                params={{ slug: c.slug }}
                className="group relative overflow-hidden rounded-xl shadow-card"
              >
                <img
                  src={c.image}
                  alt={`Pool i ${c.name}`}
                  width={1280}
                  height={896}
                  loading="lazy"
                  className="h-[160px] w-full object-cover transition duration-700 group-hover:scale-105 md:h-[160px]"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-background via-background/40 to-transparent" />
                <div className="absolute inset-0 flex flex-col justify-center p-6">
                  <p className="text-[10px] uppercase tracking-[0.3em] text-primary">{c.country}</p>
                  <h3 className="mt-1 font-display text-4xl tracking-wide">{c.name}</h3>
                  <p className="mt-1 max-w-xs text-sm text-foreground/80">{c.tagline}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Editorial pitch */}
      <section className="border-y border-border/50 bg-surface/40">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 py-20 md:grid-cols-3">
          {[
            { k: "Oberoende", v: "Inga sponsrade placeringar. Vi betalar våra egna nätter." },
            { k: "Kuraterat", v: "Fem hotell per stad – inte tjugo. Bara de som faktiskt levererar." },
            { k: "Uppdaterat", v: "Listorna uppdateras inför varje sommarsäsong." },
          ].map((b) => (
            <div key={b.k}>
              <p className="font-display text-5xl text-primary">{b.k}</p>
              <p className="mt-3 text-base text-foreground/85">{b.v}</p>
            </div>
          ))}
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
