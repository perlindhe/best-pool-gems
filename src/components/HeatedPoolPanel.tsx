import { Thermometer } from "lucide-react";
import { SectionIcon } from "@/components/SectionHeading";
import type { PoolQuote } from "@/server/hotel-detail.server";
import {
  HEATING_COPY,
  STATUS_COPY,
  type HeatingStatus,
  type HotelStatus,
  type StatusPool,
} from "@/lib/hotel-status";

type Props = {
  hotelName: string;
  /** Central heating result — derived from the individual pool records only. */
  heating: HeatingStatus;
  /** Central season sentence — one pool being seasonal never hides a year-round one. */
  seasonSentence: string;
  pools: StatusPool[];
  quotes: PoolQuote[];
  status: HotelStatus;
  lastVerifiedDate: string | null;
  officialUrl: string | null;
};

const HEAT_WORDS =
  /(heat|heated|warm|temperature|jacuzzi|hot tub|cold|chilly|freezing|unheated|\b\d{2}\s?°|degrees)/i;

const SOURCE_LABEL: Record<string, string> = {
  website: "Hotel website",
  google: "Google",
  reviews: "Guest reviews",
  tripadvisor: "TripAdvisor",
  youtube: "YouTube",
  reddit: "Reddit",
};

function formatDate(date?: string | null) {
  if (!date) return null;
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export function HeatedPoolPanel({
  hotelName,
  heating,
  seasonSentence,
  pools,
  quotes,
  status,
  lastVerifiedDate,
  officialUrl,
}: Props) {
  const heatedPools = pools.filter((p) => p.heating_state === "confirmed_heated");
  const swimmingPools = pools.filter(
    (p) => p.pool_category === "shared_hotel_pool" || p.pool_category === "shared_swim_up",
  );
  const heatQuotes = quotes.filter((q) => HEAT_WORDS.test(q.quote)).slice(0, 3);
  const when = formatDate(lastVerifiedDate);

  const heatedKind = (() => {
    const parts: string[] = [];
    if (heatedPools.some((p) => p.indoor === true)) parts.push("Indoor");
    if (heatedPools.some((p) => p.outdoor === true)) parts.push("Outdoor");
    return parts.length ? parts.join(" + ") : "Not confirmed";
  })();

  return (
    <section className="mx-auto max-w-6xl px-6 pb-4">
      <div className="rounded-lg border border-primary/40 bg-primary/[0.06] p-6 shadow-elegant md:p-8">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-start gap-4">
            <SectionIcon icon={Thermometer} />
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-primary">Heated pool check</p>
              <h2 className="mt-2 font-display text-3xl tracking-wide md:text-4xl">
                {HEATING_COPY[heating]}
              </h2>
            </div>
          </div>
          <span
            className={`rounded-sm border px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] ${
              heating === "heated_pool_available"
                ? "border-primary/60 text-primary"
                : "border-border/70 text-muted-foreground"
            }`}
          >
            {HEATING_COPY[heating]}
          </span>
        </div>

        <dl className="mt-6 grid gap-x-8 gap-y-5 sm:grid-cols-2 lg:grid-cols-4">
          <Item label="Season">{seasonSentence}</Item>
          <Item label="Indoor or outdoor">{heatedKind}</Item>
          <Item label="Heated pools">
            {heating === "heated_pool_available"
              ? `${heatedPools.length} of ${pools.length} documented pools`
              : "None confirmed"}
          </Item>
          <Item label="Swimming pools documented">{swimmingPools.length}</Item>
        </dl>

        {heatedPools.length > 0 && (
          <ul className="mt-6 flex flex-wrap gap-2">
            {heatedPools.map((p, i) => (
              <li
                key={p.id ?? i}
                className="rounded-full border border-primary/40 bg-background/40 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-foreground/85"
              >
                {p.pool_name || String(p.pool_category).replace(/_/g, " ")}
                {p.seasonal_dates ? ` · ${p.seasonal_dates}` : ""}
              </li>
            ))}
          </ul>
        )}

        <p className="mt-6 text-xs leading-relaxed text-muted-foreground">
          {when
            ? `Heating details last checked ${when}.`
            : "Heating details have not been re-checked recently."}{" "}
          {STATUS_COPY[status].sentence}{" "}
          {officialUrl && (
            <a
              href={officialUrl}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="text-primary underline underline-offset-4"
            >
              Check {hotelName}'s own site
            </a>
          )}
        </p>

        {heatQuotes.length > 0 && (
          <div className="mt-6 border-t border-border/40 pt-5">
            <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
              What our sources say about heating
            </p>
            <ul className="mt-3 grid gap-3 md:grid-cols-2">
              {heatQuotes.map((q, i) => (
                <li
                  key={`q${i}`}
                  className="rounded-md border border-border/50 bg-background/40 p-4 text-sm leading-relaxed text-foreground/90"
                >
                  &ldquo;{q.quote}&rdquo;
                  <span className="mt-2 block text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                    {q.source_url ? (
                      <a
                        href={q.source_url}
                        target="_blank"
                        rel="noopener noreferrer nofollow"
                        className="text-primary underline underline-offset-4"
                      >
                        {SOURCE_LABEL[q.source] ?? q.source}
                        {q.author ? ` · ${q.author}` : ""} ↗
                      </a>
                    ) : (
                      `${SOURCE_LABEL[q.source] ?? q.source}${q.author ? ` · ${q.author}` : ""}`
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}

function Item({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">{label}</dt>
      <dd className="mt-1.5 text-sm leading-snug text-foreground/90">{children}</dd>
    </div>
  );
}
