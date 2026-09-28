// ============================================================
// SIMULATED DATA — NER-RESILIENCE AI (Tickle Trackers, SIH 2026)
// All values below are mock/synthetic and stand in for a future
// FastAPI backend. Nothing here is a real feed.
// ============================================================

export type RiskLevel = "safe" | "moderate" | "high" | "critical";

export interface City {
  id: string;
  name: string;
  state: string;
  lat: number;
  lng: number;
  hub?: boolean;
  hubType?: string;
}

export interface RoadSegment {
  id: string;
  name: string;
  from: string;
  to: string;
  path: [number, number][];
  risk: number;
  flood: number;
  landslide: number;
  blockage: number;
  traffic: "Light" | "Moderate" | "Heavy" | "Severe";
  trafficScore: number;
  logisticsLoad: number;
  level: RiskLevel;
  highway: string;
  lengthKm: number;
  action: string;
}

export const CITIES: City[] = [
  { id: "ghy", name: "Guwahati", state: "Assam", lat: 26.1445, lng: 91.7362, hub: true, hubType: "Primary Distribution Hub" },
  { id: "shl", name: "Shillong", state: "Meghalaya", lat: 25.5788, lng: 91.8933, hub: true, hubType: "Regional Depot" },
  { id: "chr", name: "Cherrapunji", state: "Meghalaya", lat: 25.3, lng: 91.7 },
  { id: "aiz", name: "Aizawl", state: "Mizoram", lat: 23.7271, lng: 92.7176, hub: true, hubType: "Cold Chain Node" },
  { id: "imp", name: "Imphal", state: "Manipur", lat: 24.817, lng: 93.9368, hub: true, hubType: "Regional Depot" },
  { id: "koh", name: "Kohima", state: "Nagaland", lat: 25.6751, lng: 94.11 },
  { id: "agt", name: "Agartala", state: "Tripura", lat: 23.8315, lng: 91.2868, hub: true, hubType: "Border Logistics Hub" },
  { id: "itn", name: "Itanagar", state: "Arunachal Pradesh", lat: 27.0844, lng: 93.6053 },
  { id: "gan", name: "Gangtok", state: "Sikkim", lat: 27.3389, lng: 88.6065 },
];

export const cityById = (id: string) => CITIES.find((c) => c.id === id)!;

const levelOf = (risk: number): RiskLevel =>
  risk >= 75 ? "critical" : risk >= 55 ? "high" : risk >= 35 ? "moderate" : "safe";

interface RawRoad {
  id: string;
  from: string;
  to: string;
  highway: string;
  lengthKm: number;
  risk: number;
  flood: number;
  landslide: number;
  blockage: number;
  traffic: RoadSegment["traffic"];
  trafficScore: number;
  logisticsLoad: number;
  action: string;
  via?: [number, number][];
}

