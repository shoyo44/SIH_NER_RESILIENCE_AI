import { createFileRoute } from "@tanstack/react-router";
import { MonitorSmartphone, LayoutDashboard, RotateCcw } from "lucide-react";
import { EngineProvider, useEngine } from "@/components/engine/store";
import DriverApp from "@/components/engine/DriverApp";
import AdminDashboard from "@/components/engine/AdminDashboard";

export const Route = createFileRoute("/_authenticated/engine")({
  head: () => ({
    meta: [
      { title: "Tri-Modal Resilience Engine — NER-RESILIENCE AI" },
      { name: "description", content: "Driver field app and admin GIS command for tri-modal logistics resilience in Northeast India." },
      { property: "og:title", content: "Tri-Modal Resilience Engine — NER-RESILIENCE AI" },
      { property: "og:description", content: "Driver field app and admin GIS command for tri-modal logistics resilience." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <EngineProvider>
      <EnginePage />
    </EngineProvider>
  ),
});

function EnginePage() {
  const e = useEngine();
  return (
    <div className="space-y-4">
      <div className="panel flex flex-wrap items-center justify-between gap-3 p-4">
        <div className="flex min-w-0 items-center gap-2">
          <h1 className="text-lg font-bold">NER-RESILIENCE AI</h1>
          <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-semibold text-primary">Tri-Modal Resilience Engine</span>
        </div>
        <button onClick={e.reset} className="flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold hover:bg-secondary">
          <RotateCcw className="size-3.5" /> Reset Simulation
        </button>
        <div className="flex rounded-lg border bg-secondary p-1">
          {([
            ["driver", "Driver Field App", MonitorSmartphone],
            ["admin", "Admin GIS Command", LayoutDashboard],
          ] as const).map(([id, label, Icon]) => (
            <button
              key={id}
              onClick={() => e.set({ currentRole: id })}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold ${e.currentRole === id ? "bg-popover text-foreground shadow-sm" : "text-muted-foreground"}`}
            >
              <Icon className="size-3.5" /> {label}
            </button>
          ))}
        </div>
      </div>
      {e.currentRole === "driver" ? <DriverApp /> : <AdminDashboard />}
      {e.toast && (
        <div className="fixed bottom-5 left-1/2 z-[70] -translate-x-1/2 rounded-lg bg-foreground px-4 py-2 text-xs font-semibold text-background shadow-xl">
          {e.toast}
        </div>
      )}
    </div>
  );
}
