import { useEffect, useRef, type PointerEvent, type ReactNode } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { BookmarkSimple, ChartBar, House, Plus } from "@phosphor-icons/react";
import { animate, motion, useMotionValue, useReducedMotion } from "motion/react";
import { cn } from "@/lib/cn";

/** Second-order springs fitted to iOS 27 tab-bar touches: x'' + 2ζω x' + ω² x = ω² target. */
const omega = (period: number) => (2 * Math.PI) / period;
const spring = (w: number, zeta: number) => ({
  type: "spring" as const,
  stiffness: w * w,
  damping: 2 * zeta * w,
  mass: 1,
  restDelta: 0.195,
});

const TRAVEL = spring(omega(0.4), 0.85);
const LIFT = spring(omega(0.25), 1);
const PLATTER = spring(omega(0.4), 1);
const PRESS = spring(17.6, 0.59);
const DRAG = spring(32, 0.9);

type Slot = 0 | 1 | 2 | 3;

const tabs = [
  { slot: 0 as const, to: "/" as const, label: "Home", icon: House, match: (path: string) => path === "/" },
  {
    slot: 1 as const,
    to: "/compare" as const,
    label: "Compare",
    icon: ChartBar,
    match: (path: string) => path.startsWith("/compare"),
  },
  {
    slot: 3 as const,
    to: "/saved" as const,
    label: "Saved",
    icon: BookmarkSimple,
    match: (path: string) => path.startsWith("/saved"),
  },
];

function slotForPath(path: string): 0 | 1 | 3 | null {
  if (path === "/") return 0;
  if (path.startsWith("/compare")) return 1;
  if (path.startsWith("/saved")) return 3;
  return null;
}

