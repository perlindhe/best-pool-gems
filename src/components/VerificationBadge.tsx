type State = "verified" | "partially_verified" | "research_pending" | null | undefined;

function formatDate(date?: string | null) {
  if (!date) return null;
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export function VerificationBadge({
  status,
  date,
  className = "",
}: {
  status: State;
  date?: string | null;
  className?: string;
}) {
  const when = formatDate(date);
  const config =
    status === "verified"
      ? {
          label: when ? `Pool details verified ${when}` : "Pool details verified",
          icon: "✓",
          tone: "border-primary/60 text-primary",
        }
      : status === "partially_verified"
        ? {
            label: when ? `Partially verified ${when}` : "Partially verified",
            icon: "◐",
            tone: "border-border/70 text-foreground/80",
          }
        : {
            label: "Research pending",
            icon: "○",
            tone: "border-border/60 text-muted-foreground",
          };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-sm border px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] ${config.tone} ${className}`}
    >
      <span aria-hidden>{config.icon}</span>
      {config.label}
    </span>
  );
}
