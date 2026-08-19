import { AffiliateLink } from "@/components/AffiliateLink";

/**
 * Primary booking CTA. Always an affiliate-safe outbound link.
 * Booking links never influence ranking order — they are rendered
 * visually separate from the Pool Score block.
 */
export function CheckAvailability({
  url,
  size = "md",
  label = "Check availability",
  className = "",
}: {
  url?: string | null;
  size?: "sm" | "md";
  label?: string;
  className?: string;
}) {
  if (!url) return null;
  const pad = size === "sm" ? "px-3 py-1.5 text-[10px]" : "px-5 py-2.5 text-xs";
  return (
    <AffiliateLink
      href={url}
      className={`inline-flex items-center gap-2 rounded-sm bg-primary font-medium uppercase tracking-[0.18em] text-primary-foreground transition hover:opacity-90 ${pad} ${className}`}
    >
      {label} ↗
    </AffiliateLink>
  );
}

export function OfficialSiteLink({
  url,
  className = "",
}: {
  url?: string | null;
  className?: string;
}) {
  if (!url) return null;
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-2 rounded-sm border border-primary/60 px-5 py-2.5 text-xs uppercase tracking-[0.18em] text-primary transition hover:bg-primary hover:text-primary-foreground ${className}`}
    >
      Official hotel website ↗
    </a>
  );
}

/**
 * Sticky mobile booking bar for hotel pages.
 * e.g. "Grand Hotel Central · Pool Score 9.2 — Check prices"
 */
export function StickyBookingBar({
  name,
  score,
  url,
}: {
  name: string;
  score?: number | null;
  url?: string | null;
}) {
  if (!url) return null;
  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-border/70 bg-background/95 px-4 py-3 backdrop-blur md:hidden">
      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-foreground">{name}</p>
          <p className="truncate text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            {score != null ? `Pool Score ${score.toFixed(1)}` : "Pool review"}
          </p>
        </div>
        <CheckAvailability url={url} label="Check prices" size="sm" />
      </div>
      <p className="mt-1.5 text-[9px] uppercase tracking-[0.16em] text-muted-foreground">
        Affiliate link — never affects our ranking
      </p>
    </div>
  );
}
