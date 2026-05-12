import type { Hotel } from "@/data/hotels";
import { Link } from "@tanstack/react-router";

export function HotelCard({
  hotel,
  slug,
  photoUrl,
}: {
  hotel: Hotel;
  slug?: string | null;
  photoUrl?: string | null;
}) {
  const inner = (
    <article className="group relative overflow-hidden rounded-lg border border-border/60 bg-surface/60 p-6 shadow-card transition hover:border-primary/60 hover:bg-surface md:p-8">
      <div className="flex items-start gap-5 md:gap-6">
        <div className="relative shrink-0">
          {photoUrl ? (
            <div className="relative h-24 w-24 overflow-hidden rounded-md shadow-glow md:h-32 md:w-32">
              <img
                src={photoUrl}
                alt={`${hotel.name} pool`}
                loading="lazy"
                className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.06]"
              />
              <span className="absolute left-1 top-1 flex h-8 w-8 items-center justify-center rounded-md bg-background/85 font-display text-base text-primary shadow-glow backdrop-blur md:h-10 md:w-10 md:text-xl">
                {hotel.rank}
              </span>
            </div>
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-md bg-gradient-aqua font-display text-3xl text-primary-foreground shadow-glow md:h-20 md:w-20 md:text-4xl">
              {hotel.rank}
            </div>
          )}
        </div>
        <div className="flex-1">
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <h3 className="font-display text-3xl tracking-wide group-hover:text-primary md:text-4xl">
              {hotel.name}
            </h3>
            <span className="font-display text-2xl text-primary">{hotel.score.toFixed(1)}</span>
          </div>
          <p className="mt-1 text-xs uppercase tracking-[0.2em] text-muted-foreground">
            {hotel.neighborhood} · {hotel.poolType}
          </p>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-foreground/90">
            {hotel.description}
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.18em]">
            <span className="rounded-sm border border-primary/40 bg-primary/10 px-3 py-1.5 text-primary">
              {hotel.highlight}
            </span>
            <span className="text-muted-foreground">{hotel.pricePerNight}</span>
            {slug && <span className="ml-auto text-primary">View hotel →</span>}
          </div>
        </div>
      </div>
    </article>
  );

  if (!slug) return inner;
  return (
    <Link to="/hotels/$slug" params={{ slug }} className="block">
      {inner}
    </Link>
  );
}
