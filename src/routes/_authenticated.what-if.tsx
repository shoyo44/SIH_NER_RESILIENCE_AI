import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Activity, ChevronDown, Loader2, Play, Radar, Route as RouteIcon, TrendingUp, Zap } from "lucide-react";
import NetworkMap from "@/components/NetworkMap";
import { Panel, PageHeader } from "@/components/ui-kit";
import { SCENARIOS } from "@/data/mockData";
import { runSimulation, type SimulationResult } from "@/services/mockApi";

export const Route = createFileRoute("/_authenticated/what-if")({
  head: () => ({
    meta: [
      { title: "What-If Simulation — NER-RESILIENCE AI" },
      {
        name: "description",
        content:
          "Simulate road blockages, floods, landslides, rainfall and bridge failures to see network-wide logistics impact.",
      },
      { property: "og:title", content: "What-If Simulation — NER-RESILIENCE AI" },
      {
        property: "og:description",
        content: "Model disruption scenarios and their cascading impact on critical deliveries.",
      },
    ],
  }),
  component: WhatIf,
});

const PIPELINE = [
  { label: "SENSE", sub: "IMD · ISRO feeds", icon: Radar },
  { label: "FORECAST", sub: "AI risk models", icon: TrendingUp },
  { label: "SIMULATE", sub: "Cascade engine", icon: Activity },
  { label: "OPTIMIZE", sub: "Route scoring", icon: RouteIcon },
  { label: "ACT", sub: "Dispatch & alerts", icon: Zap },
];

const TERRAIN_OPTIONS = ["Steep slopes", "Flood plains", "Unstable bridges", "Forest cuttings"];

