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
  "SAPS precinct statistics for Apr 2025–Mar 2026, as compiled by SafeSuburb from the SAPS release (updated 29 Aug 2026).";

const capeTown: Finance = {
  name: "City of Cape Town",
  year: "2023-24",
  opinion: "Clean audit",
  summary:
    "The only metropolitan municipality with a clean audit in 2023-24. That is about the city’s books, not about this street’s services.",
  centsPerRand: 0.7159,
  rebateRand: 435_000,
  tariffNote:
    "2025/26 residential rate: 0.7159 cents in the rand. The R435 000 rebate applies to a primary residence. A rental or second home is rated on the full value.",
  water: "Water losses R0.11 billion — within the 30% norm.",
  electricity: "Electricity losses R0.63 billion — above the 10% norm.",
  sourceNote:
    "AGSA MFMA general report 2023-24, including the metro water and electricity loss table. Tariff: published 2025/26 residential rates.",
};

const johannesburg: Finance = {
  name: "City of Johannesburg",
  year: "2023-24",
  opinion: "Unqualified, with findings",
  summary:
    "Unqualified opinion with findings. AGSA says the city’s financial recovery plan has not yet produced the result it was written for.",
  centsPerRand: 0.9545,
  rebateRand: 300_000,
  tariffNote:
    "2025/26 residential rate: 0.9545 cents in the rand, with a R300 000 rebate. Confirm the category on the valuation roll.",
  unauthorised: "Unauthorised expenditure R2.76 billion — the largest of any metro that year.",
  water: "Water losses R2.90 billion — above the 30% norm.",
  electricity: "Electricity losses R4.93 billion — above the 10% norm.",
  sourceNote: "AGSA MFMA general report 2023-24 and the Gauteng chapter. Tariff: published 2025/26 residential rates.",
};

const tshwane: Finance = {
  name: "City of Tshwane",
  year: "2023-24",
  opinion: "Qualified, with findings",
  summary:
    "Qualified opinion with findings. AGSA also flagged Tshwane for not budgeting enough to maintain its assets.",
  centsPerRand: 1.1712,
  rebateRand: 250_000,
  tariffNote: "2025/26 residential rate: 1.1712 cents in the rand, with a R250 000 rebate.",
  unauthorised: "Unauthorised expenditure R2.15 billion.",
  water: "Water losses R1.33 billion — above the 30% norm.",
  electricity: "Electricity losses R2.53 billion — above the 10% norm.",
  sourceNote: "AGSA MFMA general report 2023-24. Tariff: published 2025/26 residential rates.",
};

const ethekwini: Finance = {
  name: "eThekwini",
  year: "2023-24",
  opinion: "Unqualified, with findings",
  summary:
    "Unqualified opinion with findings. Better institutional capability than some metros, AGSA says, and still short of a clean audit.",
  centsPerRand: 1.4254,
  rebateRand: 120_000,
  tariffNote:
    "2025/26 residential rate: 1.4254 cents in the rand, with a R120 000 rebate — a heavier rate than Cape Town or Johannesburg on the same valuation.",
  water: "Water losses R1.99 billion — above the 30% norm.",
  electricity: "Electricity losses R1.72 billion — above the 10% norm.",
  sourceNote: "AGSA MFMA general report 2023-24. Tariff: published 2025/26 residential rates.",
};

const stellenboschFinance: Finance = {
  name: "Stellenbosch Municipality",
  year: "2024-25",
  opinion: "Unqualified opinion",
  summary:
    "The auditor-general’s opinion for the year ended 30 June 2025 is unmodified. The same report draws attention to large debtor impairments. That is not a clean audit.",
  centsPerRand: 0.4398,
  rebateRand: 250_000,
  tariffNote:
    "Residential tariff R0.004398 in the rand in the municipality’s 2025/26 tariff proposals, and a R250 000 residential reduction in the rates policy approved on 30 May 2025. Confirm the gazetted rate before you offer.",
  extra: "Impairment of consumer receivables: R263.2 million (R268.7 million the year before).",
  sourceNote:
    "Report of the auditor-general on Stellenbosch Municipality for the year ended 30 June 2025. Stellenbosch 2025/26 tariff proposals and rates policy.",
};

