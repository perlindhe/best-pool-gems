import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { barcelonaTop10, type Hotel, type HotelTag } from "@/data/hotels";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import barcelonaImg from "@/assets/barcelona.jpg";

const TITLE = "Top 10 poolhotell i Barcelona (Pool Score 2026) — PoolList";
const DESCRIPTION =
  "Pool-first ranking av Barcelonas tio bästa hotellpooler 2026. Pool Score, pooltyp, vibe, bästa tid att besöka, områdesguide och FAQ.";

export const Route = createFileRoute("/barcelona/luxury-pool-hotels")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:image", content: barcelonaImg },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: barcelonaImg },
    ],
  }),
  component: LuxuryPoolHotels,
});

const FILTERS: { key: HotelTag | "all"; label: string }[] = [
  { key: "all", label: "Alla" },
  { key: "rooftop", label: "Rooftop" },
  { key: "resort", label: "Resort" },
  { key: "quiet", label: "Quiet" },
  { key: "spa", label: "Spa" },
];

const NEIGHBORHOODS = [
  {
    name: "Barceloneta",
    angle: "Resort vid stranden",
    body: "Närmast havet — stora pooler, palmer och solnedgångar över Medelhavet. Välj här om du vill kombinera strand och pool. Hotell Arts och W är ankarna.",
  },
  {
    name: "Eixample · Passeig de Gràcia",
    angle: "Diskret lyx på taket",
    body: "Gaudís kvarter. Diskreta plunge-pooler på taken av sekelskiftespalats. Bäst för vuxna par som vill ha lugnare vibe och Michelin-mat på samma adress.",
  },
  {
    name: "El Born & Gòtic",
    angle: "Pool i gamla stan",
    body: "Mindre pooler men oslagbar atmosfär bland medeltida gränder. Edition har stadens coolaste rooftop, Vividora ger dig stjärnor över Gòtic.",
  },
  {
    name: "Diagonal & Poblenou",
    angle: "Skyline utan turistkrysset",
    body: "Lugnare, modernare hotell en bit utanför centrum. Sky Bar 26 på Sofia och Meliá Sky bjuder på 360°-utsikt utan trängsel.",
  },
];

const FAQS = [
  {
    q: "Vad är Pool Score?",
    a: "En sammanvägd 0–10-poäng baserat på fem kriterier: vibe & setting, lounging space, service, uniqueness och overall pool-first feel. Vi re-scorar inför varje sommarsäsong.",
  },
  {
    q: "När är Barcelonas takpooler öppna?",
    a: "Säsongen är ungefär 15 maj till 30 september. Juni–augusti är varmast (vatten 24–27°C). Mandarin Oriental och Hotel Arts har uppvärmda pooler året runt.",
  },
  {
    q: "Kan icke-gäster besöka takpoolerna?",
    a: "Många hotell säljer dagspass eller har minimispend (50–80 €). Edition, Mandarin och SOFIA är populära — boka i förväg via hotellets sajt.",
  },
  {
    q: "Vilket hotell har bäst pool för familjer?",
    a: "Hotel Arts har två stora utomhuspooler, barnvänlig service och direkt strandläge. W passar äldre tonåringar tack vare festigare vibe.",
  },
  {
    q: "Vilket är det lugnaste poolvalet?",
    a: "Mandarin Oriental Terrat, Cotton House och Almanac. Små grupper, vuxen publik, ingen DJ.",
  },
  {
    q: "Vilket hotell har bäst utsikt?",
    a: "Hotel SOFIA Sky Bar 26 har den bredaste 360°-vyn. Mandarin Oriental ligger lägre men har Eixamples skyline rakt framför sig.",
  },
  {
    q: "Vilka pooler är öppna året runt?",
    a: "Mandarin Oriental (uppvärmd takpool), Hotel Arts (inomhusspa) och de flesta 5-stjärniga spa-anläggningar i Eixample.",
  },
  {
    q: "Hur ofta uppdateras rankingen?",
    a: "Inför varje sommar (april–maj). Pris- och säsongsinformation kontrolleras direkt med hotellen och dubbelkollas mot färska gästrecensioner.",
  },
];

const TAG_LABEL: Record<HotelTag, string> = {
  rooftop: "Rooftop",
  resort: "Resort",
  quiet: "Quiet",
  spa: "Spa",
};

