import { useState } from "react";
import { AlertTriangle, ArrowLeft, Download, Ship, Train, Truck, X } from "lucide-react";
import { Overlay, SMS_BASE64, useEngine, vulnerability } from "./store";

const FLEET = [
  { id: "AS-4412", label: "Truck #AS-4412", cargo: "Medical Supplies / Urgent", icon: Truck, progress: 38, route: "NH-06 Guwahati → Silchar" },
  { id: "NFR-1049", label: "Train #NFR-1049", cargo: "Steel Cargo / Standard", icon: Train, progress: 56, route: "Lumding–Badarpur" },
  { id: "IWAI-02", label: "Barge #IWAI-02", cargo: "Bulk Grains / Bulk", icon: Ship, progress: 22, route: "Brahmaputra NW-2" },
];

const ROUTES = [
  { id: "urgent", tier: "Urgent Freight", plan: "Diverted via Meghalaya Bypass (+1h 45m)", dist: "312 km", fuel: "+18% diesel", dwell: "0 min (road only)" },
  { id: "standard", tier: "Standard Freight", plan: "Shifted to NFR Freight Rail", dist: "268 km", fuel: "−32% energy", dwell: "2h 10m at Lumding yard" },
  { id: "bulk", tier: "Bulk Freight", plan: "Shifted to IWAI River Barge at Pandu Port", dist: "390 km", fuel: "−54% fuel", dwell: "5h 40m at Pandu Port" },
];

