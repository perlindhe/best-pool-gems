export function SiteFooter() {
  return (
    <footer className="mt-32 border-t border-border/40 bg-surface/40">
      <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 px-6 py-12 md:flex-row md:items-center">
        <div>
          <p className="font-display text-3xl tracking-wider">
            Pool<span className="text-primary">List</span>
          </p>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            Oberoende rankningar av världens snyggaste hotellpooler. Inga sponsrade placeringar.
          </p>
        </div>
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
          © {new Date().getFullYear()} PoolList — gjort för soldyrkare
        </p>
      </div>
    </footer>
  );
}
