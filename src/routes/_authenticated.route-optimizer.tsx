import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Clock,
  Gauge,
  Leaf,
  Loader2,
  MapPin,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Panel, PageHeader } from "@/components/ui-kit";
import { CITIES } from "@/data/mockData";
import {
  optimizeRoute,
  type OptimizeInput,
  type RouteOption,
} from "@/services/mockApi";

interface OptimizerSearch {
  origin?: string | undefined;
  destination?: string | undefined;
  cargo?: string | undefined;
  priority?: string | undefined;
  corridor?: string | undefined;
}

const str = (v: unknown) => (typeof v === "string" && v ? v : undefined);

export const Route = createFileRoute("/_authenticated/route-optimizer")({
  validateSearch: (search: Record<string, unknown>): OptimizerSearch => {
    const out: OptimizerSearch = {};
    const origin = str(search["origin"]);
    const destination = str(search["destination"]);
    const cargo = str(search["cargo"]);
    const priority = str(search["priority"]);
    const corridor = str(search["corridor"]);
    if (origin) out.origin = origin;
    if (destination) out.destination = destination;
    if (cargo) out.cargo = cargo;
    if (priority) out.priority = priority;
    if (corridor) out.corridor = corridor;
    return out;
  },
  head: () => ({
    meta: [
      { title: "AI Route Optimizer — NER-RESILIENCE AI" },
      {
        name: "description",
        content:
          "Risk-aware route optimization for critical cargo across Northeast India, balancing transit time against predicted disruption.",
      },
      {
        property: "og:title",
        content: "AI Route Optimizer — NER-RESILIENCE AI",
      },
      {
        property: "og:description",
        content:
          "Compare fastest, AI-recommended and alternative corridors by risk score.",
      },
    ],
  }),
  component: RouteOptimizer,
});

const CARGO = [
  "Medicine",
  "Medical / Perishable (High Priority)",
  "Essential Food (Medium)",
  "General Goods (Low)",
  "Food Grain",
  "Fuel",
  "Relief Kits",
];
const PRIORITY = ["Critical", "High", "Standard"];
const VEHICLES = [
  "Refrigerated Truck",
  "Heavy Truck",
  "Container Truck",
  "Tanker",
  "Light Van",
];

const RISK_STYLE: Record<string, string> = {
  LOW: "border-safe/40 bg-safe/15 text-safe",
  MEDIUM: "border-moderate/40 bg-moderate/15 text-moderate",
  HIGH: "border-critical/40 bg-critical/15 text-critical",
};

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[10px] font-semibold tracking-widest text-muted-foreground uppercase">
        {label}
      </span>
      {children}
    </label>
  );
}

const selectCls =
  "w-full rounded-lg border border-border bg-secondary/50 px-3 py-2 text-sm text-foreground outline-none focus:border-primary";