export function Shell({ children }: { children: ReactNode }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const reduce = useReducedMotion();
  const navigate = useNavigate();
  const platterRef = useRef<HTMLDivElement>(null);
  const slotRefs = useRef<Array<HTMLElement | null>>([null, null, null, null]);
  const lensX = useMotionValue(0);
  const lensOpacity = useMotionValue(0);
  const lensScale = useMotionValue(1);
  const pressScale = useMotionValue(1);
  const restScale = useMotionValue(1);
  const barY = useMotionValue(0);
  const plusScale = useMotionValue(1);
  const drag = useRef({ active: false, moved: false, x: 0, y: 0, pointer: -1 });
  const suppressClick = useRef(false);
  const placed = useRef(false);
  const lag = useRef<number | null>(null);

  function origin(slot: Slot) {
    return slotRefs.current[slot]?.offsetLeft ?? null;
  }

  function goTo(slot: Slot, velocity = 0) {
    if (slot === 2) {
      const back = slotForPath(path);
      const x = back == null ? null : origin(back);
      if (x != null && !reduce) animate(lensX, x, { ...TRAVEL, velocity });
      void navigate({ to: "/", hash: "search" });
      return;
    }
    const x = origin(slot);
    if (x != null) {
      if (reduce) lensX.set(x);
      else animate(lensX, x, { ...TRAVEL, velocity });
      animate(lensOpacity, 1, { duration: reduce ? 0 : 0.12 });
    }
    if (slot === 0) void navigate({ to: "/" });
    else if (slot === 1) void navigate({ to: "/compare" });
    else void navigate({ to: "/saved" });
  }

  useEffect(() => {
    const slot = slotForPath(path);
    const x = slot == null ? null : origin(slot);
    if (drag.current.active) return;
    if (x == null) {
      animate(lensOpacity, 0, { duration: reduce ? 0 : 0.16 });
      return;
    }
    animate(lensOpacity, 1, { duration: reduce ? 0 : 0.12 });
    if (!placed.current || reduce) {
      lensX.set(x);
      placed.current = true;
      return;
    }
    animate(lensX, x, TRAVEL);
  }, [path, reduce, lensOpacity, lensX]);

  useEffect(() => {
    const platter = platterRef.current;
    if (!platter) return;
    const observer = new ResizeObserver(() => {
      if (drag.current.active) return;
      const slot = slotForPath(path);
      const x = slot == null ? null : origin(slot);
      if (x != null) lensX.set(x);
    });
    observer.observe(platter);
    return () => observer.disconnect();
  }, [path, lensX]);

  useEffect(() => {
    if (reduce) return;
    let last = window.scrollY;
    let tucked = false;
    let typing = false;
    const tuck = (away: boolean) => {
      tucked = away;
      animate(barY, away ? 92 : 0, PLATTER);
      animate(restScale, away ? 0.94 : 1, PLATTER);
    };
    const onScroll = () => {
      if (typing) return;
      const y = window.scrollY;
      const dy = y - last;
      last = y;
      if (y < 12) {
        if (tucked) tuck(false);
        return;
      }
      if (dy > 8 && !tucked) tuck(true);
      else if (dy < -8 && tucked) tuck(false);
    };
    const onFocusIn = (event: FocusEvent) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;
      if (target.closest("[data-tabbar]")) return;
      if (!target.matches("input, textarea, select")) return;
      typing = true;
      tuck(true);
    };
    const onFocusOut = () => {
      if (!typing) return;
      typing = false;
      tuck(false);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("focusin", onFocusIn);
    document.addEventListener("focusout", onFocusOut);
    return () => {
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("focusin", onFocusIn);
      document.removeEventListener("focusout", onFocusOut);
    };
  }, [barY, reduce, restScale]);

  function hit(clientX: number): Slot {
    for (const slot of [0, 1, 2, 3] as const) {
      const rect = slotRefs.current[slot]?.getBoundingClientRect();
      if (rect && clientX >= rect.left && clientX <= rect.right) return slot;
    }
    let best: 0 | 1 | 3 = 0;
    let bestDist = Infinity;
    for (const slot of [0, 1, 3] as const) {
      const rect = slotRefs.current[slot]?.getBoundingClientRect();
      if (!rect) continue;
      const dist = Math.abs(clientX - (rect.left + rect.width / 2));
      if (dist < bestDist) {
        best = slot;
        bestDist = dist;
      }
    }
    return best;
  }

  function follow(clientX: number) {
    const platter = platterRef.current;
    const width = slotRefs.current[0]?.offsetWidth ?? 48;
    if (!platter) return;
    const bounds = platter.getBoundingClientRect();
    const max = origin(3) ?? 0;
    const x = Math.min(max, Math.max(0, clientX - bounds.left - width / 2));
    if (lag.current != null) window.clearTimeout(lag.current);
    lag.current = window.setTimeout(() => {
      if (reduce) lensX.set(x);
      else animate(lensX, x, DRAG);
    }, 20);
  }

  function onPointerDown(event: PointerEvent<HTMLDivElement>) {
    if (event.button !== 0) return;
    drag.current = { active: true, moved: false, x: event.clientX, y: event.clientY, pointer: event.pointerId };
    if (!reduce) {
      animate(pressScale, 1.045, PRESS);
      animate(lensScale, 1.08, LIFT);
    }
  }

  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    if (!drag.current.active || event.pointerId !== drag.current.pointer) return;
    const dx = event.clientX - drag.current.x;
    const dy = event.clientY - drag.current.y;
    if (!drag.current.moved) {
      if (Math.hypot(dx, dy) < 8) return;
      if (Math.abs(dy) > Math.abs(dx)) {
        drag.current.active = false;
        releasePress();
        return;
      }
      drag.current.moved = true;
      event.currentTarget.setPointerCapture(event.pointerId);
      animate(lensOpacity, 1, { duration: 0.08 });
    }
    const slot = hit(event.clientX);
    if (!reduce) animate(plusScale, slot === 2 ? 1.08 : 1, LIFT);
    follow(event.clientX);
  }

  function releasePress() {
    if (reduce) return;
    animate(pressScale, 1, PLATTER);
    animate(lensScale, 1, LIFT);
    animate(plusScale, 1, LIFT);
  }

  function onPointerUp(event: PointerEvent<HTMLDivElement>) {
    if (!drag.current.active || event.pointerId !== drag.current.pointer) return;
    const moved = drag.current.moved;
    drag.current.active = false;
    if (lag.current != null) window.clearTimeout(lag.current);
    releasePress();
    if (!moved) return;
    suppressClick.current = true;
    const slot = hit(event.clientX);
    goTo(slot, lensX.getVelocity());
  }

  function onPointerCancel() {
    drag.current.active = false;
    releasePress();
    const slot = slotForPath(path);
    const x = slot == null ? null : origin(slot);
    if (x == null) animate(lensOpacity, 0, { duration: 0.16 });
    else if (reduce) lensX.set(x);
    else animate(lensX, x, TRAVEL);
  }

  const selected = slotForPath(path);

  return (
    <div className="min-h-screen pb-28">
      <motion.div
        key={path}
        initial={reduce ? false : { opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 380, damping: 36, mass: 1 }}
      >
        {children}
      </motion.div>
      <nav
        className="safe-bottom pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center"
        aria-label="Primary"
        data-tabbar
      >
        <motion.div style={{ y: barY, scale: restScale }} className="pointer-events-auto mb-3 origin-bottom">
          <motion.div style={{ scale: pressScale }} className="origin-center">
            <div
              ref={platterRef}
              className="hc-glass relative flex items-center gap-1 rounded-full p-1.5"
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerCancel}
              onClickCapture={(event) => {
                if (!suppressClick.current) return;
                suppressClick.current = false;
                event.preventDefault();
                event.stopPropagation();
              }}
              style={{ touchAction: "pan-y" }}
            >
              <motion.div
                aria-hidden
                className="hc-lens pointer-events-none absolute top-1.5 left-0 z-[1] size-12 rounded-full"
                style={{ x: lensX, scale: lensScale, opacity: lensOpacity }}
              />
              <Tab
                {...tabs[0]}
                selected={selected === 0}
                setRef={(node) => {
                  slotRefs.current[0] = node;
                }}
              />
              <Tab
                {...tabs[1]}
                selected={selected === 1}
                setRef={(node) => {
                  slotRefs.current[1] = node;
                }}
              />
              <Link
                ref={(node) => {
                  slotRefs.current[2] = node;
                }}
                to="/"
                hash="search"
                aria-label="New check"
                className="relative z-10 grid size-12 place-items-center"
              >
                <motion.span
                  style={{ scale: plusScale }}
                  className="grid size-12 place-items-center rounded-full bg-lemon text-ink shadow-[inset_0_1px_0_rgb(255_255_255/0.7)]"
                >
                  <Plus size={22} weight="bold" />
                </motion.span>
              </Link>
              <Tab
                {...tabs[2]}
                selected={selected === 3}
                setRef={(node) => {
                  slotRefs.current[3] = node;
                }}
              />
            </div>
          </motion.div>
        </motion.div>
      </nav>
    </div>
  );
}

function Tab({
  to,
  label,
  icon: Icon,
  selected,
  setRef,
}: {
  to: "/" | "/compare" | "/saved";
  label: string;
  icon: typeof House;
  selected: boolean;
  setRef: (node: HTMLAnchorElement | null) => void;
}) {
  return (
    <Link
      ref={setRef}
      to={to}
      aria-current={selected ? "page" : undefined}
      className={cn(
        "relative z-10 grid size-12 place-items-center rounded-full",
        selected ? "text-ink" : "text-muted",
      )}
    >
      <Icon size={22} weight={selected ? "fill" : "regular"} />
      <span className="sr-only">{label}</span>
    </Link>
  );
}
