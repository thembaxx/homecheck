# HomeCheck

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
