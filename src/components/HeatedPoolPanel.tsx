import { Thermometer } from "lucide-react";
import { SectionIcon } from "@/components/SectionHeading";
import type { PoolFacts, PoolCitation } from "@/lib/rankings.functions";
import type { PoolQuote } from "@/server/hotel-detail.server";

type Method =
  | "personally_visited"
  | "verified_with_hotel"
  | "multiple_sources"
  | "research_pending"
  | null;

type Props = {
  hotelName: string;
  heated: boolean | null;
  indoor: boolean | null;
  outdoor: boolean | null;
  yearRound: boolean | null;
  poolCount: number | null;
  facts: PoolFacts | null | undefined;
  quotes: PoolQuote[];
  verificationStatus: "verified" | "partially_verified" | "research_pending" | null;
  verificationMethod: Method;
  lastVerifiedDate: string | null;
  officialUrl: string | null;
};

const HEAT_WORDS = /(heat|heated|warm|temperature|jacuzzi|hot tub|cold|chilly|freezing|unheated|\b\d{2}\s?°|degrees)/i;

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

function heatingCitations(facts: PoolFacts | null | undefined): PoolCitation[] {
  const s = facts?.sources;
  if (!s) return [];
  return [
    ...(s.is_heated ?? []),
    ...(s.year_round ?? []),
    ...(s.season ?? []),
  ].slice(0, 4);
}

export function HeatedPoolPanel({
  hotelName,
  heated,
  indoor,
  outdoor,
  yearRound,
  poolCount,
  facts,
  quotes,
  verificationStatus,
  verificationMethod,
  lastVerifiedDate,
  officialUrl,
}: Props) {
  const isHeated = heated ?? facts?.is_heated ?? null;
  const pools = (facts?.pools ?? []).filter((p) => p && p.type);
  const heatedPools = pools.filter((p) => p.heated === true);
  const totalPools = poolCount ?? facts?.pool_count ?? (pools.length || null);
  const season = facts?.season ?? heatedPools.find((p) => p.season)?.season ?? null;
  const isYearRound = yearRound ?? facts?.year_round ?? null;

  // Which kind of pool is heated
  let heatedKind: string | null = null;
  if (heatedPools.length) {
    const kinds = new Set(
      heatedPools.map((p) =>
        p.indoor === true ? "indoor" : p.indoor === false ? "outdoor" : "unspecified",
      ),
    );
    const parts: string[] = [];
    if (kinds.has("indoor")) parts.push("Indoor");
    if (kinds.has("outdoor")) parts.push("Outdoor");
    heatedKind = parts.length ? parts.join(" + ") : null;
  }
  if (!heatedKind && isHeated) {
    const hasIndoor = indoor ?? facts?.has_indoor ?? null;
    const hasOutdoor = outdoor ?? facts?.has_outdoor ?? null;
    if (hasIndoor && hasOutdoor) heatedKind = "Indoor + outdoor";
    else if (hasIndoor) heatedKind = "Indoor";
    else if (hasOutdoor) heatedKind = "Outdoor";
  }

  const citations = heatingCitations(facts);
  const heatQuotes = quotes.filter((q) => HEAT_WORDS.test(q.quote)).slice(0, 3);
  const when = formatDate(lastVerifiedDate);
  const websiteCited = citations.some((c) => c.source === "website");

  const headline =
    isHeated === true
      ? "Yes — the pool is heated"
      : isHeated === false
        ? "No — the pool is not heated"
        : "Heating not confirmed yet";

  const confidence =
    verificationStatus === "verified" && websiteCited
      ? "High — confirmed on the hotel's own site"
      : verificationStatus === "verified"
        ? "High — confirmed across multiple sources"
        : verificationStatus === "partially_verified"
          ? "Medium — some heating details still unconfirmed"
          : "Low — research pending, treat as provisional";

  return (
    <section className="mx-auto max-w-6xl px-6 pb-4">
      <div className="rounded-lg border border-primary/40 bg-primary/[0.06] p-6 shadow-elegant md:p-8">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-start gap-4">
            <SectionIcon icon={Thermometer} />
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-primary">Heated pool check</p>
              <h2 className="mt-2 font-display text-3xl tracking-wide md:text-4xl">{headline}</h2>
            </div>
          </div>
          <span
            className={`rounded-sm border px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] ${
              isHeated === true
                ? "border-primary/60 text-primary"
                : "border-border/70 text-muted-foreground"
            }`}
          >
            {isHeated === true ? "Heated" : isHeated === false ? "Unheated" : "Unknown"}
          </span>
        </div>

        <dl className="mt-6 grid gap-x-8 gap-y-5 sm:grid-cols-2 lg:grid-cols-4">
          <Item label="Heated months">
            {isYearRound
              ? "Year-round, all 12 months"
              : season
                ? season
                : isHeated === true
                  ? "Season not confirmed"
                  : "—"}
          </Item>
          <Item label="Indoor or outdoor">{heatedKind ?? "Not confirmed"}</Item>
          <Item label="Heated pools">
            {totalPools
              ? `${heatedPools.length || (isHeated === true ? 1 : 0)} of ${totalPools}`
              : isHeated === true
                ? "At least one"
                : "—"}
          </Item>
          <Item label="Confidence">{confidence}</Item>
        </dl>

        {heatedPools.length > 0 && (
          <ul className="mt-6 flex flex-wrap gap-2">
            {heatedPools.map((p, i) => (
              <li
                key={i}
                className="rounded-full border border-primary/40 bg-background/40 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-foreground/85"
              >
                {p.name || p.type.replace("_", " ")}
                {p.season ? ` · ${p.season}` : ""}
                {p.length_m ? ` · ${p.length_m} m` : ""}
              </li>
            ))}
          </ul>
        )}

        <p className="mt-6 text-xs leading-relaxed text-muted-foreground">
          {when
            ? `Heating details last checked ${when}.`
            : "Heating details have not been re-checked recently."}{" "}
          {verificationMethod === "verified_with_hotel"
            ? "Confirmed directly with the property."
            : websiteCited
              ? `Confirmed against ${hotelName}'s own website.`
              : "Not yet confirmed on the hotel's own website."}{" "}
          {officialUrl && (
            <a
              href={officialUrl}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="text-primary underline underline-offset-4"
            >
              Check the hotel site
            </a>
          )}
        </p>

        {(heatQuotes.length > 0 || citations.length > 0) && (
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
              {heatQuotes.length === 0 &&
                citations.map((c, i) => (
                  <li
                    key={`c${i}`}
                    className="rounded-md border border-border/50 bg-background/40 p-4 text-sm leading-relaxed text-foreground/90"
                  >
                    &ldquo;{c.quote}&rdquo;
                    <span className="mt-2 block text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                      {c.source === "website" && officialUrl ? (
                        <a
                          href={officialUrl}
                          target="_blank"
                          rel="noopener noreferrer nofollow"
                          className="text-primary underline underline-offset-4"
                        >
                          Hotel website ↗
                        </a>
                      ) : (
                        SOURCE_LABEL[c.source] ?? c.source
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
