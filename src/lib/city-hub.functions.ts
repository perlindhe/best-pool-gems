import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { CanonicalHotel } from "@/server/canonical-hotels.server";

export type CityHotel = CanonicalHotel;

export const getCityHubSummaryFn = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) => z.object({ citySlug: z.string().max(120) }).parse(input))
  .handler(async ({ data }) => {
    const { getCityHubSummary } = await import("@/server/canonical-hotels.server");
    return await getCityHubSummary(data.citySlug);
  });

export const listCityHotelsFn = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) => z.object({ citySlug: z.string().max(120) }).parse(input))
  .handler(async ({ data }) => {
    const { listCityHotels } = await import("@/server/canonical-hotels.server");
    const { hotels, total } = await listCityHotels(data.citySlug);
    return { hotels: hotels as unknown as CityHotel[], total };
  });
