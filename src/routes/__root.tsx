import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-8xl text-primary">404</h1>
        <h2 className="mt-4 font-display text-3xl tracking-wide">Sidan finns inte</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Sidan du letar efter har simmat iväg.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-5 py-2.5 text-sm font-semibold uppercase tracking-[0.18em] text-primary-foreground transition hover:opacity-90"
          >
            Tillbaka hem
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "PoolList — Världens bästa hotellpooler, rankade" },
      { name: "description", content: "Oberoende guide till de bästa pool-hotellen i världens största turiststäder. Rankningar, tips och insidertips." },
      { property: "og:title", content: "PoolList — Världens bästa hotellpooler, rankade" },
      { property: "og:description", content: "Oberoende guide till de bästa pool-hotellen i världens största turiststäder. Rankningar, tips och insidertips." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "PoolList — Världens bästa hotellpooler, rankade" },
      { name: "twitter:description", content: "Oberoende guide till de bästa pool-hotellen i världens största turiststäder. Rankningar, tips och insidertips." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/7c65e45a-57dd-4ea4-88a3-270589c8351b/id-preview-2e36be90--c3204c3e-3c74-42f1-bd40-ab3e23a229f4.lovable.app-1778055625998.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/7c65e45a-57dd-4ea4-88a3-270589c8351b/id-preview-2e36be90--c3204c3e-3c74-42f1-bd40-ab3e23a229f4.lovable.app-1778055625998.png" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow:wght@300;400;500;600;700&display=swap" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sv">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  return <Outlet />;
}
