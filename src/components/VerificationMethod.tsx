export type Method =
  | "personally_visited"
  | "verified_with_hotel"
  | "multiple_sources"
  | "research_pending"
  | null
  | undefined;

const LABELS: Record<Exclude<Method, null | undefined>, { label: string; detail: string }> = {
  personally_visited: {
    label: "Personally visited",
    detail: "A BestPoolHotels editor has been to this pool in person.",
  },
  verified_with_hotel: {
    label: "Verified with hotel",
    detail: "Pool details confirmed directly with the property.",
  },
  multiple_sources: {
    label: "Verified from multiple sources",
    detail:
      "Pool details confirmed against the hotel's own website plus at least one independent source. No editor has visited in person.",
  },
  research_pending: {
    label: "Research pending",
    detail: "We are still confirming these pool details. Treat them as provisional.",
  },
};

export function VerificationMethodBadge({
  method,
  className = "",
}: {
  method: Method;
  className?: string;
}) {
  const config = LABELS[method ?? "research_pending"];
  return (
    <span
      title={config.detail}
      className={`inline-flex items-center rounded-sm border border-border/70 px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-foreground/80 ${className}`}
    >
      {config.label}
    </span>
  );
}

export function verificationMethodDetail(method: Method) {
  return LABELS[method ?? "research_pending"].detail;
}
