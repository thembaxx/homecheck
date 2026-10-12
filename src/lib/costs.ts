import type { Place } from "@/lib/places";

export type CostInput = {
  purchasePrice: number;
  depositPct: number;
  annualRate: number;
  termYears: number;
  valuation: number;
  levyMonthly: number;
  electricityMonthly: number;
  waterMonthly: number;
  insuranceMonthly: number;
  maintenanceMonthly: number;
  securityMonthly: number;
  refuseMonthly: number;
  /** Null means “use the municipal tariff on the valuation”. */
  ratesMonthly: number | null;
};

export type CostGroup = "bond" | "rates" | "levy" | "utilities" | "cover";

export type CostLine = {
  key: string;
  label: string;
  monthly: number;
  group: CostGroup;
};

export const PRIME_RATE = 10.5;
export const PRIME_NOTE =
  "The starting interest rate is prime at 10.50%, as Rateweb recorded it in May 2026. Banks price home loans off prime. This is not a quote.";

export function bondInstalment(principal: number, annualRatePct: number, years: number) {
  const n = Math.round(years * 12);
  if (principal <= 0 || n <= 0) return 0;
  const r = annualRatePct / 100 / 12;
  if (r === 0) return principal / n;
  const growth = (1 + r) ** n;
  return (principal * r * growth) / (growth - 1);
}

/** SARS transfer duty on acquisitions from 1 April 2025 (2026 tax year). */
export function transferDuty(value: number) {
  if (value <= 1_210_000) return 0;
  if (value <= 1_663_800) return (value - 1_210_000) * 0.03;
  if (value <= 2_329_300) return 13_614 + (value - 1_663_800) * 0.06;
  if (value <= 2_994_800) return 53_544 + (value - 2_329_300) * 0.08;
  if (value <= 13_310_000) return 106_784 + (value - 2_994_800) * 0.11;
  return 1_241_456 + (value - 13_310_000) * 0.13;
}

export function monthlyRates(valuation: number, centsPerRand: number, rebateRand: number) {
  const taxable = Math.max(0, valuation - rebateRand);
  return (taxable * (centsPerRand / 100)) / 12;
}

export function defaultCosts(place: Place): CostInput {
  return {
    purchasePrice: place.asking,
    depositPct: 10,
    annualRate: PRIME_RATE,
    termYears: 20,
    valuation: place.asking,
    levyMonthly: place.levy,
    electricityMonthly: place.electricity,
    waterMonthly: place.water,
    insuranceMonthly: Math.round((place.asking * 0.002) / 12),
    maintenanceMonthly: Math.round((place.asking * place.maintenanceRate) / 12),
    securityMonthly: place.security,
    refuseMonthly: place.refuse,
    ratesMonthly: null,
  };
}

export function budget(place: Place, cost: CostInput) {
  const price = Math.max(0, cost.purchasePrice);
  const depositPct = Math.min(100, Math.max(0, cost.depositPct));
  const principal = price * (1 - depositPct / 100);
  const bond = bondInstalment(principal, cost.annualRate, cost.termYears);
  const rates =
    cost.ratesMonthly ??
    monthlyRates(Math.max(0, cost.valuation), place.finance.centsPerRand, place.finance.rebateRand);

  const lines: CostLine[] = [
    { key: "bond", label: "Bond", monthly: bond, group: "bond" },
    { key: "rates", label: "Rates", monthly: rates, group: "rates" },
    { key: "refuse", label: "Refuse", monthly: cost.refuseMonthly, group: "rates" },
    { key: "levy", label: "Levy", monthly: cost.levyMonthly, group: "levy" },
    { key: "power", label: "Power", monthly: cost.electricityMonthly, group: "utilities" },
    { key: "water", label: "Water", monthly: cost.waterMonthly, group: "utilities" },
    { key: "insurance", label: "Cover", monthly: cost.insuranceMonthly, group: "cover" },
    { key: "security", label: "Security", monthly: cost.securityMonthly, group: "cover" },
    { key: "upkeep", label: "Upkeep", monthly: cost.maintenanceMonthly, group: "cover" },
  ];

  const total = lines.reduce((sum, line) => sum + line.monthly, 0);
  const duty = transferDuty(price);
  const deposit = price - principal;

  return {
    price,
    principal,
    deposit,
    bond,
    rates,
    lines,
    total,
    duty,
    cashIn: deposit + duty,
  };
}

export const GROUP_LABEL: Record<CostGroup, string> = {
  bond: "Bond",
  rates: "Rates",
  levy: "Levy",
  utilities: "Lights & water",
  cover: "Cover",
};
