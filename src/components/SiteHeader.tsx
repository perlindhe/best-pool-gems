import { Link } from "@tanstack/react-router";
import { cities } from "@/data/hotels";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/95 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-5">
        <Link to="/" className="flex items-center gap-3">
          <span className="inline-block h-2 w-2 rounded-full bg-primary" />
          <span className="font-display text-xl font-semibold uppercase">
            Best Pool Hotels
          </span>
        </Link>
        <nav className="hidden items-center gap-7 text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground md:flex">
          <Link to="/" activeOptions={{ exact: true }} activeProps={{ className: "text-foreground" }} className="transition hover:text-foreground">
            Home
          </Link>
          <Link to="/rankings" activeProps={{ className: "text-foreground" }} className="transition hover:text-foreground">
            Rankings
          </Link>
          {cities.map((c) => (
            <Link
              key={c.slug}
              to="/$citySlug"
              params={{ citySlug: c.slug }}
              activeProps={{ className: "text-foreground" }}
              className="transition hover:text-foreground"
            >
              {c.name}
            </Link>
          ))}
          <Link to="/about" activeProps={{ className: "text-foreground" }} className="transition hover:text-foreground">
            About
          </Link>
        </nav>
      </div>
    </header>
  );
}
