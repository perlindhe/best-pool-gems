import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-8xl text-primary">404</h1>
        <h2 className="mt-4 font-display text-3xl tracking-wide">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for has swum away.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-5 py-2.5 text-sm font-semibold uppercase tracking-[0.18em] text-primary-foreground transition hover:opacity-90"
          >
            Back home
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
      { title: "Best Pool Hotels — The world's best hotel pools, ranked" },
      { name: "description", content: "Independent guide to the best pool hotels in the world's biggest travel cities. Rankings, guides and insider tips." },
      { property: "og:title", content: "Best Pool Hotels — The world's best hotel pools, ranked" },
      { property: "og:description", content: "Independent guide to the best pool hotels in the world's biggest travel cities. Rankings, guides and insider tips." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Best Pool Hotels — The world's best hotel pools, ranked" },
      { name: "twitter:description", content: "Independent guide to the best pool hotels in the world's biggest travel cities. Rankings, guides and insider tips." },
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
    <html lang="en">
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
