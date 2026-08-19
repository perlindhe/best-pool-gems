import type { Collection } from "@/data/collections";

type MetaHotel = {
  name: string;
  slug: string;
  pool_score_0_10: number | null;
  verification_status: string;
};

const BASE = "https://bestpoolhotels.com";

/** head() metadata + structured data for a programmatic collection page. */
export const buildCollectionMeta = (collection: Collection, hotels: MetaHotel[]) => {
  const url = `${BASE}/${collection.citySlug}/${collection.articleSlug}`;
  const verified = hotels.filter(
    (h) => h.verification_status === "verified" || h.verification_status === "partially_verified",
  );

  return {
    meta: [
      { title: collection.metaTitle },
      { name: "description", content: collection.excerpt },
      { property: "og:title", content: collection.title },
      { property: "og:description", content: collection.excerpt },
      { property: "og:type", content: "article" },
      { property: "og:url", content: url },
      { property: "article:modified_time", content: collection.lastUpdated },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: url }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Article",
              headline: collection.title,
              description: collection.excerpt,
              dateModified: collection.lastUpdated,
              author: { "@type": "Organization", name: "BestPoolHotels Editorial" },
              publisher: { "@type": "Organization", name: "Best Pool Hotels" },
              mainEntityOfPage: url,
            },
            {
              "@type": "BreadcrumbList",
              itemListElement: [
                { "@type": "ListItem", position: 1, name: "Home", item: `${BASE}/` },
                {
                  "@type": "ListItem",
                  position: 2,
                  name: collection.city,
                  item: `${BASE}/${collection.citySlug}`,
                },
                { "@type": "ListItem", position: 3, name: collection.title, item: url },
              ],
            },
            {
              "@type": "ItemList",
              name: collection.title,
              // Only verified records enter structured data.
              itemListElement: verified.map((h, i) => ({
                "@type": "ListItem",
                position: i + 1,
                name: h.name,
                url: `${BASE}/hotels/${h.slug}`,
              })),
            },
            {
              "@type": "FAQPage",
              mainEntity: collection.faqs.map((f) => ({
                "@type": "Question",
                name: f.question,
                acceptedAnswer: { "@type": "Answer", text: f.answer },
              })),
            },
          ],
        }),
      },
    ],
  };
};
