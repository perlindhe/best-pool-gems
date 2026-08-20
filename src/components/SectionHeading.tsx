import type { LucideIcon } from "lucide-react";

export function SectionIcon({ icon: Icon }: { icon: LucideIcon }) {
  return (
    <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-primary/40 bg-primary/10 text-primary shadow-elegant">
      <Icon className="h-5 w-5" strokeWidth={1.5} aria-hidden="true" />
    </span>
  );
}

export function SectionHeading({
  icon,
  eyebrow,
  title,
  description,
  className = "",
}: {
  icon: LucideIcon;
  eyebrow: string;
  title: string;
  description?: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <div className="flex items-start gap-4">
        <SectionIcon icon={icon} />
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-primary">{eyebrow}</p>
          <h2 className="mt-2 font-display text-3xl tracking-wide md:text-4xl">{title}</h2>
        </div>
      </div>
      {description && (
        <p className="mt-4 max-w-2xl text-sm text-muted-foreground">{description}</p>
      )}
      <div className="mt-6 h-px w-full bg-gradient-to-r from-primary/50 via-border/60 to-transparent" />
    </div>
  );
}
