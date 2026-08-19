import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

/** Hotels in one city whose outdoor pool is heated (off-season swimmable). */
export const listOffSeasonHotels = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) => z.object({ citySlug: z.string().max(120) }).parse(input))
  .handler(async ({ data }) => {
    const { listCanonicalHotels } = await import("@/server/canonical-hotels.server");
    const { hotels } = await listCanonicalHotels({
      city: data.citySlug,
      heated: true,
      outdoor: true,
      limit: 50,
    });
    return hotels.map((h) => ({
      name: h.name,
      slug: h.slug,
      neighborhood: h.neighborhood,
      poolType: h.pool_type,
      season: h.season,
      yearRound: h.year_round,
      poolCount: h.pool_count,
      score: h.pool_score_0_10,
      verificationStatus: h.verification_status,
      lastVerified: h.last_verified_date,
    }));
  });

export type OffSeasonDbHotel = Awaited<ReturnType<typeof listOffSeasonHotels>>[number];
