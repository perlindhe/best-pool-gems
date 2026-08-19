import type { HotelFilterKey } from "@/data/collection-types";

/**
 * Programmatic collection pages: one template, per-page editorial text.
 * A collection only ships when the database holds at least `minHotels`
 * qualifying records — never publish an empty or thin page.
 */
export type CollectionFaq = { question: string; answer: string };

export type Collection = {
  citySlug: string;
  articleSlug: string;
  city: string;
  category: string;
  title: string;
  metaTitle: string;
  excerpt: string;
  hero: string;
  intro: string[];
  faqs: CollectionFaq[];
  filter: Partial<Record<HotelFilterKey, boolean>>;
  minHotels: number;
  lastUpdated: string;
};

export const collections: Collection[] = [
  {
    citySlug: "barcelona",
    articleSlug: "heated-pool-hotels",
    city: "Barcelona",
    category: "Heated",
    title: "Barcelona hotels with heated pools",
    metaTitle: "Heated pool hotels in Barcelona — verified list 2026",
    excerpt:
      "Barcelona hotels where the pool is actually heated, so the water is usable outside the July–August peak. Ranked by our Pool Score.",
    hero: "Barcelona's pool season is shorter than the weather suggests. These are the hotels where heating keeps the water swimmable when the air is not.",
    intro: [
      "An unheated rooftop pool in Barcelona is a mid-June to mid-September proposition. Heating shifts that: April, May and October become realistic swimming months, and a handful of properties keep the water at temperature all year.",
      "Every hotel below has heating confirmed on the property's own pool or wellness page, or by at least two independent sources. Where we could not confirm it, the hotel is marked research pending and its facts are not presented as fact.",
      "Heating is not the same as year-round opening. Several rooftop pools here are heated but still close for winter maintenance — check the season note on each hotel page before booking a trip outside the summer months.",
    ],
    faqs: [
      {
        question: "How warm are heated hotel pools in Barcelona?",
        answer:
          "Most heated hotel pools in the city are held somewhere between 26 and 29°C. Rooftop pools sit at the lower end because wind cools the surface; indoor and spa pools sit at the upper end.",
      },
      {
        question: "Are heated pools open in winter in Barcelona?",
        answer:
          "Some are. Heating and winter opening are separate decisions: a number of rooftop pools are heated during the shoulder season but still close from November to March. The hotels marked open year-round in our database are the ones to look at for a winter swim.",
      },
      {
        question: "Can non-guests use these pools?",
        answer:
          "A few sell day passes, most do not. Access rules change season to season, so treat any day-pass claim you read online as provisional and confirm with the hotel directly.",
      },
    ],
    filter: { heated: true },
    minHotels: 5,
    lastUpdated: "2026-08-19",
  },
  {
    citySlug: "gran-canaria",
    articleSlug: "heated-pools-winter",
    city: "Gran Canaria",
    category: "Winter",
    title: "Gran Canaria hotels with heated pools for winter",
    metaTitle: "Heated winter pools in Gran Canaria — verified list 2026",
    excerpt:
      "Where to swim in Gran Canaria between November and March: hotels with heated, year-round pools, ranked by Pool Score.",
    hero: "Gran Canaria is a winter-sun island, but the Atlantic and unheated pools are colder than the sunshine implies. These hotels heat the water.",
    intro: [
      "Air temperatures in the south of the island sit around 21–24°C through the winter. Unheated pool water does not follow: it typically drops to 19–21°C, which is swimmable for a brave few and unpleasant for everyone else.",
      "The hotels below run heated pools and, in most cases, keep them open through the whole winter season. That combination is what makes a December or February pool holiday work.",
      "Scores are our own five-criteria Pool Score and are never influenced by affiliate relationships. Heating claims come from the hotel's own site or from multiple independent sources.",
    ],
    faqs: [
      {
        question: "Is it warm enough to swim in Gran Canaria in December?",
        answer:
          "In a heated pool, yes. Sea temperature around Maspalomas hovers near 20–21°C in December, and unheated pools sit close to that; heated hotel pools are typically 26–28°C.",
      },
      {
        question: "Do resorts heat every pool on the property?",
        answer:
          "Rarely. Larger resorts often heat one main pool and leave the others unheated. Where we know which pool is heated, it is stated on the hotel page.",
      },
      {
        question: "Which side of the island is best for winter pool weather?",
        answer:
          "The south — Maspalomas, Meloneras and Puerto de Mogán — gets the most reliable winter sun. The north around Las Palmas is greener but cloudier.",
      },
    ],
    filter: { heated: true },
    minHotels: 5,
    lastUpdated: "2026-08-19",
  },
  {
    citySlug: "gran-canaria",
    articleSlug: "adults-only-pool-hotels",
    city: "Gran Canaria",
    category: "Adults only",
    title: "Adults-only pool hotels in Gran Canaria",
    metaTitle: "Adults-only pool hotels in Gran Canaria — 2026 ranking",
    excerpt:
      "Quiet, adults-only pools in Gran Canaria — no kids' clubs, no inflatables. Ranked by our Pool Score.",
    hero: "Adults-only properties are where Gran Canaria's pool experience gets calm: loungers you can book, water you can actually swim lengths in.",
    intro: [
      "Gran Canaria has an unusually deep adults-only market compared with the other Canary Islands, and the pool areas are the main reason people book them: fewer people, more loungers per guest and a quieter poolside.",
      "Every hotel below is adults-only according to the property's own booking terms. Minimum ages vary — 16 and 18 are both common — so verify the age limit for your party.",
      "Pool Score is calculated the same way here as everywhere else: wow factor, size, view, loungers and service.",
    ],
    faqs: [
      {
        question: "What is the usual minimum age?",
        answer:
          "Most adults-only hotels on the island set the limit at 16 or 18. A small number use 12 or 14 and still describe themselves as adults-only, so check before booking with teenagers.",
      },
      {
        question: "Are adults-only pools quieter in practice?",
        answer:
          "Generally yes, but not always. A large adults-only resort with a pool bar and music can be louder than a small family hotel. The quiet/party note on each hotel page is the better guide.",
      },
    ],
    filter: { adultsOnly: true },
    minHotels: 4,
    lastUpdated: "2026-08-19",
  },
  {
    citySlug: "london",
    articleSlug: "indoor-pool-hotels",
    city: "London",
    category: "Indoor",
    title: "London hotels with indoor pools",
    metaTitle: "Best indoor hotel pools in London — 2026 ranking",
    excerpt:
      "London's indoor hotel pools, ranked. Where to swim lengths, which are spa pools, and which are open to non-guests.",
    hero: "London swims indoors. These are the hotel pools worth the booking — from full lap pools to candle-lit spa basements.",
    intro: [
      "Very few London hotels have an outdoor pool, and the ones that do are seasonal. The real question in this city is which indoor pool is big enough, warm enough and quiet enough to be worth choosing a hotel for.",
      "We separate proper lap pools from spa plunge pools in the pool facts on each hotel page, because the difference matters and hotel marketing routinely blurs it.",
      "Everything here is scored on the same five criteria as our outdoor rankings, so a great basement pool can outrank a mediocre rooftop.",
    ],
    faqs: [
      {
        question: "Can non-guests swim in London hotel pools?",
        answer:
          "Some hotels sell spa day passes that include pool access, usually on weekdays and often with a treatment minimum. Others are strictly guests-only. Access policy is noted on the hotel page where we have confirmed it.",
      },
      {
        question: "Which London hotel pools are long enough to swim lengths?",
        answer:
          "Only a minority. Look for pools of 15 metres or more in the pool facts; below that you are turning too often for real lap swimming.",
      },
      {
        question: "Are children allowed in hotel spa pools?",
        answer:
          "Many London hotel pools sit inside the spa and restrict children to specific family hours, or exclude them entirely. Check the family-friendly flag on each hotel page.",
      },
    ],
    filter: { indoor: true },
    minHotels: 6,
    lastUpdated: "2026-08-19",
  },
  {
    citySlug: "paris",
    articleSlug: "indoor-pool-hotels",
    city: "Paris",
    category: "Indoor",
    title: "Paris hotels with indoor pools",
    metaTitle: "Best indoor hotel pools in Paris — 2026 ranking",
    excerpt:
      "Paris hotel pools worth swimming in: vaulted stone basements, hotel spas and the few genuine lap pools in the city.",
    hero: "Paris keeps its best pools underground — vaulted, quiet and warm, with the spa attached.",
    intro: [
      "The classic Paris hotel pool is a stone-vaulted basement below a palace hotel: dramatic, warm, and often small. A handful of properties break the pattern with pools long enough to swim properly.",
      "We score them on the same five criteria as everywhere else, so atmosphere alone does not carry a page: size, loungers and service count too.",
      "Access rules in Paris are stricter than in most cities — several of these pools are for guests and spa members only.",
    ],
    faqs: [
      {
        question: "Do Paris hotels have rooftop pools?",
        answer:
          "Almost none. Building height rules and the city's roofscape mean the pool is nearly always indoors or on a terrace at a lower level.",
      },
      {
        question: "Can I use a Paris hotel pool without staying there?",
        answer:
          "Occasionally, through a spa day booking. Most palace hotels restrict the pool to guests and spa members, and walk-in access is rare.",
      },
      {
        question: "Are these pools heated year-round?",
        answer:
          "Indoor hotel pools in Paris are heated and open year-round, typically 27–29°C, with closures only for maintenance.",
      },
    ],
    filter: { indoor: true },
    minHotels: 6,
    lastUpdated: "2026-08-19",
  },
  {
    citySlug: "bangkok",
    articleSlug: "infinity-pool-hotels",
    city: "Bangkok",
    category: "Infinity",
    title: "Bangkok hotels with infinity pools",
    metaTitle: "Best infinity pools in Bangkok hotels — 2026 ranking",
    excerpt:
      "Bangkok's infinity pools, ranked by Pool Score — edge, view, size and how crowded the loungers get.",
    hero: "Bangkok does the high-rise infinity edge better than almost anywhere. These are the pools where the view earns the hype.",
    intro: [
      "An infinity edge over the Chao Phraya or the Sukhumvit skyline is the signature Bangkok pool shot, and the city has enough of them that quality varies a lot: some are genuinely spectacular, others are narrow strips squeezed between sun loungers.",
      "We score the edge and the view, but also the things photographs hide — how many loungers there are, whether the pool is deep enough to swim in, and how early it fills up.",
      "Pools here are open year-round; the practical constraint is the afternoon heat and the May–October rain, not the season.",
    ],
    faqs: [
      {
        question: "When is the best time of day to use a Bangkok hotel pool?",
        answer:
          "Early morning and after 17:00. Midday sun on an exposed high-rise deck is punishing, and shade is limited on most infinity terraces.",
      },
      {
        question: "Are Bangkok hotel pools open all year?",
        answer:
          "Yes, essentially all of them. Rain during monsoon season can close a rooftop pool temporarily for safety, especially with lightning.",
      },
      {
        question: "Do infinity pools in Bangkok have a dress code?",
        answer:
          "The pool itself rarely does, but attached rooftop bars often do in the evening. If the pool shares a level with a bar, expect a change of clothes to be required after sunset.",
      },
    ],
    filter: { infinity: true },
    minHotels: 5,
    lastUpdated: "2026-08-19",
  },
  {
    citySlug: "los-angeles",
    articleSlug: "rooftop-pool-hotels",
    city: "Los Angeles",
    category: "Rooftop",
    title: "Los Angeles hotels with rooftop pools",
    metaTitle: "Best rooftop pools in Los Angeles hotels — 2026 ranking",
    excerpt:
      "Rooftop pools across Downtown LA, Hollywood and West Hollywood, ranked by Pool Score with view, size and scene noted.",
    hero: "In LA the rooftop pool is the hotel's living room. The question is whether you want the scene or the swim.",
    intro: [
      "Los Angeles rooftop pools split into two categories: social decks where the pool is a backdrop for a bar, and quieter ones where you can actually swim. We note which is which, because arriving at the wrong one ruins the afternoon.",
      "Views range from the Downtown skyline to the Hollywood Hills. Score-wise, view is only one of five criteria — a spectacular outlook does not compensate for four loungers and no shade.",
      "Most LA rooftop pools operate year-round thanks to heating, though winter evenings are cooler than visitors expect.",
    ],
    faqs: [
      {
        question: "Are LA hotel rooftop pools open to the public?",
        answer:
          "Several sell day passes or run pool-club programming on weekends, usually with a minimum spend. Others are guests-only. Policies change seasonally.",
      },
      {
        question: "Are they heated in winter?",
        answer:
          "Most are, and many stay open all year. Evening air in December and January drops into the low teens Celsius, so the pool is warmer than the deck.",
      },
      {
        question: "Which area has the best rooftop pools?",
        answer:
          "Downtown for skyline views, West Hollywood for the scene, Hollywood for a mix of both.",
      },
    ],
    filter: { rooftop: true },
    minHotels: 6,
    lastUpdated: "2026-08-19",
  },
  {
    citySlug: "crete",
    articleSlug: "off-season-pool-hotels",
    city: "Crete",
    category: "Off season",
    title: "Off season pool hotels in Crete",
    metaTitle: "Off season pool hotels in Crete — heated outdoor pools 2026",
    excerpt:
      "Crete hotels with heated outdoor pools, so the water is swimmable in spring and autumn rather than only in high summer. Ranked by our Pool Score.",
    hero: "Crete's air stays mild long after the beach crowds leave. These hotels heat their outdoor pools, which is what actually makes an April or October pool day work.",
    intro: [
      "Between November and March the sea around Crete sits at 16–18°C and an unheated pool is colder still. Even in April and October, an unheated outdoor pool rarely climbs past 20°C — warm enough to look at, not to swim in.",
      "Every hotel on this list runs at least one heated outdoor pool. That is the single feature that stretches the Cretan pool season from roughly ten weeks to six months, and in a couple of cases to the full year.",
      "Heating and opening dates are two different things: a hotel can heat its pool and still close the property for winter. Check the season note on each hotel page, and confirm heating dates directly with the hotel before booking a shoulder-season trip.",
    ],
    faqs: [
      {
        question: "When is the off season in Crete?",
        answer:
          "Roughly November to March is low season, with April, May and October counting as shoulder season. Most resorts open in April and close in late October.",
      },
      {
        question: "How warm is a heated hotel pool in Crete?",
        answer:
          "Typically 26–29°C. Private villa pools that are heated on request usually land at the upper end; large open-air resort pools lose heat to wind and sit lower.",
      },
      {
        question: "Can I swim outdoors in Crete in winter?",
        answer:
          "Only at the few hotels that keep a heated outdoor pool running year-round, mostly in Heraklion and the Elounda area. Everywhere else the outdoor pools are drained or unheated.",
      },
    ],
    filter: { heated: true, outdoor: true },
    minHotels: 5,
    lastUpdated: "2026-08-19",
  },
];

export const getCollection = (citySlug: string, articleSlug: string) =>
  collections.find((c) => c.citySlug === citySlug && c.articleSlug === articleSlug);

export const getCityCollections = (citySlug: string) =>
  collections.filter((c) => c.citySlug === citySlug);
