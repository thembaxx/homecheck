import { useEffect, useState } from "react";
import { create } from "zustand";
import type { CostInput } from "@/lib/costs";
import { findStaticPlace, type Place } from "@/lib/places";

type Saved = { costs: CostInput; savedAt: number };

type CheckState = {
  saved: Record<string, Saved>;
  custom: Record<string, Place>;
  compare: string[];
  save: (id: string, costs: CostInput) => void;
  forget: (id: string) => void;
  rememberPlace: (place: Place) => void;
  toggleCompare: (id: string) => void;
};

const KEY = "homecheck";

type Disk = Pick<CheckState, "saved" | "custom" | "compare">;

function readDisk(): Disk {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { saved: {}, custom: {}, compare: [] };
    const parsed = JSON.parse(raw) as Partial<Disk>;
    return {
      saved: parsed.saved ?? {},
      custom: parsed.custom ?? {},
      compare: Array.isArray(parsed.compare) ? parsed.compare : [],
    };
  } catch {
    return { saved: {}, custom: {}, compare: [] };
  }
}

function writeDisk(state: CheckState) {
  try {
    const disk: Disk = { saved: state.saved, custom: state.custom, compare: state.compare };
    localStorage.setItem(KEY, JSON.stringify(disk));
  } catch {
    /* private mode or a full disk — the check still works this session */
  }
}

export const useCheckStore = create<CheckState>()((set, get) => ({
  saved: {},
  custom: {},
  compare: [],
  save: (id, costs) => {
    set((state) => ({
      saved: { ...state.saved, [id]: { costs, savedAt: Date.now() } },
      compare: state.compare.includes(id)
        ? state.compare
        : state.compare.length >= 3
          ? [...state.compare.slice(1), id]
          : [...state.compare, id],
    }));
    writeDisk(get());
  },
  forget: (id) => {
    set((state) => {
      const saved = { ...state.saved };
      delete saved[id];
      return { saved, compare: state.compare.filter((item) => item !== id) };
    });
    writeDisk(get());
  },
  rememberPlace: (place) => {
    set((state) => ({ custom: { ...state.custom, [place.id]: place } }));
    writeDisk(get());
  },
  toggleCompare: (id) => {
    set((state) => {
      if (state.compare.includes(id)) return { compare: state.compare.filter((item) => item !== id) };
      if (state.compare.length >= 3) return { compare: [...state.compare.slice(1), id] };
      return { compare: [...state.compare, id] };
    });
    writeDisk(get());
  },
}));

let hydrated = false;

export function useStoreReady() {
  const [ready, setReady] = useState(hydrated);
  useEffect(() => {
    if (!hydrated) {
      const disk = readDisk();
      useCheckStore.setState((state) => ({
        saved: { ...disk.saved, ...state.saved },
        custom: { ...disk.custom, ...state.custom },
        compare: state.compare.length > 0 ? state.compare : disk.compare,
      }));
      hydrated = true;
    }
    setReady(true);
  }, []);
  return ready;
}

export function resolvePlace(id: string, custom: Record<string, Place>) {
  return findStaticPlace(id) ?? custom[id];
}