const RAW_ROADS: RawRoad[] = [
  { id: "shl-chr", from: "shl", to: "chr", highway: "NH-206", lengthKm: 54, risk: 82, flood: 61, landslide: 78, blockage: 66, traffic: "Heavy", trafficScore: 74, logisticsLoad: 58, action: "DIVERT LOGISTICS" },
  { id: "ghy-shl", from: "ghy", to: "shl", highway: "NH-6", lengthKm: 103, risk: 38, flood: 33, landslide: 41, blockage: 22, traffic: "Moderate", trafficScore: 48, logisticsLoad: 91, action: "MONITOR — CORRIDOR STABLE" },
  { id: "ghy-itn", from: "ghy", to: "itn", highway: "NH-15", lengthKm: 322, risk: 47, flood: 58, landslide: 36, blockage: 31, traffic: "Moderate", trafficScore: 44, logisticsLoad: 62, action: "STAGE BUFFER STOCK" },
  { id: "shl-agt", from: "shl", to: "agt", highway: "NH-6", lengthKm: 431, risk: 64, flood: 71, landslide: 49, blockage: 52, traffic: "Heavy", trafficScore: 66, logisticsLoad: 70, action: "PRE-POSITION ALTERNATE FLEET" },
  { id: "ghy-koh", from: "ghy", to: "koh", highway: "NH-29", lengthKm: 342, risk: 56, flood: 44, landslide: 63, blockage: 47, traffic: "Moderate", trafficScore: 52, logisticsLoad: 55, action: "RESTRICT NIGHT MOVEMENT" },
  { id: "koh-imp", from: "koh", to: "imp", highway: "NH-2", lengthKm: 137, risk: 77, flood: 39, landslide: 88, blockage: 72, traffic: "Severe", trafficScore: 84, logisticsLoad: 64, action: "CRITICAL — REROUTE IMMEDIATELY" },
  { id: "imp-aiz", from: "imp", to: "aiz", highway: "NH-102B", lengthKm: 380, risk: 59, flood: 47, landslide: 68, blockage: 55, traffic: "Moderate", trafficScore: 50, logisticsLoad: 41, action: "CONVOY MOVEMENT ADVISED" },
  { id: "aiz-agt", from: "aiz", to: "agt", highway: "NH-108", lengthKm: 445, risk: 43, flood: 55, landslide: 34, blockage: 29, traffic: "Light", trafficScore: 28, logisticsLoad: 38, action: "MONITOR — CORRIDOR STABLE" },
  { id: "ghy-gan", from: "ghy", to: "gan", highway: "NH-10", lengthKm: 570, risk: 31, flood: 27, landslide: 44, blockage: 19, traffic: "Light", trafficScore: 24, logisticsLoad: 33, action: "NORMAL OPERATIONS" },
  { id: "ghy-agt", from: "ghy", to: "agt", highway: "NH-8", lengthKm: 520, risk: 27, flood: 36, landslide: 18, blockage: 15, traffic: "Light", trafficScore: 31, logisticsLoad: 47, action: "NORMAL OPERATIONS" },
];

export const ROADS: RoadSegment[] = RAW_ROADS.map((r) => {
  const a = cityById(r.from);
  const b = cityById(r.to);
  return {
    ...r,
    name: `${a.name} → ${b.name}`,
    level: levelOf(r.risk),
    path: [[a.lat, a.lng], ...(r.via ?? []), [b.lat, b.lng]] as [number, number][],
  };
});

export const KPIS = [
  { label: "Network Health", value: "92%", delta: "+1.4% vs 24h", tone: "good" as const, icon: "activity" },
  { label: "Active Routes", value: "1,248", delta: "312 in transit", tone: "info" as const, icon: "route" },
  { label: "High Risk Segments", value: "27", delta: "+6 last 6h", tone: "warn" as const, icon: "triangle" },
  { label: "Active Disruptions", value: "8", delta: "3 escalating", tone: "bad" as const, icon: "zap" },
  { label: "Critical Deliveries", value: "146", delta: "23 medical", tone: "info" as const, icon: "package" },
  { label: "Predicted Incidents", value: "13", delta: "next 72 hours", tone: "warn" as const, icon: "brain" },
];

export const RISK_PREDICTIONS = [
  { label: "Flood Risk", value: 67, window: "Next 24h", driver: "Brahmaputra basin surge" },
  { label: "Landslide Risk", value: 82, window: "Next 48h", driver: "Saturated slope index 0.88" },
  { label: "Road Blockage", value: 54, window: "Next 24h", driver: "Debris + repair backlog" },
  { label: "Traffic Risk", value: 71, window: "Next 12h", driver: "Festival convoy density" },
  { label: "Delivery Delay", value: 43, window: "Next 72h", driver: "Hub throughput lag" },
];

export const RAINFALL_TREND = [
  { day: "Mon", rainfall: 42, forecast: 40 },
  { day: "Tue", rainfall: 68, forecast: 64 },
  { day: "Wed", rainfall: 96, forecast: 91 },
  { day: "Thu", rainfall: 154, forecast: 148 },
  { day: "Fri", rainfall: 189, forecast: 196 },
  { day: "Sat", rainfall: 132, forecast: 141 },
  { day: "Sun", rainfall: 108, forecast: 117 },
];

