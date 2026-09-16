import type { PoolRecord } from "@/server/hotel-detail.server";

const CATEGORY_LABEL: Record<PoolRecord["pool_category"], string> = {
  shared_hotel_pool: "Shared hotel pool",
  private_room_pool: "Private room pool",
  shared_swim_up: "Shared swim-up pool",
  spa_pool: "Spa pool",
  childrens_pool: "Children's pool",
  plunge_pool: "Plunge pool",
  jacuzzi: "Jacuzzi / hot tub",
};

const NOT_CONFIRMED =
  "This detail has not yet been confirmed and is not included in the hotel's score.";

export type PoolMixCounts = {
  shared_pool_count: number | null;
  spa_pool_count: number | null;
  kids_pool_count: number | null;
  private_pool_count: number | null;
  jacuzzi_count: number | null;
  plunge_pool_count?: number | null;
};

/** Plain-English summary built only from the individual pool records. */
export function poolMixSentence(c: PoolMixCounts): string | null {
  const parts: string[] = [];
  const shared = c.shared_pool_count ?? 0;
  const kids = c.kids_pool_count ?? 0;
  const spa = c.spa_pool_count ?? 0;
  const jac = c.jacuzzi_count ?? 0;
  const plunge = c.plunge_pool_count ?? 0;
  const priv = c.private_pool_count ?? 0;
  if (shared > 0) parts.push(`${shared} shared pool${shared === 1 ? "" : "s"}`);
  if (kids > 0) parts.push(`${kids} children's pool${kids === 1 ? "" : "s"}`);
  if (plunge > 0) parts.push(`${plunge} plunge pool${plunge === 1 ? "" : "s"}`);
  if (spa > 0) parts.push(`${spa} spa pool${spa === 1 ? "" : "s"}`);
  if (jac > 0) parts.push(`${jac} jacuzzi${jac === 1 ? "" : "s"}`);
  if (parts.length === 0 && priv === 0) return null;
  let text =
    parts.length > 1
      ? `${parts.slice(0, -1).join(", ")} and ${parts[parts.length - 1]}`
      : (parts[0] ?? "");
  if (priv > 0) {
    text = text
      ? `${text}, plus private pools in selected room categories`
      : "Private pools in selected room categories";
  }
  return `${text.charAt(0).toUpperCase()}${text.slice(1)}.`;
}

function poolLine(p: PoolRecord): string {
  const bits: string[] = [CATEGORY_LABEL[p.pool_category]];
  if (p.indoor === true) bits.push("Indoor");
  else if (p.outdoor === true) bits.push("Outdoor");
  else bits.push("Indoor or outdoor not confirmed");
  if (p.rooftop === true) bits.push("Rooftop");
  if (p.infinity_edge === true) bits.push("Infinity edge");
  if (p.heating_state === "confirmed_heated")
    bits.push(p.heated_months ? `Heated (${p.heated_months})` : "Heated");
  else if (p.heating_state === "confirmed_not_heated") bits.push("Not heated");
  else bits.push("Heating not confirmed");
  if (p.length_metres != null) bits.push(`${p.length_metres} m`);
  if (p.saltwater === true) bits.push("Saltwater");
  if (p.adults_only === true) bits.push("Adults only");
  if (p.season_state === "year_round") bits.push("Open year-round");
  else if (p.season_state === "seasonal")
    bits.push(p.seasonal_dates ? `Seasonal (${p.seasonal_dates})` : "Seasonal");
  else bits.push("Season not confirmed");
  if (p.day_pass === true) bits.push("Day pass available");
  return bits.join(" · ");
}

const HEATING_SUMMARY: Record<string, string> = {
  heated: "At least one pool is confirmed heated — heating does not apply to every pool below.",
  not_heated: "No pool at this hotel is heated, according to the hotel's own information.",
  unknown: "Heating has not been confirmed for any pool here.",
};

export function PoolRecordsPanel({
  pools,
  counts,
  heatedState,
}: {
  pools: PoolRecord[];
  counts: PoolMixCounts;
  heatedState: string | null;
}) {
  if (!pools.length) return null;
  const summary = poolMixSentence(counts);

  return (
    <div className="mt-4 overflow-hidden rounded-md border border-border/50 bg-background/30">
      <p className="border-b border-border/40 bg-surface/40 px-3 py-2 text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
        Pools at this hotel
      </p>

      {summary && <p className="px-3 pt-3 text-sm text-foreground/90">{summary}</p>}
      <p className="px-3 pb-3 pt-1 text-xs text-muted-foreground">
        {HEATING_SUMMARY[heatedState ?? "unknown"] ?? HEATING_SUMMARY.unknown}
      </p>

      <ul className="divide-y divide-border/30 border-t border-border/30">
        {pools.map((p) => (
          <li key={p.id} className="px-3 py-2">
            <p className="text-sm font-medium text-foreground/90">
              {p.pool_name || CATEGORY_LABEL[p.pool_category]}
            </p>
            <p className="text-xs text-muted-foreground">{poolLine(p)}</p>
            {p.fact_status !== "verified" && (
              <p className="mt-1 text-[11px] text-muted-foreground/80">{NOT_CONFIRMED}</p>
            )}
          </li>
        ))}
      </ul>

      <p className="border-t border-border/40 bg-surface/40 px-3 py-1.5 text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
        A jacuzzi is listed separately and never counted as a swimming pool
      </p>
    </div>
  );
}
