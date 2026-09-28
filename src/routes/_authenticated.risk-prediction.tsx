import { createFileRoute } from "@tanstack/react-router";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Panel, PageHeader, RiskPill, levelOf } from "@/components/ui-kit";
import { CONFIDENCE_TREND, RAINFALL_TREND, RISK_PREDICTIONS, RISK_TREND } from "@/data/mockData";

export const Route = createFileRoute("/_authenticated/risk-prediction")({
  head: () => ({
    meta: [
      { title: "AI Risk Prediction — NER-RESILIENCE AI" },
      {
        name: "description",
        content:
          "Simulated AI forecasts for flood, landslide, road blockage, traffic and delivery delay risk across Northeast India.",
      },
      { property: "og:title", content: "AI Risk Prediction — NER-RESILIENCE AI" },
      {
        property: "og:description",
        content: "Forecast hazard probabilities and model confidence for regional logistics.",
      },
    ],
  }),
  component: RiskPrediction,
});

const axis = { stroke: "oklch(0.68 0.025 245)", fontSize: 11 };
const tooltipStyle = {
  background: "oklch(0.22 0.03 253)",
  border: "1px solid oklch(0.35 0.03 252)",
  borderRadius: 8,
  color: "oklch(0.95 0.01 240)",
  fontSize: 12,
};

function RiskPrediction() {
  return (
    <>
      <PageHeader
        title="AI RISK PREDICTION"
        description="Model outputs from NER-Resilience v2.1. Every probability below is SIMULATED AI DATA generated for demonstration."
      />

      <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {RISK_PREDICTIONS.map((p) => {
          const level = levelOf(p.value);
          return (
            <div key={p.label} className="panel p-4">
              <div className="flex items-start justify-between">
                <p className="text-xs tracking-wider text-muted-foreground uppercase">{p.label}</p>
                <RiskPill level={level} />
              </div>
              <p className="font-display mt-3 text-3xl font-bold text-foreground">{p.value}%</p>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                <div
                  className={`h-full rounded-full ${
                    level === "critical"
                      ? "bg-critical"
                      : level === "high"
                        ? "bg-highrisk"
                        : level === "moderate"
                          ? "bg-moderate"
                          : "bg-safe"
                  }`}
                  style={{ width: `${p.value}%` }}
                />
              </div>
              <p className="mt-2 text-[11px] text-muted-foreground">
                {p.window} · {p.driver}
              </p>
            </div>
          );
        })}
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Panel title="Rainfall Trend" subtitle="Observed vs model forecast (mm / day)">
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={RAINFALL_TREND}>
              <defs>
                <linearGradient id="rf" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.55} />
                  <stop offset="100%" stopColor="#22d3ee" stopOpacity={0.03} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.32 0.03 252)" />
              <XAxis dataKey="day" {...axis} />
              <YAxis {...axis} />
              <Tooltip contentStyle={tooltipStyle} />
              <Area dataKey="rainfall" stroke="#22d3ee" fill="url(#rf)" strokeWidth={2} />
              <Line dataKey="forecast" stroke="#818cf8" strokeDasharray="5 4" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </Panel>

        <Panel title="Risk Trend" subtitle="7-day hazard probability evolution (%)">
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={RISK_TREND}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.32 0.03 252)" />
              <XAxis dataKey="day" {...axis} />
              <YAxis {...axis} />
              <Tooltip contentStyle={tooltipStyle} />
              <Line dataKey="flood" stroke="#38bdf8" strokeWidth={2} dot={false} />
              <Line dataKey="landslide" stroke="#f97316" strokeWidth={2} dot={false} />
              <Line dataKey="traffic" stroke="#a78bfa" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </Panel>

        <Panel
          title="Prediction Confidence"
          subtitle="Per-model confidence score (%)"
          className="xl:col-span-2"
        >
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={CONFIDENCE_TREND}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.32 0.03 252)" />
              <XAxis dataKey="model" {...axis} />
              <YAxis {...axis} domain={[0, 100]} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "oklch(0.3 0.03 252 / 0.4)" }} />
              <Bar dataKey="confidence" fill="#22d3ee" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Panel>
      </div>
    </>
  );
}
