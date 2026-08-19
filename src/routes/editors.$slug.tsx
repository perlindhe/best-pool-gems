import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { getEditor } from "@/data/editors";

export const Route = createFileRoute("/editors/$slug")({
  loader: ({ params }) => {
    const editor = getEditor(params.slug);
    if (!editor) throw notFound();
    return { editor };
  },
  head: ({ params, loaderData }) => {
    const url = `https://bestpoolhotels.com/editors/${params.slug}`;
    if (!loaderData) {
      return {
        meta: [{ title: "Editor not found" }, { name: "robots", content: "noindex" }],
      };
    }
    const { editor } = loaderData;
    const title = `${editor.name} — ${editor.role} · Best Pool Hotels`;
    const description = editor.bio.slice(0, 155);
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "profile" },
        { property: "og:url", content: url },
        { name: "twitter:card", content: "summary" },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Person",
            name: editor.name,
            jobTitle: editor.role,
            description: editor.bio,
            url,
            worksFor: { "@type": "Organization", name: "Best Pool Hotels" },
            knowsAbout: editor.focus,
          }),
        },
      ],
    };
  },
  notFoundComponent: () => (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className="mx-auto max-w-3xl px-6 py-32 text-center">
        <h1 className="font-display text-5xl text-primary">Editor not found</h1>
        <Link to="/editors" className="mt-8 inline-block text-sm uppercase tracking-[0.25em] text-primary">
          ← All editors
        </Link>
      </div>
      <SiteFooter />
    </div>
  ),
  component: EditorPage,
});

function EditorPage() {
  const { editor } = Route.useLoaderData();
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-6 pb-24 pt-32">
        <Link to="/editors" className="text-xs uppercase tracking-[0.3em] text-primary hover:underline">
          ← Editors
        </Link>
        <h1 className="mt-6 font-display text-[clamp(2.5rem,6vw,4.5rem)] leading-[0.95] tracking-tight">
          {editor.name}
        </h1>
        <p className="mt-3 text-xs uppercase tracking-[0.25em] text-primary">
          {editor.role} · since {editor.since}
        </p>
        <p className="mt-8 text-lg leading-relaxed text-foreground/90">{editor.bio}</p>

        <h2 className="mt-12 font-display text-2xl tracking-wide">Areas of focus</h2>
        <ul className="mt-4 flex flex-wrap gap-2">
          {editor.focus.map((f) => (
            <li
              key={f}
              className="rounded-full border border-border/70 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-foreground/85"
            >
              {f}
            </li>
          ))}
        </ul>

        <p className="mt-12 rounded-lg border border-border/60 bg-surface/40 p-6 text-sm leading-relaxed text-muted-foreground">
          We only describe a pool as personally visited when an editor has actually been there. Every
          other hotel is labelled "verified with hotel", "verified from multiple sources" or
          "research pending" on its own page.
        </p>
      </main>
      <SiteFooter />
    </div>
  );
}
