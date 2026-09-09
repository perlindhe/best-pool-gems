import type { rankingFiltersSchema } from "@/lib/rankings.functions";
import type { z } from "zod";

export type ThemeFilters = Partial<z.infer<typeof rankingFiltersSchema>>;

export type PoolTheme = {
  path: string;
  title: string;
  h1: string;
  description: string;
  intro: string;
  filters: ThemeFilters;
};

export const poolThemes: Record<string, PoolTheme> = {
  heated: {
    path: "/heated-pool-hotels",
    title: "Hotels With Heated Pools (2026) – Verified & Ranked",
    h1: "Hotels with heated pools",
    description:
      "Hotels whose pool heating we have checked against the property's own pool or spa page. Filter-free list with pool type, season, indoor or outdoor and last verification date.",
    intro:
      "Heating is one of the facts we refuse to publish from guest reviews alone. Every hotel below has heating confirmed on the hotel's official pool, spa or facilities page, or by two independent sources, with the verification date shown on each profile.",
    filters: { heated: true },
  },
  rooftop: {
    path: "/rooftop-pool-hotels",
    title: "Rooftop Pool Hotels (2026) – Verified & Ranked",
    h1: "Rooftop pool hotels",
    description:
      "Hotels with a genuine rooftop pool, not a terrace plunge tub mislabelled by booking sites. Pool size, view, season and access checked by Best Pool Hotels.",
    intro:
      "A rooftop pool has to sit on a roof deck and be open to hotel guests. We exclude terrace jacuzzis and spa tubs that booking sites list as rooftop pools, and we note where the pool is small or seasonal rather than year-round.",
    filters: { rooftop: true },
  },
  family: {
    path: "/family-pool-hotels",
    title: "Family Hotels With Pools (2026) – Verified & Ranked",
    h1: "Family hotels with pools",
    description:
      "Hotels where children are welcome in the pool, with kids' pools, depth, supervision rules and season verified against the hotel's own information.",
    intro:
      "Many hotel pools are quietly adults-only, or restrict children to short windows in the day. These hotels allow children in the main pool or provide a separate kids' pool, with the rule taken from the hotel's own published information.",
    filters: { familyFriendly: true },
  },
  indoor: {
    path: "/indoor-pool-hotels",
    title: "Hotels With Indoor Pools (2026) – Verified & Ranked",
    h1: "Hotels with indoor pools",
    description:
      "Hotels with an indoor pool that is open to guests year-round. Pool length, heating, spa access and opening hours verified by Best Pool Hotels.",
    intro:
      "An indoor pool is what makes a hotel usable for swimming outside summer. Each hotel here has an indoor pool confirmed on the hotel's own site, with heating and season stated separately rather than assumed.",
    filters: { indoor: true },
  },
};
