export type FactCitation = { url: string; label: string; date: string | null; verified: boolean };

function object(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown> : null;
}

function safeUrl(value: unknown): string | null {
  if (typeof value !== "string") return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:" ? url.href : null;
  } catch { return null; }
}

export function factCitation(input: {
  field: string;
  evidence: unknown;
  sourceUrls?: unknown;
  date?: string | null;
  officialUrls: (string | null | undefined)[];
}): FactCitation | null {
  const official = input.officialUrls.map(safeUrl).filter((u): u is string => Boolean(u));
  const sameHotel = (url: string) => official.some((base) => {
    const a = new URL(base), b = new URL(url);
    return a.hostname.replace(/^www\./, "") === b.hostname.replace(/^www\./, "") &&
      (a.pathname === "/" || b.pathname === a.pathname || b.pathname.startsWith(a.pathname.replace(/\/$/, "") + "/"));
  });
  const root = object(input.evidence);
  const direct = root ? object(root[input.field]) : null;
  const entries = direct ? [direct] : Array.isArray(input.evidence) ? input.evidence.map(object).filter((e): e is Record<string, unknown> => Boolean(e)) : [];
  for (const entry of entries) {
    const quote = typeof entry.quote === "string" ? entry.quote : "";
    const mentions = input.field === "heating" ? /heat|temperature|\b\d+\s*(°|degrees)/i.test(quote)
      : input.field === "opening_hours" ? /opening hours|open daily|\b\d{1,2}[:.]\d{2}\b/i.test(quote) : false;
    if (!direct && entry.field !== input.field && !mentions) continue;
    if (entry.verified === false || entry.status === "not_verified" || entry.status === "research_pending") continue;
    let url = safeUrl(entry.source_url ?? entry.url ?? entry.source);
    if (!url && entry.source === "website" && Array.isArray(input.sourceUrls)) {
      url = input.sourceUrls.map(safeUrl).find((u): u is string => Boolean(u && sameHotel(u))) ?? null;
    }
    if (!url && entry.source === "website" && mentions) url = official[0] ?? null;
    if (!url) continue;
    const rawDate = entry.verified_at ?? entry.last_verified ?? input.date;
    const date = typeof rawDate === "string" && /^\d{4}-\d{2}-\d{2}/.test(rawDate) && Number.isFinite(Date.parse(rawDate))
      ? new Date(rawDate).toLocaleDateString("en-GB", { month: "long", year: "numeric", timeZone: "UTC" }) : null;
    return { url, label: sameHotel(url) ? "hotel website" : new URL(url).hostname.replace(/^www\./, ""), date,
      verified: Boolean(mentions || entry.verified === true || entry.status === "verified") };
  }
  return null;
}