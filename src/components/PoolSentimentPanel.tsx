import type { PoolQuote } from "@/server/hotel-detail.server";

const NEGATIVE = [
  "cold", "chilly", "freezing", "not heated", "unheated", "too small", "tiny",
  "crowded", "busy", "noisy", "dirty", "unclean", "closed", "shut", "under renovation",
  "disappoint", "overpriced", "no loungers", "not enough", "shallow", "shaded", "cloudy",
  "waited", "queue", "poor", "bad", "worst", "avoid", "lukewarm", "green", "algae",
  "kall", "smutsig", "trång",
];

const POSITIVE = [
  "amazing", "stunning", "beautiful", "lovely", "perfect", "great", "excellent",
  "gorgeous", "heated", "warm", "relax", "peaceful", "quiet", "spotless", "clean",
  "view", "highlight", "best", "fantastic", "wonderful", "spacious", "worth",
  "enjoy", "love", "recommend",
];

type Sentiment = "positive" | "negative" | "neutral";

function classify(text: string): Sentiment {
  const t = text.toLowerCase();
  let score = 0;
  for (const w of NEGATIVE) if (t.includes(w)) score -= 1;
  for (const w of POSITIVE) if (t.includes(w)) score += 1;
  if (score > 0) return "positive";
  if (score < 0) return "negative";
  return "neutral";
}

function sourceLabel(s: string) {
  if (s === "tripadvisor") return "TripAdvisor";
  if (s === "google") return "Google";
  if (s === "reddit") return "Reddit";
  if (s === "youtube") return "YouTube";
  if (s === "web") return "Web";
  return s;
}

function QuoteItem({ q }: { q: PoolQuote }) {
  return (
    <li className="rounded-lg border border-border/60 bg-background/40 p-4">
      <p className="text-sm leading-relaxed text-foreground/90">&ldquo;{q.quote}&rdquo;</p>
      <p className="mt-3 flex items-center justify-between gap-3 text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
        <span>{q.author ? `— ${q.author}` : "— Verified guest"}</span>
        {q.source_url ? (
          <a
            href={q.source_url}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="shrink-0 text-primary hover:underline"
          >
            {sourceLabel(q.source)} ↗
          </a>
        ) : (
          <span className="shrink-0">{sourceLabel(q.source)}</span>
        )}
      </p>
    </li>
  );
}

export function PoolSentimentPanel({
  hotelName,
  quotes,
}: {
  hotelName: string;
  quotes: PoolQuote[];
}) {
  if (!quotes.length) return null;

  const positive: PoolQuote[] = [];
  const negative: PoolQuote[] = [];
  const neutral: PoolQuote[] = [];
  for (const q of quotes) {
    const s = classify(q.quote);
    if (s === "positive") positive.push(q);
    else if (s === "negative") negative.push(q);
    else neutral.push(q);
  }

  return (
    <section className="mx-auto max-w-6xl px-6 pb-12">
      <div className="rounded-lg border border-border/60 bg-surface/50 p-6 md:p-8">
        <p className="text-xs uppercase tracking-[0.3em] text-primary">
          Full transparency
        </p>
        <h2 className="mt-3 font-display text-3xl tracking-wide md:text-4xl">
          Every pool comment we found
        </h2>
        <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
          All {quotes.length} guest comments we collected about the pool at {hotelName} —
          praise and criticism alike, unedited and linked to their source.
        </p>

        <div className="mt-8 grid gap-8 md:grid-cols-2">
          <div>
            <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
              Positive · {positive.length}
            </p>
            {positive.length > 0 ? (
              <ul className="mt-4 space-y-3">
                {positive.map((q, i) => (
                  <QuoteItem key={`p-${i}`} q={q} />
                ))}
              </ul>
            ) : (
              <p className="mt-4 text-sm text-muted-foreground">
                No clearly positive pool comments found yet.
              </p>
            )}
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
              Critical · {negative.length}
            </p>
            {negative.length > 0 ? (
              <ul className="mt-4 space-y-3">
                {negative.map((q, i) => (
                  <QuoteItem key={`n-${i}`} q={q} />
                ))}
              </ul>
            ) : (
              <p className="mt-4 text-sm text-muted-foreground">
                No critical pool comments found yet. We publish them as soon as we find any.
              </p>
            )}
          </div>
        </div>

        {neutral.length > 0 && (
          <div className="mt-8">
            <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
              Mixed or factual · {neutral.length}
            </p>
            <ul className="mt-4 grid gap-3 md:grid-cols-2">
              {neutral.map((q, i) => (
                <QuoteItem key={`m-${i}`} q={q} />
              ))}
            </ul>
          </div>
        )}

        <p className="mt-6 text-[10px] uppercase tracking-[0.22em] text-muted-foreground/80">
          Comments are grouped automatically by tone and shown verbatim. We never remove
          negative feedback.
        </p>
      </div>
    </section>
  );
}
