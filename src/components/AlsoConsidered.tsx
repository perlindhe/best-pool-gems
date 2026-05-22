export type AlsoConsideredItem = {
  name: string;
  neighborhood?: string;
  reason: string;
};

export function AlsoConsidered({ items }: { items: AlsoConsideredItem[] }) {
  if (!items.length) return null;
  return (
    <section className="border-t border-border/40 bg-surface/40">
      <div className="mx-auto max-w-5xl px-6 py-16">
        <p className="text-xs uppercase tracking-[0.3em] text-primary">Also considered</p>
        <h2 className="mt-3 font-display text-4xl tracking-wide md:text-5xl">
          Nearly made the list
        </h2>
        <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
          Hotels we shortlisted but left out of the main ranking this edition, with
          a one-line note explaining the call.
        </p>
        <ul className="mt-8 grid gap-4 md:grid-cols-2">
          {items.map((i) => (
            <li
              key={i.name}
              className="rounded-lg border border-border/60 bg-background/60 p-5"
            >
              <p className="font-display text-xl tracking-wide text-foreground">{i.name}</p>
              {i.neighborhood && (
                <p className="mt-1 text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                  {i.neighborhood}
                </p>
              )}
              <p className="mt-3 text-sm leading-relaxed text-foreground/85">{i.reason}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
