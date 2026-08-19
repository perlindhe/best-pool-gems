import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const getCityHubSummaryFn = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) => z.object({ citySlug: z.string().max(120) }).parse(input))
  .handler(async ({ data }) => {
    const { getCityHubSummary } = await import("@/server/canonical-hotels.server");
    return await getCityHubSummary(data.citySlug);
  });