function LuxuryPoolHotels() {
  const [filter, setFilter] = useState<HotelTag | "all">("all");

  const visible = useMemo(
    () =>
      filter === "all"
        ? barcelonaTop10
        : barcelonaTop10.filter((h) => h.tags?.includes(filter)),
    [filter],
  );

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      {/* Hero */}
      <section className="relative isolate overflow-hidden">
        <img
          src={barcelonaImg}
          alt="Takpool i Barcelona"
          width={1920}
          height={1280}
          className="absolute inset-0 -z-10 h-full w-full object-cover"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-hero" />
        <div className="mx-auto flex min-h-[72vh] max-w-7xl flex-col justify-end px-6 pb-16 pt-28">
          <nav className="mb-6 text-xs uppercase tracking-[0.3em] text-primary">
            <Link to="/" className="hover:text-foreground">PoolList</Link>
            <span className="mx-2 text-muted-foreground">/</span>
            <Link to="/$citySlug" params={{ citySlug: "barcelona" }} className="hover:text-foreground">
              Barcelona
            </Link>
            <span className="mx-2 text-muted-foreground">/</span>
            <span className="text-foreground">Top 10</span>
          </nav>
          <p className="text-xs uppercase tracking-[0.35em] text-primary">Pool Score 2026 · Stor guide</p>
          <h1 className="mt-5 max-w-5xl font-display text-[clamp(3rem,9vw,7.5rem)] leading-[0.85] tracking-tight text-balance">
            Top 10 poolhotell i Barcelona
          </h1>
          <p className="mt-4 text-sm uppercase tracking-[0.3em] text-muted-foreground">
            Pool Score 2026 · uppdaterad inför sommaren
          </p>
        </div>
      </section>

      {/* Intro */}
      <section className="mx-auto max-w-3xl px-6 py-20">
        <p className="font-display text-3xl leading-tight tracking-wide text-foreground/95 md:text-4xl">
          Vi rankar inte hotell efter sängar, frukostbufféer eller lobbykonst.
          Vi rankar dem efter <span className="text-primary">poolen</span>.
        </p>
        <div className="mt-8 space-y-5 text-lg leading-relaxed text-foreground/90">
          <p>
            Barcelona är en pool-stad. Mellan medelhavsbrisen, Gaudís horisont och
            stadens dryga 270 soldagar har hotellen tävlat i ett decennium om att
            bygga den vackraste takplungen, det djärvaste mosaikgolvet, den mest
            instagrammade solnedgångsstunden. Den här guiden är resultatet av
            fyra säsongers besök, dryga 200 timmar i solstolar och lika många
            poolside-cocktails.
          </p>
          <p>
            Varje hotell har fått en Pool Score 0–10 baserat på vibe & setting,
            lounging space, service, uniqueness och overall pool-first feel. Vi
            tar inte emot betalning för placering, och rankingen sätts av
            redaktionen innan eventuella bokningslänkar läggs till. Du kan lita
            på att en sjua här är en sjua oavsett vem som annonserar.
          </p>
          <p>
            Använd snabbfilterna nedan om du letar efter en specifik vibe — en
            tystare poolmorgon, en partyresort vid havet eller ett spa med
            uppvärmt vatten i april.
          </p>
        </div>
      </section>

      {/* Quick filter */}
      <section className="sticky top-[64px] z-40 border-y border-border/40 bg-background/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-2 px-6 py-4">
          <span className="mr-3 text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
            Filtrera
          </span>
          {FILTERS.map((f) => {
            const active = filter === f.key;
            return (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`rounded-full border px-4 py-2 text-xs uppercase tracking-[0.2em] transition ${
                  active
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border/60 text-muted-foreground hover:border-primary/60 hover:text-foreground"
                }`}
              >
                {f.label}
              </button>
            );
          })}
          <span className="ml-auto text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
            {visible.length} hotell
          </span>
        </div>
      </section>

      {/* Top 10 list */}
      <section className="mx-auto max-w-5xl space-y-6 px-6 py-16">
        {visible.length === 0 && (
          <p className="rounded-md border border-border/60 bg-surface/60 p-8 text-center text-muted-foreground">
            Inget hotell matchar det filtret. Prova en annan vibe.
          </p>
        )}
        {visible.map((h: Hotel) => (
          <article
            key={h.rank}
            className="group relative overflow-hidden rounded-lg border border-border/60 bg-surface/60 p-6 shadow-card transition hover:border-primary/60 md:p-8"
          >
            <div className="flex items-start gap-6">
              <div className="shrink-0">
                <div className="flex h-16 w-16 items-center justify-center rounded-md bg-gradient-aqua font-display text-3xl text-primary-foreground shadow-glow md:h-20 md:w-20 md:text-4xl">
                  {h.rank}
                </div>
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                  <h2 className="font-display text-3xl tracking-wide md:text-4xl">{h.name}</h2>
                  <span className="font-display text-2xl text-primary">
                    {h.score.toFixed(1)}
                    <span className="ml-1 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                      Pool Score
                    </span>
                  </span>
                </div>
                <p className="mt-1 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  {h.neighborhood} · {h.poolType}
                </p>
                <p className="mt-4 text-base leading-relaxed text-foreground/90">{h.description}</p>

                <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-3">
                  <div>
                    <dt className="text-[10px] uppercase tracking-[0.2em] text-primary">Vibe</dt>
                    <dd className="mt-1 text-foreground/90">{h.vibe}</dd>
                  </div>
                  <div>
                    <dt className="text-[10px] uppercase tracking-[0.2em] text-primary">Bästa tid</dt>
                    <dd className="mt-1 text-foreground/90">{h.bestTime}</dd>
                  </div>
                  <div>
                    <dt className="text-[10px] uppercase tracking-[0.2em] text-primary">Pris</dt>
                    <dd className="mt-1 text-foreground/90">{h.pricePerNight}</dd>
                  </div>
                </dl>

                {h.tags && h.tags.length > 0 && (
                  <div className="mt-5 flex flex-wrap gap-2">
                    {h.tags.map((t) => (
                      <span
                        key={t}
                        className="rounded-sm border border-primary/40 bg-primary/10 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-primary"
                      >
                        {TAG_LABEL[t]}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </article>
        ))}
      </section>

      {/* Areas / map section */}
      <section className="border-t border-border/40 bg-surface/40">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <p className="text-xs uppercase tracking-[0.3em] text-primary">Karta</p>
          <h2 className="mt-3 font-display text-5xl tracking-wide md:text-6xl">
            Bästa områdena för pool
          </h2>
          <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
            Var du bor avgör vilken sorts pool du får. Här är de fyra områdena
            där poollivet är bäst — och vad de är bra på.
          </p>

          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {NEIGHBORHOODS.map((n) => (
              <div
                key={n.name}
                className="rounded-xl border border-border/60 bg-background/60 p-7 transition hover:border-primary/60"
              >
                <p className="text-[10px] uppercase tracking-[0.3em] text-primary">{n.angle}</p>
                <h3 className="mt-3 font-display text-3xl tracking-wide md:text-4xl">{n.name}</h3>
                <p className="mt-4 text-base leading-relaxed text-foreground/90">{n.body}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 overflow-hidden rounded-xl border border-border/60">
            <iframe
              title="Karta över Barcelona"
              src="https://www.openstreetmap.org/export/embed.html?bbox=2.1450%2C41.3700%2C2.2050%2C41.4050&amp;layer=mapnik"
              loading="lazy"
              className="h-[420px] w-full"
            />
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-6 py-24">
        <p className="text-xs uppercase tracking-[0.3em] text-primary">FAQ</p>
        <h2 className="mt-3 font-display text-5xl tracking-wide md:text-6xl">
          Vanliga frågor
        </h2>
        <div className="mt-10 divide-y divide-border/50 border-y border-border/50">
          {FAQS.map((f) => (
            <details key={f.q} className="group py-5">
              <summary className="flex cursor-pointer list-none items-start justify-between gap-4 font-display text-2xl tracking-wide transition hover:text-primary">
                {f.q}
                <span className="mt-1 shrink-0 text-primary transition group-open:rotate-45">＋</span>
              </summary>
              <p className="mt-3 text-base leading-relaxed text-foreground/85">{f.a}</p>
            </details>
          ))}
        </div>
        <p className="mt-8 rounded-md border border-border/60 bg-surface/60 p-4 text-sm text-muted-foreground">
          Pool-detaljer kan vara säsongsbundna. Dubbelkolla alltid pool-info på
          din bokningssida innan du bokar.
        </p>
      </section>

      {/* CTA + how we rank */}
      <section className="border-t border-border/40 bg-gradient-hero">
        <div className="mx-auto max-w-5xl px-6 py-24 text-center">
          <p className="text-xs uppercase tracking-[0.35em] text-primary">Pool-first stays</p>
          <h2 className="mt-4 font-display text-5xl leading-tight tracking-wide md:text-6xl">
            Hitta din pool i Barcelona
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-foreground/85">
            Tio hotell, en lista, ingen sponsring. Använd guiden, läs vår metod —
            och vill du djupdyka i tak- eller strandalternativ har vi separata
            guider för det också.
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Link
              to="/$citySlug/$articleSlug"
              params={{ citySlug: "barcelona", articleSlug: "rooftop-pool-hotels" }}
              className="rounded-full bg-primary px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-primary-foreground transition hover:opacity-90"
            >
              Bästa rooftop-pooler
            </Link>
            <Link
              to="/$citySlug/$articleSlug"
              params={{ citySlug: "barcelona", articleSlug: "pool-hotels-near-beach" }}
              className="rounded-full border border-primary/40 px-6 py-3 text-sm uppercase tracking-[0.2em] backdrop-blur transition hover:border-primary hover:bg-primary/10"
            >
              Pooler vid stranden
            </Link>
            <Link
              to="/about"
              className="rounded-full border border-border/60 px-6 py-3 text-sm uppercase tracking-[0.2em] transition hover:border-primary hover:bg-primary/10"
            >
              Hur vi rankar →
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
