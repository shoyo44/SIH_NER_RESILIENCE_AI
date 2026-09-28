// SIMULATED SERVICE LAYER
// Every function here returns mock data with an artificial latency so a real
// FastAPI backend can replace the bodies later without touching the UI.

import { ALERTS, ROADS, SCENARIOS, SHIPMENTS, type Alert, type Shipment } from "@/data/mockData";

const delay = <T,>(value: T, ms = 350): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(value), ms));

export interface RouteOption {
  id: "A" | "B" | "C";
  tag: string;
  recommended: boolean;
  duration: string;
  distanceKm: number;
  risk: "LOW" | "MEDIUM" | "HIGH";
  score: number;
  via: string[];
  notes: string;
  carbonSavedKg: number;
}

export interface OptimizeInput {
  origin: string;
  destination: string;
  cargo: string;
  priority: string;
  vehicle: string;
  maxRisk: number;
}

const hash = (s: string) =>
  Math.abs([...s].reduce((a, c) => (a * 31 + c.charCodeAt(0)) | 0, 7));

export function optimizeRoute(input: OptimizeInput): Promise<RouteOption[]> {
  const seed = hash(Object.values(input).join("|"));
  const j = (n: number, spread: number) => n + ((seed >> n % 7) % spread) - Math.floor(spread / 2);
  const priorityBoost = input.priority === "Critical" ? 4 : input.priority === "High" ? 2 : 0;
  const riskPenalty = input.maxRisk < 40 ? 5 : 0;

  return delay(
    [
      {
        id: "A",
        tag: "Fastest",
        recommended: false,
        duration: `${3 + (seed % 2)}h ${String(5 + (seed % 40)).padStart(2, "0")}m`,
        distanceKm: j(103, 12),
        risk: "HIGH",
        score: Math.min(74, j(68, 6) - riskPenalty),
        via: [input.origin, "Nongpoh Bypass", input.destination],
        notes: "Shortest transit time but crosses a slope-instability segment.",
        carbonSavedKg: 4 + (seed % 6),
      },
      {
        id: "B",
        tag: "AI RECOMMENDED",
        recommended: true,
        duration: `${3 + (seed % 2)}h ${String(28 + (seed % 20)).padStart(2, "0")}m`,
        distanceKm: j(118, 10),
        risk: "LOW",
        score: Math.min(98, j(94, 4) + priorityBoost),
        via: [input.origin, "Byrnihat Corridor", "Umiam Ridge", input.destination],
        notes: `Lowest predicted disruption for ${input.cargo.toLowerCase()} under ${input.priority.toLowerCase()} priority.`,
        carbonSavedKg: 18 + (seed % 9),
      },
      {
        id: "C",
        tag: "Alternative",
        recommended: false,
        duration: `${4 + (seed % 2)}h ${String(5 + (seed % 30)).padStart(2, "0")}m`,
        distanceKm: j(146, 14),
        risk: "MEDIUM",
        score: j(81, 6),
        via: [input.origin, "Jorabat", "Mawlai Ring Road", input.destination],
        notes: "Longer but fully avoids flood-prone low-lying stretches.",
        carbonSavedKg: 9 + (seed % 7),
      },
    ],
    700,
  );
}

export interface SimulationResult {
  scenarioId: string;
  headline: string;
  affectedRoutes: number;
  affectedDistricts: number;
  expectedDelay: number;
  criticalDeliveries: number;
  resilience: number;
  alternatives: number;
  chain: string[];
  impactedRoadId: string;
}

const SIM_RESULTS: Record<string, Omit<SimulationResult, "scenarioId">> = {
  blockage: {
    headline: "Shillong–Cherrapunji corridor blocked",
    affectedRoutes: 17, affectedDistricts: 5, expectedDelay: 3.8, criticalDeliveries: 23, resilience: 74, alternatives: 4,
    chain: ["ROAD BLOCKAGE", "TRAFFIC REDISTRIBUTION", "CONGESTION", "DELIVERY DELAY", "CRITICAL SUPPLY IMPACT"],
    impactedRoadId: "shl-chr",
  },
  flood: {
    headline: "Brahmaputra surge floods Guwahati approach roads",
    affectedRoutes: 34, affectedDistricts: 9, expectedDelay: 6.4, criticalDeliveries: 51, resilience: 58, alternatives: 2,
    chain: ["FLOOD INUNDATION", "HUB ACCESS LOSS", "REGIONAL BACKLOG", "MULTI-STATE DELAY", "RELIEF SUPPLY SHORTFALL"],
    impactedRoadId: "ghy-shl",
  },
  landslide: {
    headline: "Landslide severs NH-2 Kohima–Imphal link",
    affectedRoutes: 22, affectedDistricts: 6, expectedDelay: 9.2, criticalDeliveries: 38, resilience: 47, alternatives: 1,
    chain: ["SLOPE FAILURE", "CORRIDOR SEVERED", "FUEL & MEDICINE HOLD", "IMPHAL ISOLATION", "CRITICAL SUPPLY IMPACT"],
    impactedRoadId: "koh-imp",
  },
  rainfall: {
    headline: "Region-wide 200mm+ rainfall event",
    affectedRoutes: 46, affectedDistricts: 12, expectedDelay: 4.6, criticalDeliveries: 64, resilience: 63, alternatives: 6,
    chain: ["EXTREME RAINFALL", "VISIBILITY & SPEED DROP", "NETWORK-WIDE SLOWDOWN", "SCHEDULE SLIPPAGE", "PERISHABLE CARGO LOSS"],
    impactedRoadId: "shl-agt",
  },
  bridge: {
    headline: "Bridge failure on NH-15 to Itanagar",
    affectedRoutes: 11, affectedDistricts: 4, expectedDelay: 12.5, criticalDeliveries: 19, resilience: 39, alternatives: 1,
    chain: ["STRUCTURAL FAILURE", "HARD ROUTE CLOSURE", "300KM DETOUR", "SEVERE DELAY", "CRITICAL SUPPLY IMPACT"],
    impactedRoadId: "ghy-itn",
  },
};

export function runSimulation(scenarioId: string): Promise<SimulationResult> {
  const base = SIM_RESULTS[scenarioId] ?? SIM_RESULTS["blockage"]!;
  return delay({ scenarioId, ...base }, 1600);
}

export const getRoads = () => delay(ROADS);
export const getShipments = (): Promise<Shipment[]> => delay(SHIPMENTS);
export const getAlerts = (): Promise<Alert[]> => delay(ALERTS);
export const getScenarios = () => delay(SCENARIOS);
