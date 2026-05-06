import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

// PUBLIC reads (used by SSR pages) — service role to bypass any future tightening.
export const listHotelsByCity = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) =>
    z.object({ citySlug: z.string().min(1).max(64) }).parse(input),
  )
  .handler(async ({ data }) => {
    const { data: rows, error } = await supabaseAdmin
      .from("public_hotels_view")
      .select("*")
      .eq("city_slug", data.citySlug)
      .order("rank_position", { ascending: true, nullsFirst: false });
    if (error) throw new Error(error.message);
    return { hotels: rows ?? [] };
  });

export const listCities = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await supabaseAdmin
    .from("public_hotels_view")
    .select("city, city_slug, country");
  if (error) throw new Error(error.message);
  const map = new Map<string, { city: string; city_slug: string; country: string; count: number }>();
  for (const r of data ?? []) {
    const key = r.city_slug as string;
    const cur = map.get(key);
    if (cur) cur.count += 1;
    else
      map.set(key, {
        city: r.city as string,
        city_slug: key,
        country: r.country as string,
        count: 1,
      });
  }
  return { cities: Array.from(map.values()) };
});
