import { createFileRoute } from "@tanstack/react-router";
import { cities, guides } from "@/data/hotels";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const BASE_URL = "https://bestpoolhotels.com";

type Entry = {
  path: string;
  lastmod?: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
};

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const entries: Entry[] = [
          { path: "/", changefreq: "weekly", priority: "1.0" },
          { path: "/rankings", changefreq: "daily", priority: "0.9" },
          { path: "/about", changefreq: "monthly", priority: "0.6" },
          { path: "/disclosure", changefreq: "yearly", priority: "0.3" },
          { path: "/cookies", changefreq: "yearly", priority: "0.3" },
          { path: "/integritetspolicy", changefreq: "yearly", priority: "0.3" },
        ];

        for (const c of cities) {
          entries.push({ path: `/${c.slug}`, changefreq: "weekly", priority: "0.8" });
        }
        for (const g of guides) {
          entries.push({
            path: `/${g.slug}`,
            lastmod: g.date,
            changefreq: "monthly",
            priority: "0.7",
          });
        }
        entries.push({
          path: "/barcelona/luxury-pool-hotels",
          changefreq: "monthly",
          priority: "0.7",
        });

        try {
          const { data } = await supabaseAdmin
            .from("public_hotels_view")
            .select("slug")
            .limit(2000);
          if (data) {
            for (const h of data as Array<{ slug: string | null }>) {
              if (!h.slug) continue;
              entries.push({
                path: `/hotels/${h.slug}`,
                changefreq: "weekly",
                priority: "0.6",
              });
            }
          }
        } catch {
          // ignore — sitemap should still serve static routes even if DB is down
        }

        const seen = new Set<string>();
        const urls = entries
          .filter((e) => (seen.has(e.path) ? false : (seen.add(e.path), true)))
          .map((e) =>
            [
              `  <url>`,
              `    <loc>${BASE_URL}${e.path}</loc>`,
              e.lastmod ? `    <lastmod>${e.lastmod}</lastmod>` : null,
              e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
              e.priority ? `    <priority>${e.priority}</priority>` : null,
              `  </url>`,
            ]
              .filter(Boolean)
              .join("\n"),
          );

        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
          ...urls,
          `</urlset>`,
        ].join("\n");

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
