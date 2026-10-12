import type { ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { BookmarkSimple, ChartBar, House, Plus } from "@phosphor-icons/react";
import { cn } from "@/lib/cn";

const tabs = [
  { to: "/", label: "Home", icon: House, match: (path: string) => path === "/" },
  { to: "/compare", label: "Compare", icon: ChartBar, match: (path: string) => path.startsWith("/compare") },
  { to: "/saved", label: "Saved", icon: BookmarkSimple, match: (path: string) => path.startsWith("/saved") },
] as const;

export function Shell({ children }: { children: ReactNode }) {
  const path = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="min-h-screen pb-28">
      {children}
      <nav className="safe-bottom pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center" aria-label="Primary">
        <div className="pointer-events-auto mb-3 flex items-center gap-1 rounded-full bg-surface p-1.5 shadow-soft">
          {tabs.slice(0, 2).map((tab) => (
            <Tab key={tab.to} {...tab} active={tab.match(path)} />
          ))}
          <Link
            to="/"
            hash="search"
            aria-label="New check"
            className="grid size-12 place-items-center rounded-full bg-lemon text-ink transition-transform duration-150 ease-out active:scale-[0.96]"
          >
            <Plus size={22} weight="bold" />
          </Link>
          {tabs.slice(2).map((tab) => (
            <Tab key={tab.to} {...tab} active={tab.match(path)} />
          ))}
        </div>
      </nav>
    </div>
  );
}

function Tab({
  to,
  label,
  icon: Icon,
  active,
}: {
  to: "/" | "/compare" | "/saved";
  label: string;
  icon: typeof House;
  active: boolean;
}) {
  return (
    <Link
      to={to}
      aria-current={active ? "page" : undefined}
      className={cn(
        "grid size-12 place-items-center rounded-full transition-transform duration-150 ease-out active:scale-[0.96]",
        active ? "bg-ink text-canvas" : "text-ink",
      )}
    >
      <Icon size={22} weight={active ? "fill" : "regular"} />
      <span className="sr-only">{label}</span>
    </Link>
  );
}
