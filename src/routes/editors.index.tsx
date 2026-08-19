import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { editors } from "@/data/editors";

export const Route = createFileRoute("/editors/")({
  head: () => ({
    meta: [
      { title: "Our editors — Best Pool Hotels" },
      {
        name: "description",
        content:
          "The people behind BestPoolHotels: who researches the pools, who sets the Pool Score methodology, and how we verify every fact we publish.",
      },
      { property: "og:title", content: "Our editors — Best Pool Hotels" },
      {
        property: "og:description",
        content: "Who researches, scores and verifies the hotel pools we publish.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://bestpoolhotels.com/editors" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: "https://bestpoolhotels.com/editors" }],
  }),
  component: EditorsPage,
});

function EditorsPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-4xl px-6 pb-24 pt-32">
        <p className="text-xs uppercase tracking-[0.3em] text-primary">Editorial</p>
        <h1 className="mt-4 font-display text-[clamp(2.5rem,6vw,4.5rem)] leading-[0.95] tracking-tight">
          Our editors
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-foreground/85">
          Every Pool Score is set by a named person, not an algorithm alone. Here is who does the
          research, and what each of them owns.
        </p>

        <div className="mt-12 grid gap-6">
          {editors.map((e) => (
            <Link
              key={e.slug}
              to="/editors/$slug"
              params={{ slug: e.slug }}
              className="rounded-xl border border-border/60 bg-surface/50 p-7 transition hover:border-primary/60"
            >
              <h2 className="font-display text-3xl tracking-wide">{e.name}</h2>
              <p className="mt-1 text-xs uppercase tracking-[0.22em] text-primary">{e.role}</p>
              <p className="mt-4 leading-relaxed text-foreground/85">{e.bio}</p>
              <p className="mt-4 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                {e.focus.join(" · ")}
              </p>
            </Link>
          ))}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
