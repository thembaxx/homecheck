import { Link, createFileRoute } from "@tanstack/react-router";
import { budget } from "@/lib/costs";
import { zar } from "@/lib/format";
import { resolvePlace, useCheckStore, useStoreReady } from "@/lib/store";

export const Route = createFileRoute("/saved")({
  head: () => ({
    meta: [{ title: "Saved checks | HomeCheck" }, { name: "robots", content: "noindex, follow" }],
  }),
  component: SavedPage,
});

function SavedPage() {
  const ready = useStoreReady();
  const saved = useCheckStore((s) => s.saved);
  const custom = useCheckStore((s) => s.custom);
  const forget = useCheckStore((s) => s.forget);
  const ids = Object.keys(saved).sort(
    (a, b) => (saved[b]?.savedAt ?? 0) - (saved[a]?.savedAt ?? 0),
  );

  return (
    <div className="mx-auto max-w-3xl px-4 pt-6 md:px-8">
      <h1 className="text-5xl font-medium tracking-tight">Saved</h1>
      <p className="mt-2 text-muted">
        Kept on this device. Not an account, and not a valuation file.
      </p>
      {!ready && ids.length === 0 ? (
        <p className="mt-8 text-muted">Opening your saved checks.</p>
      ) : ids.length === 0 ? (
        <div className="mt-8 rounded-card bg-surface p-6">
          <p className="text-2xl font-medium">Nothing saved yet.</p>
          <Link
            to="/"
            className="mt-5 inline-flex h-12 items-center rounded-full bg-lemon px-5 text-ink"
          >
            Start with a suburb
          </Link>
        </div>
      ) : (
        <ul className="mt-6 space-y-3">
          {ids.map((id) => {
            const place = resolvePlace(id, custom);
            const costs = saved[id]?.costs;
            if (!place || !costs) return null;
            const model = budget(place, costs);
            return (
              <li key={id} className="flex gap-3 rounded-card bg-surface p-3">
                <img src={place.photo} alt="" className="h-24 w-24 rounded-3xl object-cover" />
                <div className="min-w-0 flex-1">
                  <Link to="/check/$placeId" params={{ placeId: id }} className="block">
                    <p className="text-lg font-medium">{place.suburb}</p>
                    <p className="truncate text-sm text-muted">{place.address}</p>
                    <p className="mt-1 tabular-nums">{zar(model.total)} / month</p>
                  </Link>
                  <button
                    type="button"
                    className="mt-1 text-sm text-muted underline"
                    onClick={() => forget(id)}
                  >
                    Remove
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
