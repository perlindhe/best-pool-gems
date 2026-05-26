import type { Guide } from "@/data/hotels";

export type GuideSource = { label: string; url?: string };

export type GuideTableRow = {
  hotel: string;
  neighborhood: string;
  // Free-form key cells unique per guide (e.g. "view", "walking distance", "season")
  cells: { label: string; value: string }[];
};

export type GuideAlsoConsidered = {
  name: string;
  neighborhood?: string;
  reason: string;
};

export type GuideContent = {
  hero: string;
  publishedDate: string; // ISO
  lastUpdated: string; // ISO
  sources: GuideSource[];
  verificationNote: string;
  body: { heading?: string; paragraphs: string[] }[];
  table?: {
    heading: string;
    intro?: string;
    rows: GuideTableRow[];
  };
  alsoConsidered: GuideAlsoConsidered[];
};

const COMMON_SOURCES: GuideSource[] = [
  { label: "Hotel Arts official site", url: "https://www.ritzcarlton.com/en/hotels/bcnrz-hotel-arts-barcelona/overview/" },
  { label: "The Barcelona EDITION", url: "https://www.marriott.com/en-us/hotels/bcneb-the-barcelona-edition/overview/" },
  { label: "Mandarin Oriental Barcelona", url: "https://www.mandarinoriental.com/en/barcelona/passeig-de-gracia" },
  { label: "Grand Hotel Central", url: "https://www.grandhotelcentral.com/" },
];

