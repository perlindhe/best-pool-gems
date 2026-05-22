import { Link } from "@tanstack/react-router";

export function SiteFooter() {
  return (
    <footer className="mt-32 border-t border-border/40 bg-surface/40">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 md:grid-cols-4">
        <div className="md:col-span-2">
          <p className="font-display text-3xl tracking-wider">
            Best Pool <span className="text-primary">Hotels</span>
          </p>
          <p className="mt-3 max-w-md text-sm text-muted-foreground">
            Independent rankings of the world's most beautiful hotel pools. No sponsored placements.
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-primary">The site</p>
          <ul className="mt-4 space-y-2 text-sm">
            <li><Link to="/" className="hover:text-primary">Best hotel pools</Link></li>
            <li><Link to="/about" className="hover:text-primary">About Best Pool Hotels</Link></li>
            <li><Link to="/disclosure" className="hover:text-primary">Affiliate links & disclosure</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-primary">Legal</p>
          <ul className="mt-4 space-y-2 text-sm">
            <li><Link to="/privacy" className="hover:text-primary">Privacy policy</Link></li>
            <li><Link to="/cookies" className="hover:text-primary">Cookies</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border/40">
        <p className="mx-auto max-w-7xl px-6 py-5 text-xs uppercase tracking-[0.2em] text-muted-foreground">
          © {new Date().getFullYear()} Best Pool Hotels — made for sun chasers
        </p>
      </div>
    </footer>
  );
}
