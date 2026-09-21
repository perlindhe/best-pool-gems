import { createFileRoute } from "@tanstack/react-router";
import { cities, guides } from "@/data/hotels";
import { collections } from "@/data/collections";

import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { validateHotelForPublication, type StatusHotel } from "@/lib/hotel-status";

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
          { path: "/pool-rankings", changefreq: "weekly", priority: "0.8" },
          { path: "/about", changefreq: "monthly", priority: "0.6" },
          { path: "/editors", changefreq: "monthly", priority: "0.4" },
          { path: "/editors/per-lindhe", changefreq: "yearly", priority: "0.3" },
          { path: "/editors/editorial-team", changefreq: "yearly", priority: "0.3" },
          { path: "/verification-standards", changefreq: "yearly", priority: "0.5" },
          { path: "/corrections", changefreq: "yearly", priority: "0.4" },
          { path: "/disclosure", changefreq: "yearly", priority: "0.3" },
          { path: "/cookies", changefreq: "yearly", priority: "0.3" },
          { path: "/privacy", changefreq: "yearly", priority: "0.3" },
          { path: "/heated-pool-hotels", changefreq: "weekly", priority: "0.8" },
          { path: "/rooftop-pool-hotels", changefreq: "weekly", priority: "0.8" },
          { path: "/family-pool-hotels", changefreq: "weekly", priority: "0.8" },
          { path: "/indoor-pool-hotels", changefreq: "weekly", priority: "0.8" },
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
        for (const c of collections) {
          entries.push({
            path: `/${c.citySlug}/${c.articleSlug}`,
            lastmod: c.lastUpdated,
            changefreq: "monthly",
            priority: "0.7",
          });
        }

        entries.push({
          path: "/barcelona/luxury-pool-hotels",
          changefreq: "monthly",
          priority: "0.7",
        });

        // Only fully verified + published hotel profiles belong in the sitemap.
        // Partially verified and research-pending profiles stay reachable for
        // visitors but are noindex, so they must never be submitted to Google.
        {
          const { getApprovedEvidenceSlugs, passesEvidenceGate } = await import(
            "@/server/evidence-gate.server"
          );
          const approvedEvidence = await getApprovedEvidenceSlugs();
          const pageSize = 1000;
          for (let offset = 0; ; ) {
            const { data, error } = await supabaseAdmin
              .from("public_hotels_view")
              .select("*")
              .eq("editorial_status", "published")
              .eq("hotel_status", "active")
              .is("canonical_hotel_id", null)
              .order("slug")
              .range(offset, offset + pageSize - 1);
            if (error) throw error;
            if (!data || data.length === 0) break;
            for (const row of data as Array<Record<string, unknown>>) {
              const h = row as { slug: string | null; updated_at: string | null };
              // One gate decides indexing, ranking and sitemap membership.
              if (!h.slug || !validateHotelForPublication(row as StatusHotel).in_sitemap) continue;
              // Test-group hotels need an approved Evidence-based Pool Score.
              if (!passesEvidenceGate(h.slug, approvedEvidence)) continue;
              entries.push({
                path: `/hotels/${h.slug}`,
                lastmod: h.updated_at ? h.updated_at.slice(0, 10) : undefined,
                changefreq: "monthly",
                priority: "0.6",
              });
            }
            offset += data.length;
          }
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
