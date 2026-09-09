import { createFileRoute } from "@tanstack/react-router";
import { listRankedHotels, type RankedHotel } from "@/lib/rankings.functions";
import { ThemeCollection, themeHead } from "@/components/ThemeCollection";
import { poolThemes } from "@/lib/pool-themes";

const theme = poolThemes.rooftop!;

export const Route = createFileRoute("/rooftop-pool-hotels")({
  loader: async () =>
    await listRankedHotels({ data: { ...theme.filters, verifiedOnly: true, limit: 100 } }),
  head: () => themeHead(theme),
  component: () => {
    const { hotels, total } = Route.useLoaderData() as { hotels: RankedHotel[]; total: number };
    return <ThemeCollection theme={theme} hotels={hotels} total={total} />;
  },
});