const seaPointStation: Station = {
  name: "Sea Point SAPS",
  lat: -33.9156,
  lng: 18.3894,
  period: "Apr 2025–Mar 2026",
  total: 3703,
  yoyLabel: "Up 11.1% vs 2024/25",
  sourcePath: "/western-cape/city-of-cape-town/sea-point/",
  sourceUrl: "https://safesuburb.co.za/western-cape/city-of-cape-town/sea-point/",
  rows: [
    { label: "Theft from a vehicle", count: 1002, delta: 168 },
    { label: "Other theft", count: 839, delta: -5 },
    { label: "Drug-related", count: 629, delta: 180 },
    { label: "Commercial crime", count: 544, delta: 83 },
    { label: "Common assault", count: 117, delta: -9 },
    { label: "Residential burglary", count: 96, delta: -17 },
    { label: "Robbery at a home", count: 2, delta: 2 },
    { label: "Murder", count: 1, delta: 1 },
    { label: "Carjacking", count: 1, delta: 0 },
  ],
};

const claremontStation: Station = {
  name: "Claremont SAPS",
  lat: -33.9806,
  lng: 18.4654,
  period: "Apr 2025–Mar 2026",
  total: 2757,
  yoyLabel: "Down 10% vs 2024/25",
  sourcePath: "/western-cape/city-of-cape-town/claremont/",
  sourceUrl: "https://safesuburb.co.za/western-cape/city-of-cape-town/claremont/",
  rows: [
    { label: "Other theft", count: 745, delta: -79 },
    { label: "Commercial crime", count: 556, delta: -8 },
    { label: "Theft from a vehicle", count: 373, delta: -29 },
    { label: "Shoplifting", count: 243, delta: -23 },
    { label: "Drug-related", count: 197, delta: -43 },
    { label: "Residential burglary", count: 107, delta: -46 },
    { label: "Common assault", count: 104, delta: -13 },
    { label: "Aggravated robbery", count: 85, delta: -21 },
    { label: "Robbery at a home", count: 10, delta: 2 },
    { label: "Carjacking", count: 9, delta: 7 },
    { label: "Murder", count: 0 },
  ],
};

const stellenboschStation: Station = {
  name: "Stellenbosch SAPS",
  lat: -33.9364,
  lng: 18.8612,
  period: "Apr 2025–Mar 2026",
  total: 6650,
  yoyLabel: "Down 8.2% vs 2024/25",
  sourcePath: "/western-cape/cape-winelands/stellenbosch/stellenbosch/",
  sourceUrl: "https://safesuburb.co.za/western-cape/cape-winelands/stellenbosch/stellenbosch/",
  rows: [
    { label: "Other theft", count: 1123, delta: -96 },
    { label: "Drug-related", count: 882, delta: 114 },
    { label: "Theft from a vehicle", count: 862, delta: -326 },
    { label: "Commercial crime", count: 621, delta: -150 },
    { label: "Common assault", count: 552, delta: 2 },
    { label: "Aggravated robbery", count: 465, delta: 46 },
    { label: "Residential burglary", count: 456, delta: 17 },
    { label: "Murder", count: 49, delta: 14 },
  ],
};

