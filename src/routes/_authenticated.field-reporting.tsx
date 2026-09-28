import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, CloudOff, ImagePlus, MapPin, Send } from "lucide-react";
import { Panel, PageHeader } from "@/components/ui-kit";
import { CITIES } from "@/data/mockData";

export const Route = createFileRoute("/_authenticated/field-reporting")({
  head: () => ({
    meta: [
      { title: "Offline Field Reporting — NER-RESILIENCE AI" },
      {
        name: "description",
        content:
          "Offline-first incident reporting for field workers in remote Northeast India, with a sync queue for low-connectivity areas.",
      },
      { property: "og:title", content: "Offline Field Reporting — NER-RESILIENCE AI" },
      {
        property: "og:description",
        content: "Report landslides, floods and roadblocks from the field — even without connectivity.",
      },
    ],
  }),
  component: FieldReporting,
});

const INCIDENT_TYPES = ["Landslide", "Flood", "Bridge Collapse", "Roadblock"];

interface Report {
  id: string;
  location: string;
  type: string;
  severity: number;
  description: string;
  synced: boolean;
}

const selectCls =
  "w-full rounded-lg border border-border bg-secondary/50 px-3 py-2 text-sm text-foreground outline-none focus:border-primary";

function FieldReporting() {
  const [location, setLocation] = useState(CITIES[0]!.name);
  const [type, setType] = useState(INCIDENT_TYPES[0]!);
  const [severity, setSeverity] = useState(50);
  const [description, setDescription] = useState("");
  const [imageName, setImageName] = useState<string | null>(null);
  const [queue, setQueue] = useState<Report[]>([
    {
      id: "FR-1042",
      location: "Cherrapunji",
      type: "Landslide",
      severity: 80,
      description: "Fresh debris on SH-5 near viewpoint.",
      synced: false,
    },
    {
      id: "FR-1041",
      location: "Majuli approach",
      type: "Flood",
      severity: 65,
      description: "Water over road surface, 30cm deep.",
      synced: false,
    },
  ]);
  const [submitted, setSubmitted] = useState(false);

  const pending = queue.filter((r) => !r.synced).length;

  const submit = () => {
    setQueue((q) => [
      {
        id: `FR-${1043 + q.length}`,
        location,
        type,
        severity,
        description: description || "No description provided.",
        synced: false,
      },
      ...q,
    ]);
    setDescription("");
    setImageName(null);
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 2500);
  };

  return (
    <>
      <PageHeader
        title="OFFLINE FIELD REPORTING"
        description="Ground-truth incident capture for remote NER corridors. Reports queue locally and sync when connectivity returns."
      />

      <div className="mb-4 inline-flex items-center gap-2 rounded-lg border border-highrisk/40 bg-highrisk/10 px-3 py-2 text-xs font-semibold text-highrisk">
        <CloudOff className="size-4" />
        OFFLINE MODE · SYNC QUEUE: {pending} REPORT{pending === 1 ? "" : "S"} PENDING
      </div>

      <div className="grid gap-4 xl:grid-cols-[380px_1fr]">
        <Panel title="New Incident Report">
          <div className="space-y-3">
            <label className="block">
              <span className="mb-1.5 block text-[10px] font-semibold tracking-widest text-muted-foreground uppercase">
                Location Tag
              </span>
              <select className={selectCls} value={location} onChange={(e) => setLocation(e.target.value)}>
                {CITIES.map((c) => (
                  <option key={c.id}>{c.name}</option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-1.5 block text-[10px] font-semibold tracking-widest text-muted-foreground uppercase">
                Incident Type
              </span>
              <select className={selectCls} value={type} onChange={(e) => setType(e.target.value)}>
                {INCIDENT_TYPES.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </label>

            <div>
              <span className="mb-1.5 block text-[10px] font-semibold tracking-widest text-muted-foreground uppercase">
                Severity — {severity}%
              </span>
              <input
                type="range"
                min={0}
                max={100}
                step={5}
                value={severity}
                onChange={(e) => setSeverity(Number(e.target.value))}
                className="w-full accent-[oklch(0.78_0.14_205)]"
              />
            </div>

            <div>
              <span className="mb-1.5 block text-[10px] font-semibold tracking-widest text-muted-foreground uppercase">
                Photo Evidence
              </span>
              <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-secondary/30 px-3 py-5 text-xs text-muted-foreground hover:border-primary/50">
                <ImagePlus className="size-4" />
                {imageName ?? "Attach photo (mock upload)"}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => setImageName(e.target.files?.[0]?.name ?? null)}
                />
              </label>
            </div>

            <label className="block">
              <span className="mb-1.5 block text-[10px] font-semibold tracking-widest text-muted-foreground uppercase">
                Description
              </span>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what you see on the ground…"
                className={`${selectCls} resize-none`}
              />
            </label>

            <button
              onClick={submit}
              className="accent-bar font-display flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-bold tracking-widest text-primary-foreground"
            >
              <Send className="size-4" /> QUEUE REPORT
            </button>
            {submitted && (
              <p className="flex items-center gap-1.5 text-xs font-semibold text-safe">
                <CheckCircle2 className="size-4" /> Report queued — will sync when online.
              </p>
            )}
          </div>
        </Panel>

        <Panel title="Sync Queue" subtitle="Reports captured in the field, awaiting upload">
          <ul className="space-y-2.5">
            {queue.map((r) => (
              <li
                key={r.id}
                className="rounded-xl border border-border bg-secondary/30 p-4"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-display text-sm font-bold text-foreground">{r.id}</span>
                  <span className="rounded-md border border-highrisk/40 bg-highrisk/15 px-2 py-0.5 text-[10px] font-bold tracking-wider text-highrisk">
                    {r.type.toUpperCase()}
                  </span>
                  <span
                    className={`rounded-md border px-2 py-0.5 text-[10px] font-bold tracking-wider ${
                      r.severity >= 70
                        ? "border-critical/40 bg-critical/15 text-critical"
                        : r.severity >= 40
                          ? "border-moderate/40 bg-moderate/15 text-moderate"
                          : "border-safe/40 bg-safe/15 text-safe"
                    }`}
                  >
                    SEVERITY {r.severity}%
                  </span>
                  <span className="ml-auto inline-flex items-center gap-1 text-[10px] font-semibold tracking-wider text-highrisk uppercase">
                    <CloudOff className="size-3" /> Pending sync
                  </span>
                </div>
                <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <MapPin className="size-3.5" /> {r.location}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">{r.description}</p>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-center text-[10px] tracking-widest text-muted-foreground uppercase">
            Simulated data · offline-first capability demo
          </p>
        </Panel>
      </div>
    </>
  );
}
