import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Activity,
  AlertTriangle,
  Brain,
  Package,
  Route as RouteIcon,
  Zap,
  X,
  ArrowRight,
  Search as SearchIcon,
} from "lucide-react";
import NetworkMap from "@/components/NetworkMap";
import { Meter, Panel, PageHeader, RiskPill, LEVEL_LABEL } from "@/components/ui-kit";
import { CITIES, KPIS, ROADS, type RoadSegment } from "@/data/mockData";


export const Route = createFileRoute("/_authenticated/")({
  validateSearch: (search: Record<string, unknown>): { q?: string | undefined } =>
    typeof search["q"] === "string" && search["q"] ? { q: search["q"] as string } : {},



  head: () => ({
    meta: [
      { title: "Command Center — NER-RESILIENCE AI" },
      {
        name: "description",
        content:
          "Live regional command center for Northeast India logistics: network health, risk corridors and predicted disruptions.",
      },
      { property: "og:title", content: "Command Center — NER-RESILIENCE AI" },
      {
        property: "og:description",
        content: "Predictive logistics resilience command center for the Northeast region.",
      },
    ],
  }),
  component: CommandCenter,
});

const ICONS: Record<string, typeof Activity> = {
  activity: Activity,
  route: RouteIcon,
  triangle: AlertTriangle,
  zap: Zap,
  package: Package,
  brain: Brain,
};

const TONE: Record<string, string> = {
  good: "text-safe",
  info: "text-primary",
  warn: "text-moderate",
  bad: "text-critical",
};

function CommandCenter() {
  const { q } = Route.useSearch();
  const query = (q ?? "").trim().toLowerCase();

  const matches = useMemo(() => {
    if (!query) return [] as RoadSegment[];
    const cityHits = CITIES.filter((c) => c.name.toLowerCase().includes(query)).map((c) => c.id);
    return ROADS.filter(
      (r) =>
        r.name.toLowerCase().includes(query) ||
        r.highway.toLowerCase().includes(query) ||
        cityHits.includes(r.from) ||
        cityHits.includes(r.to),
    );
  }, [query]);

  const [selected, setSelected] = useState<RoadSegment | null>(
    ROADS.find((r) => r.id === "shl-chr") ?? null,
  );

  const active = query ? (matches[0] ?? selected) : selected;

  return (
    <>
      <PageHeader
        title="COMMAND CENTER"
        description="Region-wide situational picture for Northeast India — network health, corridor risk and predicted disruptions in one operational view."
      />

      {query && (
        <div className="mb-4 flex flex-wrap items-center gap-3 rounded-xl border border-primary/40 bg-primary/10 px-4 py-3">
          <SearchIcon className="size-4 text-primary" />
          <p className="text-sm text-foreground">
            <b>{matches.length}</b> corridor{matches.length === 1 ? "" : "s"} matching “{q}”
            {matches.length > 0 && (
              <span className="ml-2 text-xs text-muted-foreground">
                {matches.map((m) => m.highway).join(" · ")}
              </span>
            )}
          </p>
          <Link
            to="/"
            search={{}}
            className="ml-auto inline-flex items-center gap-1 rounded-md border border-border px-2.5 py-1 text-[11px] tracking-wider text-muted-foreground uppercase hover:text-foreground"
          >
            <X className="size-3" /> Clear
          </Link>
        </div>
      )}



      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
        {KPIS.map((k) => {
          const Icon = ICONS[k.icon] ?? Activity;
          return (
            <div key={k.label} className="panel p-4">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
                  {k.label}
                </p>
                <Icon className={`size-4 ${TONE[k.tone]}`} />
              </div>
              <p className={`font-display mt-2 text-2xl font-bold ${TONE[k.tone]}`}>{k.value}</p>
              <p className="mt-1 text-[11px] text-muted-foreground">{k.delta}</p>
            </div>
          );
        })}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
        <Panel
          title="Northeast India Network Map"
          subtitle="Click any corridor for a risk breakdown. Colours: green safe · yellow moderate · orange high · red critical."
        >
          <NetworkMap
            selectedId={active?.id ?? null}
            highlightIds={matches.map((m) => m.id)}
            onSelect={setSelected}
            className="h-[520px]"
          />

          <div className="mt-3 flex flex-wrap gap-3 text-[11px] text-muted-foreground">
            {[
              ["bg-safe", "Safe"],
              ["bg-moderate", "Moderate"],
              ["bg-highrisk", "High Risk"],
              ["bg-critical", "Critical"],
            ].map(([c, l]) => (
              <span key={l} className="inline-flex items-center gap-1.5">
                <span className={`h-1 w-5 rounded-full ${c}`} /> {l}
              </span>
            ))}
          </div>
        </Panel>

        <div className="space-y-4">
          <Panel
            title="Corridor Detail"
            action={
              active && (
                <button
                  onClick={() => setSelected(null)}
                  className="text-muted-foreground hover:text-foreground"
                  aria-label="Close detail"
                >
                  <X className="size-4" />
                </button>
              )
            }
          >
            {active ? (
              <div className="space-y-4">
                <div>
                  <p className="font-display text-lg font-bold text-foreground">{active.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {active.highway} · {active.lengthKm} km
                  </p>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-border bg-secondary/40 p-3">
                  <span className="text-xs tracking-wider text-muted-foreground uppercase">
                    Overall Risk
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="font-display text-xl font-bold text-foreground">
                      {active.risk}%
                    </span>
                    <RiskPill level={active.level} text={LEVEL_LABEL[active.level]} />
                  </span>
                </div>
                <div className="space-y-3">
                  <Meter label="Flood probability" value={active.flood} level={active.level} />
                  <Meter
                    label="Landslide probability"
                    value={active.landslide}
                    level={active.level}
                  />
                  <Meter
                    label="Blockage probability"
                    value={active.blockage}
                    level={active.level}
                  />
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Traffic</span>
                  <span className="font-semibold text-foreground">{active.traffic}</span>
                </div>
                <div className="rounded-lg border border-primary/30 bg-primary/10 p-3">
                  <p className="text-[10px] font-semibold tracking-widest text-primary uppercase">
                    Recommended Action
                  </p>
                  <p className="font-display mt-1 flex items-center gap-2 text-sm font-bold text-foreground">
                    <ArrowRight className="size-4 text-primary" />
                    {active.action}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Select a corridor on the map to inspect predicted flood, landslide and blockage
                probabilities.
              </p>
            )}
          </Panel>

          <Panel title="Top Risk Corridors">
            <ul className="space-y-2">
              {[...ROADS]
                .sort((a, b) => b.risk - a.risk)
                .slice(0, 5)
                .map((r) => (
                  <li key={r.id}>
                    <button
                      onClick={() => setSelected(r)}
                      className="flex w-full items-center justify-between rounded-lg border border-border bg-secondary/30 px-3 py-2 text-left transition-colors hover:bg-secondary/70"
                    >
                      <span>
                        <span className="block text-sm text-foreground">{r.name}</span>
                        <span className="text-[11px] text-muted-foreground">{r.highway}</span>
                      </span>
                      <RiskPill level={r.level} text={`${r.risk}%`} />
                    </button>
                  </li>
                ))}
            </ul>
          </Panel>
        </div>
      </div>
    </>
  );
}
