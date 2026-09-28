import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Truck } from "lucide-react";
import { Panel, PageHeader, RiskPill } from "@/components/ui-kit";
import { SHIPMENTS } from "@/data/mockData";

export const Route = createFileRoute("/_authenticated/logistics")({
  head: () => ({
    meta: [
      { title: "Logistics Monitoring — NER-RESILIENCE AI" },
      {
        name: "description",
        content:
          "Track simulated vehicles and shipments across Northeast India with risk, ETA and delivery status filters.",
      },
      { property: "og:title", content: "Logistics Monitoring — NER-RESILIENCE AI" },
      {
        property: "og:description",
        content: "Fleet and shipment monitoring for critical regional cargo.",
      },
    ],
  }),
  component: Logistics,
});

const FILTERS = ["All", "Critical", "Delayed", "At Risk"] as const;

const STATUS_STYLE: Record<string, string> = {
  "ON ROUTE": "border-safe/40 bg-safe/15 text-safe",
  DELAYED: "border-highrisk/40 bg-highrisk/15 text-highrisk",
  "AT RISK": "border-critical/40 bg-critical/15 text-critical",
  HELD: "border-border bg-secondary text-muted-foreground",
};

function Logistics() {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");

  const list = SHIPMENTS.filter((s) =>
    filter === "All"
      ? true
      : filter === "Critical"
        ? s.critical
        : filter === "Delayed"
          ? s.status === "DELAYED"
          : s.status === "AT RISK",
  );

  return (
    <>
      <PageHeader
        title="LOGISTICS MONITORING"
        description="Live view of simulated fleet movement across the region, scored against corridor risk in real time."
      />

      <div className="mb-4 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-lg border px-4 py-2 text-xs font-semibold tracking-wider uppercase transition-colors ${
              filter === f
                ? "border-primary/50 bg-primary/15 text-primary"
                : "border-border bg-card text-muted-foreground hover:text-foreground"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <Panel title={`Shipments (${list.length})`}>
        <div className="grid gap-3 lg:grid-cols-2">
          {list.map((s) => (
            <article key={s.id} className="rounded-xl border border-border bg-secondary/30 p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <span className="grid size-9 place-items-center rounded-lg bg-primary/15">
                    <Truck className="size-4 text-primary" />
                  </span>
                  <div>
                    <p className="font-display text-sm font-bold text-foreground">{s.id}</p>
                    <p className="text-xs text-muted-foreground">
                      {s.cargo} · {s.vehicle}
                    </p>
                  </div>
                </div>
                <span
                  className={`rounded-md border px-2 py-0.5 text-[10px] font-bold tracking-wider ${STATUS_STYLE[s.status]}`}
                >
                  {s.status}
                </span>
              </div>

              <p className="mt-3 text-sm text-foreground">
                {s.from} <span className="text-primary">→</span> {s.to}
              </p>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                <div className="accent-bar h-full rounded-full" style={{ width: `${s.progress}%` }} />
              </div>

              <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  ETA <b className="font-display text-foreground">{s.eta}</b>
                </span>
                <span className="flex items-center gap-2">
                  {s.critical && (
                    <span className="rounded border border-primary/40 bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold text-primary">
                      CRITICAL
                    </span>
                  )}
                  <RiskPill level={s.risk} />
                </span>
              </div>
            </article>
          ))}
        </div>
      </Panel>
    </>
  );
}
