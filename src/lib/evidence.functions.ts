import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

async function ensureAdmin(supabase: { rpc: (fn: string, args: Record<string, unknown>) => Promise<{ data: unknown }> }, userId: string) {
  const { data } = await supabase.rpc("has_role", { _user_id: userId, _role: "admin" });
  if (data !== true) throw new Error("Forbidden: admin only");
}

/** The ten hotels in the evidence-v1 test group, with their current report. */
export const getEvidenceOverview = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await ensureAdmin(context.supabase as never, context.userId);
    const { EVIDENCE_TEST_GROUP, buildEvidenceReport } = await import(
      "@/server/evidence-score.server"
    );
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: hotels, error } = await supabaseAdmin
      .from("hotels")
      .select("id, slug, name, city")
      .in("slug", EVIDENCE_TEST_GROUP as unknown as string[]);
    if (error) throw new Error(error.message);

    const reports = [];
    for (const h of hotels ?? []) {
      try {
        reports.push({ city: h.city, ...(await buildEvidenceReport(h.id)) });
      } catch (e) {
        reports.push({
          hotelId: h.id,
          slug: h.slug,
          name: h.name,
          city: h.city,
          error: e instanceof Error ? e.message : String(e),
        });
      }
    }
    return { reports };
  });

export const recalculateEvidenceScore = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ hotel_id: z.string().uuid() }).parse(input))
  .handler(async ({ context, data }) => {
    await ensureAdmin(context.supabase as never, context.userId);
    const { saveEvidenceReport } = await import("@/server/evidence-score.server");
    return saveEvidenceReport(data.hotel_id);
  });

export const collectPoolComments = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ hotel_id: z.string().uuid() }).parse(input))
  .handler(async ({ context, data }) => {
    await ensureAdmin(context.supabase as never, context.userId);
    const { ingestPoolComments, saveEvidenceReport, isEvidenceTestHotel } = await import(
      "@/server/evidence-score.server"
    );
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: hotel } = await supabaseAdmin
      .from("hotels")
      .select("slug")
      .eq("id", data.hotel_id)
      .maybeSingle();
    if (!isEvidenceTestHotel(hotel?.slug)) {
      throw new Error("Collection is limited to the evidence-v1 test group while it is under review.");
    }
    const result = await ingestPoolComments(data.hotel_id);
    await saveEvidenceReport(data.hotel_id);
    return result;
  });

export const listPoolComments = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ hotel_id: z.string().uuid() }).parse(input))
  .handler(async ({ context, data }) => {
    await ensureAdmin(context.supabase as never, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: rows, error } = await supabaseAdmin
      .from("pool_comments")
      .select("*")
      .eq("hotel_id", data.hotel_id)
      .order("published_at", { ascending: false });
    if (error) throw new Error(error.message);
    return { comments: rows ?? [] };
  });

export const updatePoolComment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        id: z.string().uuid(),
        editor_sentiment: z
          .enum(["positive", "neutral", "negative", "unclear", "irrelevant"])
          .nullable()
          .optional(),
        editor_relevance: z.enum(["pool", "not_pool", "unclear"]).nullable().optional(),
        excluded_reason: z.string().max(200).nullable().optional(),
      })
      .parse(input),
  )
  .handler(async ({ context, data }) => {
    await ensureAdmin(context.supabase as never, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { id, ...patch } = data;
    const { data: row, error } = await supabaseAdmin
      .from("pool_comments")
      .update({ ...patch, approved_by: context.userId, approved_at: new Date().toISOString() } as never)
      .eq("id", id)
      .select("hotel_id")
      .maybeSingle();
    if (error) throw new Error(error.message);
    const { saveEvidenceReport } = await import("@/server/evidence-score.server");
    if (row?.hotel_id) await saveEvidenceReport(row.hotel_id);
    return { ok: true };
  });

export const listExternalMentions = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ hotel_id: z.string().uuid() }).parse(input))
  .handler(async ({ context, data }) => {
    await ensureAdmin(context.supabase as never, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: rows, error } = await supabaseAdmin
      .from("external_mentions")
      .select("*")
      .eq("hotel_id", data.hotel_id)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return { mentions: rows ?? [] };
  });

export const upsertExternalMention = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        id: z.string().uuid().optional(),
        hotel_id: z.string().uuid(),
        url: z.string().url(),
        publication: z.string().max(200).nullable().optional(),
        author: z.string().max(200).nullable().optional(),
        tier: z.enum(["A", "B", "C"]).nullable().optional(),
        is_about_pool: z.boolean().nullable().optional(),
        is_positive: z.boolean().nullable().optional(),
        excluded_reason: z.string().max(200).nullable().optional(),
        approve: z.boolean().optional(),
      })
      .parse(input),
  )
  .handler(async ({ context, data }) => {
    await ensureAdmin(context.supabase as never, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { approve, ...row } = data;
    const payload = {
      ...row,
      approved_by: approve ? context.userId : null,
      approved_at: approve ? new Date().toISOString() : null,
    };
    const { error } = await supabaseAdmin
      .from("external_mentions")
      .upsert(payload as never, { onConflict: "hotel_id,url" });
    if (error) throw new Error(error.message);
    const { saveEvidenceReport } = await import("@/server/evidence-score.server");
    await saveEvidenceReport(data.hotel_id);
    return { ok: true };
  });

export const setPoolSize = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        pool_id: z.string().uuid(),
        area_sqm: z.number().positive().nullable().optional(),
        length_metres: z.number().positive().nullable().optional(),
        size_source_url: z.string().url().nullable().optional(),
        size_verified: z.boolean(),
      })
      .parse(input),
  )
  .handler(async ({ context, data }) => {
    await ensureAdmin(context.supabase as never, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { pool_id, ...patch } = data;
    const { data: row, error } = await supabaseAdmin
      .from("hotel_pools")
      .update(patch as never)
      .eq("id", pool_id)
      .select("hotel_id")
      .maybeSingle();
    if (error) throw new Error(error.message);
    const { saveEvidenceReport } = await import("@/server/evidence-score.server");
    if (row?.hotel_id) await saveEvidenceReport(row.hotel_id);
    return { ok: true };
  });

export const approveEvidenceScore = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        hotel_id: z.string().uuid(),
        editor: z.string().min(2).max(120).nullable(),
      })
      .parse(input),
  )
  .handler(async ({ context, data }) => {
    await ensureAdmin(context.supabase as never, context.userId);
    const { setEvidenceApproval } = await import("@/server/evidence-score.server");
    return setEvidenceApproval(data.hotel_id, data.editor);
  });

/** Runs collection + scoring + automatic approval for the ten test hotels. */
export const runEvidenceAutomationForTestGroup = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await ensureAdmin(context.supabase as never, context.userId);
    const { runEvidenceAutomation } = await import("@/server/evidence-score.server");
    return runEvidenceAutomation();
  });