export const guideContent: Record<string, GuideContent> = {
  // -------------------------------------------------- TOP 10 LUXURY
  "barcelona/luxury-pool-hotels": {
    hero: "The definitive editorial ranking of the ten best hotel pools in Barcelona — scored by our five-criteria Pool Score, re-verified for the 2026 season.",
    publishedDate: "2024-05-18",
    lastUpdated: "2026-05-22",
    sources: COMMON_SOURCES,
    verificationNote:
      "Every hotel on this list was re-verified against the property's own pool / wellness page within the last 30 days. Opening dates and access rules can change in season — always re-check on the hotel's official site before booking.",
    body: [
      {
        heading: "Scope of this guide",
        paragraphs: [
          "This is the overall top 10 — the best pool experiences in Barcelona regardless of category. For pure rooftop coverage see our dedicated **Rooftop pool hotels** guide; for beach-adjacent picks see **Pool hotels near the beach**.",
          "Every score is the editorial team's own. Affiliate relationships never influence which hotels appear or in what order.",
        ],
      },
    ],
    alsoConsidered: [
      {
        name: "Cotton House Hotel",
        neighborhood: "Eixample",
        reason:
          "Charming plunge on a 19th-century palace, but the water is small enough to be a hot-tub on busy days — fell out of the top 10 in 2026.",
      },
      {
        name: "Ohla Eixample",
        neighborhood: "Eixample",
        reason:
          "Glass-bottom rooftop is architecturally spectacular, but the lounging deck is tight and book-ahead-only beds limit drop-in use.",
      },
      {
        name: "Hotel Casa Fuster",
        neighborhood: "Gràcia",
        reason:
          "Stunning Modernist landmark, but the rooftop pool is a small plunge that doesn't compete with our top 10 for actual swimming.",
      },
      {
        name: "Hotel Brummell",
        neighborhood: "Poble-sec",
        reason:
          "Best low-key neighbourhood pool in Barcelona — held out of the luxury list because the price tier and the scope of this guide are different.",
      },
    ],
  },

  // -------------------------------------------------- ROOFTOP-ONLY
  "barcelona/rooftop-pool-hotels": {
    hero: "Rooftop pool hotels in Barcelona, scored by view, access and opening hours. Strictly rooftop pools — beach resorts and basement spas live in our other guides.",
    publishedDate: "2024-06-02",
    lastUpdated: "2026-05-22",
    sources: COMMON_SOURCES,
    verificationNote:
      "Opening hours and non-guest access (day pass / minimum spend) re-verified directly with each rooftop or the hotel's wellness page for the 2026 season.",
    body: [
      {
        heading: "Scope of this guide",
        paragraphs: [
          "Only rooftop pools make this list — no garden pools, no basement spas, no beach decks. The detail table below focuses on what you actually need to plan a rooftop visit: view, access and opening hours.",
          "Most rooftop pools in Barcelona open mid-May and close at the end of September. Outside that window, head to our **Pool season** guide for heated and year-round options.",
        ],
      },
      {
        heading: "Tips for non-guests",
        paragraphs: [
          "Many rooftop pools sell day passes or require a minimum spend (€50–80). Edition and Mandarin are often fully booked by lunchtime — reserve via the hotel's website 1–2 days ahead.",
        ],
      },
    ],
    table: {
      heading: "Every rooftop, side-by-side",
      intro: "View, access and typical opening hours for the 2026 season.",
      rows: [
        {
          hotel: "The Barcelona EDITION",
          neighborhood: "El Born",
          cells: [
            { label: "View", value: "Skyline over El Born" },
            { label: "Access", value: "Guests only · DJ from 6pm" },
            { label: "Open", value: "Daily 10:00–20:00 · May–Sep" },
          ],
        },
        {
          hotel: "Mandarin Oriental — Terrat",
          neighborhood: "Passeig de Gràcia",
          cells: [
            { label: "View", value: "360° Eixample garden" },
            { label: "Access", value: "Guests only · 2 heated pools" },
            { label: "Open", value: "Year-round (heated)" },
          ],
        },
        {
          hotel: "Grand Hotel Central",
          neighborhood: "Gòtic / El Born",
          cells: [
            { label: "View", value: "Skyline over Via Laietana" },
            { label: "Access", value: "Hotel guests only" },
            { label: "Open", value: "Daily 11:00–20:00 · May–Sep" },
          ],
        },
        {
          hotel: "Hotel SOFIA — Sky Bar 26",
          neighborhood: "Diagonal",
          cells: [
            { label: "View", value: "True 360° city panorama" },
            { label: "Access", value: "Day pass available" },
            { label: "Open", value: "Daily 10:00–20:00 · May–Sep" },
          ],
        },
        {
          hotel: "Sir Victor",
          neighborhood: "Eixample",
          cells: [
            { label: "View", value: "Direct view of La Pedrera" },
            { label: "Access", value: "Hotel guests only" },
            { label: "Open", value: "Daily 11:00–20:00 · May–Oct" },
          ],
        },
        {
          hotel: "ME Barcelona",
          neighborhood: "Eixample",
          cells: [
            { label: "View", value: "Eixample rooftops" },
            { label: "Access", value: "Hotel guests · bar open to public" },
            { label: "Open", value: "Daily, party hours Thu–Sat" },
          ],
        },
        {
          hotel: "Almanac",
          neighborhood: "Passeig de Gràcia",
          cells: [
            { label: "View", value: "Skyline over Passeig de Gràcia" },
            { label: "Access", value: "Hotel guests only" },
            { label: "Open", value: "Daily 11:00–20:00 · May–Sep" },
          ],
        },
        {
          hotel: "Kimpton Vividora",
          neighborhood: "Gòtic",
          cells: [
            { label: "View", value: "Rooftop in the Gothic Quarter" },
            { label: "Access", value: "Hotel guests only" },
            { label: "Open", value: "Daily 11:00–20:00 · May–Oct" },
          ],
        },
      ],
    },
    alsoConsidered: [
      {
        name: "Soho House Barcelona",
        neighborhood: "Gòtic",
        reason: "Iconic rooftop over the port, but members and house guests only — not usable for general readers.",
      },
      {
        name: "H10 Cubik",
        neighborhood: "Via Laietana",
        reason: "Great-value rooftop plunge with a 360° Old Town panorama, but the pool itself is small.",
      },
      {
        name: "Yurbban Trafalgar",
        neighborhood: "El Born",
        reason: "One of the best skyline rooftops on a budget — left out because the plunge is genuinely tiny.",
      },
    ],
  },

  // -------------------------------------------------- BEACH-ADJACENT
  "barcelona/pool-hotels-near-beach": {
    hero: "Hotels in Barcelona where you can combine a real hotel pool with a walk-to-the-sea morning. Beachfront and beach-walk options, with walking distance from pool to sand.",
    publishedDate: "2024-06-15",
    lastUpdated: "2026-05-22",
    sources: COMMON_SOURCES,
    verificationNote:
      "Walking distances measured from the hotel pool deck to the nearest swimmable beach via Google Maps walking directions, May 2026.",
    body: [
      {
        heading: "Scope of this guide",
        paragraphs: [
          "Strictly beach-adjacent picks — every hotel here is either directly on the sand or within a 15-minute flat walk of swimmable Mediterranean. Rooftop-only hotels are listed in our **Rooftop pool hotels** guide instead.",
          "Barceloneta is the obvious anchor, but the calmer side of the city — Poblenou and Diagonal Mar — has caught up with a wave of new sea-view rooftops.",
        ],
      },
    ],
    table: {
      heading: "Pool and beach distance",
      intro: "How long it actually takes to walk from the pool to the sand.",
      rows: [
        {
          hotel: "Hotel Arts Barcelona",
          neighborhood: "Barceloneta",
          cells: [
            { label: "Pool", value: "Two outdoor pools · garden" },
            { label: "To beach", value: "~3 min walk (50 m)" },
            { label: "Vibe", value: "Resort in the city, family-friendly" },
          ],
        },
        {
          hotel: "W Barcelona",
          neighborhood: "Barceloneta",
          cells: [
            { label: "Pool", value: "Three pools incl. Wet Deck" },
            { label: "To beach", value: "Directly on the sand" },
            { label: "Vibe", value: "Party, summer Saturdays" },
          ],
        },
        {
          hotel: "Hotel SB Diagonal Zero",
          neighborhood: "Diagonal Mar",
          cells: [
            { label: "Pool", value: "Rooftop pool · sea view" },
            { label: "To beach", value: "~10 min walk" },
            { label: "Vibe", value: "Modern, calmer than Barceloneta" },
          ],
        },
        {
          hotel: "Meliá Barcelona Sky",
          neighborhood: "Poblenou",
          cells: [
            { label: "Pool", value: "24th-floor rooftop pool" },
            { label: "To beach", value: "~12 min walk" },
            { label: "Vibe", value: "Sky views without the crowd" },
          ],
        },
      ],
    },
    alsoConsidered: [
      {
        name: "Hotel Pulitzer",
        neighborhood: "Plaça Catalunya",
        reason: "Beloved central rooftop, but it's a 25-minute walk or short metro hop to the sand — too far for this beach-focused guide.",
      },
      {
        name: "Pestana Arena Barcelona",
        neighborhood: "Sant Antoni",
        reason: "Wide modern rooftop pool, but the location is inland — no beach within sensible walking distance.",
      },
      {
        name: "Eurostars Grand Marina",
        neighborhood: "Port Vell",
        reason: "Marina-front with a rooftop pool, but the nearest beach (Sant Sebastià) is still a 15+ minute walk along the port.",
      },
    ],
  },

  // -------------------------------------------------- SEASONAL
  "barcelona/pool-season": {
    hero: "When does the pool season actually start in Barcelona — and which hotel pools are heated, indoor or open year-round? A practical month-by-month planner.",
    publishedDate: "2024-04-10",
    lastUpdated: "2026-05-22",
    sources: COMMON_SOURCES,
    verificationNote:
      "Season dates re-verified with each hotel for 2026. Outdoor rooftop opening dates can slip a week either side depending on weather.",
    body: [
      {
        heading: "Scope of this guide",
        paragraphs: [
          "This guide is not a ranking — it's a seasonal planner. If you want a definitive list of the best pool hotels see our **Top 10 luxury pool hotels** guide; if you want rooftop-only coverage see the **Rooftop pool hotels** guide.",
        ],
      },
      {
        heading: "Month-by-month",
        paragraphs: [
          "**April** — Most outdoor rooftops are still closed; air temperatures hover around 18–20°C. Heated indoor spa pools at Mandarin Oriental, Hotel Arts and the city's 5-star hotels are your only swim.",
          "**May** — Outdoor rooftops re-open around **May 15**. Water is fresh (~20–22°C), days are warm. Best month for empty rooftops.",
          "**June–August** — High season. Water 24–27°C, daytime air 28–32°C. Edition and Mandarin sell out — reserve a bed.",
          "**September** — The single best month overall: warm sea, warm air, smaller crowds. Most rooftops stay open until September 30.",
          "**October** — Outdoor rooftops typically close in the first week. Heated indoor spas take over again.",
          "**November–March** — Winter swim window. Heated rooftop at Mandarin Oriental is open year-round; otherwise stick to indoor spas.",
        ],
      },
      {
        heading: "Pools open year-round",
        paragraphs: [
          "**Mandarin Oriental** — heated rooftop garden + heated indoor spa. The only outdoor pool you can swim in January.",
          "**Hotel Arts Barcelona** — heated indoor spa pool open year-round (outdoor garden pools follow the regular May–September season).",
          "**Hotel 1898** — heated indoor pool in the basement spa, plus the rooftop in season.",
        ],
      },
      {
        heading: "Typical opening hours",
        paragraphs: [
          "Rooftop pools are usually open 10:00–20:00 for hotel guests. Rooftop bars with a pool typically open at 17:00 or 18:00 for non-guests — at that point the pool itself is usually closed for swimming.",
        ],
      },
    ],
    alsoConsidered: [
      {
        name: "Hotel SB Diagonal Zero",
        neighborhood: "Diagonal Mar",
        reason: "Has a heated rooftop pool but only in shoulder season — not a true year-round swim option.",
      },
      {
        name: "Crowne Plaza Barcelona",
        neighborhood: "Fira",
        reason: "Heated indoor pool open year-round, but the location is far from the centre.",
      },
    ],
  },
};

