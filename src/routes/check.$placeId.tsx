import { Link, createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { ReportView } from "@/components/report-view";
import { defaultCosts } from "@/lib/costs";
import { resolvePlace, useCheckStore, useStoreReady } from "@/lib/store";

export const Route = createFileRoute("/check/$placeId")({
  head: () => ({
    meta: [
      { title: "Your property check | HomeCheck" },
      { name: "robots", content: "noindex, follow" },
    ],
  }),
  component: CheckPage,
});

function CheckPage() {
  const { placeId } = Route.useParams();
  const ready = useStoreReady();
  const custom = useCheckStore((s) => s.custom);
  const place = resolvePlace(placeId, ready ? custom : {});
  const initial = useMemo(() => (place ? defaultCosts(place) : null), [place]);

  if (!place || !initial) {
    return (
      <div className="mx-auto max-w-lg px-4 pt-16">
        <h1 className="text-4xl font-medium tracking-tight">
          {ready ? "That check is not here" : "Opening this check"}
        </h1>
        <p className="mt-3 text-muted">
          {ready
            ? "It may have been on this device and then cleared. Search again from home."
            : "If you opened a street from the map, it is stored on this device."}
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex h-12 items-center rounded-full bg-ink px-5 text-canvas"
        >
          Back home
        </Link>
      </div>
    );
  }

  return <ReportView key={place.id} place={place} initial={initial} ready={ready} />;
}
