import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { listCanonicalHotels, listCanonicalCities } from "@/server/canonical-hotels.server";

// PUBLIC reads (used by SSR pages) — all go through the canonical accessor.
export const listHotelsByCity = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) =>
    z.object({ citySlug: z.string().min(1).max(64) }).parse(input),
  )
  .handler(async ({ data }) => {
    const { hotels } = await listCanonicalHotels({ city: data.citySlug });
    return { hotels };
  });

export const listCities = createServerFn({ method: "GET" }).handler(async () => {
  return await listCanonicalCities();
});
