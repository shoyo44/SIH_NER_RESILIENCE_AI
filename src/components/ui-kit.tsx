import type { ReactNode } from "react";
import type { RiskLevel } from "@/data/mockData";

export function Panel({
  title,
  subtitle,
  action,
  children,
  className = "",
}: {
  title?: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`panel p-4 sm:p-5 ${className}`}>
      {(title || action) && (
        <header className="mb-4 flex items-start justify-between gap-3">
          <div>
            {title && (
              <h2 className="font-display text-sm font-semibold tracking-widest text-foreground uppercase">
                {title}
              </h2>
            )}
            {subtitle && <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>}
          </div>
          {action}
        </header>
      )}
      {children}
    </section>
  );
}

export function SimBadge({ label = "SIMULATED DATA" }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/10 px-2.5 py-1 text-[10px] font-semibold tracking-[0.18em] text-primary uppercase">
      <span className="size-1.5 animate-pulse rounded-full bg-primary" />
      {label}
    </span>
  );
}

const LEVEL_STYLES: Record<RiskLevel, string> = {
  safe: "border-safe/40 bg-safe/15 text-safe",
  moderate: "border-moderate/40 bg-moderate/15 text-moderate",
  high: "border-highrisk/40 bg-highrisk/15 text-highrisk",
  critical: "border-critical/40 bg-critical/15 text-critical",
};

export const LEVEL_LABEL: Record<RiskLevel, string> = {
  safe: "SAFE",
  moderate: "MODERATE",
  high: "HIGH RISK",
  critical: "CRITICAL",
};

export function RiskPill({ level, text }: { level: RiskLevel; text?: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-bold tracking-wider ${LEVEL_STYLES[level]}`}
    >
      {text ?? LEVEL_LABEL[level]}
    </span>
  );
}

export function Meter({ label, value, level }: { label: string; value: number; level: RiskLevel }) {
  const bar =
    level === "critical"
      ? "bg-critical"
      : level === "high"
        ? "bg-highrisk"
        : level === "moderate"
          ? "bg-moderate"
          : "bg-safe";
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-display font-semibold text-foreground">{value}%</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
        <div className={`h-full rounded-full ${bar}`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

export function levelOf(value: number): RiskLevel {
  return value >= 75 ? "critical" : value >= 55 ? "high" : value >= 35 ? "moderate" : "safe";
}

export function PageHeader({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children?: ReactNode;
}) {
  return (
    <div className="hero-surface panel mb-5 flex flex-wrap items-center justify-between gap-4 p-5">
      <div>
        <h1 className="font-display text-xl font-bold tracking-wide text-foreground sm:text-2xl">
          {title}
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{description}</p>
      </div>
      <div className="flex items-center gap-3">
        {children}
        <SimBadge />
      </div>
    </div>
  );
}
