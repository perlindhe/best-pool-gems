import { Link } from "@tanstack/react-router";
import { HotelImage } from "@/components/HotelImage";
import { CheckAvailability } from "@/components/BookingCTA";
import { VerificationBadge } from "@/components/VerificationBadge";
import { hasCompletePoolScore } from "@/lib/scoring";

/** Canonical record fields a listing card needs. One hotel = one record. */
export type CardHotel = {
  id: string;
  slug: string;
  name: string;
  neighborhood: string | null;
  pool_type: string | null;
  pool_score_0_10: number | null;
  pool_components: Record<string, number> | null;
  meta_rating_0_100: number | null;
  why_included: string | null;
  editorial_notes: string | null;
  season: string | null;
  pool_size: string | null;
  price_from_eur: number | null;
  hero_photo_url?: string | null;
  cover_image_url: string | null;
  booking_url: string | null;
  affiliate_url?: string | null;
  verification_status: "verified" | "partially_verified" | "research_pending";
  last_verified_date: string | null;
};

const summary = (h: CardHotel) => {
  const text = (h.why_included ?? h.editorial_notes ?? "").trim();
  if (!text) return null;
  return text.length > 320 ? `${text.slice(0, 317)}…` : text;
};

export function HotelCard({ hotel, rank }: { hotel: CardHotel; rank: number }) {
  const photoUrl = hotel.hero_photo_url ?? hotel.cover_image_url ?? null;
  const bookingUrl = hotel.affiliate_url ?? hotel.booking_url ?? null;
  const scored = hasCompletePoolScore(hotel.pool_components, hotel.pool_score_0_10);
  const blurb = summary(hotel);

  return (
    <article className="group relative overflow-hidden rounded-lg border border-border/60 bg-surface/60 p-6 shadow-card transition hover:border-primary/60 hover:bg-surface md:p-8">
      <div className="flex items-start gap-5 md:gap-6">
        <div className="relative shrink-0">
          {photoUrl ? (
            <div className="relative h-24 w-24 overflow-hidden rounded-md shadow-glow md:h-32 md:w-32">
              <HotelImage
                src={photoUrl}
                alt={`${hotel.name} pool`}
                width={256}
                height={256}
                sizes="(max-width: 768px) 96px, 128px"
                className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.06]"
              />
              <span className="absolute left-1 top-1 flex h-8 w-8 items-center justify-center rounded-md bg-background/85 font-display text-base text-primary shadow-glow backdrop-blur md:h-10 md:w-10 md:text-xl">
                {rank}
              </span>
            </div>
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-md bg-gradient-aqua font-display text-3xl text-primary-foreground shadow-glow md:h-20 md:w-20 md:text-4xl">
              {rank}
            </div>
          )}
        </div>
        <div className="flex-1">
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <h3 className="font-display text-3xl tracking-wide group-hover:text-primary md:text-4xl">
              <Link
                to="/hotels/$slug"
                params={{ slug: hotel.slug }}
                className="after:absolute after:inset-0 after:content-['']"
              >
                {hotel.name}
              </Link>
            </h3>
            {scored ? (
              <span className="font-display text-2xl text-primary">
                {hotel.pool_score_0_10!.toFixed(1)}
              </span>
            ) : (
              <span className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                Not yet scored
              </span>
            )}
          </div>
          <p className="mt-1 text-xs uppercase tracking-[0.2em] text-muted-foreground">
            {[hotel.neighborhood, hotel.pool_type].filter(Boolean).join(" · ") || "Pool hotel"}
          </p>
          {blurb && (
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-foreground/90">{blurb}</p>
          )}
          <div className="mt-5 flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.18em]">
            <VerificationBadge
              status={hotel.verification_status}
              date={hotel.last_verified_date}
            />
            {hotel.meta_rating_0_100 != null && (
              <span className="text-muted-foreground">
                Meta rating {(hotel.meta_rating_0_100 / 10).toFixed(1)}/10
              </span>
            )}
            {hotel.price_from_eur != null && (
              <span className="text-muted-foreground">From €{hotel.price_from_eur}</span>
            )}
            <span className="ml-auto text-primary">View hotel →</span>
          </div>
          {bookingUrl && (
            <div className="relative z-10 mt-5">
              <CheckAvailability url={bookingUrl} size="sm" />
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
