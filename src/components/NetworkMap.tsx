import { useEffect, useRef } from "react";
import { CITIES, ROADS, type RoadSegment } from "@/data/mockData";

export type MapLayer = "risk" | "flood" | "landslide" | "traffic" | "logistics";

export const metricFor = (road: RoadSegment, layer: MapLayer) =>
  layer === "flood"
    ? road.flood
    : layer === "landslide"
      ? road.landslide
      : layer === "traffic"
        ? road.trafficScore
        : layer === "logistics"
          ? road.logisticsLoad
          : road.risk;

export const colorFor = (value: number, layer: MapLayer) => {
  if (layer === "logistics") return value >= 70 ? "#22d3ee" : value >= 45 ? "#38bdf8" : "#64748b";
  if (value >= 75) return "#ef4444";
  if (value >= 55) return "#f97316";
  if (value >= 35) return "#eab308";
  return "#22c55e";
};

interface Props {
  layer?: MapLayer;
  selectedId?: string | null;
  blockedId?: string | null;
  highlightIds?: string[];
  onSelect?: (road: RoadSegment) => void;
  className?: string;
}

export default function NetworkMap({
  layer = "risk",
  selectedId = null,
  blockedId = null,
  highlightIds = [],
  onSelect,
  className = "h-[480px]",
}: Props) {
  const highlightKey = highlightIds.join(",");

  const nodeRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const layersRef = useRef<any[]>([]);
  const selectRef = useRef(onSelect);
  selectRef.current = onSelect;

  useEffect(() => {
    let cancelled = false;
    let ro: ResizeObserver | undefined;

    (async () => {
      const L = (await import("leaflet")).default;
      if (cancelled || !nodeRef.current || mapRef.current) return;

      const map = L.map(nodeRef.current, {
        center: [25.6, 92.2],
        zoom: 7,
        zoomControl: true,
        attributionControl: false,
        scrollWheelZoom: true,
      });
      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 18,
        className: "ner-tiles",
      }).addTo(map);
      mapRef.current = map;

      ro = new ResizeObserver(() => map.invalidateSize());
      ro.observe(nodeRef.current);
      setTimeout(() => map.invalidateSize(), 200);
      draw(L, map);
    })();

    return () => {
      cancelled = true;
      ro?.disconnect();
      mapRef.current?.remove();
      mapRef.current = null;
      layersRef.current = [];
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function draw(L: any, map: any) {
    layersRef.current.forEach((l) => map.removeLayer(l));
    layersRef.current = [];

    const hasHighlight = highlightIds.length > 0;
    const bounds: [number, number][] = [];

    ROADS.forEach((road) => {
      const value = metricFor(road, layer);
      const blocked = blockedId === road.id;
      const highlighted = hasHighlight && highlightIds.includes(road.id);
      if (highlighted) bounds.push(...road.path);
      const color = blocked ? "#ef4444" : highlighted ? "#22d3ee" : colorFor(value, layer);
      const line = L.polyline(road.path, {
        color,
        weight: selectedId === road.id || blocked || highlighted ? 8 : 4.5,
        opacity: blocked || highlighted ? 1 : hasHighlight ? 0.22 : 0.85,
        dashArray: blocked ? "10 8" : undefined,
        lineCap: "round",
      })

        .addTo(map)
        .bindTooltip(
          `<b>${road.name}</b><br/>${road.highway} · ${layer.toUpperCase()} ${value}%`,
          { className: "ner-tip", direction: "top" },
        )
        .on("click", () => selectRef.current?.(road));
      layersRef.current.push(line);

      if (blocked) {
        const mid = road.path[Math.floor(road.path.length / 2)]!;
        const marker = L.circleMarker(mid, {
          radius: 11,
          color: "#ef4444",
          fillColor: "#ef4444",
          fillOpacity: 0.35,
          weight: 3,
        })
          .addTo(map)
          .bindTooltip("BLOCKED", { permanent: true, direction: "top", className: "ner-tip" });
        layersRef.current.push(marker);
      }
    });

    CITIES.forEach((city) => {
      const isHub = !!city.hub;
      const emphasise = layer === "logistics" && isHub;
      const marker = L.circleMarker([city.lat, city.lng], {
        radius: emphasise ? 10 : isHub ? 7 : 5,
        color: emphasise ? "#22d3ee" : isHub ? "#38bdf8" : "#94a3b8",
        fillColor: emphasise ? "#22d3ee" : isHub ? "#0ea5e9" : "#cbd5e1",
        fillOpacity: 0.9,
        weight: 2,
      })
        .addTo(map)
        .bindTooltip(
          `<b>${city.name}</b><br/>${city.state}${city.hubType ? ` · ${city.hubType}` : ""}`,
          { direction: "top", className: "ner-tip" },
        );
      layersRef.current.push(marker);
    });

    if (bounds.length) {
      map.fitBounds(L.latLngBounds(bounds).pad(0.35), { animate: true });
    }
  }

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const L = (await import("leaflet")).default;
      if (cancelled || !mapRef.current) return;
      draw(L, mapRef.current);
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [layer, selectedId, blockedId, highlightKey]);


  return (
    <div
      ref={nodeRef}
      className={`w-full overflow-hidden rounded-xl border border-border bg-card ${className}`}
    />
  );
}
