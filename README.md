# HomeCheck

A South African property-research interface for ownership-cost assumptions, municipal context, amenities and precinct-level crime trends.

[Browse the source](https://github.com/thembaxx/homecheck)

## Engineering highlights

Explicit data limitations, local saved checks and discovery-generation tooling. Precinct totals cannot establish the safety of a street; prices are indicative.

## Technology

Declared in [package.json](package.json): React `^19.2.0` · TypeScript `^5.7.0` · Tailwind CSS `^4.3.0` · Vite `^8.2.0` · Three.js `^0.186.1` · Motion `^14.1.0` · React Three Fiber `^9.8.1` · Better Auth `~1.6.30` · TanStack Query `^5.101.0` · TanStack Start `^1.168.60` · TanStack Router `^1.170.0` · Leaflet `^1.9.4` · Zod `^4.4.0`.

**Quality tooling:** `typecheck`, `test`, `lint` scripts are available. See the setup guide below for prerequisites; this documentation pass does not assert that those checks were run.

---

## Project guide

The buyer’s reality check for South African property. Search an address, then read a due-diligence report: estimated monthly ownership cost, municipal audit context, police-station crime trends, nearby amenities, and commute assumptions.

Station statistics are precinct totals. They do not measure the safety of a particular street. Asking prices are indicative bands, not valuations or live listings.

## Run

```bash
npm install
npm run dev
```

The dev server listens on port 8080. Saved checks stay in the browser. Nothing is charged in this build. The packs shown in the product are a R99 snapshot, a R199 buyer report, and a R299 compare pack.

## Brand and discovery

See [BRAND.md](BRAND.md). `src/brand.json` supplies public positioning and the verified canonical origin `https://homecheck-navy.vercel.app`. `npm run discovery` regenerates robots, sitemap, public HTML and Markdown, `/llms.txt`, its `/llm.txt` alias and `/llms-full.txt`. Builds run this automatically. Saved, comparison and report routes carry `noindex`; the sitemap contains public product pages only.
