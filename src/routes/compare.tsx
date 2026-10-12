import { Link, createFileRoute } from "@tanstack/react-router";
import { budget } from "@/lib/costs";
import { zar } from "@/lib/format";
import { resolvePlace, useCheckStore, useStoreReady } from "@/lib/store";

export const Route = createFileRoute("/compare")({ component: ComparePage });

function ComparePage() {
  const ready = useStoreReady();
  const saved = useCheckStore((s) => s.saved);
  const custom = useCheckStore((s) => s.custom);
  const compare = useCheckStore((s) => s.compare);
  const toggle = useCheckStore((s) => s.toggleCompare);
  const ids = Object.keys(saved);

  return (
    <div className="mx-auto max-w-6xl px-4 pt-6 md:px-8">
      <h1 className="text-5xl font-medium tracking-tight">Compare</h1>
      <p className="mt-2 max-w-xl text-muted">
        Up to three saved checks. The cheaper purchase price is not always the cheaper month.
      </p>
      {!ready && ids.length === 0 ? (
        <p className="mt-8 text-muted">Opening your saved checks.</p>
      ) : ids.length < 2 ? (
        <div className="mt-8 rounded-card bg-sage p-6">
          <p className="text-2xl font-medium">Save two addresses first.</p>
          <p className="mt-2 text-muted">Open a place, set the price you were quoted, and tap Save.</p>
          <Link to="/" className="mt-5 inline-flex h-12 items-center rounded-full bg-ink px-5 text-canvas">
            Find an address
          </Link>
        </div>
      ) : (
        <>
          <div className="mt-5 flex gap-2 overflow-x-auto">
            {ids.map((id) => {
              const place = resolvePlace(id, custom);
              const on = compare.includes(id);
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => toggle(id)}
                  className={`h-11 shrink-0 rounded-full px-4 text-sm ${on ? "bg-ink text-canvas" : "bg-surface"}`}
                >
                  {place?.suburb ?? id}
                </button>
              );
            })}
          </div>
          <div className="mt-5 flex gap-3 overflow-x-auto pb-4">
            {compare.map((id) => {
              const place = resolvePlace(id, custom);
              const costs = saved[id]?.costs;
              if (!place || !costs) return null;
              const model = budget(place, costs);
              return (
                <Link
                  key={id}
                  to="/check/$placeId"
                  params={{ placeId: id }}
                  className="w-72 shrink-0 rounded-card bg-surface p-5"
                >
                  <p className="text-sm text-muted">{place.city}</p>
                  <h2 className="text-2xl font-medium">{place.suburb}</h2>
                  <p className="mt-4 font-serif text-4xl tracking-tight tabular-nums">{zar(model.total)}</p>
                  <p className="text-sm text-muted">a month</p>
                  <dl className="mt-4 space-y-2 text-sm">
                    <Row label="Price" value={zar(model.price)} />
                    <Row label="Bond" value={zar(model.bond)} />
                    <Row label="Rates" value={zar(model.rates)} />
                    <Row label="Levy" value={zar(costs.levyMonthly)} />
                    <Row label="Transfer duty" value={zar(model.duty)} />
                    <Row label="Audit" value={place.finance.opinion} />
                    <Row label="Station year" value={place.station.total.toLocaleString("en-ZA")} />
                  </dl>
                </Link>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-muted">{label}</dt>
      <dd className="text-right">{value}</dd>
    </div>
  );
}