export const RISK_TREND = [
  { day: "Mon", flood: 31, landslide: 44, traffic: 52 },
  { day: "Tue", flood: 38, landslide: 51, traffic: 55 },
  { day: "Wed", flood: 47, landslide: 60, traffic: 58 },
  { day: "Thu", flood: 58, landslide: 71, traffic: 66 },
  { day: "Fri", flood: 67, landslide: 82, traffic: 71 },
  { day: "Sat", flood: 61, landslide: 77, traffic: 64 },
  { day: "Sun", flood: 54, landslide: 69, traffic: 59 },
];

export const CONFIDENCE_TREND = [
  { model: "Flood", confidence: 91 },
  { model: "Landslide", confidence: 87 },
  { model: "Blockage", confidence: 78 },
  { model: "Traffic", confidence: 84 },
  { model: "Delay", confidence: 73 },
];

export const NETWORK_HEALTH_TREND = [
  { week: "W1", health: 88, incidents: 9 },
  { week: "W2", health: 84, incidents: 14 },
  { week: "W3", health: 79, incidents: 21 },
  { week: "W4", health: 86, incidents: 12 },
  { week: "W5", health: 90, incidents: 8 },
  { week: "W6", health: 92, incidents: 6 },
];

export const RISK_DISTRIBUTION = [
  { name: "Safe", value: 612, color: "#22c55e" },
  { name: "Moderate", value: 401, color: "#eab308" },
  { name: "High Risk", value: 208, color: "#f97316" },
  { name: "Critical", value: 27, color: "#ef4444" },
];

export const ROUTE_DELAYS = [
  { corridor: "GHY–SHL", delay: 0.6 },
  { corridor: "SHL–CHR", delay: 3.8 },
  { corridor: "KOH–IMP", delay: 4.4 },
  { corridor: "GHY–ITN", delay: 1.9 },
  { corridor: "AIZ–AGT", delay: 1.2 },
  { corridor: "GHY–GAN", delay: 0.8 },
];

export const DISASTER_INCIDENTS = [
  { month: "Apr", flood: 4, landslide: 6, blockage: 3 },
  { month: "May", flood: 9, landslide: 11, blockage: 7 },
  { month: "Jun", flood: 18, landslide: 21, blockage: 14 },
  { month: "Jul", flood: 24, landslide: 26, blockage: 19 },
  { month: "Aug", flood: 16, landslide: 18, blockage: 12 },
  { month: "Sep", flood: 11, landslide: 13, blockage: 8 },
];

export const STATE_RISK = [
  { state: "Meghalaya", risk: 84 },
  { state: "Manipur", risk: 76 },
  { state: "Nagaland", risk: 68 },
  { state: "Mizoram", risk: 57 },
  { state: "Assam", risk: 52 },
  { state: "Arunachal", risk: 61 },
  { state: "Tripura", risk: 38 },
  { state: "Sikkim", risk: 44 },
];

export interface Shipment {
  id: string;
  cargo: string;
  from: string;
  to: string;
  eta: string;
  risk: RiskLevel;
  status: "ON ROUTE" | "DELAYED" | "AT RISK" | "HELD";
  critical: boolean;
  vehicle: string;
  progress: number;
}

