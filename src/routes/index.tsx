import { createFileRoute, Link } from "@tanstack/react-router";
import heroImg from "@/assets/hero-pool.jpg";
import { cities, guides } from "@/data/hotels";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Bästa hotellpooler — PoolList" },
      { name: "description", content: "Oberoende guide till de bästa hotellpoolerna i världens största turiststäder. Rankningar, guider och insidertips." },
      { property: "og:title", content: "Bästa hotellpooler — PoolList" },
      { property: "og:description", content: "Oberoende rankningar av världens snyggaste hotellpooler." },
    ],
  }),
  component: Home,
});

function Home() {
  const latestGuides = [...guides].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 4);

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
            Bästa <span className="text-primary">hotellpoolerna</span>, rankade.
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-foreground/85 md:text-xl">
            Oberoende rankningar och guider till världens snyggaste hotellpooler — i Barcelona,
            Paris, London och New York. Inga sponsrade placeringar.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link
              to="/cities/$slug"
              params={{ slug: "barcelona" }}
              className="rounded-full bg-primary px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-primary-foreground transition hover:opacity-90"
            >
              Topp 10 Barcelona
            </Link>
            <Link
              to="/about"
              className="rounded-full border border-primary/40 px-6 py-3 text-sm uppercase tracking-[0.2em] backdrop-blur transition hover:border-primary hover:bg-primary/10"
            >
              Hur vi rankar
            </Link>
          </div>
        </div>
      </section>

      {/* Latest guides */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="flex items-end justify-between gap-6">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-primary">Senaste guiderna</p>
            <h2 className="mt-3 font-display text-5xl tracking-wide md:text-6xl">
              Färska poolspaningar
            </h2>
          </div>
          <p className="hidden max-w-sm text-sm text-muted-foreground md:block">
            Kuraterade tips från redaktionens senaste resor — uppdaterat veckovis.
          </p>
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-12">
          {/* Featured */}
          <Link
            to="/guider/$"
            params={{ _splat: latestGuides[0].slug }}
            className="group relative col-span-12 overflow-hidden rounded-xl shadow-card lg:col-span-7"
          >
            <img
              src={latestGuides[0].image}
              alt={latestGuides[0].title}
              width={1280}
              height={896}
              loading="lazy"
              className="h-[520px] w-full object-cover transition duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
            <div className="absolute inset-0 flex flex-col justify-end p-8 md:p-12">
              <p className="text-xs uppercase tracking-[0.3em] text-primary">
                {latestGuides[0].city} · {latestGuides[0].category}
              </p>
              <h3 className="mt-3 font-display text-5xl leading-tight tracking-wide md:text-6xl">
                {latestGuides[0].title}
              </h3>
              <p className="mt-4 max-w-lg text-base text-foreground/90">{latestGuides[0].excerpt}</p>
              <span className="mt-6 inline-flex w-fit items-center gap-2 text-sm uppercase tracking-[0.25em] text-primary">
                Läs guiden <span aria-hidden>→</span>
              </span>
            </div>
          </Link>

          <div className="col-span-12 grid gap-8 lg:col-span-5">
            {latestGuides.slice(1).map((g) => (
              <Link
                key={g.slug}
                to="/guider/$"
                params={{ _splat: g.slug }}
                className="group rounded-xl border border-border/60 bg-surface/60 p-6 transition hover:border-primary/60"
              >
                <p className="text-[10px] uppercase tracking-[0.3em] text-primary">
                  {g.city} · {g.category} · {g.readingTime}
                </p>
                <h3 className="mt-3 font-display text-3xl leading-tight tracking-wide group-hover:text-primary">
                  {g.title}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">{g.excerpt}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Cities row */}
      <section className="border-y border-border/50 bg-surface/40">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <p className="text-xs uppercase tracking-[0.3em] text-primary">Destinationer</p>
          <h2 className="mt-3 font-display text-5xl tracking-wide">Utforska per stad</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {cities.map((c) => (
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
                  className="h-64 w-full object-cover transition duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
                <div className="absolute inset-0 flex flex-col justify-end p-5">
                  <p className="text-[10px] uppercase tracking-[0.3em] text-primary">{c.country}</p>
                  <h3 className="font-display text-3xl tracking-wide">{c.name}</h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
