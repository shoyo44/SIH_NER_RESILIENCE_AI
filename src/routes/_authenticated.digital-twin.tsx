import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Warehouse } from "lucide-react";
import NetworkMap, { metricFor, type MapLayer } from "@/components/NetworkMap";
import { Meter, Panel, PageHeader, RiskPill } from "@/components/ui-kit";
import { CITIES, ROADS, type RoadSegment } from "@/data/mockData";

export const Route = createFileRoute("/_authenticated/digital-twin")({
  head: () => ({
    meta: [
      { title: "Digital Twin — NER-RESILIENCE AI" },
      {
        name: "description",
        content:
          "Interactive digital twin of the Northeast India road network with risk, flood, landslide, traffic and logistics layers.",
      },
      { property: "og:title", content: "Digital Twin — NER-RESILIENCE AI" },
      {
        property: "og:description",
        content: "Layered digital twin of Northeast India road corridors and logistics hubs.",
      },
    ],
  }),
  component: DigitalTwin,
});

const LAYERS: { id: MapLayer; label: string }[] = [
  { id: "risk", label: "Risk" },
  { id: "flood", label: "Flood" },
  { id: "landslide", label: "Landslide" },
  { id: "traffic", label: "Traffic" },
  { id: "logistics", label: "Logistics" },
];

function DigitalTwin() {
  const [layer, setLayer] = useState<MapLayer>("risk");
  const [selected, setSelected] = useState<RoadSegment | null>(null);

  return (
    <>
      <PageHeader
        title="DIGITAL TWIN"
        description="A living replica of the regional network — switch layers to inspect how each hazard reshapes corridor and hub state."
      />

      <div className="mb-4 flex flex-wrap gap-2">
        {LAYERS.map((l) => (
          <button
            key={l.id}
            onClick={() => setLayer(l.id)}
            className={`rounded-lg border px-4 py-2 text-xs font-semibold tracking-wider uppercase transition-colors ${
              layer === l.id
                ? "border-primary/50 bg-primary/15 text-primary"
                : "border-border bg-card text-muted-foreground hover:text-foreground"
            }`}
          >
            {l.label}
          </button>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_340px]">
        <Panel
          title={`${layer} Layer`}
          subtitle="Line colour and weight reflect the active layer value. Click a corridor for details."
        >
          <NetworkMap
            layer={layer}
            selectedId={selected?.id ?? null}
            onSelect={setSelected}
            className="h-[640px]"
          />
        </Panel>

        <div className="space-y-4">
          <Panel title="Segment Inspector">
            {selected ? (
              <div className="space-y-3">
                <p className="font-display text-base font-bold text-foreground">{selected.name}</p>
                <p className="text-xs text-muted-foreground">
                  {selected.highway} · {selected.lengthKm} km · traffic {selected.traffic}
                </p>
                <Meter
                  label={`${layer} index`}
                  value={metricFor(selected, layer)}
                  level={selected.level}
                />
                <Meter label="Flood" value={selected.flood} level={selected.level} />
                <Meter label="Landslide" value={selected.landslide} level={selected.level} />
                <Meter label="Logistics load" value={selected.logisticsLoad} level="safe" />
                <p className="rounded-lg border border-border bg-secondary/40 p-3 text-xs text-muted-foreground">
                  {selected.action}
                </p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Select any road segment to inspect its simulated twin state.
              </p>
            )}
          </Panel>

          <Panel title="Logistics Hubs">
            <ul className="space-y-2">
              {CITIES.filter((c) => c.hub).map((c) => (
                <li
                  key={c.id}
                  className="flex items-center gap-3 rounded-lg border border-border bg-secondary/30 px-3 py-2"
                >
                  <Warehouse className="size-4 text-primary" />
                  <span>
                    <span className="block text-sm text-foreground">{c.name}</span>
                    <span className="text-[11px] text-muted-foreground">{c.hubType}</span>
                  </span>
                </li>
              ))}
            </ul>
          </Panel>

          <Panel title="Network Summary">
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="rounded-lg border border-border bg-secondary/30 p-3">
                <p className="font-display text-xl font-bold text-foreground">{ROADS.length}</p>
                <p className="text-[10px] tracking-wider text-muted-foreground uppercase">
                  Modelled corridors
                </p>
              </div>
              <div className="rounded-lg border border-border bg-secondary/30 p-3">
                <p className="font-display text-xl font-bold text-foreground">{CITIES.length}</p>
                <p className="text-[10px] tracking-wider text-muted-foreground uppercase">
                  Nodes tracked
                </p>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {ROADS.slice(0, 4).map((r) => (
                <RiskPill key={r.id} level={r.level} text={`${r.highway} ${r.risk}%`} />
              ))}
            </div>
          </Panel>
        </div>
      </div>
    </>
  );
}
