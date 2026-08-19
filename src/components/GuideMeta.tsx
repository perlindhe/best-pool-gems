type Source = { label: string; url?: string };

export type GuideMetaProps = {
  author?: string;
  authorRole?: string;
  authorBio?: string;
  publishedDate?: string; // ISO yyyy-mm-dd
  lastUpdated: string; // ISO yyyy-mm-dd
  sources?: Source[];
  verificationNote?: string;
  hotelsChecked?: number;
  hotelsIncluded?: number;
};

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("en-GB", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}

/**
 * Trust block for guide pages: author, publish + last-updated date,
 * sources and verification note. Rendered near the top of every guide.
 */
export function GuideMeta({
  author = "BestPoolHotels Editorial",
  authorRole = "Independent travel editors",
  authorBio = "BestPoolHotels is an independent editorial team. We verify every pool fact against the hotel's own website plus at least one independent source before publishing, and label separately the hotels an editor has visited in person.",
  publishedDate,
  lastUpdated,
  sources = [],
  verificationNote,
  hotelsChecked,
  hotelsIncluded,
}: GuideMetaProps) {
  return (
    <aside
      className="my-10 rounded-xl border border-border/60 bg-surface/50 p-6 text-sm"
      aria-label="Editorial information"
    >
      <div className="grid gap-5 md:grid-cols-[1fr_auto]">
        <div>
          <p className="text-[10px] uppercase tracking-[0.3em] text-primary">
            By{" "}
            <a href="/editors" className="underline-offset-2 hover:underline">
              {author}
            </a>
          </p>
          <p className="mt-1 text-xs text-muted-foreground">{authorRole}</p>
          <p className="mt-3 max-w-2xl leading-relaxed text-foreground/85">{authorBio}</p>
        </div>
        <div className="text-xs text-muted-foreground md:text-right">
          {publishedDate && (
            <p>
              <span className="uppercase tracking-[0.18em]">Published</span>
              <br />
              <span className="text-foreground">{formatDate(publishedDate)}</span>
            </p>
          )}
          <p className={publishedDate ? "mt-3" : ""}>
            <span className="uppercase tracking-[0.18em]">Last updated</span>
            <br />
            <span className="text-foreground">{formatDate(lastUpdated)}</span>
          </p>
        </div>
      </div>

      {(hotelsChecked != null || hotelsIncluded != null) && (
        <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 border-t border-border/40 pt-4 text-xs">
          {hotelsChecked != null && (
            <p>
              <span className="uppercase tracking-[0.18em] text-muted-foreground">Hotels checked</span>{" "}
              <span className="text-foreground font-medium">{hotelsChecked}</span>
            </p>
          )}
          {hotelsIncluded != null && (
            <p>
              <span className="uppercase tracking-[0.18em] text-muted-foreground">Included in guide</span>{" "}
              <span className="text-foreground font-medium">{hotelsIncluded}</span>
            </p>
          )}
        </div>
      )}

      {verificationNote && (
        <p className="mt-5 border-t border-border/40 pt-4 text-xs leading-relaxed text-muted-foreground">
          <strong className="text-foreground">Verification:</strong> {verificationNote}
        </p>
      )}

      <p className="mt-4 border-t border-border/40 pt-4 text-xs leading-relaxed text-muted-foreground">
        <strong className="text-foreground">No paid placements.</strong> Hotels cannot pay to be
        included or ranked higher. Rankings are decided by the editorial team before any booking
        links are added.
      </p>

      <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
        <strong className="text-foreground">Affiliate disclosure.</strong> Some booking links earn us
        a small commission at no extra cost to you. See our{" "}
        <a href="/disclosure" className="text-primary underline-offset-2 hover:underline">
          disclosure
        </a>
        .
      </p>


      {sources.length > 0 && (
        <div className="mt-4 border-t border-border/40 pt-4">
          <p className="text-[10px] uppercase tracking-[0.3em] text-primary">Sources</p>
          <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs">
            {sources.map((s, i) => (
              <li key={i}>
                {s.url ? (
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary underline-offset-2 hover:underline"
                  >
                    {s.label} ↗
                  </a>
                ) : (
                  <span className="text-muted-foreground">{s.label}</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </aside>
  );
}
