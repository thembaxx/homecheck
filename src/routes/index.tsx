import { lazy, Suspense, useEffect, useRef, useState, type FormEvent } from "react";
import { ClientOnly, Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { ArrowUpRight, MagnifyingGlass } from "@phosphor-icons/react";
import { motion, useReducedMotion } from "motion/react";
import { Mark } from "@/components/logo";
import { Button } from "@/components/ui/button";
import type { HouseLayers } from "@/components/house-scene";
import { zarCompact } from "@/lib/format";
import { searchMap } from "@/lib/live";
import { filterPlaces, materialise, REGIONS, type GeoHit, type Region } from "@/lib/places";
import { useCheckStore } from "@/lib/store";

const HouseScene = lazy(() => import("@/components/house-scene"));

const LAYERS: Array<{ key: keyof HouseLayers; label: string }> = [
  { key: "boundary", label: "Wall" },
  { key: "power", label: "Solar" },
  { key: "water", label: "Tank" },
  { key: "garden", label: "Tree" },
];

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const reduce = useReducedMotion();
  const navigate = useNavigate();
  const hash = useRouterState({ select: (s) => s.location.hash });
  const inputRef = useRef<HTMLInputElement>(null);
  const lookup = useServerFn(searchMap);
  const rememberPlace = useCheckStore((s) => s.rememberPlace);
  const [region, setRegion] = useState<Region | "All">("All");
  const [query, setQuery] = useState("");
  const [hits, setHits] = useState<GeoHit[] | null>(null);
  const [lookupNote, setLookupNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [layers, setLayers] = useState<HouseLayers>({
    boundary: true,
    power: true,
    water: true,
    garden: true,
  });

  useEffect(() => {
    if (hash === "search") inputRef.current?.focus();
  }, [hash]);

  const places = filterPlaces(region, query);

  async function onSearch(e: FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (q.length < 3) {
      setLookupNote("Type at least a suburb or a street.");
      return;
    }
    setBusy(true);
    setLookupNote("");
    try {
      const res = await lookup({ data: q });
      setHits(res.results);
      if (!res.ok) setLookupNote(res.message ?? "The map directory did not answer.");
      else if (res.results.length === 0) setLookupNote("No South African match on OpenStreetMap.");
    } catch {
      setLookupNote("The map directory did not answer.");
      setHits([]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 md:px-8">
      <header className="flex items-center justify-between pt-5">
        <Link to="/" className="flex items-center gap-2 text-ink">
          <Mark />
          <span className="font-serif text-2xl tracking-tight">HomeCheck</span>
        </Link>
        <a href="#pricing" className="text-sm font-medium">
          R99–R299
        </a>
      </header>

      <section className="mt-8 grid items-start gap-8 md:grid-cols-2">
        <div>
          <p className="text-sm text-muted">Property intelligence for people buying, not listing.</p>
          <h1 className="mt-2 text-4xl font-medium tracking-tight md:text-6xl">
            Hello. What will this house cost to live in?
          </h1>
          <p className="mt-4 max-w-md text-lg text-muted">
            Listings show the kitchen. HomeCheck adds the bond, the rates, the city’s audit, and the police station’s year — with the limits written on the page.
          </p>
          <div className="mt-6 flex items-center gap-4">
            <div
              className="grid size-24 shrink-0 place-items-center rounded-full"
              style={{
                background: "conic-gradient(var(--color-lemon) 0 12.5%, var(--color-line) 12.5% 100%)",
              }}
              aria-hidden="true"
            >
              <div className="grid size-16 place-items-center rounded-full bg-canvas">
                <span className="font-serif text-xl">1/8</span>
              </div>
            </div>
            <p className="max-w-xs text-sm">
              <span className="font-medium">One metro had a clean audit in 2023-24.</span> Cape Town. Johannesburg, eThekwini and the others did not. That is the kind of fact a listing leaves out.
            </p>
          </div>

          <form id="search" onSubmit={(e) => void onSearch(e)} className="mt-6">
            <label className="sr-only" htmlFor="address">
              Suburb or street
            </label>
            <div className="flex gap-2">
              <div className="flex h-12 min-w-0 flex-1 items-center gap-2 rounded-full bg-surface px-4">
                <MagnifyingGlass size={18} />
                <input
                  id="address"
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Sea Point, Brooklyn, 4th Avenue…"
                  className="min-w-0 flex-1 bg-transparent outline-none"
                />
              </div>
              <Button type="submit" tone="ink" disabled={busy}>
                {busy ? "Looking" : "Map"}
              </Button>
            </div>
          </form>
          <div className="mt-3 flex gap-2 overflow-x-auto">
            {REGIONS.map((item) => {
              const on = item === region;
              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => setRegion(item)}
                  className={`relative h-11 shrink-0 overflow-hidden rounded-full px-4 text-sm ${on ? "text-canvas" : "bg-surface text-ink"}`}
                >
                  {on && (
                    <motion.span
                      layoutId="region-pill"
                      className="absolute inset-0 bg-ink"
                      transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 380, damping: 34 }}
                    />
                  )}
                  <span className="relative">{item}</span>
                </button>
              );
            })}
          </div>
          {lookupNote && <p className="mt-3 text-sm text-muted">{lookupNote}</p>}
        </div>

        <div className="relative h-96 overflow-hidden rounded-card bg-sage">
          <ClientOnly fallback={<div className="h-full" />}>
            <Suspense fallback={<div className="h-full" />}>
              <HouseScene layers={layers} motionOn={!reduce} />
            </Suspense>
          </ClientOnly>
          <div className="absolute inset-x-3 bottom-3 flex flex-wrap gap-2">
            {LAYERS.map((layer) => {
              const on = layers[layer.key];
              return (
                <button
                  key={layer.key}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setLayers((prev) => ({ ...prev, [layer.key]: !prev[layer.key] }))}
                  className={`h-11 rounded-full px-4 text-sm ${on ? "bg-lemon text-ink" : "bg-surface/90 text-ink"}`}
                >
                  {layer.label}
                </button>
              );
            })}
          </div>
          <p className="absolute left-4 top-4 max-w-48 text-sm">Drag the erf. The listing never shows the wall, the tank or the meter.</p>
        </div>
      </section>

      {hits && hits.length > 0 && (
        <section className="mt-8">
          <h2 className="text-lg font-medium">From OpenStreetMap</h2>
          <ul className="mt-3 space-y-2">
            {hits.map((hit, index) => (
              <motion.li
                key={`${hit.lat}-${hit.lng}`}
                initial={reduce ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 380, damping: 34, delay: reduce ? 0 : index * 0.04 }}
              >
                <button
                  type="button"
                  className="flex w-full items-center justify-between gap-3 rounded-card bg-surface px-4 py-3 text-left"
                  onClick={() => {
                    const place = materialise(hit);
                    rememberPlace(place);
                    void navigate({ to: "/check/$placeId", params: { placeId: place.id } });
                  }}
                >
                  <span>
                    <span className="block font-medium">{hit.label}</span>
                    <span className="text-sm text-muted">{hit.province || "South Africa"}</span>
                  </span>
                  <ArrowUpRight size={18} />
                </button>
              </motion.li>
            ))}
          </ul>
        </section>
      )}

      <section className="mt-10">
        <div className="flex items-end justify-between">
          <h2 className="text-2xl font-medium">Nine places to open</h2>
          <p className="text-sm text-muted">{places.length}</p>
        </div>
        <div className="mt-4 flex gap-3 overflow-x-auto pb-2 md:grid md:grid-cols-3 md:overflow-visible">
          {places.map((place, index) => (
            <motion.article
              key={place.id}
              className="w-72 shrink-0 md:w-auto"
              initial={reduce ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: index * 0.04 }}
            >
              <Link to="/check/$placeId" params={{ placeId: place.id }} className="block">
                <div className="relative h-64 overflow-hidden rounded-card">
                  <img src={place.photo} alt={place.photoAlt} className="h-full w-full object-cover" />
                  <p className="absolute left-3 top-3 flex items-center gap-2 rounded-full bg-surface px-3 py-1 text-sm">
                    <span className="size-2 rounded-full bg-lemon" />
                    {place.tenure === "Freehold" ? "Freehold" : "Sectional"}
                  </p>
                  <div className="absolute inset-x-3 bottom-3 flex items-center justify-between rounded-3xl bg-surface/90 p-3 backdrop-blur-md">
                    <div>
                      <p className="font-medium">{place.suburb}</p>
                      <p className="text-sm text-muted">
                        {place.city} · {zarCompact(place.asking)}
                      </p>
                    </div>
                    <span className="grid size-10 place-items-center rounded-full bg-ink text-canvas">
                      <ArrowUpRight size={16} />
                    </span>
                  </div>
                </div>
              </Link>
            </motion.article>
          ))}
        </div>
        {places.length === 0 && (
          <p className="mt-4 text-muted">Nothing in this set matches. Search the map for a street.</p>
        )}
      </section>

      <section id="pricing" className="mt-14">
        <h2 className="text-2xl font-medium">What a report costs</h2>
        <p className="mt-2 max-w-xl text-muted">
          This preview includes the full check so you can judge it. Nothing is charged here.
        </p>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {[
            { price: "R99", name: "Snapshot", text: "One address. Amenities, commute assumptions, municipal opinion." },
            { price: "R199", name: "Buyer report", text: "Your bond, rates and levy, a PDF, and the station year with its limits.", lemon: true },
            { price: "R299", name: "Compare pack", text: "Three addresses side by side, so the cheaper listing can lose." },
          ].map((tier) => (
            <article key={tier.name} className={`rounded-card p-5 ${tier.lemon ? "bg-lemon" : "bg-surface"}`}>
              <p className="text-sm">{tier.name}</p>
              <p className="font-serif text-4xl tracking-tight">{tier.price}</p>
              <p className="mt-2 text-sm">{tier.text}</p>
            </article>
          ))}
        </div>
      </section>

      <footer className="mt-14 space-y-2 pb-4 text-sm text-muted">
        <p>
          Photographs are from Unsplash and are not these addresses. Crime figures are SAPS precinct totals via SafeSuburb, not a street score. Municipal opinions are from the Auditor-General’s 2023-24 MFMA report, except Stellenbosch’s 2024-25 audit. Prime is 10.50% as of May 2026.
        </p>
        <p>HomeCheck does not value property and does not take a payment in this preview.</p>
      </footer>
    </div>
  );
}
