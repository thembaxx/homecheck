import { readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const brand = JSON.parse(await readFile(join(root, "src/brand.json"), "utf8"));
const origin = new URL(brand.url);
if (
  !["http:", "https:"].includes(origin.protocol) ||
  origin.pathname !== "/" ||
  origin.username ||
  origin.password ||
  origin.search ||
  origin.hash
)
  throw new Error("Brand URL must be an HTTP(S) origin.");
const url = (path) => new URL(path, origin).href;
const escape = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c],
  );
const overview = `# ${brand.name}\n\n> ${brand.description}\n\n${brand.tagline}\n\n## Features\n\n${brand.features.map((v) => `- ${v}`).join("\n")}\n\n## Scope and privacy\n\n${brand.limits.map((v) => `- ${v}`).join("\n")}\n\n## Reference links\n\n${brand.sources.map(([label, href]) => `- [${label}](${href})`).join("\n")}\n`;
const index = `# ${brand.name}\n\n> ${brand.description}\n\n${brand.limits.join(" ")}\n\n## Product\n\n- [Product overview](${url("/about.html")}): Features, scope, reference links and privacy.\n- [Plain-text overview](${url("/about.md")}): Public product documentation.\n- [Open the app](${url("/")}): Interactive app; requires JavaScript.\n\n## Optional\n\n- [Full public context](${url("/llms-full.txt")}): Complete public product overview.\n`;
const schema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": url("/#website"),
      name: brand.name,
      description: brand.description,
      url: url("/"),
      inLanguage: brand.language,
    },
    {
      "@type": "WebApplication",
      "@id": url("/#application"),
      name: brand.name,
      description: brand.description,
      url: url("/"),
      inLanguage: brand.language,
      applicationCategory: brand.category,
      operatingSystem: "Web browser",
      featureList: brand.features,
    },
  ],
};
const head = (title, path) =>
  `<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><title>${escape(title)}</title><meta name="description" content="${escape(brand.description)}"><meta name="theme-color" content="${brand.background}"><link rel="canonical" href="${url(path)}"><link rel="describedby" type="text/plain" href="/llms.txt"><link rel="icon" href="${brand.name === "Elemental" ? "/brand-icon.svg" : "/favicon.svg"}"><meta property="og:type" content="website"><meta property="og:site_name" content="${brand.name}"><meta property="og:locale" content="${brand.locale}"><meta property="og:title" content="${escape(title)}"><meta property="og:description" content="${escape(brand.description)}"><meta property="og:url" content="${url(path)}"><meta property="og:image" content="${url("/social.png")}"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta property="og:image:alt" content="${escape(brand.name + ": " + brand.tagline)}"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${escape(title)}"><meta name="twitter:description" content="${escape(brand.description)}"><meta name="twitter:image" content="${url("/social.png")}">`;
const sections = `<h1>${brand.name}</h1><p class="tagline">${escape(brand.tagline)}</p><p>${escape(brand.description)}</p><h2>What you can do</h2><ul>${brand.features.map((v) => `<li>${escape(v)}</li>`).join("")}</ul><h2>Scope and privacy</h2><ul>${brand.limits.map((v) => `<li>${escape(v)}</li>`).join("")}</ul><h2>Reference links</h2><ul>${brand.sources.map(([label, href]) => `<li><a href="${escape(href)}">${escape(label)}</a></li>`).join("")}</ul>`;
const styles = `html{color-scheme:light dark}body{margin:0;background:${brand.background};color:${brand.name === "Elemental" ? "#f1f5f9" : "#242a23"};font:16px/1.7 system-ui,sans-serif}main{max-width:720px;margin:auto;padding:40px 24px}h1{font-size:clamp(32px,8vw,56px);line-height:1.15}.tagline{font-size:24px}li{margin:10px 0}a{color:inherit;text-underline-offset:3px}`;
const out = join(root, "public");
await mkdir(out, { recursive: true });
const files = {
  "llms.txt": index,
  "llm.txt": index,
  "llms-full.txt": overview,
  "about.md": overview,
  "robots.txt": `User-agent: *\nAllow: /\n${brand.name === "HomeCheck" ? "Disallow: /api/\nDisallow: /auth/\n" : ""}\nSitemap: ${url("/sitemap.xml")}\n`,
  "sitemap.xml": `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${url("/")}</loc></url><url><loc>${url("/about.html")}</loc></url></urlset>\n`,
  "about.html": `<!doctype html><html lang="${brand.language}"><head>${head(`About ${brand.name}`, "/about.html")}<style>${styles}</style></head><body><main><nav aria-label="Product"><a href="/">Open ${brand.name}</a></nav>${sections}<footer><a href="/about.md">Plain-text overview</a> · <a href="/llms.txt">AI-readable index</a></footer></main></body></html>\n`,
};
if (brand.name === "Elemental")
  files["index.html"] =
    `<!doctype html><html lang="${brand.language}"><head>${head(brand.title, "/")}<script type="application/ld+json">${JSON.stringify(schema).replace(/</g, "\\u003c")}</script><style>html,body,#root{margin:0;min-height:100%;background:${brand.background}}#root{display:flex;flex:1}noscript{font:16px/1.7 system-ui;color:#f1f5f9}noscript main{max-width:720px;margin:auto;padding:32px}</style></head><body><noscript><main>${sections}<p>Enable JavaScript to use the interactive app, or <a href="/about.html">read the overview</a>.</p></main></noscript><div id="root"></div></body></html>\n`;
await Promise.all(
  Object.entries(files).map(([path, content]) => writeFile(join(out, path), content)),
);
console.log(`Generated public discovery files for ${brand.name}.`);
