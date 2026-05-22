import type { PoolFacts, PoolDescriptor } from "@/lib/rankings.functions";

const SIZE_LABEL: Record<string, string> = {
  small: "Small (<50 m²)",
  medium: "Medium (50–150 m²)",
  large: "Large (150–400 m²)",
  very_large: "Very large (400+ m²)",
};

const POOL_TYPE_LABEL: Record<PoolDescriptor["type"], string> = {
  outdoor: "Outdoor pool",
  indoor: "Indoor pool",
  rooftop: "Rooftop pool",
  infinity: "Infinity pool",
  plunge: "Plunge pool",
  lap: "Lap pool",
  kids: "Kids' pool",
  spa_pool: "Spa pool",
  jacuzzi: "Jacuzzi",
};

type Row = { label: string; value: string };

function buildRows(f: PoolFacts): Row[] {
  const rows: Row[] = [];
  const yn = (v: boolean | null | undefined) =>
    v === true ? "Yes" : v === false ? "No" : null;

  if (f.pool_count != null)
    rows.push({ label: "Pools", value: String(f.pool_count) });
  if (f.size_estimate)
    rows.push({ label: "Size", value: SIZE_LABEL[f.size_estimate] ?? f.size_estimate });
  if (f.length_m != null)
    rows.push({ label: "Length", value: `${f.length_m} m` });
  if (f.view) rows.push({ label: "View", value: f.view });

  const setting: string[] = [];
  if (f.is_rooftop) setting.push("Rooftop");
  if (f.is_infinity) setting.push("Infinity edge");
  if (f.has_indoor && f.has_outdoor) setting.push("Indoor + outdoor");
  else if (f.has_indoor) setting.push("Indoor");
  else if (f.has_outdoor) setting.push("Outdoor");
  if (setting.length) rows.push({ label: "Setting", value: setting.join(" · ") });

  if (yn(f.is_heated)) rows.push({ label: "Heated", value: yn(f.is_heated)! });
  if (yn(f.is_saltwater)) rows.push({ label: "Saltwater", value: yn(f.is_saltwater)! });
  if (yn(f.year_round))
    rows.push({ label: "Year-round", value: yn(f.year_round)! });
  if (f.season) rows.push({ label: "Season", value: f.season });

  const amenities: string[] = [];
  if (f.has_jacuzzi) amenities.push("Jacuzzi");
  if (f.has_swim_up_bar) amenities.push("Swim-up bar");
  if (f.has_cabanas) amenities.push("Cabanas");
  if (f.has_poolside_food) amenities.push("Poolside food");
  if (f.has_kids_pool) amenities.push("Kids' pool");
  if (amenities.length)
    rows.push({ label: "Amenities", value: amenities.join(" · ") });

  if (yn(f.adults_only))
    rows.push({ label: "Adults only", value: yn(f.adults_only)! });

  return rows;
}

function poolSubtitle(p: PoolDescriptor): string {
  const bits: string[] = [];
  if (p.indoor === true) bits.push("Indoor");
  if (p.indoor === false) bits.push("Outdoor");
  if (p.heated === true) bits.push("Heated");
  if (p.length_m != null) bits.push(`${p.length_m} m`);
  if (p.adults_only === true) bits.push("Adults only");
  if (p.season) bits.push(p.season);
  return bits.join(" · ");
}

export function PoolFactsTable({ facts }: { facts: PoolFacts | null | undefined }) {
  if (!facts) return null;
  const rows = buildRows(facts);
  const pools = (facts.pools ?? []).filter((p) => p && p.type);
  if (rows.length === 0 && pools.length === 0) return null;

  return (
    <div className="mt-4 overflow-hidden rounded-md border border-border/50 bg-background/30">
      <p className="border-b border-border/40 bg-surface/40 px-3 py-2 text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
        Pool facts
      </p>

      {pools.length > 0 && (
        <ul className="divide-y divide-border/30">
          {pools.map((p, i) => (
            <li key={i} className="px-3 py-2">
              <p className="text-sm font-medium text-foreground/90">
                {p.name || POOL_TYPE_LABEL[p.type]}
              </p>
              <p className="text-xs text-muted-foreground">
                {poolSubtitle(p) || POOL_TYPE_LABEL[p.type]}
              </p>
            </li>
          ))}
        </ul>
      )}

      {rows.length > 0 && (
        <dl className="divide-y divide-border/30 border-t border-border/30 text-sm">
          {rows.map((r) => (
            <div
              key={r.label}
              className="grid grid-cols-[110px_1fr] gap-3 px-3 py-2"
            >
              <dt className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                {r.label}
              </dt>
              <dd className="text-foreground/90">{r.value}</dd>
            </div>
          ))}
        </dl>
      )}

      <p className="border-t border-border/40 bg-surface/40 px-3 py-1.5 text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
        Only facts confirmed by 2+ sources or the hotel's own site are shown
      </p>
    </div>
  );
}
