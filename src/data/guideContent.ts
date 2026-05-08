import type { Guide } from "@/data/hotels";

export type GuideContent = {
  hero: string;
  body: { heading?: string; paragraphs: string[] }[];
};

export const guideContent: Record<string, GuideContent> = {
  "barcelona/luxury-pool-hotels": {
    hero: "The definitive list of Barcelona's ten best hotel pools — from icons to secret rooftop plunges.",
    body: [
      {
        heading: "How we rank",
        paragraphs: [
          "We've personally visited every hotel on this list over the past two years. The ranking is based on three criteria: view, water and vibe. No hotel has paid for placement.",
          "You'll find the full top 10 with prices, location and what makes each pool special on our dedicated Barcelona page.",
        ],
      },
      {
        heading: "Three quick favorites",
        paragraphs: [
          "**Hotel Arts Barcelona** — best combination of beach and pool, two large outdoor pools with sea views.",
          "**The Barcelona EDITION** — coolest rooftop vibe with a DJ at sunset and a deep-blue mosaic pool.",
          "**Mandarin Oriental Barcelona** — the city's most sophisticated rooftop garden on the 24th floor.",
        ],
      },
      {
        heading: "Worth knowing",
        paragraphs: [
          "Most rooftop pools in Barcelona open in mid-May and close at the end of September. Want to swim year-round — choose the indoor spa at Mandarin or Hotel Arts.",
        ],
      },
    ],
  },
  "barcelona/rooftop-pool-hotels": {
    hero: "Seven rooftop pools where the view is as important as the water — with hours, dress code and access for non-guests.",
    body: [
      {
        heading: "The best rooftop pools",
        paragraphs: [
          "**The Barcelona EDITION** (El Born) — DJ from 6pm, smart-casual dress code, often queues on Saturdays.",
          "**Hotel SOFIA Sky Bar 26** (Diagonal) — best 360° view, calmer than Edition.",
          "**ME Barcelona** (Eixample) — party vibe, drinks until midnight.",
          "**Mandarin Oriental Terrat** (Passeig de Gràcia) — discreet, grown-up, two pools.",
          "**Sir Victor** (Eixample) — bohemian, La Pedrera in view.",
          "**Almanac** (Passeig de Gràcia) — small plunge, big views.",
          "**Kimpton Vividora** (Gòtic) — most charming location in the Old Town.",
        ],
      },
      {
        heading: "Tips for non-guests",
        paragraphs: [
          "Many rooftop pools sell day passes or require a minimum spend (€50–80). Book ahead via the hotel's website — Edition and Mandarin are often fully booked by lunchtime.",
        ],
      },
    ],
  },
  "barcelona/pool-hotels-near-beach": {
    hero: "Hotels in Barceloneta and Poblenou where you can combine the Mediterranean with a really good hotel pool.",
    body: [
      {
        heading: "Beachfront in Barceloneta",
        paragraphs: [
          "**Hotel Arts Barcelona** — two pools in the garden, 50 meters from the beach.",
          "**W Barcelona** — the iconic sail, three pools and the Wet Deck party.",
        ],
      },
      {
        heading: "Calmer alternatives in Poblenou & Diagonal Mar",
        paragraphs: [
          "**Hotel SB Diagonal Zero** — rooftop pool with sea view, very good value compared to Barceloneta.",
          "**Meliá Barcelona Sky** — 24th-floor rooftop pool, ten minutes from the beach in Poblenou.",
        ],
      },
      {
        heading: "The hidden gem",
        paragraphs: [
          "**Hotel Pulitzer** has no beach at all — but one of the city's most charming small rooftop pools and is 15 minutes from Barceloneta by metro. Often half the price.",
        ],
      },
    ],
  },
  "barcelona/pool-season": {
    hero: "Everything about pool season in Barcelona — when do the rooftop pools open and which are open year-round?",
    body: [
      {
        heading: "Season at a glance",
        paragraphs: [
          "**May–September** is high season for rooftop pools. Most open around May 15 and close September 30.",
          "**June–August** are the warmest months with water temperatures of 24–27°C.",
          "**April and October** can be pleasant, but many pools are closed or have limited hours then.",
        ],
      },
      {
        heading: "Pools open year-round",
        paragraphs: [
          "**Mandarin Oriental** — heated rooftop pool, open in winter too.",
          "**Hotel Arts** — indoor spa with heated pool year-round.",
          "**Bulgari spas** don't exist in Barcelona yet, but the two above are safe bets.",
        ],
      },
      {
        heading: "Typical opening hours",
        paragraphs: [
          "Rooftop pools are usually open 10:00–20:00 for hotel guests. Rooftop bars with a pool open around 17:00 for non-guests, but the pool itself is then closed for swimming.",
        ],
      },
    ],
  },
};

export const buildGuideMeta = (guide: Guide) => ({
  meta: [
    { title: `${guide.title} — PoolList` },
    { name: "description", content: guide.excerpt },
    { property: "og:title", content: guide.title },
    { property: "og:description", content: guide.excerpt },
    { property: "og:image", content: guide.image },
    { property: "article:published_time", content: guide.date },
    { name: "twitter:card", content: "summary_large_image" },
  ],
});