export const SHIPMENTS: Shipment[] = [
  { id: "TRK-2048", cargo: "Medicine", from: "Guwahati", to: "Shillong", eta: "2h 18m", risk: "safe", status: "ON ROUTE", critical: true, vehicle: "Refrigerated Truck", progress: 62 },
  { id: "TRK-2051", cargo: "Vaccines", from: "Shillong", to: "Cherrapunji", eta: "1h 44m", risk: "critical", status: "AT RISK", critical: true, vehicle: "Cold Chain Van", progress: 35 },
  { id: "TRK-1907", cargo: "Rice & Grain", from: "Guwahati", to: "Kohima", eta: "6h 05m", risk: "moderate", status: "ON ROUTE", critical: false, vehicle: "Heavy Truck", progress: 41 },
  { id: "TRK-2210", cargo: "Fuel", from: "Kohima", to: "Imphal", eta: "4h 52m", risk: "critical", status: "DELAYED", critical: true, vehicle: "Tanker", progress: 18 },
  { id: "TRK-1788", cargo: "Construction Material", from: "Agartala", to: "Aizawl", eta: "8h 30m", risk: "moderate", status: "ON ROUTE", critical: false, vehicle: "Heavy Truck", progress: 55 },
  { id: "TRK-2302", cargo: "Relief Kits", from: "Guwahati", to: "Itanagar", eta: "5h 12m", risk: "high", status: "AT RISK", critical: true, vehicle: "Container Truck", progress: 27 },
  { id: "TRK-1650", cargo: "Electronics", from: "Guwahati", to: "Agartala", eta: "9h 40m", risk: "safe", status: "ON ROUTE", critical: false, vehicle: "Container Truck", progress: 73 },
  { id: "TRK-2411", cargo: "Oxygen Cylinders", from: "Guwahati", to: "Gangtok", eta: "10h 05m", risk: "moderate", status: "DELAYED", critical: true, vehicle: "Specialised Carrier", progress: 12 },
];

export interface Alert {
  id: string;
  severity: "CRITICAL" | "HIGH" | "MODERATE";
  title: string;
  location: string;
  probability: number;
  time: string;
  detail: string;
  status: "ACTIVE" | "ACKNOWLEDGED" | "INVESTIGATING" | "REROUTED";
}

export const ALERTS: Alert[] = [
  { id: "AL-9001", severity: "CRITICAL", title: "LANDSLIDE RISK DETECTED", location: "Shillong–Cherrapunji", probability: 82, time: "04 min ago", detail: "Slope saturation crossed threshold after 189mm rainfall in 24h. 23 critical deliveries in corridor.", status: "ACTIVE" },
  { id: "AL-9002", severity: "CRITICAL", title: "ROAD BLOCKAGE PREDICTED", location: "Kohima–Imphal (NH-2)", probability: 77, time: "19 min ago", detail: "Debris accumulation and severe congestion projected within 8 hours.", status: "ACTIVE" },
  { id: "AL-9003", severity: "HIGH", title: "FLOOD SURGE WARNING", location: "Brahmaputra Basin — Guwahati", probability: 67, time: "42 min ago", detail: "River level 1.2m above danger mark; low-lying depot approach roads at risk.", status: "ACTIVE" },
  { id: "AL-9004", severity: "HIGH", title: "COLD CHAIN DELAY RISK", location: "Aizawl Cold Chain Node", probability: 58, time: "1h 12m ago", detail: "Inbound vaccine consignment delay may breach temperature window.", status: "ACTIVE" },
  { id: "AL-9005", severity: "MODERATE", title: "TRAFFIC CONGESTION BUILD-UP", location: "Guwahati–Shillong (NH-6)", probability: 44, time: "2h 05m ago", detail: "Festival convoy density rising near Nongpoh corridor.", status: "ACTIVE" },
];

export const SCENARIOS = [
  { id: "blockage", label: "Road Blockage", target: "Block Shillong–Cherrapunji Road", roadId: "shl-chr" },
  { id: "flood", label: "Flood", target: "Brahmaputra flood surge — Guwahati corridor", roadId: "ghy-shl" },
  { id: "landslide", label: "Landslide", target: "Landslide on Kohima–Imphal (NH-2)", roadId: "koh-imp" },
  { id: "rainfall", label: "Heavy Rainfall", target: "Region-wide 200mm+ rainfall event", roadId: "shl-agt" },
  { id: "bridge", label: "Bridge Failure", target: "Bridge failure on Guwahati–Itanagar (NH-15)", roadId: "ghy-itn" },
];
