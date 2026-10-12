import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";
import type { Amenity } from "@/lib/places";

export default function MapCard({
  lat,
  lng,
  label,
  amenities,
}: {
  lat: number;
  lng: number;
  label: string;
  amenities: Amenity[];
}) {
  const ref = useRef<HTMLDivElement>(null);
  const mapRef = useRef<import("leaflet").Map | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let dead = false;
    void import("leaflet").then((L) => {
      if (dead || !ref.current) return;
      const map = L.map(ref.current, {
        zoomControl: false,
        scrollWheelZoom: false,
        attributionControl: true,
      }).setView([lat, lng], 15);
      mapRef.current = map;
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap",
        maxZoom: 19,
      }).addTo(map);
      const pin = L.divIcon({
        className: "",
        html: `<div class="hc-pin"></div>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8],
      });
      L.marker([lat, lng], { icon: pin, title: label }).addTo(map);
      const dot = L.divIcon({
        className: "",
        html: `<div class="hc-dot"></div>`,
        iconSize: [10, 10],
        iconAnchor: [5, 5],
      });
      for (const spot of amenities) {
        L.marker([spot.lat, spot.lng], { icon: dot, title: spot.name }).addTo(map);
      }
      window.setTimeout(() => map.invalidateSize(), 180);
    });
    return () => {
      dead = true;
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [lat, lng, label, amenities]);

  return (
    <div className="overflow-hidden rounded-card bg-sage">
      <div ref={ref} className="h-72" />
      <div className="flex gap-2 p-3">
        <button
          type="button"
          className="h-11 flex-1 rounded-full bg-surface text-sm font-medium"
          onClick={() => mapRef.current?.zoomIn()}
        >
          Closer
        </button>
        <button
          type="button"
          className="h-11 flex-1 rounded-full bg-surface text-sm font-medium"
          onClick={() => mapRef.current?.zoomOut()}
        >
          Wider
        </button>
      </div>
    </div>
  );
}
