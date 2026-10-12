import { kmText } from "@/lib/format";

export type Region = "Coast" | "Highveld" | "Winelands" | "KZN";

export type CrimeRow = { label: string; count: number; delta?: number };

export type Station = {
  name: string;
  lat: number;
  lng: number;
  period: string;
  total: number;
  yoyLabel: string;
  rows: CrimeRow[];
  sourcePath: string;
  sourceUrl: string;
};

export type Finance = {
  name: string;
  year: string;
  opinion: string;
  summary: string;
  centsPerRand: number;
  rebateRand: number;
  tariffNote: string;
  unauthorised?: string;
  water?: string;
  electricity?: string;
  extra?: string;
  sourceNote: string;
};

export type Amenity = { name: string; kind: string; lat: number; lng: number };

export type Commute = {
  to: string;
  mode: string;
  minutes: number | null;
  note: string;
  lat: number;
  lng: number;
};

export type Place = {
  id: string;
  address: string;
  suburb: string;
  city: string;
  province: string;
  region: Region;
  tenure: "Sectional title" | "Freehold";
  beds: number;
  baths: number;
  size: string;
  lat: number;
  lng: number;
  photo: string;
  photoAlt: string;
  asking: number;
  band: string;
  priceNote: string;
  levy: number;
  electricity: number;
  water: number;
  security: number;
  refuse: number;
  /** Share of price set aside per year for maintenance. */
  maintenanceRate: number;
  station: Station;
  finance: Finance;
  amenities: Amenity[];
  commutes: Commute[];
  custom?: boolean;
  matchedFrom?: string;
  matchedKm?: number;
};

const shot = (id: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1400&q=75`;

const STATION_NOTE =
  "SAPS precinct statistics for Apr 2025\u2013Mar 2026, as compiled by SafeSuburb from the SAPS release (updated 29 Aug 2026).";

const capeTown: Finance = {
  name: "City of Cape Town",
  year: "2023-24",
  opinion: "Clean audit",
  summary:
    "The only metropolitan municipality with a clean audit in 2023-24. That is about the city\u2019s books, not about this street\u2019s services.",
  centsPerRand: 0.7159,
  rebateRand: 435_000,
  tariffNote:
    "2025/26 residential rate: 0.7159 cents in the rand. The R435 000 rebate applies to a primary residence. A rental or second home is rated on the full value.",
  water: "Water losses R0.11 billion \u2014 within the 30% norm.",
  electricity: "Electricity losses R0.63 billion \u2014 above the 10% norm.",
  sourceNote:
    "AGSA MFMA general report 2023-24, including the metro water and electricity loss table. Tariff: published 2025/26 residential rates.",
};
