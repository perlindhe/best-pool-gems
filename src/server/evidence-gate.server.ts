import { supabaseAdmin } from "@/integrations/supabase/client.server";

/**
 * One gate for the Evidence-based Pool Score.
 *
 * The evidence model now applies to every hotel. Rolling it out must never
 * remove pages that are already published, so a hotel without an approved
 * evidence score keeps the existing publication rules; an approved evidence
 * score simply replaces the previous number.
 */
export async function getApprovedEvidenceSlugs(): Promise<Set<string>> {
  const { data: scores, error } = await supabaseAdmin
    .from("pool_scores_evidence")
    .select("hotel_id, score_out_of_ten, total_points, confidence_level, approved_by, approved_at");
  if (error) throw new Error(error.message);

  const approvedIds = new Set<string>();
  for (const s of (scores ?? []) as Array<{
    hotel_id: string;
    score_out_of_ten: number | null;
    total_points: number | null;
    confidence_level: string | null;
    approved_by: string | null;
    approved_at: string | null;
  }>) {
    if (
      s.approved_by &&
      s.approved_at &&
      s.score_out_of_ten != null &&
      s.total_points != null &&
      s.confidence_level !== "low"
    )
      approvedIds.add(s.hotel_id);
  }
  if (approvedIds.size === 0) return new Set();

  const { data: hotels, error: hotelErr } = await supabaseAdmin
    .from("hotels")
    .select("id, slug")
    .in("id", [...approvedIds]);
  if (hotelErr) throw new Error(hotelErr.message);

  const approved = new Set<string>();
  for (const h of (hotels ?? []) as Array<{ id: string; slug: string }>) approved.add(h.slug);
  return approved;
}

/**
 * True when this slug may rank, be indexed and enter the sitemap as far as the
 * evidence model is concerned. The existing verification and publication gates
 * still apply on top of this.
 */
export function passesEvidenceGate(slug: string | null | undefined, _approved: Set<string>) {
  return Boolean(slug);
}