const sandtonStation: Station = {
  name: "Sandton SAPS",
  lat: -26.1082,
  lng: 28.0518,
  period: "Apr 2025–Mar 2026",
  total: 6645,
  yoyLabel: "Stable vs 2024/25",
  sourcePath: "/gauteng/johannesburg/sandton/",
  sourceUrl: "https://safesuburb.co.za/gauteng/johannesburg/sandton/",
  rows: [
    { label: "Commercial crime", count: 2056, delta: 90 },
    { label: "Other theft", count: 1202, delta: -19 },
    { label: "Theft from a vehicle", count: 468, delta: -65 },
    { label: "Aggravated robbery", count: 413, delta: -62 },
    { label: "Residential burglary", count: 261 },
    { label: "Robbery at a home", count: 95 },
    { label: "Carjacking", count: 91 },
    { label: "Murder", count: 19 },
  ],
};

const rosebankStation: Station = {
  name: "Rosebank SAPS",
  lat: -26.1464,
  lng: 28.0412,
  period: "Apr 2025–Mar 2026",
  total: 945,
  yoyLabel: "Down 8.5% vs 2024/25",
  sourcePath: "/gauteng/johannesburg/rosebank/",
  sourceUrl: "https://safesuburb.co.za/gauteng/johannesburg/rosebank/",
  rows: [
    { label: "Commercial crime", count: 277, delta: 41 },
    { label: "Other theft", count: 170, delta: -44 },
    { label: "Shoplifting", count: 114, delta: 29 },
    { label: "Theft from a vehicle", count: 53, delta: -45 },
    { label: "Aggravated robbery", count: 50, delta: -16 },
    { label: "Residential burglary", count: 11, delta: -6 },
    { label: "Robbery at a home", count: 7, delta: -2 },
    { label: "Murder", count: 2, delta: 2 },
    { label: "Carjacking", count: 1, delta: -3 },
  ],
};

const parkviewStation: Station = {
  name: "Parkview SAPS",
  lat: -26.1576,
  lng: 28.0278,
  period: "Apr 2025–Mar 2026",
  total: 1637,
  yoyLabel: "Stable vs 2024/25 (1 635)",
  sourcePath: "/gauteng/johannesburg/parkview/",
  sourceUrl: "https://safesuburb.co.za/gauteng/johannesburg/parkview/",
  rows: [
    { label: "Theft from a vehicle", count: 268, delta: 45 },
    { label: "Residential burglary", count: 120, delta: -22 },
    { label: "Robbery at a home", count: 21, delta: -8 },
    { label: "Carjacking", count: 10, delta: 5 },
    { label: "Murder", count: 3, delta: 1 },
  ],
};

const brooklynStation: Station = {
  name: "Brooklyn SAPS",
  lat: -25.7672,
  lng: 28.2362,
  period: "Apr 2025–Mar 2026",
  total: 6286,
  yoyLabel: "Down 6.2% vs 2024/25",
  sourcePath: "/gauteng/tshwane/brooklyn/",
  sourceUrl: "https://safesuburb.co.za/gauteng/tshwane/brooklyn/",
  rows: [
    { label: "Theft from a vehicle", count: 442 },
    { label: "Residential burglary", count: 384 },
    { label: "Common assault", count: 277 },
    { label: "Aggravated robbery", count: 245 },
    { label: "Robbery at a home", count: 77 },
    { label: "Carjacking", count: 18 },
    { label: "Murder", count: 8 },
  ],
};

const durbanNorthStation: Station = {
  name: "Durban North SAPS",
  lat: -29.7832,
  lng: 31.0342,
  period: "Apr 2025–Mar 2026",
  total: 3825,
  yoyLabel: "Stable vs 2024/25 (3 812)",
  sourcePath: "/kwazulu-natal/ethekwini/durban-north/",
  sourceUrl: "https://safesuburb.co.za/kwazulu-natal/ethekwini/durban-north/",
  rows: [
    { label: "Theft from a vehicle", count: 282 },
    { label: "Common assault", count: 252 },
    { label: "Residential burglary", count: 124 },
    { label: "Carjacking", count: 4 },
    { label: "Murder", count: 3 },
    { label: "Robbery at a home", count: 2 },
  ],
};

