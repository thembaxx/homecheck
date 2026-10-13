import { createRootRoute, HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import { Toaster } from "sonner";
import { AuthProvider } from "@/lib/auth/provider";
import { PreviewHostBridge } from "@/components/preview-host-bridge";
import { Shell } from "@/components/shell";
import appCss from "../styles.css?url";
import brand from "../brand.json";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { title: brand.title },
      {
        name: "description",
        content: brand.description,
      },
      { name: "theme-color", content: brand.background },
      { name: "robots", content: "index, follow" },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: brand.name },
      { property: "og:locale", content: brand.locale },
      { property: "og:title", content: brand.title },
      { property: "og:description", content: brand.description },
      { property: "og:image", content: `${brand.url}/social.png` },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: `${brand.name}: ${brand.tagline}` },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: brand.title },
      { name: "twitter:description", content: brand.description },
      { name: "twitter:image", content: `${brand.url}/social.png` },
    ],
    links: [
      { rel: "describedby", type: "text/plain", href: "/llms.txt" },
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "stylesheet", href: appCss },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600&family=Outfit:wght@400;500;600&display=swap",
      },
      { rel: "manifest", href: "/__grok/manifest.webmanifest" },
      { rel: "apple-touch-icon", href: "/__grok/icon-180.png" },
    ],
  }),
  component: () => (
    <html lang={brand.language} suppressHydrationWarning>
      <head>
        <HeadContent />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "WebSite",
                  name: brand.name,
                  url: `${brand.url}/`,
                  inLanguage: brand.language,
                },
                {
                  "@type": "WebApplication",
                  name: brand.name,
                  url: `${brand.url}/`,
                  description: brand.description,
                  applicationCategory: brand.category,
                  operatingSystem: "Web browser",
                  featureList: brand.features,
                },
              ],
            }).replace(/</g, "\\u003c"),
          }}
        />
      </head>
      <body>
        <PreviewHostBridge />
        <AuthProvider>
          <Shell>
            <Outlet />
          </Shell>
          <Toaster position="top-center" />
        </AuthProvider>
        <Scripts />
      </body>
    </html>
  ),
});
