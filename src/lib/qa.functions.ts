import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export type QaRow = {
  id: string;
  slug: string;
  name: string;
  city: string;
  verification_status: string;
  editorial_status: string | null;
  pool_status: string;
  has_active_pool: boolean | null;
  ranking_eligible: boolean | null;
  shared_pools: number;
  spa_pools: number;
  kids_pools: number;
  private_pools: number;
  jacuzzis: number;
  heated_state: string;
  season_state: string;
  score: number | null;
  last_verified_date: string | null;
  qa_blocked: boolean | null;
  qa_checked_at: string | null;
  missing: string[];
};

async function ensureAdmin(userId: string) {
  const { data, error } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Forbidden: admin only");
}

export const adminQaOverview = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await ensureAdmin(context.userId);

    const { data, error } = await supabaseAdmin
      .from("public_hotels_view")
      .select(
        "id, slug, name, city, verification_status, editorial_status, pool_status, has_active_pool, ranking_eligible, shared_pool_count, spa_pool_count, kids_pool_count, private_pool_count, jacuzzi_count, heated_state, season_state, pool_score_0_10, last_verified_date, qa_blocked, qa_checked_at, primary_source_url, secondary_source_url, official_url",
      )
      .order("city")
      .order("name");
    if (error) throw new Error(error.message);

    const rows: QaRow[] = (data ?? []).map((h) => {
      const missing: string[] = [];
      if (!h.official_url) missing.push("official URL");
      if (!h.primary_source_url) missing.push("primary source");
      if (!h.secondary_source_url) missing.push("second source");
      if (!h.last_verified_date) missing.push("verification date");
      if ((h.shared_pool_count ?? 0) === 0) missing.push("confirmed pool");
      if (h.heated_state === "unknown") missing.push("heating");
      if (h.season_state === "unknown") missing.push("season");
      if (h.pool_score_0_10 == null) missing.push("Pool Score");
      return {
        id: h.id as string,
        slug: h.slug as string,
        name: h.name as string,
        city: h.city as string,
        verification_status: h.verification_status as string,
        editorial_status: (h.editorial_status as string | null) ?? null,
        pool_status: h.pool_status as string,
        has_active_pool: (h.has_active_pool as boolean | null) ?? null,
        ranking_eligible: (h.ranking_eligible as boolean | null) ?? null,
        shared_pools: (h.shared_pool_count as number) ?? 0,
        spa_pools: (h.spa_pool_count as number) ?? 0,
        kids_pools: (h.kids_pool_count as number) ?? 0,
        private_pools: (h.private_pool_count as number) ?? 0,
        jacuzzis: (h.jacuzzi_count as number) ?? 0,
        heated_state: (h.heated_state as string) ?? "unknown",
        season_state: (h.season_state as string) ?? "unknown",
        score: (h.pool_score_0_10 as number | null) ?? null,
        last_verified_date: (h.last_verified_date as string | null) ?? null,
        qa_blocked: (h.qa_blocked as boolean | null) ?? null,
        qa_checked_at: (h.qa_checked_at as string | null) ?? null,
        missing,
      };
    });

    return { rows };
  });