const priceNote =
  "A working price inside a 2026 asking band buyers see in this suburb. Not a listing, not a Lightstone value, and not what a bank will lend.";

export const PLACES: Place[] = [
  {
    id: "sea-point",
    address: "12 Regent Road, Sea Point",
    suburb: "Sea Point",
    city: "Cape Town",
    province: "Western Cape",
    region: "Coast",
    tenure: "Sectional title",
    beds: 2,
    baths: 2,
    size: "86 m²",
    lat: -33.9186,
    lng: 18.3858,
    photo: shot("photo-1580060839134-75a5edca2e99"),
    photoAlt: "Cape Town and the mountain, for atmosphere. Not this address.",
    asking: 4_850_000,
    band: "Two-bed flats often sit around R3.5m–R7m",
    priceNote,
    levy: 4200,
    electricity: 1400,
    water: 420,
    security: 450,
    refuse: 280,
    maintenanceRate: 0.004,
    station: seaPointStation,
    finance: capeTown,
    amenities: [
      { name: "Sea Point Promenade", kind: "Promenade", lat: -33.9162, lng: 18.3876 },
      { name: "Sea Point Pavilion", kind: "Pool", lat: -33.9196, lng: 18.3852 },
      { name: "Checkers, Regent Road", kind: "Groceries", lat: -33.9174, lng: 18.3866 },
      { name: "Somerset Hospital", kind: "Hospital", lat: -33.9086, lng: 18.4132 },
      { name: "Sea Point High School", kind: "School", lat: -33.9104, lng: 18.393 },
    ],
    commutes: [
      {
        to: "Cape Town CBD",
        mode: "Car, weekday peak",
        minutes: 28,
        note: "Along the Atlantic seaboard. A planning assumption, not live traffic.",
        lat: -33.9249,
        lng: 18.4241,
      },
      {
        to: "Cape Town CBD",
        mode: "Car, Sunday morning",
        minutes: 12,
        note: "Same road, empty. Still an assumption.",
        lat: -33.9249,
        lng: 18.4241,
      },
      {
        to: "Civic Centre",
        mode: "MyCiTi",
        minutes: 22,
        note: "A typical ride, not today’s timetable.",
        lat: -33.9208,
        lng: 18.429,
      },
    ],
  },
  {
    id: "bantry-bay",
    address: "20 Victoria Road, Bantry Bay",
    suburb: "Bantry Bay",
    city: "Cape Town",
    province: "Western Cape",
    region: "Coast",
    tenure: "Sectional title",
    beds: 3,
    baths: 3,
    size: "180 m²",
    lat: -33.9264,
    lng: 18.3768,
    photo: shot("photo-1613490493576-7fde63acd811"),
    photoAlt: "A modern house at dusk, for atmosphere. Not this address.",
    asking: 18_500_000,
    band: "Victoria Road apartments are often R12m–R30m",
    priceNote,
    levy: 8500,
    electricity: 2800,
    water: 700,
    security: 650,
    refuse: 320,
    maintenanceRate: 0.004,
    station: seaPointStation,
    finance: capeTown,
    amenities: [
      { name: "Bantry Bay rocks", kind: "Coast", lat: -33.9272, lng: 18.3754 },
      { name: "Sea Point Promenade", kind: "Promenade", lat: -33.9162, lng: 18.3876 },
      { name: "Somerset Hospital", kind: "Hospital", lat: -33.9086, lng: 18.4132 },
      { name: "Camps Bay beach", kind: "Beach", lat: -33.9508, lng: 18.3778 },
      { name: "Sea Point High School", kind: "School", lat: -33.9104, lng: 18.393 },
    ],
    commutes: [
      {
        to: "Cape Town CBD",
        mode: "Car, weekday peak",
        minutes: 32,
        note: "Victoria Road into Sea Point, then the same seaboard crawl.",
        lat: -33.9249,
        lng: 18.4241,
      },
      {
        to: "Cape Town CBD",
        mode: "Car, Sunday morning",
        minutes: 14,
        note: "Planning assumption, not a routed drive.",
        lat: -33.9249,
        lng: 18.4241,
      },
    ],
  },
  {
    id: "claremont",
    address: "210 Main Road, Claremont",
    suburb: "Claremont",
    city: "Cape Town",
    province: "Western Cape",
    region: "Coast",
    tenure: "Freehold",
    beds: 3,
    baths: 2,
    size: "420 m² erf",
    lat: -33.9815,
    lng: 18.4652,
    photo: shot("photo-1570129477492-45c003edd2be"),
    photoAlt: "A suburban house with a lawn, for atmosphere. Not this address.",
    asking: 6_400_000,
    band: "Family houses nearby are often R4.5m–R9m",
    priceNote,
    levy: 0,
    electricity: 2200,
    water: 780,
    security: 780,
    refuse: 340,
    maintenanceRate: 0.01,
    station: claremontStation,
    finance: capeTown,
    amenities: [
      { name: "Cavendish Square", kind: "Mall", lat: -33.9796, lng: 18.4648 },
      { name: "Claremont station", kind: "Rail", lat: -33.9836, lng: 18.4672 },
      { name: "Arderne Gardens", kind: "Park", lat: -33.9868, lng: 18.4614 },
      { name: "Kingsbury Hospital", kind: "Hospital", lat: -33.9846, lng: 18.4722 },
    ],
    commutes: [
      {
        to: "Cape Town CBD",
        mode: "Car, weekday peak",
        minutes: 45,
        note: "Main Road or the M3. Mornings are often worse than this. Not live traffic.",
        lat: -33.9249,
        lng: 18.4241,
      },
      {
        to: "Cape Town CBD",
        mode: "Car, midday",
        minutes: 22,
        note: "Planning assumption.",
        lat: -33.9249,
        lng: 18.4241,
      },
      {
        to: "Claremont station",
        mode: "Metrorail, Southern line",
        minutes: null,
        note: "The line exists. Do not budget a minute — check the day’s service before you rely on it.",
        lat: -33.9836,
        lng: 18.4672,
      },
    ],
  },
  {
    id: "stellenbosch",
    address: "14 Dorp Street, Stellenbosch",
    suburb: "Stellenbosch",
    city: "Stellenbosch",
    province: "Western Cape",
    region: "Winelands",
    tenure: "Freehold",
    beds: 3,
    baths: 2,
    size: "650 m² erf",
    lat: -33.9378,
    lng: 18.8602,
    photo: shot("photo-1506377247377-2a5b3b417ebb"),
    photoAlt: "Vineyard rows, for atmosphere. Not this address.",
    asking: 7_200_000,
    band: "Town houses often ask R4.5m–R12m",
    priceNote,
    levy: 0,
    electricity: 2100,
    water: 720,
    security: 700,
    refuse: 260,
    maintenanceRate: 0.01,
    station: stellenboschStation,
    finance: stellenboschFinance,
    amenities: [
      { name: "Eikestad Mall", kind: "Mall", lat: -33.9368, lng: 18.8618 },
      { name: "Stellenbosch University", kind: "Campus", lat: -33.9326, lng: 18.864 },
      { name: "Stellenbosch Hospital", kind: "Hospital", lat: -33.9402, lng: 18.8685 },
      { name: "Botanical Garden", kind: "Park", lat: -33.9366, lng: 18.8646 },
      { name: "Stellenbosch station", kind: "Rail", lat: -33.9352, lng: 18.8538 },
    ],
    commutes: [
      {
        to: "Cape Town CBD",
        mode: "Car, weekday peak",
        minutes: 70,
        note: "R310 onto the N1. A planning assumption, not a Friday afternoon guarantee.",
        lat: -33.9249,
        lng: 18.4241,
      },
      {
        to: "Cape Town CBD",
        mode: "Car, off-peak",
        minutes: 45,
        note: "Planning assumption.",
        lat: -33.9249,
        lng: 18.4241,
      },
    ],
  },
  {
    id: "sandton",
    address: "15 Fredman Drive, Sandown",
    suburb: "Sandton",
    city: "Johannesburg",
    province: "Gauteng",
    region: "Highveld",
    tenure: "Sectional title",
    beds: 2,
    baths: 2,
    size: "92 m²",
    lat: -26.1048,
    lng: 28.056,
    photo: shot("photo-1577948000111-9c970dfe3743"),
    photoAlt: "The Johannesburg skyline at dusk, for atmosphere. Not this address.",
    asking: 3_450_000,
    band: "Sandton two-beds often ask R2.2m–R4.8m",
    priceNote,
    levy: 5800,
    electricity: 1600,
    water: 480,
    security: 350,
    refuse: 220,
    maintenanceRate: 0.004,
    station: sandtonStation,
    finance: johannesburg,
    amenities: [
      { name: "Sandton City", kind: "Mall", lat: -26.1076, lng: 28.053 },
      { name: "Gautrain Sandton", kind: "Rail", lat: -26.1079, lng: 28.0578 },
      { name: "Nelson Mandela Square", kind: "Square", lat: -26.1073, lng: 28.0543 },
      { name: "Morningside Clinic", kind: "Hospital", lat: -26.0948, lng: 28.0522 },
    ],
    commutes: [
      {
        to: "OR Tambo",
        mode: "Gautrain",
        minutes: 15,
        note: "Train time Sandton to the airport station, not door to door. Add the walk and the wait.",
        lat: -26.1336,
        lng: 28.2429,
      },
      {
        to: "OR Tambo",
        mode: "Car, weekday peak",
        minutes: 55,
        note: "Via the N1 or Marlboro. Often longer. Not live traffic.",
        lat: -26.1336,
        lng: 28.2429,
      },
      {
        to: "Johannesburg CBD",
        mode: "Car, off-peak",
        minutes: 25,
        note: "Planning assumption.",
        lat: -26.2041,
        lng: 28.0473,
      },
    ],
  },
  {
    id: "rosebank",
    address: "8 Cradock Avenue, Rosebank",
    suburb: "Rosebank",
    city: "Johannesburg",
    province: "Gauteng",
    region: "Highveld",
    tenure: "Sectional title",
    beds: 1,
    baths: 1,
    size: "58 m²",
    lat: -26.1455,
    lng: 28.0402,
    photo: shot("photo-1600607687939-ce8a6c25118c"),
    photoAlt: "A bright modern living room, for atmosphere. Not this address.",
    asking: 2_150_000,
    band: "Rosebank one-beds often ask R1.6m–R3.2m",
    priceNote,
    levy: 3900,
    electricity: 1200,
    water: 380,
    security: 300,
    refuse: 200,
    maintenanceRate: 0.004,
    station: rosebankStation,
    finance: johannesburg,
    amenities: [
      { name: "Rosebank Mall", kind: "Mall", lat: -26.1463, lng: 28.0408 },
      { name: "Gautrain Rosebank", kind: "Rail", lat: -26.1472, lng: 28.034 },
      { name: "The Zone", kind: "Shops", lat: -26.1466, lng: 28.043 },
      { name: "Johannesburg Zoo", kind: "Park", lat: -26.1554, lng: 28.0368 },
    ],
    commutes: [
      {
        to: "Sandton",
        mode: "Gautrain",
        minutes: 5,
        note: "One stop. Station to station, not door to door.",
        lat: -26.1079,
        lng: 28.0578,
      },
      {
        to: "Sandton",
        mode: "Car, weekday peak",
        minutes: 20,
        note: "Oxford or Jan Smuts. Planning assumption.",
        lat: -26.1076,
        lng: 28.0567,
      },
    ],
  },
  {
    id: "parkhurst",
    address: "62 4th Avenue, Parkhurst",
    suburb: "Parkhurst",
    city: "Johannesburg",
    province: "Gauteng",
    region: "Highveld",
    tenure: "Freehold",
    beds: 3,
    baths: 2,
    size: "495 m² erf",
    lat: -26.1398,
    lng: 28.0152,
    photo: shot("photo-1564013799919-ab600027ffc6"),
    photoAlt: "A house with a lawn and a tree, for atmosphere. Not this address.",
    asking: 5_900_000,
    band: "4th Avenue houses often ask R3.5m–R8m",
    priceNote,
    levy: 0,
    electricity: 2300,
    water: 760,
    security: 820,
    refuse: 240,
    maintenanceRate: 0.01,
    station: parkviewStation,
    finance: johannesburg,
    amenities: [
      { name: "4th Avenue shops", kind: "Shops", lat: -26.1412, lng: 28.0146 },
      { name: "Delta Park", kind: "Park", lat: -26.1318, lng: 28.0175 },
      { name: "Emmarentia Dam", kind: "Park", lat: -26.1488, lng: 28.0164 },
      { name: "Parkview SAPS", kind: "Station", lat: -26.1576, lng: 28.0278 },
    ],
    commutes: [
      {
        to: "Sandton",
        mode: "Car, weekday peak",
        minutes: 25,
        note: "Via Jan Smuts or Oxford. Planning assumption.",
        lat: -26.1076,
        lng: 28.0567,
      },
      {
        to: "Rosebank",
        mode: "Car, off-peak",
        minutes: 10,
        note: "Planning assumption.",
        lat: -26.1455,
        lng: 28.0402,
      },
    ],
  },
  {
    id: "brooklyn",
    address: "27 Dey Street, Brooklyn",
    suburb: "Brooklyn",
    city: "Pretoria",
    province: "Gauteng",
    region: "Highveld",
    tenure: "Freehold",
    beds: 3,
    baths: 2,
    size: "900 m² erf",
    lat: -25.7688,
    lng: 28.2378,
    photo: shot("photo-1600585154340-be6161a56a0c"),
    photoAlt: "A contemporary house, for atmosphere. Not this address.",
    asking: 4_750_000,
    band: "Brooklyn houses often ask R3.5m–R8m",
    priceNote,
    levy: 0,
    electricity: 2400,
    water: 800,
    security: 760,
    refuse: 260,
    maintenanceRate: 0.01,
    station: brooklynStation,
    finance: tshwane,
    amenities: [
      { name: "Brooklyn Mall", kind: "Mall", lat: -25.7702, lng: 28.2358 },
      { name: "University of Pretoria", kind: "Campus", lat: -25.7545, lng: 28.2312 },
      { name: "Loftus Versfeld", kind: "Stadium", lat: -25.7533, lng: 28.2228 },
      { name: "Brooklyn Circle", kind: "Shops", lat: -25.767, lng: 28.236 },
    ],
    commutes: [
      {
        to: "Pretoria CBD",
        mode: "Car, weekday peak",
        minutes: 20,
        note: "Toward Church Square. Planning assumption, not live traffic.",
        lat: -25.7463,
        lng: 28.1881,
      },
      {
        to: "Menlyn",
        mode: "Car, weekday peak",
        minutes: 15,
        note: "Planning assumption.",
        lat: -25.7824,
        lng: 28.2756,
      },
    ],
  },
  {
    id: "durban-north",
    address: "47 Broadway, Durban North",
    suburb: "Durban North",
    city: "Durban",
    province: "KwaZulu-Natal",
    region: "KZN",
    tenure: "Freehold",
    beds: 3,
    baths: 2,
    size: "1100 m² erf",
    lat: -29.7885,
    lng: 31.0375,
    photo: shot("photo-1605276374104-dee2a0ed3cd6"),
    photoAlt: "A brick house with a porch, for atmosphere. Not this address.",
    asking: 3_650_000,
    band: "Durban North houses often ask R2.5m–R6m",
    priceNote,
    levy: 0,
    electricity: 2000,
    water: 700,
    security: 740,
    refuse: 300,
    maintenanceRate: 0.01,
    station: durbanNorthStation,
    finance: ethekwini,
    amenities: [
      { name: "Broadway shops", kind: "Shops", lat: -29.7902, lng: 31.0358 },
      { name: "Beachwood", kind: "Coast", lat: -29.7805, lng: 31.0455 },
      { name: "Durban North SAPS", kind: "Station", lat: -29.7832, lng: 31.0342 },
      { name: "Umhlanga Rocks", kind: "Beach", lat: -29.7276, lng: 31.0856 },
    ],
    commutes: [
      {
        to: "Durban CBD",
        mode: "Car, weekday peak",
        minutes: 30,
        note: "Down the M4. Planning assumption, not live traffic.",
        lat: -29.8587,
        lng: 31.0218,
      },
      {
        to: "King Shaka airport",
        mode: "Car, off-peak",
        minutes: 35,
        note: "North on the N2. Often longer in December. Not live traffic.",
        lat: -29.6144,
        lng: 31.1197,
      },
    ],
  },
];

