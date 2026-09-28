import { useState } from "react";
import { Cpu, Download, Menu, Play, RotateCw, Volume2, Wifi, WifiOff, X, AlertTriangle, CheckCircle2 } from "lucide-react";
import { ALERT_TEXT, LANG_CODE, SMS_BASE64, SMS_PACKET, useEngine, type Lang } from "./store";

const LANGS: { id: Lang; label: string }[] = [
  { id: "assamese", label: "Assamese" },
  { id: "hindi", label: "Hindi" },
  { id: "bengali", label: "Bengali" },
  { id: "english", label: "English" },
];

function DriverDrawer() {
  const e = useEngine();
  return (
    <>
      <div
        className={`absolute inset-0 z-20 bg-foreground/30 transition-opacity ${e.isDrawerOpen ? "opacity-100" : "pointer-events-none opacity-0"}`}
        onClick={() => e.set({ isDrawerOpen: false })}
      />
      <aside
        className={`absolute inset-y-0 left-0 z-30 w-[85%] overflow-y-auto bg-popover p-4 shadow-2xl transition-transform duration-300 ${e.isDrawerOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm font-semibold">Driver Settings & Manifest</p>
          <button aria-label="Close drawer" onClick={() => e.set({ isDrawerOpen: false })} className="rounded-md p-1 hover:bg-secondary">
            <X className="size-4" />
          </button>
        </div>
        <div className="rounded-lg border bg-surface p-3 text-xs">
          <p className="text-sm font-semibold">Biren Das</p>
          <p className="text-muted-foreground">ID: DRV-8492 · Rating: 4.9★</p>
          <p className="text-muted-foreground">CDL Heavy Transport</p>
        </div>
        <div className="mt-3 rounded-lg border bg-surface p-3 text-xs">
          <p className="font-semibold">Brahmaputra Freight Express</p>
          <p className="text-muted-foreground">Depot: Guwahati Inland Terminal</p>
        </div>
        <p className="mt-4 mb-2 text-[10px] font-semibold tracking-widest text-muted-foreground uppercase">Language</p>
        <div className="flex flex-wrap gap-1.5">
          {LANGS.map((l) => (
            <button
              key={l.id}
              onClick={() => e.set({ activeLanguage: l.id })}
              className={`rounded-full border px-3 py-1 text-xs ${e.activeLanguage === l.id ? "border-primary bg-primary text-primary-foreground" : "hover:bg-secondary"}`}
            >
              {l.label}
            </button>
          ))}
        </div>
        <p className="mt-4 mb-2 text-[10px] font-semibold tracking-widest text-muted-foreground uppercase">System Diagnostics</p>
        <ul className="space-y-1.5 text-xs">
          <li className="flex justify-between"><span className="text-muted-foreground">Offline cache</span><span>28 MB cached</span></li>
          <li className="flex justify-between"><span className="text-muted-foreground">TFLite model</span><span>YOLO-Nano v8.2</span></li>
        </ul>
        <button
          onClick={() => e.showToast("Logs exported · diag-DRV-8492.txt")}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border py-2 text-xs font-semibold hover:bg-secondary"
        >
          <Download className="size-3.5" /> Export Logs
        </button>
      </aside>
    </>
  );
}

// --- THIS IS THE UPDATED CAMERA VIEWPORT COMPONENT ---
// --- REPLACE ONLY THIS FUNCTION IN DriverApp.tsx ---
function CameraViewport() {
  const e = useEngine();
  
  const trigger = () => {
    e.set({ hazardTriggered: true, hazardReported: true });
    e.showToast(e.isOffline ? "Hazard queued via SMS fallback" : "Hazard reported to command");
  };

  return (
    <div>
      <div className="relative h-48 w-full overflow-hidden rounded-xl border border-slate-300 bg-slate-900 shadow-inner">
        
        {/* Looking exactly at the filename in your public folder */}
        <img 
          src="/images (1).jpg" 
          alt="Dashcam view of mountain roadway" 
          className="absolute inset-0 h-full w-full object-cover opacity-80" 
        />

        <div className="absolute inset-x-0 top-0 flex items-center justify-between bg-gradient-to-b from-slate-900/80 to-transparent px-2 py-1.5 text-[10px] font-medium text-white">
          <span>TFLite YOLO-Nano</span>
          <span>38ms Latency</span>
          <span className="flex items-center gap-1">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
            Active Stream
          </span>
        </div>

        {e.hazardTriggered && (
          <div className="absolute left-[18%] top-[40%] h-[46%] w-[58%] animate-pulse rounded border-2 border-red-500">
            <span className="absolute -top-5 left-0 whitespace-nowrap rounded bg-red-500 px-1.5 py-0.5 text-[10px] font-semibold text-white">
              Landslide / Rockfall [91.4%]
            </span>
          </div>
        )}
      </div>

      <div className="mt-2 grid grid-cols-2 gap-2">
        <button
          onClick={trigger}
          className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-red-500"
        >
          <AlertTriangle className="h-3.5 w-3.5" /> Simulate Landslide
        </button>
        <button
          onClick={() => e.set({ hazardTriggered: false })}
          className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50"
        >
          <CheckCircle2 className="h-3.5 w-3.5" /> Clear Road
        </button>
      </div>
    </div>
  );
}
// --- END OF UPDATED CAMERA VIEWPORT COMPONENT ---

function VoiceCoPilot() {
  const e = useEngine();
  const [playing, setPlaying] = useState(false);
  const play = () => {
    setPlaying(true);
    try {
      const u = new SpeechSynthesisUtterance(ALERT_TEXT[e.activeLanguage]);
      u.lang = LANG_CODE[e.activeLanguage];
      u.onend = () => setPlaying(false);
      speechSynthesis.cancel();
      speechSynthesis.speak(u);
    } catch {
      /* speech unavailable */
    }
    setTimeout(() => setPlaying(false), 4000);
  };
  return (
    <div className="rounded-xl border bg-surface p-3">
      <div className="flex items-center justify-between">
        <p className="flex items-center gap-1.5 text-xs font-semibold"><Volume2 className="size-3.5 text-primary" /> Voice Co-Pilot</p>
        <button onClick={play} className="flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-[11px] font-semibold text-primary-foreground">
          {playing ? <RotateCw className="size-3 animate-spin" /> : <Play className="size-3" />} {playing ? "Playing" : "Play Alert"}
        </button>
      </div>
      <div className="my-2 flex h-6 items-end gap-0.5">
        {Array.from({ length: 32 }).map((_, i) => (
          <span
            key={i}
            className={`w-1 rounded-full bg-primary/70 ${playing ? "animate-pulse" : ""}`}
            style={{ height: `${20 + ((i * 37) % 80)}%`, animationDelay: `${i * 40}ms` }}
          />
        ))}
      </div>
      <p className="text-xs leading-relaxed">{ALERT_TEXT[e.activeLanguage]}</p>
    </div>
  );
}

export default function DriverApp() {
  const e = useEngine();
  return (
    <div className="relative mx-auto h-[780px] max-w-sm overflow-hidden rounded-[2.5rem] border-8 border-device bg-popover shadow-2xl">
      <DriverDrawer />
      <div className="h-full overflow-y-auto">
        <header className="flex items-center justify-between gap-2 border-b px-3 py-3">
          <button aria-label="Open menu" onClick={() => e.set({ isDrawerOpen: true })} className="rounded-md p-1.5 hover:bg-secondary">
            <Menu className="size-4" />
          </button>
          <span className="truncate rounded-full bg-secondary px-2 py-1 text-[10px] font-semibold">Brahmaputra Freight | AS-01-GC-4412</span>
          <button
            onClick={() => e.set({ isOffline: !e.isOffline })}
            className={`flex shrink-0 items-center gap-1 rounded-full px-2 py-1 text-[10px] font-semibold ${e.isOffline ? "bg-critical/15 text-critical" : "bg-safe/15 text-safe"}`}
          >
            {e.isOffline ? <WifiOff className="size-3" /> : <Wifi className="size-3" />}
            {e.isOffline ? "Offline Dead Zone" : "4G High-Speed"}
          </button>
        </header>
        <div className="space-y-3 p-3">
          <div className="rounded-xl border bg-surface p-3 text-xs">
            <p className="text-[10px] font-semibold tracking-widest text-primary uppercase">Active Mission</p>
            <p className="mt-1 font-semibold">Guwahati Inland Port → Silchar Depot (via NH-06)</p>
            <p className="mt-1 text-muted-foreground">Medical Supplies & Cold-Chain Vials · <span className="font-semibold text-critical">URGENT</span></p>
            <p className="mt-1 text-muted-foreground">142 km remaining · Base ETA 4h 15m</p>
          </div>
          <CameraViewport />
          {e.hazardTriggered && e.isOffline && (
            <div className="rounded-lg bg-terminal p-2.5 font-mono text-[10px] leading-relaxed text-terminal-foreground">
              <p>[OFFLINE TELEMETRY] Compressing Base64 SMS Webhook: {SMS_PACKET}</p>
              <p className="break-all opacity-70">→ {SMS_BASE64}</p>
            </div>
          )}
          {e.hazardTriggered && <VoiceCoPilot />}
          {!e.hazardTriggered && (
            <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground"><Cpu className="size-3.5" /> Edge AI scanning road ahead…</p>
          )}
        </div>
      </div>
    </div>
  );
}