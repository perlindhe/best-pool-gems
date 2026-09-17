import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { EVIDENCE_TEST_GROUP, isEvidenceTestHotel } from "@/lib/evidence-score";

/**
 * One gate for the Evidence-based Pool Score test group.
 *
 * A hotel in the test group may only rank, be indexed or enter the sitemap when
 * an editor has approved an evidence-v1 score with a publishable confidence
 * level. Hotels outside the test group keep the previous model untouched.
 */
export async function getApprovedEvidenceSlugs(): Promise<Set<string>> {
  const { data: hotels, error: hotelErr } = await supabaseAdmin
    .from("hotels")
    .select("id, slug")
    .in("slug", EVIDENCE_TEST_GROUP);
  if (hotelErr) throw new Error(hotelErr.message);

  const byId = new Map<string, string>();
  for (const h of (hotels ?? []) as Array<{ id: string; slug: string }>) byId.set(h.id, h.slug);
  if (byId.size === 0) return new Set();

  const { data: scores, error } = await supabaseAdmin
    .from("pool_scores_evidence")
    .select("hotel_id, score_out_of_ten, total_points, confidence_level, approved_by, approved_at")
    .in("hotel_id", [...byId.keys()]);
  if (error) throw new Error(error.message);

  const approved = new Set<string>();
  for (const s of (scores ?? []) as Array<{
    hotel_id: string;
    score_out_of_ten: number | null;
    total_points: number | null;
    confidence_level: string | null;
    approved_by: string | null;
    approved_at: string | null;
  }>) {
    const ok =
      Boolean(s.approved_by) &&
      Boolean(s.approved_at) &&
      s.score_out_of_ten != null &&
      s.total_points != null &&
      s.confidence_level !== "low";
    const slug = byId.get(s.hotel_id);
    if (ok && slug) approved.add(slug);
  }
  return approved;
}

/** True when this slug is allowed through the evidence gate. */
export function passesEvidenceGate(slug: string | null | undefined, approved: Set<string>) {
  if (!slug) return false;
  if (!isEvidenceTestHotel(slug)) return true;
  return approved.has(slug);
}