export const STATION_SOURCE_NOTE = STATION_NOTE;

export const REGIONS: Array<Region | "All"> = ["All", "Coast", "Highveld", "Winelands", "KZN"];

export function kmBetween(aLat: number, aLng: number, bLat: number, bLng: number) {
  const R = 6371;
  const dLat = ((bLat - aLat) * Math.PI) / 180;
  const dLng = ((bLng - aLng) * Math.PI) / 180;
  const s1 = Math.sin(dLat / 2);
  const s2 = Math.sin(dLng / 2);
  const h =
    s1 * s1 +
    Math.cos((aLat * Math.PI) / 180) * Math.cos((bLat * Math.PI) / 180) * s2 * s2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

export function filterPlaces(region: Region | "All", query: string) {
  const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  return PLACES.filter((place) => {
    if (region !== "All" && place.region !== region) return false;
    if (words.length === 0) return true;
    const hay =
      `${place.address} ${place.suburb} ${place.city} ${place.province} ${place.finance.name} ${place.station.name}`.toLowerCase();
    return words.every((word) => hay.includes(word));
  });
}

export function nearestPlace(lat: number, lng: number) {
  let best = PLACES[0];
  let bestKm = kmBetween(lat, lng, best.lat, best.lng);
  for (const place of PLACES.slice(1)) {
    const d = kmBetween(lat, lng, place.lat, place.lng);
    if (d < bestKm) {
      best = place;
      bestKm = d;
    }
  }
  return { place: best, km: bestKm };
}

export type GeoHit = {
  label: string;
  lat: number;
  lng: number;
  suburb: string;
  city: string;
  province: string;
};

export function geoId(lat: number, lng: number) {
  const enc = (n: number) => n.toFixed(5).replace("-", "m").replace(".", "d");
  return `osm-${enc(lat)}-${enc(lng)}`;
}

export function materialise(hit: GeoHit): Place {
  const near = nearestPlace(hit.lat, hit.lng);
  const base = near.place;
  return {
    ...base,
    id: geoId(hit.lat, hit.lng),
    custom: true,
    address: hit.label,
    suburb: hit.suburb || base.suburb,
    city: hit.city || base.city,
    province: hit.province || base.province,
    lat: hit.lat,
    lng: hit.lng,
    matchedFrom: base.suburb,
    matchedKm: near.km,
    priceNote: `Map search has no asking price. This one is copied from the ${base.suburb} profile, ${kmText(near.km)} away. Replace it before you compare.`,
    photoAlt: base.photoAlt,
  };
}

export function findStaticPlace(id: string) {
  return PLACES.find((place) => place.id === id);
}
