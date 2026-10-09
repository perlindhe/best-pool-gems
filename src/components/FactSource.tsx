import type { FactCitation } from "@/lib/fact-citation";

export function FactSource({ citation }: { citation: FactCitation | null }) {
  return <p className="mt-1 text-xs text-muted-foreground">
    {citation ? <><span>{citation.verified ? "Verified via " : "Source: "}</span>
      <a href={citation.url} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-primary">{citation.label}</a>
      {citation.date ? `, ${citation.date}` : " · Verification date unavailable"}
    </> : "Source verification unavailable"}
  </p>;
}