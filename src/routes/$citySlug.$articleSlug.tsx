import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { getCityGuides, getGuideByParts } from "@/data/hotels";
import { guideContent, buildGuideMeta, type GuideContent, type GuideTableRow } from "@/data/guideContent";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { GuideMeta } from "@/components/GuideMeta";
import { AlsoConsidered } from "@/components/AlsoConsidered";

export const Route = createFileRoute("/$citySlug/$articleSlug")({
  loader: ({ params }) => {
    const guide = getGuideByParts(params.citySlug, params.articleSlug);
    const content = guide ? guideContent[guide.slug] : undefined;
    if (!guide || !content) throw notFound();
    return { guide, content };
  },
  head: ({ loaderData }) => (loaderData?.guide ? buildGuideMeta(loaderData.guide) : {}),
  notFoundComponent: () => (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className="mx-auto max-w-3xl px-6 py-32 text-center">
        <h1 className="font-display text-6xl text-primary">Guide missing</h1>
        <Link to="/" className="mt-8 inline-block text-sm uppercase tracking-[0.25em] text-primary">
          ← Back to home
        </Link>
      </div>
      <SiteFooter />
    </div>
  ),
  errorComponent: ({ error }) => (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className="mx-auto max-w-3xl px-6 py-32 text-center">
        <h1 className="font-display text-5xl text-primary">Something went wrong</h1>
        <p className="mt-4 text-muted-foreground">{error.message}</p>
      </div>
    </div>
  ),
  component: GuidePage,
});

function renderInline(text: string) {
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
  const related = getCityGuides(guide.citySlug)
    .filter((g) => g.slug !== guide.slug)
    .slice(0, 3);

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
            <nav className="text-xs uppercase tracking-[0.35em] text-primary">
              <Link to="/" className="hover:text-foreground">Home</Link>
              <span className="mx-2 text-muted-foreground">/</span>
              <Link
                to="/$citySlug"
                params={{ citySlug: guide.citySlug }}
                className="hover:text-foreground"
              >
                {guide.city}
              </Link>
              <span className="mx-2 text-muted-foreground">/</span>
              <span className="text-foreground">{guide.category}</span>
            </nav>
            <h1 className="mt-5 font-display text-[clamp(3rem,8vw,6.5rem)] leading-[0.9] tracking-tight text-balance">
              {guide.title}
            </h1>
            <p className="mt-5 max-w-2xl text-lg text-foreground/85 md:text-xl">{content.hero}</p>
          </div>
        </section>

        <section className="mx-auto max-w-3xl px-6 py-16">
          <GuideMeta
            publishedDate={content.publishedDate}
            lastUpdated={content.lastUpdated}
            sources={content.sources}
            verificationNote={content.verificationNote}
          />

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
        </section>

        {content.table && (
          <section className="border-t border-border/40 bg-surface/40">
            <div className="mx-auto max-w-5xl px-6 py-16">
              <h2 className="font-display text-4xl tracking-wide text-primary md:text-5xl">
                {content.table.heading}
              </h2>
              {content.table.intro && (
                <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
                  {content.table.intro}
                </p>
              )}

              <div className="mt-8 overflow-x-auto rounded-xl border border-border/60 bg-background/60">
                <table className="w-full min-w-[640px] text-sm">
                  <thead>
                    <tr className="border-b border-border/60 text-left text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                      <th className="px-5 py-3 font-normal">Hotel</th>
                      {content.table.rows[0]?.cells.map((c: { label: string; value: string }) => (
                        <th key={c.label} className="px-5 py-3 font-normal">
                          {c.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {content.table.rows.map((row: GuideTableRow) => (
                      <tr key={row.hotel} className="border-t border-border/40 align-top">
                        <td className="px-5 py-4">
                          <p className="font-display text-lg tracking-wide text-foreground">
                            {row.hotel}
                          </p>
                          <p className="mt-0.5 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                            {row.neighborhood}
                          </p>
                        </td>
                        {row.cells.map((c: { label: string; value: string }) => (
                          <td key={c.label} className="px-5 py-4 text-foreground/85">
                            {c.value}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        <AlsoConsidered
          items={content.alsoConsidered.map((i: { name: string; neighborhood?: string; reason: string }) => ({
            name: i.name,
            neighborhood: i.neighborhood,
            reason: i.reason,
          }))}
        />

        <section className="mx-auto max-w-3xl px-6 py-12">
          <div className="rounded-lg border border-primary/30 bg-primary/5 p-6 text-sm text-muted-foreground">
            <p className="text-xs uppercase tracking-[0.25em] text-primary">Disclosure</p>
            <p className="mt-2">
              Some links in this guide are affiliate links and carry{" "}
              <code className="text-foreground">rel="sponsored nofollow"</code>. They never affect our ranking — read more on{" "}
              <Link to="/disclosure" className="underline hover:text-primary">
                Affiliate links &amp; disclosure
              </Link>.
            </p>
          </div>
        </section>

        {related.length > 0 && (
          <section className="border-t border-border/40 bg-surface/40">
            <div className="mx-auto max-w-7xl px-6 py-20">
              <p className="text-xs uppercase tracking-[0.3em] text-primary">More from {guide.city}</p>
              <h2 className="mt-3 font-display text-5xl tracking-wide">More guides</h2>
              <div className="mt-10 grid gap-6 md:grid-cols-3">
                {related.map((g) => (
                  <Link
                    key={g.slug}
                    to="/$citySlug/$articleSlug"
                    params={{ citySlug: g.citySlug, articleSlug: g.articleSlug }}
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
