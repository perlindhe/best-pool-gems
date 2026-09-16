import {
  calculateVerificationStatus,
  STATUS_COPY,
  type HotelStatus,
  type StatusHotel,
} from "@/lib/hotel-status";

function formatDate(date?: string | null) {
  if (!date) return null;
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

const TONE: Record<HotelStatus, { icon: string; tone: string }> = {
  fully_verified: { icon: "✓", tone: "border-primary/60 text-primary" },
  partially_verified: { icon: "◐", tone: "border-border/70 text-foreground/80" },
  research_pending: { icon: "○", tone: "border-border/60 text-muted-foreground" },
  conflicting_data: { icon: "!", tone: "border-border/70 text-foreground/80" },
  no_active_pool: { icon: "—", tone: "border-border/60 text-muted-foreground" },
};

/**
 * The one badge on the site. It never receives a status — it derives it from
 * the canonical record through the central function, so no page can show a
 * different verification state than another.
 */
export function VerificationBadge({
  hotel,
  date,
  className = "",
}: {
  hotel: StatusHotel;
  date?: string | null;
  className?: string;
}) {
  const status = calculateVerificationStatus(hotel);
  const when = formatDate(date ?? hotel.last_verified_date);
  const { icon, tone } = TONE[status];
  const label =
    status === "fully_verified" && when
      ? `Fully verified ${when}`
      : STATUS_COPY[status].label;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-sm border px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] ${tone} ${className}`}
    >
      <span aria-hidden>{icon}</span>
      {label}
    </span>
  );
}
