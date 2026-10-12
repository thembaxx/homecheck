import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { ClientOnly } from "@tanstack/react-router";
import { Drawer } from "vaul";
import {
  ArrowLeft,
  ArrowUpRight,
  BookmarkSimple,
  Car,
  FilePdf,
  Lightning,
  MapPin,
  ShieldWarning,
  SlidersHorizontal,
} from "@phosphor-icons/react";
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { budget, defaultCosts, GROUP_LABEL, monthlyRates, PRIME_NOTE, type CostGroup, type CostInput } from "@/lib/costs";
import { kmText, zar, zarCompact } from "@/lib/format";
import { nearbyOsm, refreshStation, type OsmPlace } from "@/lib/live";
import { kmBetween, STATION_SOURCE_NOTE, type Place } from "@/lib/places";
import { useCheckStore } from "@/lib/store";

const MapCard = lazy(() => import("@/components/map-card"));

const FILL: Record<CostGroup, string> = {
  bond: "var(--color-lemon)",
  rates: "var(--color-sage)",
  levy: "var(--color-surface)",
  utilities: "var(--color-ink)",
  cover: "var(--color-muted)",
};

export function ReportView({ place, initial, ready }: { place: Place; initial: CostInput; ready: boolean }) {
  const [costs, setCosts] = useState(initial);
  const [open, setOpen] = useState(false);
  const [liveTotal, setLiveTotal] = useState<number | null>(null);
  const [liveFailed, setLiveFailed] = useState(false);
  const [osm, setOsm] = useState<OsmPlace[] | null>(null);
  const save = useCheckStore((s) => s.save);
  const saved = useCheckStore((s) => s.saved[place.id]);
  const refresh = useServerFn(refreshStation);
  const nearby = useServerFn(nearbyOsm);

  useEffect(() => {
    if (ready && saved) setCosts(saved.costs);
  }, [ready, saved, place.id]);

  useEffect(() => {
    let cancel = false;
    void refresh({ data: place.station.sourcePath }).then((res) => {
      if (cancel) return;
      if (res.ok) setLiveTotal(res.total);
      else setLiveFailed(true);
    });
    void nearby({ data: { lat: place.lat, lng: place.lng } }).then((res) => {
      if (!cancel) setOsm(res.ok ? res.places : []);
    });
    return () => {
      cancel = true;
    };
    // RPC stubs are stable enough; re-fetch only when the pin changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [place.id, place.lat, place.lng, place.station.sourcePath]);

  const model = useMemo(() => budget(place, costs), [place, costs]);
  const slices = useMemo(() => {
    const groups = new Map<CostGroup, number>();
    for (const line of model.lines) {
      groups.set(line.group, (groups.get(line.group) ?? 0) + line.monthly);
    }
    return [...groups.entries()]
      .filter(([, value]) => value > 0)
      .map(([key, value]) => ({ key, name: GROUP_LABEL[key], value }));
  }, [model.lines]);

  const stationKm = kmBetween(place.lat, place.lng, place.station.lat, place.station.lng);
  const tariffRates = monthlyRates(costs.valuation, place.finance.centsPerRand, place.finance.rebateRand);

  async function onPdf() {
    const { downloadReport } = await import("@/lib/pdf");
    await downloadReport(place, costs);
    toast("Report downloaded");
  }

  return (
    <div className="mx-auto grid max-w-6xl gap-6 px-4 pt-4 md:grid-cols-[minmax(0,1fr)_22rem] md:px-8">
      <header className="md:col-start-1 md:row-start-1">
        <div className="flex items-center justify-between">
          <Link
            to="/"
            aria-label="Back"
            className="grid size-12 place-items-center rounded-full bg-surface text-ink"
          >
            <ArrowLeft size={20} />
          </Link>
          <Button tone="surface" size="sm" onClick={() => void onPdf()}>
            <FilePdf size={18} />
            Create a report
          </Button>
        </div>
        <h1 className="mt-6 text-5xl font-medium tracking-tight">{place.suburb}</h1>
        <p className="mt-2 text-muted">{place.address}</p>
        <div className="relative mt-5 overflow-hidden rounded-card">
          <img src={place.photo} alt={place.photoAlt} className="h-80 w-full object-cover" />
          <p className="absolute left-4 top-4 flex items-center gap-2 rounded-full bg-surface px-3 py-1.5 text-sm">
            <span className="size-2 rounded-full bg-lemon" />
            {place.station.name}
          </p>
          <div className="absolute inset-x-3 bottom-3 flex items-center justify-between rounded-3xl bg-surface/90 p-3 backdrop-blur-md">
            <div>
              <p className="text-lg font-medium">{place.tenure}</p>
              <p className="text-sm text-muted">
                {place.beds} bed · {place.baths} bath · {place.size}
              </p>
            </div>
            <span className="grid size-11 place-items-center rounded-full bg-ink text-canvas">
              <ArrowUpRight size={18} />
            </span>
          </div>
        </div>
      </header>

      <aside className="md:sticky md:top-4 md:col-start-2 md:row-start-1 md:row-span-2 md:self-start">
        <section className="rounded-card bg-sage p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm text-muted">If you buy at this price</p>
              <h2 className="text-2xl font-medium">Monthly</h2>
            </div>
            <p className="text-right text-sm text-muted">
              {zarCompact(model.price)}
              <span className="block">{costs.depositPct}% down</span>
            </p>
          </div>
          <div className="pointer-events-none relative mx-auto mt-2 h-56 w-full overflow-hidden">
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={slices}
                  dataKey="value"
                  nameKey="name"
                  innerRadius="68%"
                  outerRadius="100%"
                  startAngle={100}
                  endAngle={-260}
                  stroke="none"
                  paddingAngle={3}
                  cornerRadius={8}
                >
                  {slices.map((slice) => (
                    <Cell key={slice.key} fill={FILL[slice.key]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 grid place-items-center">
              <p className="font-serif text-4xl leading-none tracking-tight tabular-nums">{zar(model.total)}</p>
            </div>
          </div>
          <ul className="mt-4 grid grid-cols-2 gap-2">
            {slices.map((slice) => (
              <li key={slice.key} className="flex items-center gap-2 text-sm">
                <span className="size-2.5 rounded-full" style={{ background: FILL[slice.key] }} />
                <span className="text-muted">{slice.name}</span>
                <span className="ml-auto tabular-nums">{zar(slice.value)}</span>
              </li>
            ))}
          </ul>
        </section>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <Button
            tone="lemon"
            onClick={() => {
              save(place.id, costs);
              toast("Saved for comparison");
            }}
          >
            <BookmarkSimple size={18} weight="fill" />
            {saved ? "Update" : "Save"}
          </Button>
          <Button tone="ink" onClick={() => setOpen(true)}>
            <SlidersHorizontal size={18} />
            Your costs
          </Button>
        </div>
        <p className="mt-3 text-sm text-muted">
          Cash before you move in, deposit plus transfer duty: {zar(model.cashIn)}. Conveyancer fees are extra.
        </p>
      </aside>

      <div className="space-y-8 md:col-start-1">
        {place.custom && place.matchedFrom && (
          <p className="rounded-card bg-lemon px-4 py-3 text-sm">
            This pin is not one of the nine profiled suburbs. Tariffs and the station are borrowed from {place.matchedFrom}
            {place.matchedKm != null ? `, ${kmText(place.matchedKm)} away` : ""}. Type the real price and the rates from the municipal account.
          </p>
        )}

        <section>
          <h2 className="text-2xl font-medium">The month, line by line</h2>
          <ul className="mt-4 grid grid-cols-2 gap-3">
            {model.lines.map((line) => (
              <li key={line.key} className="rounded-card bg-surface p-4">
                <p className="text-sm text-muted">{line.label}</p>
                <p className="mt-1 text-xl font-medium tabular-nums">{zar(line.monthly)}</p>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-sm text-muted">{place.priceNote}</p>
          <p className="mt-1 text-sm text-muted">{place.band}</p>
        </section>

        <section className="rounded-card bg-surface p-5">
          <h2 className="text-2xl font-medium">Cash on transfer</h2>
          <p className="mt-2 font-serif text-4xl tracking-tight tabular-nums">{zar(model.duty)}</p>
          <p className="mt-2 text-sm text-muted">
            Transfer duty on {zar(model.price)}, using the SARS brackets in force from 1 April 2025. Deposit on top of that is {zar(model.deposit)}. A conveyancer will add their own fee. HomeCheck does not estimate it.
          </p>
        </section>

        <section>
          <div className="flex items-end justify-between gap-3">
            <h2 className="text-2xl font-medium">The pin</h2>
            <p className="text-sm text-muted">OpenStreetMap</p>
          </div>
          <div className="mt-4">
            <ClientOnly fallback={<div className="h-72 rounded-card bg-sage" />}>
              <Suspense fallback={<div className="h-72 animate-pulse rounded-card bg-sage" />}>
                <MapCard lat={place.lat} lng={place.lng} label={place.address} amenities={place.amenities} />
              </Suspense>
            </ClientOnly>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-medium">What’s nearby</h2>
          <p className="mt-1 text-sm text-muted">Straight-line distance from the pin. Not a walking route.</p>
          <ul className="mt-4 space-y-2">
            {place.amenities.map((spot) => (
              <li key={spot.name} className="flex items-center gap-3 rounded-card bg-surface px-4 py-3">
                <MapPin size={18} />
                <div>
                  <p className="font-medium">{spot.name}</p>
                  <p className="text-sm text-muted">{spot.kind}</p>
                </div>
                <span className="ml-auto tabular-nums text-sm">
                  {kmText(kmBetween(place.lat, place.lng, spot.lat, spot.lng))}
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-4">
            <h3 className="text-sm font-medium text-muted">OpenStreetMap, just now</h3>
            {osm == null ? (
              <p className="mt-2 text-sm text-muted">Asking Overpass for schools, clinics and supermarkets within 1.5 km.</p>
            ) : osm.length === 0 ? (
              <p className="mt-2 text-sm text-muted">Nothing named came back. The landmarks above are mapped by hand.</p>
            ) : (
              <ul className="mt-2 space-y-2">
                {osm.map((spot) => (
                  <li key={`${spot.name}-${spot.lat}`} className="flex items-center gap-3 text-sm">
                    <span className="size-2 rounded-full bg-lemon" />
                    <span>{spot.name}</span>
                    <span className="text-muted">{spot.kind}</span>
                    <span className="ml-auto tabular-nums">{kmText(kmBetween(place.lat, place.lng, spot.lat, spot.lng))}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        <section className="rounded-card bg-sage p-5">
          <p className="text-sm text-muted">{place.finance.year}</p>
          <h2 className="text-2xl font-medium">{place.finance.name}</h2>
          <p className="mt-3 inline-flex rounded-full bg-lemon px-3 py-1 text-sm font-medium">{place.finance.opinion}</p>
          <p className="mt-3">{place.finance.summary}</p>
          <ul className="mt-4 space-y-2 text-sm">
            {place.finance.unauthorised && <li>{place.finance.unauthorised}</li>}
            {place.finance.water && <li>{place.finance.water}</li>}
            {place.finance.electricity && <li>{place.finance.electricity}</li>}
            {place.finance.extra && <li>{place.finance.extra}</li>}
          </ul>
          <p className="mt-4 text-sm text-muted">{place.finance.tariffNote}</p>
          <p className="mt-2 text-sm text-muted">{place.finance.sourceNote}</p>
        </section>

        <section>
          <div className="flex items-start gap-3">
            <span className="grid size-12 shrink-0 place-items-center rounded-full bg-surface">
              <ShieldWarning size={22} />
            </span>
            <div>
              <h2 className="text-2xl font-medium">Station statistics are not this street</h2>
              <p className="mt-2 text-muted">
                {place.station.name} covers a whole precinct, {kmText(stationKm)} from this pin. The counts below are that station’s year. They are not a safety rating for this erf, and they are not adjusted for how many people the station serves.
              </p>
            </div>
          </div>
          <div className="mt-4 rounded-card bg-surface p-5">
            <p className="text-sm text-muted">{place.station.period}</p>
            <p className="font-serif text-5xl tracking-tight tabular-nums">{place.station.total.toLocaleString("en-ZA")}</p>
            <p className="mt-1 text-sm">{place.station.yoyLabel}</p>
            <ul className="mt-4 divide-y divide-line">
              {place.station.rows.map((row) => (
                <li key={row.label} className="flex items-baseline justify-between gap-3 py-2 text-sm">
                  <span>{row.label}</span>
                  <span className="tabular-nums">
                    {row.count.toLocaleString("en-ZA")}
                    {row.delta != null && (
                      <span className="ml-2 text-muted">{row.delta > 0 ? `+${row.delta}` : row.delta}</span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-sm text-muted">
              {liveTotal != null
                ? `SafeSuburb’s page currently headlines ${liveTotal.toLocaleString("en-ZA")} reported crimes.`
                : liveFailed
                  ? "Could not refresh SafeSuburb just now. The figures above are the 29 Aug 2026 snapshot."
                  : "Checking SafeSuburb for the headline total."}
            </p>
            <a className="mt-2 inline-block text-sm underline" href={place.station.sourceUrl} target="_blank" rel="noreferrer">
              Station page on SafeSuburb
            </a>
            <p className="mt-3 text-sm text-muted">{STATION_SOURCE_NOTE}</p>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-medium">Getting around</h2>
          <ul className="mt-4 space-y-3">
            {place.commutes.map((trip) => (
              <li key={`${trip.to}-${trip.mode}`} className="rounded-card bg-surface p-4">
                <div className="flex items-center gap-2 text-sm text-muted">
                  <Car size={16} />
                  {trip.mode}
                </div>
                <p className="mt-1 text-lg font-medium">
                  {trip.to}
                  {trip.minutes != null && <span className="tabular-nums"> · {trip.minutes} min</span>}
                </p>
                <p className="mt-1 text-sm text-muted">{trip.note}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-card bg-ink p-5 text-canvas">
          <div className="flex items-center gap-2 text-lemon">
            <Lightning size={18} />
            <p className="text-sm">What this is not</p>
          </div>
          <p className="mt-2">
            Not a Property24 listing, not a Private Property advert, and not a Lightstone valuation. HomeCheck will not tell you what the house is worth. It will tell you what the tariff, the bond and the station’s year look like, and leave the gaps labelled.
          </p>
        </section>
      </div>

      <Drawer.Root open={open} onOpenChange={setOpen} shouldScaleBackground={false}>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 z-50 bg-ink/40" />
          <Drawer.Content className="fixed inset-x-0 bottom-0 z-50 max-h-[88vh] rounded-t-card bg-canvas outline-none">
            <div className="mx-auto max-w-lg overflow-y-auto px-4 pb-10 pt-3">
              <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-line" />
              <Drawer.Title className="text-2xl font-medium">Your costs</Drawer.Title>
              <Drawer.Description className="mt-1 text-sm text-muted">
                Every figure here is an assumption you can replace. {PRIME_NOTE}
              </Drawer.Description>
              <div className="mt-5 space-y-4">
                <Field label="Purchase price" value={costs.purchasePrice} onChange={(n) => setCosts({ ...costs, purchasePrice: n })} />
                <Field label="Municipal valuation" value={costs.valuation} onChange={(n) => setCosts({ ...costs, valuation: n })} />
                <label className="block text-sm">
                  Deposit {costs.depositPct}%
                  <input
                    className="mt-2 w-full accent-ink"
                    type="range"
                    min={0}
                    max={40}
                    value={costs.depositPct}
                    onChange={(e) => setCosts({ ...costs, depositPct: Number(e.target.value) })}
                  />
                </label>
                <label className="block text-sm">
                  Interest {costs.annualRate.toFixed(2)}% a year
                  <input
                    className="mt-2 w-full accent-ink"
                    type="range"
                    min={8}
                    max={16}
                    step={0.05}
                    value={costs.annualRate}
                    onChange={(e) => setCosts({ ...costs, annualRate: Number(e.target.value) })}
                  />
                </label>
                <div className="flex gap-2">
                  {[10, 20, 30].map((years) => (
                    <button
                      key={years}
                      type="button"
                      onClick={() => setCosts({ ...costs, termYears: years })}
                      className={`h-11 flex-1 rounded-full text-sm ${costs.termYears === years ? "bg-ink text-canvas" : "bg-surface"}`}
                    >
                      {years} years
                    </button>
                  ))}
                </div>
                <Field label="Levy" value={costs.levyMonthly} onChange={(n) => setCosts({ ...costs, levyMonthly: n })} />
                <div>
                  <Field
                    label="Rates per month"
                    value={costs.ratesMonthly ?? Math.round(tariffRates)}
                    onChange={(n) => setCosts({ ...costs, ratesMonthly: n })}
                  />
                  <button
                    type="button"
                    className="mt-2 text-sm underline"
                    onClick={() => setCosts({ ...costs, ratesMonthly: null })}
                  >
                    Use the {place.finance.name} tariff instead
                  </button>
                </div>
                <Field label="Refuse" value={costs.refuseMonthly} onChange={(n) => setCosts({ ...costs, refuseMonthly: n })} />
                <Field label="Electricity" value={costs.electricityMonthly} onChange={(n) => setCosts({ ...costs, electricityMonthly: n })} />
                <Field label="Water" value={costs.waterMonthly} onChange={(n) => setCosts({ ...costs, waterMonthly: n })} />
                <Field label="Building insurance" value={costs.insuranceMonthly} onChange={(n) => setCosts({ ...costs, insuranceMonthly: n })} />
                <Field label="Armed response" value={costs.securityMonthly} onChange={(n) => setCosts({ ...costs, securityMonthly: n })} />
                <Field label="Upkeep" value={costs.maintenanceMonthly} onChange={(n) => setCosts({ ...costs, maintenanceMonthly: n })} />
                <Button
                  tone="ghost"
                  className="w-full"
                  onClick={() => setCosts(defaultCosts(place))}
                >
                  Reset assumptions
                </Button>
              </div>
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: number; onChange: (n: number) => void }) {
  return (
    <label className="block text-sm">
      {label}
      <input
        inputMode="decimal"
        className="mt-1 h-12 w-full rounded-full bg-surface px-4 text-base tabular-nums outline-none focus-visible:ring-2 focus-visible:ring-ink"
        value={Number.isFinite(value) ? Math.round(value) : 0}
        onChange={(e) => onChange(Number(e.target.value.replace(/[^\d.]/g, "")) || 0)}
      />
    </label>
  );
}
