import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AlertTriangle, Check, Search, Shuffle } from "lucide-react";
import { Panel, PageHeader } from "@/components/ui-kit";
import { type Alert } from "@/data/mockData";
import { roadForAlert, setAlertStatus, useAlerts } from "@/state/alertsStore";
import { cityById } from "@/data/mockData";


export const Route = createFileRoute("/_authenticated/alerts")({
  head: () => ({
    meta: [
      { title: "Alerts — NER-RESILIENCE AI" },
      {
        name: "description",
        content:
          "Simulated predictive alerts for landslides, floods, blockages and cold-chain risk across the Northeast logistics network.",
      },
      { property: "og:title", content: "Alerts — NER-RESILIENCE AI" },
      {
        property: "og:description",
        content: "Acknowledge, investigate or reroute against predicted disruptions.",
      },
    ],
  }),
  component: AlertsPage,
});

const SEVERITY: Record<Alert["severity"], string> = {
  CRITICAL: "border-critical/50 bg-critical/15 text-critical",
  HIGH: "border-highrisk/50 bg-highrisk/15 text-highrisk",
  MODERATE: "border-moderate/50 bg-moderate/15 text-moderate",
};

const STATUS: Record<Alert["status"], string> = {
  ACTIVE: "border-border bg-secondary text-muted-foreground",
  ACKNOWLEDGED: "border-safe/40 bg-safe/15 text-safe",
  INVESTIGATING: "border-primary/40 bg-primary/15 text-primary",
  REROUTED: "border-accent/50 bg-accent/20 text-foreground",
};

function AlertsPage() {
  const alerts = useAlerts();
  const navigate = useNavigate();

  const update = (id: string, status: Alert["status"]) => setAlertStatus(id, status);

  const reroute = (alert: Alert) => {
    setAlertStatus(alert.id, "REROUTED");
    const road = roadForAlert(alert.id);
    void navigate({
      to: "/route-optimizer",
      search: road
        ? {
            origin: cityById(road.from).name,
            destination: cityById(road.to).name,
            cargo: "Medicine",
            priority: "Critical",
            corridor: road.name,
          }
        : {},
    });
  };


  return (
    <>
      <PageHeader
        title="ALERT OPERATIONS"
        description="Predictive alerts raised by the resilience engine. Acknowledge, investigate or trigger a reroute directly from the queue."
      />

      <Panel title={`Active Queue (${alerts.filter((a) => a.status === "ACTIVE").length})`}>
        <div className="space-y-3">
          {alerts.map((a) => (
            <article
              key={a.id}
              className="rounded-xl border border-border bg-secondary/30 p-4 sm:p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <span className={`mt-0.5 rounded-lg border p-2 ${SEVERITY[a.severity]}`}>
                    <AlertTriangle className="size-4" />
                  </span>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-md border px-2 py-0.5 text-[10px] font-bold tracking-wider ${SEVERITY[a.severity]}`}
                      >
                        {a.severity}
                      </span>
                      <span
                        className={`rounded-md border px-2 py-0.5 text-[10px] font-bold tracking-wider ${STATUS[a.status]}`}
                      >
                        {a.status}
                      </span>
                      <span className="text-[11px] text-muted-foreground">{a.time}</span>
                    </div>
                    <h3 className="font-display mt-1.5 text-base font-bold text-foreground">
                      {a.title}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {a.location} · Probability {a.probability}%
                    </p>
                    <p className="mt-2 max-w-2xl text-xs text-muted-foreground">{a.detail}</p>
                  </div>
                </div>
                <p className="font-display text-2xl font-bold text-foreground">{a.probability}%</p>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  onClick={() => update(a.id, "ACKNOWLEDGED")}
                  disabled={a.status === "ACKNOWLEDGED"}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-safe/40 bg-safe/10 px-3 py-2 text-[11px] font-bold tracking-wider text-safe disabled:opacity-50"
                >
                  <Check className="size-3.5" /> ACKNOWLEDGE
                </button>
                <button
                  onClick={() => update(a.id, "INVESTIGATING")}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-primary/40 bg-primary/10 px-3 py-2 text-[11px] font-bold tracking-wider text-primary"
                >
                  <Search className="size-3.5" /> INVESTIGATE
                </button>
                <button
                  onClick={() => reroute(a)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-secondary px-3 py-2 text-[11px] font-bold tracking-wider text-foreground"
                >
                  <Shuffle className="size-3.5" /> REROUTE
                </button>
              </div>
            </article>
          ))}
        </div>
      </Panel>
    </>
  );
}
