import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { getHotelsForCompare, type CompareHotel } from "@/lib/compare.functions";

// Whitelist of allowed comparison pairs. Each entry has friendly URL slug
// and the two DB slugs to load. New pairs require unique editorial copy.
const PAIRS: Record<
  string,
  { a: string; b: string; intro: string; verdict: string; title: string }
> = {
  "grand-hotel-central-vs-barcelona-edition": {
    a: "barcelona-grand-hotel-central",
    b: "barcelona-edition",
    title: "Grand Hotel Central vs The Barcelona EDITION",
    intro:
      "Two of Barcelona's most photographed rooftop pools, both in the Born / Gothic area, both with cathedral and old-town views. Different vibes — quietly grown-up vs party-leaning design hotel.",
    verdict:
      "Pick Grand Hotel Central if you want a calm adults-leaning pool with the best Gothic Quarter skyline view in the city. Pick The Barcelona EDITION if you want energy, a livelier rooftop scene and modern design throughout.",
  },
  "grand-hotel-central-vs-kimpton-vividora": {
    a: "barcelona-grand-hotel-central",
    b: "barcelona-kimpton-vividora",
    title: "Grand Hotel Central vs Kimpton Vividora",
    intro:
      "Two boutique rooftop pools in the Gothic Quarter, three blocks apart. Central has the iconic infinity edge; Vividora has a relaxed pet-friendly rooftop with a younger crowd.",
    verdict:
      "Central is the better pool — bigger, more dramatic view, more design ambition. Vividora is the easier hang: less expensive, more casual, friendlier to families and groups.",
  },
  "hotel-arts-vs-w-barcelona": {
    a: "barcelona-hotel-arts",
    b: "barcelona-w",
    title: "Hotel Arts vs W Barcelona",
    intro:
      "The two five-star beachfront giants on Barcelona's waterfront. Hotel Arts sits on the Port Olímpic end with a leafy pool deck; the W (the 'sail') anchors Barceloneta with a glass-edged infinity pool over the sea.",
    verdict:
      "Hotel Arts wins on garden pool atmosphere and family feel. The W wins on jaw-drop factor — that infinity pool over the Mediterranean is one of Europe's best urban-beach pools.",
  },
};

export const Route = createFileRoute("/compare/$pair")({
  loader: async ({ params }) => {
    const pair = PAIRS[params.pair];
    if (!pair) throw notFound();
    const result = await getHotelsForCompare({ data: { slugs: [pair.a, pair.b] } });
    const [a, b] = result;
    if (!a || !b) throw notFound();
    return { pair, a, b };
  },
  head: ({ params, loaderData }) => {
    if (!loaderData) return {};
    const { pair } = loaderData;
    const url = `https://bestpoolhotels.com/compare/${params.pair}`;
    const title = `${pair.title} — Pool comparison · Best Pool Hotels`;
    const description = pair.intro.slice(0, 155);
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "article" },
        { property: "og:url", content: url },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: "https://bestpoolhotels.com/" },
              {
                "@type": "ListItem",
                position: 2,
                name: "Barcelona",
                item: "https://bestpoolhotels.com/barcelona",
              },
              { "@type": "ListItem", position: 3, name: pair.title, item: url },
            ],
          }),
        },
      ],
    };
  },
  notFoundComponent: () => (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className="mx-auto max-w-3xl px-6 py-32 text-center">
        <h1 className="font-display text-5xl text-primary">Comparison not found</h1>
        <Link to="/barcelona" className="mt-8 inline-block text-sm uppercase tracking-[0.25em] text-primary">
          ← Back to Barcelona
        </Link>
      </div>
      <SiteFooter />
    </div>
  ),
  errorComponent: ({ error }) => (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className="mx-auto max-w-3xl px-6 py-32 text-center">
        <h1 className="font-display text-5xl text-primary">Couldn't load comparison</h1>
        <p className="mt-4 text-muted-foreground">{error.message}</p>
      </div>
      <SiteFooter />
    </div>
  ),
  component: ComparePage,
});

