import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const schema = z.object({
  citySlug: z.string().max(120),
  articleSlug: z.string().max(160),
});

/** Hotels backing one programmatic collection page, read from the canonical accessor. */
export const listCollectionHotels = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) => schema.parse(input))
  .handler(async ({ data }) => {
    const { getCollection } = await import("@/data/collections");
    const { listCanonicalHotels } = await import("@/server/canonical-hotels.server");
    const collection = getCollection(data.citySlug, data.articleSlug);
    if (!collection) return { hotels: [], total: 0 };
    const { hotels, total } = await listCanonicalHotels({
      city: collection.citySlug,
      ...collection.filter,
      limit: 50,
    });
    return { hotels, total };
  });
