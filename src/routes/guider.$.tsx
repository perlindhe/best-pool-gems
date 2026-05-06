import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { guides, getGuide } from "@/data/hotels";
import { guideContent, buildGuideMeta, type GuideContent } from "@/data/guideContent";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export const Route = createFileRoute("/guider/$")({
  loader: ({ params }) => {
    const slug = params._splat ?? "";
    const guide = getGuide(slug);
    const content = guideContent[slug];
    if (!guide || !content) throw notFound();
    return { guide, content };
  },
  head: ({ loaderData }) => (loaderData?.guide ? buildGuideMeta(loaderData.guide) : {}),
  notFoundComponent: () => (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className="mx-auto max-w-3xl px-6 py-32 text-center">
        <h1 className="font-display text-6xl text-primary">Guide saknas</h1>
        <Link to="/" className="mt-8 inline-block text-sm uppercase tracking-[0.25em] text-primary">
          ← Till startsidan
        </Link>
      </div>
      <SiteFooter />
    </div>
  ),
  component: GuidePage,
});

function renderInline(text: string) {
  // tiny **bold** parser
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((p, i) =>
    p.startsWith("**") && p.endsWith("**") ? (
      <strong key={i} className="text-foreground">
        {p.slice(2, -2)}
      </strong>
    ) : (
      <span key={i}>{p}</span>
    ),
  );
}

function GuidePage() {
  const { guide, content } = Route.useLoaderData();
  const related = guides.filter((g) => g.slug !== guide.slug && g.city === guide.city).slice(0, 3);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <article>
        <section className="relative isolate overflow-hidden">
          <img
            src={guide.image}
            alt={guide.title}
            width={1280}
            height={896}
            className="absolute inset-0 -z-10 h-full w-full object-cover"
          />
          <div className="absolute inset-0 -z-10 bg-gradient-hero" />
          <div className="mx-auto flex min-h-[60vh] max-w-5xl flex-col justify-end px-6 pb-16 pt-28">
            <p className="text-xs uppercase tracking-[0.35em] text-primary">
              {guide.city} · {guide.category} · {guide.readingTime}
            </p>
            <h1 className="mt-5 font-display text-[clamp(3rem,8vw,6.5rem)] leading-[0.9] tracking-tight text-balance">
              {guide.title}
            </h1>
            <p className="mt-5 max-w-2xl text-lg text-foreground/85 md:text-xl">{content.hero}</p>
          </div>
        </section>

        <section className="mx-auto max-w-3xl px-6 py-20">
          <div className="space-y-12">
            {content.body.map((block: GuideContent["body"][number], i: number) => (
              <div key={i}>
                {block.heading && (
                  <h2 className="font-display text-4xl tracking-wide text-primary md:text-5xl">
                    {block.heading}
                  </h2>
                )}
                <div className="mt-5 space-y-4 text-lg leading-relaxed text-foreground/90">
                  {block.paragraphs.map((p: string, j: number) => (
                    <p key={j}>{renderInline(p)}</p>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-16 rounded-lg border border-primary/30 bg-primary/5 p-6 text-sm text-muted-foreground">
            <p className="text-xs uppercase tracking-[0.25em] text-primary">Disclosure</p>
            <p className="mt-2">
              Vissa länkar i den här guiden kan vara annonslänkar. Det påverkar aldrig vår
              ranking — läs mer på{" "}
              <Link to="/disclosure" className="underline hover:text-primary">
                Annonslänkar & disclosure
              </Link>.
            </p>
          </div>
        </section>

        {related.length > 0 && (
          <section className="border-t border-border/40 bg-surface/40">
            <div className="mx-auto max-w-7xl px-6 py-20">
              <p className="text-xs uppercase tracking-[0.3em] text-primary">Mer från {guide.city}</p>
              <h2 className="mt-3 font-display text-5xl tracking-wide">Fler guider</h2>
              <div className="mt-10 grid gap-6 md:grid-cols-3">
                {related.map((g) => (
                  <Link
                    key={g.slug}
                    to="/guider/$"
                    params={{ _splat: g.slug }}
                    className="group block rounded-lg border border-border/60 bg-surface/60 p-6 transition hover:border-primary/60"
                  >
                    <p className="text-[10px] uppercase tracking-[0.3em] text-primary">{g.category}</p>
                    <h3 className="mt-3 font-display text-2xl leading-tight tracking-wide group-hover:text-primary">
                      {g.title}
                    </h3>
                    <p className="mt-3 text-sm text-muted-foreground">{g.excerpt}</p>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}
      </article>

      <SiteFooter />
    </div>
  );
}
