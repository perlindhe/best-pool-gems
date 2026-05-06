import { Link } from "@tanstack/react-router";

export function SiteFooter() {
  return (
    <footer className="mt-32 border-t border-border/40 bg-surface/40">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 md:grid-cols-4">
        <div className="md:col-span-2">
          <p className="font-display text-3xl tracking-wider">
            Pool<span className="text-primary">List</span>
          </p>
          <p className="mt-3 max-w-md text-sm text-muted-foreground">
            Oberoende rankningar av världens snyggaste hotellpooler. Inga sponsrade placeringar.
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-primary">Sajten</p>
          <ul className="mt-4 space-y-2 text-sm">
            <li><Link to="/" className="hover:text-primary">Bästa hotellpooler</Link></li>
            <li><Link to="/about" className="hover:text-primary">Om PoolList</Link></li>
            <li><Link to="/disclosure" className="hover:text-primary">Annonslänkar & disclosure</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-primary">Juridik</p>
          <ul className="mt-4 space-y-2 text-sm">
            <li><Link to="/integritetspolicy" className="hover:text-primary">Integritetspolicy</Link></li>
            <li><Link to="/cookies" className="hover:text-primary">Cookies</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border/40">
        <p className="mx-auto max-w-7xl px-6 py-5 text-xs uppercase tracking-[0.2em] text-muted-foreground">
          © {new Date().getFullYear()} PoolList — gjort för soldyrkare
        </p>
      </div>
    </footer>
  );
}
