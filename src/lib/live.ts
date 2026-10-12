import { createServerFn } from "@tanstack/react-start";
import type { GeoHit } from "@/lib/places";

const UA = "HomeCheck/1.0 (South African buyer due-diligence; educational preview)";

type Nom = {
  lat: string;
  lon: string;
  display_name: string;
  address?: {
    house_number?: string;
    road?: string;
    suburb?: string;
    neighbourhood?: string;
    village?: string;
    town?: string;
    city?: string;
    municipality?: string;
    state?: string;
  };
};

const geoCache = new Map<string, GeoHit[]>();

function clean(q: string) {
  const s = q.trim().replace(/\s+/g, " ");
  if (s.length < 3 || s.length > 140) throw new Error("Type a fuller address.");
  return s;
}

export const searchMap = createServerFn({ method: "GET" })
  .validator((q: string) => clean(q))
  .handler(async ({ data }) => {
    const key = data.toLowerCase();
    const hit = geoCache.get(key);
    if (hit) return { ok: true as const, results: hit };
    const url = new URL("https://nominatim.openstreetmap.org/search");
    url.searchParams.set("format", "jsonv2");
    url.searchParams.set("addressdetails", "1");
    url.searchParams.set("countrycodes", "za");
    url.searchParams.set("limit", "5");
    url.searchParams.set("q", data);
    try {
      const res = await fetch(url, {
        headers: { Accept: "application/json", "User-Agent": UA },
        signal: AbortSignal.timeout(8000),
      });
      if (!res.ok) return { ok: false as const, results: [] as GeoHit[], message: "The map directory is busy." };
      const rows = (await res.json()) as Nom[];
      const results: GeoHit[] = rows
        .map((row) => {
          const lat = Number(row.lat);
          const lng = Number(row.lon);
          if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
          const a = row.address ?? {};
          const line = [a.house_number, a.road].filter(Boolean).join(" ");
          const suburb = a.suburb || a.neighbourhood || a.village || "";
          const city = a.city || a.town || a.municipality || "";
          const label = [line, suburb, city].filter(Boolean).join(", ") || row.display_name;
          return {
            label,
            lat,
            lng,
            suburb,
            city,
            province: a.state || "",
          };
        })
        .filter((row): row is GeoHit => row !== null);
      geoCache.set(key, results);
      return { ok: true as const, results };
    } catch {
      return { ok: false as const, results: [] as GeoHit[], message: "Could not reach the map directory." };
    }
  });

export const refreshStation = createServerFn({ method: "GET" })
  .validator((path: string) => {
    if (!path.startsWith("/") || path.includes("..") || path.length > 180) {
      throw new Error("Unknown station.");
    }
    return path;
  })
  .handler(async ({ data }) => {
    try {
      const res = await fetch(`https://safesuburb.co.za${data}`, {
        headers: { Accept: "text/html", "User-Agent": UA },
        signal: AbortSignal.timeout(8000),
      });
      if (!res.ok) return { ok: false as const };
      const html = await res.text();
      const patterns = [
        /recorded\s+(?:<[^>]+>\s*)*([\d,]+)\s+crimes/i,
        /([\d,]+)\s+crimes\s+in\s+Apr\s+2025/i,
      ];
      for (const pattern of patterns) {
        const match = html.match(pattern);
        if (!match?.[1]) continue;
        const total = Number(match[1].replace(/[^\d]/g, ""));
        if (total > 50 && total < 200_000) return { ok: true as const, total };
      }
      return { ok: false as const };
    } catch {
      return { ok: false as const };
    }
  });

export type OsmPlace = { name: string; kind: string; lat: number; lng: number };

export const nearbyOsm = createServerFn({ method: "GET" })
  .validator((input: { lat: number; lng: number }) => {
    if (!Number.isFinite(input.lat) || !Number.isFinite(input.lng)) throw new Error("Bad pin.");
    if (Math.abs(input.lat) > 90 || Math.abs(input.lng) > 180) throw new Error("Bad pin.");
    return { lat: input.lat, lng: input.lng };
  })
  .handler(async ({ data }) => {
    const query = `[out:json][timeout:12];(node["amenity"~"school|hospital|clinic|pharmacy|fuel|university"](around:1500,${data.lat},${data.lng});node["shop"="supermarket"](around:1500,${data.lat},${data.lng}););out body 30;`;
    try {
      const res = await fetch("https://overpass-api.de/api/interpreter", {
        method: "POST",
        headers: { "User-Agent": UA, "Content-Type": "text/plain" },
        body: query,
        signal: AbortSignal.timeout(12000),
      });
      if (!res.ok) return { ok: false as const, places: [] as OsmPlace[] };
      const json = (await res.json()) as {
        elements?: Array<{ lat?: number; lon?: number; tags?: Record<string, string> }>;
      };
      const places: OsmPlace[] = [];
      for (const el of json.elements ?? []) {
        const name = el.tags?.name;
        if (!name || el.lat == null || el.lon == null) continue;
        const kind = el.tags?.amenity || el.tags?.shop || "place";
        places.push({ name, kind, lat: el.lat, lng: el.lon });
        if (places.length >= 8) break;
      }
      return { ok: true as const, places };
    } catch {
      return { ok: false as const, places: [] as OsmPlace[] };
    }
  });
