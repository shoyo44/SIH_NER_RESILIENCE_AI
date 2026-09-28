// SIMULATED SHARED STATE — alert queue shared between the alerts page,
// the notifications drawer and any other consumer.
import { useSyncExternalStore } from "react";
import { ALERTS, ROADS, type Alert } from "@/data/mockData";

let alerts: Alert[] = ALERTS.map((a) => ({ ...a }));
const listeners = new Set<() => void>();

const emit = () => listeners.forEach((l) => l());

export const subscribe = (fn: () => void) => {
  listeners.add(fn);
  return () => listeners.delete(fn);
};

export const getAlerts = () => alerts;

export const setAlertStatus = (id: string, status: Alert["status"]) => {
  alerts = alerts.map((a) => (a.id === id ? { ...a, status } : a));
  emit();
};

export function useAlerts(): Alert[] {
  return useSyncExternalStore(subscribe, getAlerts, getAlerts);
}

// Maps an alert to the corridor it affects, so REROUTE can pre-fill the optimizer.
export const ALERT_ROAD: Record<string, string> = {
  "AL-9001": "shl-chr",
  "AL-9002": "koh-imp",
  "AL-9003": "ghy-shl",
  "AL-9004": "imp-aiz",
  "AL-9005": "ghy-shl",
};

export const roadForAlert = (alertId: string) =>
  ROADS.find((r) => r.id === ALERT_ROAD[alertId]) ?? null;