function WhatIf() {
  const [scenarioId, setScenarioId] = useState(SCENARIOS[0]!.id);
  const [rainfall, setRainfall] = useState(80);
  const [terrain, setTerrain] = useState<string[]>(["Steep slopes"]);
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const scenario = SCENARIOS.find((s) => s.id === scenarioId)!;

  const run = async () => {
    setLoading(true);
    setResult(null);
    const r = await runSimulation(scenarioId);
    setResult(r);
    setLoading(false);
  };

  const metrics = result
    ? [
        { label: "Affected Routes", value: `${result.affectedRoutes}` },
        { label: "Affected Districts", value: `${result.affectedDistricts}` },
        { label: "Expected Delay", value: `${result.expectedDelay} hrs` },
        { label: "Critical Deliveries Affected", value: `${result.criticalDeliveries}` },
        { label: "Network Resilience", value: `${result.resilience}%` },
        { label: "Alternative Routes", value: `${result.alternatives}` },
      ]
    : [];

  return (
    <>
      <PageHeader
        title="WHAT-IF SIMULATION"
        description="Stress-test the network before reality does. Choose a disruption scenario and watch its cascade through the regional supply chain."
      />

      <Panel title="Resilience Pipeline" subtitle="How the engine processes every disruption">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
          {PIPELINE.map((step, i) => {
            const activeStage = loading ? 2 : result ? 4 : -1;
            const active = i <= activeStage;
            return (
              <div
                key={step.label}
                className={`rounded-lg border px-3 py-2.5 text-center transition-colors ${
                  active
                    ? "border-primary/50 bg-primary/12"
                    : "border-border bg-secondary/30"
                }`}
              >
                <step.icon
                  className={`mx-auto size-4 ${active ? "text-primary" : "text-muted-foreground"} ${loading && i === 2 ? "animate-pulse" : ""}`}
                />
                <p
                  className={`font-display mt-1.5 text-[11px] font-bold tracking-widest ${
                    active ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  {step.label}
                </p>
                <p className="text-[10px] text-muted-foreground">{step.sub}</p>
              </div>
            );
          })}
        </div>
      </Panel>

      <div className="grid gap-4 xl:grid-cols-[340px_1fr]">
        <div className="space-y-4">
          <Panel title="Scenario">
            <div className="space-y-2">
              {SCENARIOS.map((s) => (
                <button
                  key={s.id}
                  onClick={() => {
                    setScenarioId(s.id);
                    setResult(null);
                  }}
                  className={`w-full rounded-lg border px-3 py-2.5 text-left text-sm transition-colors ${
                    scenarioId === s.id
                      ? "border-primary/50 bg-primary/12 font-semibold text-primary"
                      : "border-border bg-secondary/30 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
            <div className="mt-4 rounded-lg border border-border bg-secondary/40 p-3">
              <p className="text-[10px] font-semibold tracking-widest text-muted-foreground uppercase">
                Trigger
              </p>
              <p className="mt-1 text-sm text-foreground">{scenario.target}</p>
            </div>

            <div className="mt-4">
              <p className="mb-1.5 text-[10px] font-semibold tracking-widest text-muted-foreground uppercase">
                Rainfall Intensity — {rainfall} mm/hr
              </p>
              <input
                type="range"
                min={0}
                max={250}
                step={5}
                value={rainfall}
                onChange={(e) => setRainfall(Number(e.target.value))}
                className="w-full accent-[oklch(0.78_0.14_205)]"
              />
            </div>

            <div className="mt-4">
              <p className="mb-1.5 text-[10px] font-semibold tracking-widest text-muted-foreground uppercase">
                Terrain Vulnerability
              </p>
              <div className="space-y-1.5">
                {TERRAIN_OPTIONS.map((t) => (
                  <label
                    key={t}
                    className="flex cursor-pointer items-center gap-2 rounded-md border border-border bg-secondary/30 px-2.5 py-1.5 text-xs text-foreground"
                  >
                    <input
                      type="checkbox"
                      checked={terrain.includes(t)}
                      onChange={(e) =>
                        setTerrain((prev) =>
                          e.target.checked ? [...prev, t] : prev.filter((x) => x !== t),
                        )
                      }
                      className="accent-[oklch(0.78_0.14_205)]"
                    />
                    {t}
                  </label>
                ))}
              </div>
            </div>
            <button
              onClick={run}
              disabled={loading}
              className="accent-bar font-display mt-4 flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-bold tracking-widest text-primary-foreground disabled:opacity-70"
            >
              {loading ? <Loader2 className="size-4 animate-spin" /> : <Play className="size-4" />}
              {loading ? "SIMULATING…" : "RUN SIMULATION"}
            </button>
          </Panel>

          {result && (
            <Panel title="Impact Cascade">
              <ol className="space-y-1">
                {result.chain.map((step, i) => (
                  <li key={step}>
                    <div
                      className={`rounded-lg border px-3 py-2 text-center text-xs font-bold tracking-wider ${
                        i === result.chain.length - 1
                          ? "border-critical/50 bg-critical/15 text-critical"
                          : "border-border bg-secondary/40 text-foreground"
                      }`}
                    >
                      {step}
                    </div>
                    {i < result.chain.length - 1 && (
                      <div className="flex justify-center py-0.5 text-primary">
                        <ChevronDown className="size-4" />
                      </div>
                    )}
                  </li>
                ))}
              </ol>
            </Panel>
          )}
        </div>

        <div className="space-y-4">
          <Panel
            title="Simulation Results"
            subtitle={result ? result.headline : "Run a scenario to project network-wide impact."}
          >
            {loading ? (
              <div className="grid h-48 place-items-center">
                <div className="text-center">
                  <Loader2 className="mx-auto mb-3 size-7 animate-spin text-primary" />
                  <p className="font-display text-sm tracking-widest text-primary">
                    PROPAGATING DISRUPTION ACROSS NETWORK…
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Recomputing 1,248 routes · 8 states
                  </p>
                </div>
              </div>
            ) : result ? (
              <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
                {metrics.map((m) => (
                  <div key={m.label} className="rounded-xl border border-border bg-secondary/30 p-4">
                    <p className="text-[10px] tracking-wider text-muted-foreground uppercase">
                      {m.label}
                    </p>
                    <p className="font-display mt-2 text-2xl font-bold text-foreground">{m.value}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid h-48 place-items-center rounded-lg border border-dashed border-border text-sm text-muted-foreground">
                No simulation executed yet.
              </div>
            )}
          </Panel>

          <Panel
            title="Impacted Network View"
            subtitle="The disrupted corridor is highlighted in red on the twin map."
          >
            <NetworkMap
              blockedId={result?.impactedRoadId ?? null}
              className="h-[420px]"
            />
          </Panel>
        </div>
      </div>
    </>
  );
}
