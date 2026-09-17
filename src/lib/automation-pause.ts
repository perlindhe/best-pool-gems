import { isCorrectionPhase } from "@/lib/hotel-status";

/**
 * Data-correction phase: bulk import, automatic verification, automatic
 * Pool Score generation and new-destination publishing are paused.
 * Only the hotels in the current correction phase may be processed until the phase is approved.
 * Set to false to resume normal automation.
 */
export const AUTOMATION_PAUSED = true;

/** Returns a reason string when this run must not proceed, otherwise null. */
export function automationBlockedReason(slug?: string | null): string | null {
  if (!AUTOMATION_PAUSED) return null;
  if (slug && isCorrectionPhase(slug)) return null;
  return "Automation is paused during the data-correction phase. Pass hotel_slug for one of the hotels in the current correction phase.";
}