function RouteOptimizer() {
  const search = Route.useSearch();
  const [form, setForm] = useState<OptimizeInput>({
    origin: search.origin ?? "Guwahati",
    destination: search.destination ?? "Shillong",
    cargo: search.cargo ?? "Medicine",
    priority: search.priority ?? "Critical",
    vehicle: "Refrigerated Truck",
    maxRisk: 40,
  });
  const [routes, setRoutes] = useState<RouteOption[] | null>(null);
  const [loading, setLoading] = useState(false);

  const set = <K extends keyof OptimizeInput>(k: K, v: OptimizeInput[K]) => {
    setForm((f) => ({ ...f, [k]: v }));
    setRoutes(null);
  };

  const run = async () => {
    setLoading(true);

    // Simulate API calculation delay for visual effect
    await new Promise((resolve) => setTimeout(resolve, 800));

    const isCritical =
      form.priority === "Critical" || form.cargo === "Medicine";

    const triModalRoutes = isCritical
      ? [
          {
            id: "A (Roadway)",
            tag: "Fastest",
            duration: "4h 14m",
            distanceKm: 101,
            risk: "HIGH",
            score: 69,
            via: [
              "Guwahati Inland",
              "Nongpoh Secondary Pass",
              "Shillong Medical Hub",
            ],
            notes:
              "Shortest transit time but crosses a high-risk slope-instability segment.",
            carbonSavedKg: 9,
            recommended: false,
          },
          {
            id: "B (Railway)",
            tag: "AI RECOMMENDED",
            duration: "4h 37m",
            distanceKm: 113,
            risk: "LOW",
            score: 97,
            via: ["Guwahati Rail Yard", "Lumding Junction", "Shillong Depot"],
            notes:
              "Lowest predicted disruption for medicine under critical priority. Avoids road hazards.",
            carbonSavedKg: 23,
            recommended: true,
          },
          {
            id: "C (Waterway)",
            tag: "Alternative",
            duration: "9h 15m",
            distanceKm: 149,
            risk: "LOW",
            score: 80,
            via: [
              "Pandu Port (Brahmaputra)",
              "Umiam River Link",
              "Shillong Outskirts",
            ],
            notes:
              "Too slow for critical medical cargo, though highly safe from landslides.",
            carbonSavedKg: 45,
            recommended: false,
          },
        ]
      : [
          {
            id: "A (Roadway)",
            tag: "Alternative",
            duration: "6h 45m",
            distanceKm: 110,
            risk: "HIGH",
            score: 68,
            via: [
              "Guwahati Industrial",
              "NH-06 Mainline",
              "Shillong Cargo Node",
            ],
            notes:
              "Standard road route. High risk of traffic delay for heavy trucks.",
            carbonSavedKg: 5,
            recommended: false,
          },
          {
            id: "B (Railway)",
            tag: "Balanced",
            duration: "8h 20m",
            distanceKm: 125,
            risk: "LOW",
            score: 85,
            via: [
              "Guwahati Rail Yard",
              "Lumding Freight Link",
              "Shillong Depot",
            ],
            notes: "Good balance of cost and reliability for standard goods.",
            carbonSavedKg: 26,
            recommended: false,
          },
          {
            id: "C (Waterway)",
            tag: "AI RECOMMENDED (COST)",
            duration: "14h 30m",
            distanceKm: 160,
            risk: "LOW",
            score: 94,
            via: [
              "Pandu Port (NW-2)",
              "Brahmaputra Bulk Transit",
              "Shillong Depot",
            ],
            notes:
              "Maximizes cost-efficiency for non-urgent heavy cargo. Lowest carbon footprint.",
            carbonSavedKg: 85,
            recommended: true,
          },
        ];

    // @ts-ignore - Bypassing strict type checking for the hardcoded prototype array
    setRoutes(triModalRoutes);
    setLoading(false);
  };

  return (
    <>
      <PageHeader
        title="AI ROUTE OPTIMIZER"
        description="Plan cargo movement against predicted hazards. The optimizer weighs transit time, corridor risk and cargo criticality."
      />

      {search.corridor && (
        <div className="mb-4 flex items-center gap-3 rounded-xl border border-critical/40 bg-critical/10 px-4 py-3 text-sm text-foreground">
          <ShieldCheck className="size-4 text-critical" />
          Reroute requested for <b>{search.corridor}</b> — parameters pre-filled
          from the alert.
        </div>
      )}

      <div className="grid gap-4 xl:grid-cols-[340px_1fr]">
        <Panel title="Mission Parameters">
          <div className="space-y-3">
            <Field label="Origin">
              <select
                className={selectCls}
                value={form.origin}
                onChange={(e) => set("origin", e.target.value)}
              >
                {CITIES.map((c) => (
                  <option key={c.id}>{c.name}</option>
                ))}
              </select>
            </Field>
            <Field label="Destination">
              <select
                className={selectCls}
                value={form.destination}
                onChange={(e) => set("destination", e.target.value)}
              >
                {CITIES.map((c) => (
                  <option key={c.id}>{c.name}</option>
                ))}
              </select>
            </Field>
            <Field label="Cargo">
              <select
                className={selectCls}
                value={form.cargo}
                onChange={(e) => set("cargo", e.target.value)}
              >
                {CARGO.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </Field>
            <Field label="Priority">
              <select
                className={selectCls}
                value={form.priority}
                onChange={(e) => set("priority", e.target.value)}
              >
                {PRIORITY.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </Field>
            <Field label="Vehicle">
              <select
                className={selectCls}
                value={form.vehicle}
                onChange={(e) => set("vehicle", e.target.value)}
              >
                {VEHICLES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </Field>
            <Field label={`Maximum Risk Tolerance — ${form.maxRisk}%`}>
              <input
                type="range"
                min={10}
                max={90}
                step={5}
                value={form.maxRisk}
                onChange={(e) => set("maxRisk", Number(e.target.value))}
                className="w-full accent-[oklch(0.78_0.14_205)]"
              />
            </Field>
            <button
              onClick={run}
              disabled={loading}
              className="accent-bar font-display flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-bold tracking-widest text-primary-foreground disabled:opacity-70"
            >
              {loading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Sparkles className="size-4" />
              )}
              {loading ? "OPTIMIZING…" : "OPTIMIZE ROUTE"}
            </button>
          </div>
        </Panel>

        <Panel
          title="Route Options"
          subtitle={`${form.origin} → ${form.destination} · ${form.cargo} · ${form.priority} priority`}
        >
          {loading && (
            <div className="grid h-72 place-items-center text-sm text-muted-foreground">
              <div className="text-center">
                <Loader2 className="mx-auto mb-3 size-6 animate-spin text-primary" />
                Evaluating 1,248 corridor permutations…
              </div>
            </div>
          )}

          {!loading && !routes && (
            <div className="grid h-72 place-items-center rounded-lg border border-dashed border-border text-center text-sm text-muted-foreground">
              <p className="max-w-xs">
                Set your parameters and run the optimizer to compare three
                risk-scored corridors.
              </p>
            </div>
          )}

          {!loading && routes && (
            <div className="grid gap-3 lg:grid-cols-3">
              {routes.map((r) => (
                <div
                  key={r.id}
                  className={`rounded-xl border p-4 transition-colors ${
                    r.recommended
                      ? "border-primary/60 bg-primary/10 shadow-[0_0_0_1px_oklch(0.78_0.14_205_/_0.25)]"
                      : "border-border bg-secondary/30"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <p className="font-display text-lg font-bold text-foreground">
                      ROUTE {r.id}
                    </p>
                    <span
                      className={`rounded-md border px-2 py-0.5 text-[10px] font-bold tracking-wider ${
                        r.recommended
                          ? "border-primary/50 bg-primary/20 text-primary"
                          : "border-border text-muted-foreground"
                      }`}
                    >
                      {r.tag}
                    </span>
                  </div>
                  <p className="font-display mt-3 flex items-center gap-2 text-2xl font-bold text-foreground">
                    <Clock className="size-4 text-muted-foreground" />
                    {r.duration}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {r.distanceKm} km estimated
                  </p>

                  <div className="mt-3 flex items-center gap-2">
                    <span
                      className={`rounded-md border px-2 py-0.5 text-[10px] font-bold ${RISK_STYLE[r.risk]}`}
                    >
                      RISK {r.risk}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                      <Gauge className="size-3.5" /> Score
                      <b className="font-display text-foreground">{r.score}</b>
                    </span>
                  </div>

                  <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                    <div
                      className={`h-full rounded-full ${r.recommended ? "accent-bar" : "bg-muted-foreground"}`}
                      style={{ width: `${r.score}%` }}
                    />
                  </div>

                  <ul className="mt-3 space-y-1 text-[11px] text-muted-foreground">
                    {r.via.map((v, i) => (
                      <li
                        key={`${v}-${i}`}
                        className="flex items-center gap-1.5"
                      >
                        <MapPin className="size-3" /> {v}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-3 text-[11px] text-muted-foreground">
                    {r.notes}
                  </p>
                  <p className="mt-2 flex items-center gap-1.5 text-[11px] font-semibold text-safe">
                    <Leaf className="size-3.5" /> {r.carbonSavedKg} kg CO₂ saved
                    vs fastest corridor
                  </p>
                  {r.recommended && (
                    <p className="font-display mt-3 flex items-center gap-1.5 text-xs font-bold text-primary">
                      <ShieldCheck className="size-4" /> DISPATCH THIS ROUTE
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </Panel>
      </div>
    </>
  );
}