export const buildGuideMeta = (guide: Guide) => {
  const url = `https://bestpoolhotels.com/${guide.slug}`;
  const content = guideContent[guide.slug];
  const lastModified = content?.lastUpdated ?? guide.date;
  return {
    meta: [
      { title: `${guide.title} — Best Pool Hotels` },
      { name: "description", content: guide.excerpt },
      { property: "og:title", content: guide.title },
      { property: "og:description", content: guide.excerpt },
      { property: "og:image", content: guide.image },
      { property: "og:type", content: "article" },
      { property: "og:url", content: url },
      { property: "article:published_time", content: content?.publishedDate ?? guide.date },
      { property: "article:modified_time", content: lastModified },
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
              headline: guide.title,
              description: guide.excerpt,
              image: guide.image,
              datePublished: content?.publishedDate ?? guide.date,
              dateModified: lastModified,
              author: { "@type": "Organization", name: "BestPoolHotels Editorial" },
              publisher: { "@type": "Organization", name: "Best Pool Hotels" },
              mainEntityOfPage: url,
            },
            {
              "@type": "BreadcrumbList",
              itemListElement: [
                { "@type": "ListItem", position: 1, name: "Home", item: "https://bestpoolhotels.com/" },
                {
                  "@type": "ListItem",
                  position: 2,
                  name: guide.city,
                  item: `https://bestpoolhotels.com/${guide.citySlug}`,
                },
                { "@type": "ListItem", position: 3, name: guide.title, item: url },
              ],
            },
            ...(content?.table
              ? [
                  {
                    "@type": "ItemList",
                    name: content.table.heading,
                    itemListElement: content.table.rows.map((row, i) => ({
                      "@type": "ListItem",
                      position: i + 1,
                      name: row.hotel,
                    })),
                  },
                ]
              : []),
          ],
        }),
      },
    ],
  };
};

