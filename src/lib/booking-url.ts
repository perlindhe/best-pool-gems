/**
 * Single rule for every "Check availability" / "Book" button.
 * Prefers a stored affiliate or booking link; otherwise falls back to a
 * Booking.com search for the exact hotel name + city, so the CTA always works.
 */
export function bookingUrlFor(h: {
  name?: string | null;
  city?: string | null;
  affiliate_url?: string | null;
  booking_url?: string | null;
}): string | null {
  const stored = (h.affiliate_url ?? h.booking_url ?? "").trim();
  if (stored) return stored;
  const name = (h.name ?? "").trim();
  if (!name) return null;
  const q = [name, h.city].filter(Boolean).join(", ");
  return `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(q)}`;
}