function Card({ title, children, action }: { title: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <section className="panel p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

function FleetTable() {
  const e = useEngine();
  return (
    <Card title="Active Fleet">
      <ul className="space-y-2">
        {FLEET.map((f) => (
          <li key={f.id}>
            <button
              onClick={() => e.set({ selectedTruck: f.id })}
              className={`w-full rounded-lg border p-2.5 text-left transition-colors ${e.selectedTruck === f.id ? "border-primary bg-primary/10" : "hover:bg-secondary"}`}
            >
              <span className="flex items-center gap-2 text-sm font-semibold"><f.icon className="size-4 text-primary" /> {f.label}</span>
              <span className="block text-[11px] text-muted-foreground">{f.cargo} · {f.route}</span>
              <span className="mt-1.5 block h-1 rounded-full bg-secondary">
                <span className="block h-full rounded-full bg-primary" style={{ width: `${f.progress}%` }} />
              </span>
            </button>
          </li>
        ))}
      </ul>
    </Card>
  );
}

function RouteOptimizer() {
  const e = useEngine();
  const active = ROUTES.find((r) => r.id === e.activeModal);
  return (
    <Card title="Tri-Modal A* Optimizer">
      {!e.hazardReported ? (
        <p className="text-xs text-muted-foreground">All corridors nominal. Diversions appear here when a hazard is reported.</p>
      ) : (
        <ul className="space-y-2">
          {ROUTES.map((r) => (
            <li key={r.id} className="rounded-lg border p-2.5">
              <p className="text-xs font-semibold">{r.tier}</p>
              <p className="text-[11px] text-muted-foreground">{r.plan}</p>
              <button onClick={() => e.set({ activeModal: r.id })} className="mt-1.5 text-[11px] font-semibold text-primary hover:underline">
                Inspect Route Details →
              </button>
            </li>
          ))}
        </ul>
      )}
      {active && (
        <Overlay onClose={() => e.set({ activeModal: null })}>
          <div className="rounded-xl border bg-popover p-5 shadow-2xl">
            <div className="mb-3 flex items-center justify-between">
              <button onClick={() => e.set({ activeModal: null })} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
                <ArrowLeft className="size-3.5" /> Back
              </button>
              <button aria-label="Close" onClick={() => e.set({ activeModal: null })}><X className="size-4" /></button>
            </div>
            <p className="font-semibold">{active.tier}</p>
            <p className="text-sm text-muted-foreground">{active.plan}</p>
            <dl className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
              <div className="rounded-lg bg-secondary p-2"><dt className="text-muted-foreground">Distance</dt><dd className="font-semibold">{active.dist}</dd></div>
              <div className="rounded-lg bg-secondary p-2"><dt className="text-muted-foreground">Fuel Δ</dt><dd className="font-semibold">{active.fuel}</dd></div>
              <div className="rounded-lg bg-secondary p-2"><dt className="text-muted-foreground">Dwell</dt><dd className="font-semibold">{active.dwell}</dd></div>
            </dl>
          </div>
        </Overlay>
      )}
    </Card>
  );
}

const NODES = [
  { n: "Guwahati", x: 90, y: 70 },
  { n: "Pandu Port", x: 60, y: 95 },
  { n: "Lumding", x: 250, y: 120 },
  { n: "Shillong", x: 140, y: 190 },
  { n: "Badarpur", x: 330, y: 270 },
  { n: "Silchar", x: 380, y: 290 },
];

function GisMapCanvas() {
  const e = useEngine();
  const [pin, setPin] = useState<"truck" | "hazard" | null>(null);
  return (
    <Card title="GIS Network · NER Corridors">
      <div className="relative overflow-hidden rounded-lg border bg-surface">
        <svg viewBox="0 0 440 340" className="w-full">
          {/* Waterway NW-2 */}
          <path d="M0,110 C60,90 120,60 200,55 S360,40 440,30" className="stroke-teal" strokeWidth="6" fill="none" opacity="0.8" />
          {/* Rail NFR */}
          <path d="M90,70 L250,120 L330,270 L380,290" className="stroke-highrisk" strokeWidth="3" strokeDasharray="8 6" fill="none" />
          {/* Highway NH-06 / NH-27 */}
          <path d="M90,70 L140,190" className="stroke-primary" strokeWidth="4" fill="none" />
          <path d="M140,190 L240,230" className={e.hazardReported ? "animate-pulse stroke-critical" : "stroke-primary"} strokeWidth="5" fill="none" />
          <path d="M240,230 L380,290" className="stroke-primary" strokeWidth="4" fill="none" />
          {NODES.map((c) => (
            <g key={c.n}>
              <circle cx={c.x} cy={c.y} r="5" className="fill-foreground" />
              <text x={c.x + 8} y={c.y - 6} className="fill-foreground text-[10px] font-semibold">{c.n}</text>
            </g>
          ))}
          {/* Train & barge markers */}
          <g transform="translate(290,190)"><rect x="-8" y="-6" width="16" height="12" rx="3" className="fill-highrisk" /></g>
          <g transform="translate(160,58)"><rect x="-10" y="-5" width="20" height="10" rx="5" className="fill-teal" /></g>
          {/* Truck */}
          <g transform="translate(118,138)" className="cursor-pointer" onClick={() => setPin("truck")}>
            <circle r="11" className={e.selectedTruck === "AS-4412" ? "fill-primary" : "fill-accent"} />
            <circle r="16" className="animate-ping fill-primary/20" />
            <text textAnchor="middle" y="4" className="fill-primary-foreground text-[10px] font-bold">T</text>
          </g>
          {e.hazardReported && (
            <g transform="translate(190,210)" className="cursor-pointer" onClick={() => setPin("hazard")}>
              <circle r="18" className="animate-ping fill-critical/40" />
              <circle r="8" className="fill-critical" />
            </g>
          )}
        </svg>
        <div className="flex flex-wrap gap-3 border-t px-3 py-2 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1"><span className="h-1 w-4 bg-primary" /> Highway NH-06/27</span>
          <span className="flex items-center gap-1"><span className="h-1 w-4 border-t-2 border-dashed border-highrisk" /> Rail NFR</span>
          <span className="flex items-center gap-1"><span className="h-1 w-4 bg-teal" /> Waterway NW-2</span>
        </div>
        {pin && (
          <div className="absolute top-3 right-3 w-60 rounded-lg border bg-popover p-3 text-xs shadow-xl">
            <button aria-label="Close" onClick={() => setPin(null)} className="absolute top-2 right-2"><X className="size-3.5" /></button>
            {pin === "truck" ? (
              <>
                <p className="font-semibold">Truck #AS-4412 · Biren Das</p>
                <p className="text-muted-foreground">Speed: {e.hazardTriggered ? "12" : "46"} km/h</p>
                <p className="text-muted-foreground">GPS: 25.4210° N, 92.5130° E</p>
                <p className="text-muted-foreground">Cargo: Medical Supplies & Cold-Chain Vials</p>
              </>
            ) : (
              <>
                <p className="font-semibold text-critical">Landslide Incident</p>
                <p className="text-muted-foreground">25.18° N, 92.85° E · NH-06 mountain sector</p>
                <p className="text-muted-foreground">Severity 3 · Confidence 91.4% · Reported by AS-4412</p>
              </>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}

function TelemetryGateway() {
  const e = useEngine();
  const [open, setOpen] = useState(false);
  const lines = e.hazardReported
    ? [
        `[INGEST] Base64 SMS Webhook Received from AS-01-GC-4412`,
        `[RAW] ${SMS_BASE64}`,
        `[DECODE] Hazard: Landslide | Lat: 25.1834, Lon: 92.8512 | LightGBM Score: 0.94`,
      ]
    : ["[IDLE] Awaiting telemetry packets…"];
  return (
    <Card
      title="SMS Webhook Gateway"
      action={
        <button onClick={() => setOpen(true)} className="flex items-center gap-1 text-[11px] font-semibold text-primary">
          <Download className="size-3" /> Download Log
        </button>
      }
    >
      <div className="rounded-lg bg-terminal p-3 font-mono text-[10px] leading-relaxed break-all text-terminal-foreground">
        {lines.map((l) => <p key={l}>{l}</p>)}
      </div>
      {open && (
        <Overlay onClose={() => setOpen(false)}>
          <div className="rounded-xl border bg-popover p-5 shadow-2xl">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-semibold">gateway-log.txt preview</p>
              <button aria-label="Close" onClick={() => setOpen(false)}><X className="size-4" /></button>
            </div>
            <pre className="max-h-64 overflow-auto rounded-lg bg-terminal p-3 text-[10px] whitespace-pre-wrap text-terminal-foreground">
              {["[BOOT] Gateway online · port 443", ...lines].join("\n")}
            </pre>
            <button
              onClick={() => { e.showToast("Log downloaded"); setOpen(false); }}
              className="mt-3 w-full rounded-lg bg-primary py-2 text-xs font-semibold text-primary-foreground"
            >
              Download
            </button>
          </div>
        </Overlay>
      )}
    </Card>
  );
}

function DigitalTwinControls() {
  const e = useEngine();
  const v = vulnerability(e.rainfall, e.soilMoisture);
  const tone = v > 75 ? "critical" : v > 45 ? "moderate" : "safe";
  const label = v > 75 ? "Critical" : v > 45 ? "Medium" : "Low";
  const bar = { critical: "bg-critical", moderate: "bg-moderate", safe: "bg-safe" }[tone];
  const text = { critical: "text-critical", moderate: "text-moderate", safe: "text-safe" }[tone];
  return (
    <Card title="Digital Twin Simulator">
      <label className="block text-xs">
        <span className="flex justify-between"><span>Monsoon Rainfall</span><b>{e.rainfall} mm/hr</b></span>
        <input type="range" min={0} max={250} value={e.rainfall} onChange={(ev) => e.set({ rainfall: +ev.target.value })} className="w-full accent-primary" />
      </label>
      <label className="mt-2 block text-xs">
        <span className="flex justify-between"><span>Soil Saturation Index</span><b>{e.soilMoisture}%</b></span>
        <input type="range" min={0} max={100} value={e.soilMoisture} onChange={(ev) => e.set({ soilMoisture: +ev.target.value })} className="w-full accent-primary" />
      </label>
      <div className="mt-3">
        <p className="flex justify-between text-xs"><span>Regional Vulnerability</span><b className={text}>{v}% · {label}</b></p>
        <div className="mt-1 h-2.5 rounded-full bg-secondary"><div className={`h-full rounded-full transition-all ${bar}`} style={{ width: `${v}%` }} /></div>
      </div>
      {v > 75 && (
        <div className="mt-3 flex gap-2 rounded-lg border border-critical/40 bg-critical/10 p-2.5 text-xs text-critical">
          <AlertTriangle className="size-4 shrink-0" />
          <span><b>Pre-impact Warning: NH-06 Vulnerable.</b> Preemptively rerouting bulk manifests to NW-2 River Barge.</span>
        </div>
      )}
    </Card>
  );
}

export default function AdminDashboard() {
  return (
    <div className="grid gap-4 xl:grid-cols-[300px_minmax(0,1fr)_320px]">
      <div className="space-y-4"><FleetTable /><RouteOptimizer /></div>
      <GisMapCanvas />
      <div className="space-y-4"><TelemetryGateway /><DigitalTwinControls /></div>
    </div>
  );
}