function ComparePage() {
  const { pair, a, b } = Route.useLoaderData() as {
    pair: (typeof PAIRS)[string];
    a: CompareHotel;
    b: CompareHotel;
  };

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <section className="mx-auto max-w-6xl px-6 pt-24 pb-12">
        <Link
          to="/barcelona"
          className="text-xs uppercase tracking-[0.3em] text-primary hover:underline"
        >
          ← Barcelona
        </Link>
        <p className="mt-6 text-xs uppercase tracking-[0.35em] text-primary">Pool comparison</p>
        <h1 className="mt-3 font-display text-[clamp(2.5rem,6vw,5rem)] leading-[0.95] tracking-tight">
          {pair.title}
        </h1>
        <p className="mt-6 max-w-3xl text-base leading-relaxed text-foreground/85">{pair.intro}</p>
      </section>

      {/* Hero pair */}
      <section className="mx-auto grid max-w-6xl gap-6 px-6 pb-12 md:grid-cols-2">
        {[a, b].map((h) => (
          <Link
            key={h.slug}
            to="/hotels/$slug"
            params={{ slug: h.slug }}
            className="group block overflow-hidden rounded-lg border border-border/60 bg-surface/40"
          >
            {h.cover_image_url && (
              <img
                src={h.cover_image_url}
                alt={`Pool at ${h.name}`}
                className="h-72 w-full object-cover transition duration-700 group-hover:scale-[1.03]"
              />
            )}
            <div className="p-6">
              <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                {h.neighborhood ?? h.city}
              </p>
              <p className="mt-2 font-display text-3xl tracking-wide">{h.name}</p>
              <p className="mt-3 text-sm text-muted-foreground">
                Pool score{" "}
                <span className="text-foreground">
                  {h.pool_score_0_10 != null ? h.pool_score_0_10.toFixed(1) : "—"}/10
                </span>
                {" · "}
                Meta{" "}
                <span className="text-foreground">
                  {h.meta_rating_0_100 != null ? Math.round(h.meta_rating_0_100) : "—"}/100
                </span>
              </p>
            </div>
          </Link>
        ))}
      </section>

      {/* Side-by-side table */}
      <section className="mx-auto max-w-6xl px-6 pb-16">
        <p className="text-xs uppercase tracking-[0.3em] text-primary">Side by side</p>
        <h2 className="mt-3 font-display text-3xl tracking-wide md:text-4xl">
          The pool, by the numbers
        </h2>
        <div className="mt-6 overflow-x-auto rounded-lg border border-border/60">
          <table className="w-full text-sm">
            <thead className="bg-surface/60 text-left text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              <tr>
                <th className="px-4 py-3"> </th>
                <th className="px-4 py-3">{a.name}</th>
                <th className="px-4 py-3">{b.name}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              <Row label="Pool score" a={fmt(a.pool_score_0_10, "/10")} b={fmt(b.pool_score_0_10, "/10")} />
              <Row label="Meta rating" a={fmt(a.meta_rating_0_100, "/100", 0)} b={fmt(b.meta_rating_0_100, "/100", 0)} />
              <Row label="Pool type" a={a.pool_type ?? "—"} b={b.pool_type ?? "—"} />
              <Row label="Setting" a={a.pool_setting ?? "—"} b={b.pool_setting ?? "—"} />
              <Row label="View" a={a.view_type ?? "—"} b={b.view_type ?? "—"} />
              <Row label="Size" a={a.pool_size ?? "—"} b={b.pool_size ?? "—"} />
              <Row label="Best time" a={a.best_time_to_visit ?? "—"} b={b.best_time_to_visit ?? "—"} />
              <Row label="Heated" a={yesNo(a.heated_pool)} b={yesNo(b.heated_pool)} />
              <Row label="Year-round" a={yesNo(a.year_round)} b={yesNo(b.year_round)} />
              <Row label="Season" a={a.season ?? "—"} b={b.season ?? "—"} />
              <Row label="Guest only" a={yesNo(a.guest_only)} b={yesNo(b.guest_only)} />
              <Row label="Day pass" a={yesNo(a.day_pass_available)} b={yesNo(b.day_pass_available)} />
              <Row label="Vibe" a={a.vibe ?? "—"} b={b.vibe ?? "—"} />
              <Row
                label="Price from"
                a={a.price_from_eur ? `€${a.price_from_eur}` : "—"}
                b={b.price_from_eur ? `€${b.price_from_eur}` : "—"}
              />
              <Row label="Neighborhood" a={a.neighborhood ?? "—"} b={b.neighborhood ?? "—"} />
            </tbody>
          </table>
        </div>
      </section>

      {/* Editor's verdict */}
      <section className="mx-auto max-w-4xl px-6 pb-20">
        <p className="text-xs uppercase tracking-[0.3em] text-primary">Editor's verdict</p>
        <p className="mt-4 font-display text-2xl leading-snug tracking-wide text-foreground/95 md:text-3xl">
          {pair.verdict}
        </p>
      </section>

      <SiteFooter />
    </div>
  );
}

function Row({ label, a, b }: { label: string; a: string; b: string }) {
  return (
    <tr>
      <td className="px-4 py-3 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
        {label}
      </td>
      <td className="px-4 py-3 text-foreground/90">{a}</td>
      <td className="px-4 py-3 text-foreground/90">{b}</td>
    </tr>
  );
}

function fmt(v: number | null, suffix: string, digits = 1): string {
  if (v == null) return "—";
  return `${v.toFixed(digits)}${suffix}`;
}

function yesNo(v: boolean | null): string {
  if (v == null) return "—";
  return v ? "Yes" : "No";
}
