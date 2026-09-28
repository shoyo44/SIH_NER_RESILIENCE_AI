import { createFileRoute } from "@tanstack/react-router";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  CartesianGrid,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Panel, PageHeader } from "@/components/ui-kit";
import {
  DISASTER_INCIDENTS,
  NETWORK_HEALTH_TREND,
  RISK_DISTRIBUTION,
  ROUTE_DELAYS,
  STATE_RISK,
} from "@/data/mockData";

export const Route = createFileRoute("/_authenticated/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics — NER-RESILIENCE AI" },
      {
        name: "description",
        content:
          "Network health, risk distribution, route delays, disaster incidents and state-level risk analytics for Northeast India logistics.",
      },
      { property: "og:title", content: "Analytics — NER-RESILIENCE AI" },
      {
        property: "og:description",
        content: "Regional resilience analytics across corridors, states and hazard types.",
      },
    ],
  }),
  component: Analytics,
});

const axis = { stroke: "oklch(0.68 0.025 245)", fontSize: 11 };
const tooltipStyle = {
  background: "oklch(0.22 0.03 253)",
  border: "1px solid oklch(0.35 0.03 252)",
  borderRadius: 8,
  color: "oklch(0.95 0.01 240)",
  fontSize: 12,
};
const grid = <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.32 0.03 252)" />;

function Analytics() {
  return (
    <>
      <PageHeader
        title="ANALYTICS"
        description="Historical and comparative view of regional resilience performance across corridors, hazards and states."
      />

      <div className="grid gap-4 xl:grid-cols-2">
        <Panel title="Network Health" subtitle="Weekly health index vs incident count">
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={NETWORK_HEALTH_TREND}>
              <defs>
                <linearGradient id="nh" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="#22d3ee" stopOpacity={0.03} />
                </linearGradient>
              </defs>
              {grid}
              <XAxis dataKey="week" {...axis} />
              <YAxis {...axis} />
              <Tooltip contentStyle={tooltipStyle} />
              <Area dataKey="health" stroke="#22d3ee" fill="url(#nh)" strokeWidth={2} />
              <Area dataKey="incidents" stroke="#f97316" fill="transparent" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </Panel>

        <Panel title="Risk Distribution" subtitle="Corridor count by risk band">
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={RISK_DISTRIBUTION}
                dataKey="value"
                nameKey="name"
                innerRadius={55}
                outerRadius={90}
                paddingAngle={3}
              >
                {RISK_DISTRIBUTION.map((d) => (
                  <Cell key={d.name} fill={d.color} stroke="transparent" />
                ))}
              </Pie>
              <Legend wrapperStyle={{ fontSize: 11, color: "#94a3b8" }} />
              <Tooltip contentStyle={tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
        </Panel>

        <Panel title="Route Delays" subtitle="Average delay by corridor (hours)">
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={ROUTE_DELAYS}>
              {grid}
              <XAxis dataKey="corridor" {...axis} />
              <YAxis {...axis} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "oklch(0.3 0.03 252 / 0.4)" }} />
              <Bar dataKey="delay" fill="#38bdf8" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Panel>

        <Panel title="Disaster Incidents" subtitle="Recorded events by hazard type">
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={DISASTER_INCIDENTS}>
              {grid}
              <XAxis dataKey="month" {...axis} />
              <YAxis {...axis} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "oklch(0.3 0.03 252 / 0.4)" }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="flood" stackId="a" fill="#38bdf8" />
              <Bar dataKey="landslide" stackId="a" fill="#f97316" />
              <Bar dataKey="blockage" stackId="a" fill="#a78bfa" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Panel>

        <Panel title="State Risk" subtitle="Composite risk index by state" className="xl:col-span-2">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={STATE_RISK} layout="vertical" margin={{ left: 30 }}>
              {grid}
              <XAxis type="number" domain={[0, 100]} {...axis} />
              <YAxis type="category" dataKey="state" width={90} {...axis} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "oklch(0.3 0.03 252 / 0.4)" }} />
              <Bar dataKey="risk" radius={[0, 6, 6, 0]}>
                {STATE_RISK.map((s) => (
                  <Cell
                    key={s.state}
                    fill={
                      s.risk >= 75 ? "#ef4444" : s.risk >= 55 ? "#f97316" : s.risk >= 35 ? "#eab308" : "#22c55e"
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Panel>
      </div>

      <p className="font-display mt-5 rounded-xl border border-primary/30 bg-primary/10 p-5 text-center text-sm tracking-wide text-foreground">
        Predict disruption before it happens. Understand its network-wide impact. Protect critical
        logistics through intelligent routing.
      </p>
    </>
  );
}
