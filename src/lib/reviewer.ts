/**
 * The public-facing reviewer byline. Internal values (verified_by,
 * approved_by, "auto:evidence-v1", system labels) must never reach the page —
 * every hotel profile shows the named editor who owns the review, linked to
 * their editor page.
 */
export const REVIEWER = {
  name: "Per Lindhe",
  slug: "per-lindhe",
} as const;

/** Always returns the public reviewer, whatever the internal label says. */
export function publicReviewer(_internalLabel?: string | null) {
  return REVIEWER;
}

/** "16 September 2026" — the public date format for verification lines. */
export function formatVerifiedDate(date?: string | null): string | null {
  if (!date) return null;
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}
