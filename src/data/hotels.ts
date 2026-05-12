import barcelonaImg from "@/assets/barcelona.jpg";
import parisImg from "@/assets/paris.jpg";
import londonImg from "@/assets/london.jpg";
import newyorkImg from "@/assets/newyork.jpg";
import granCanariaImg from "@/assets/gran-canaria.jpg";
import mallorcaImg from "@/assets/mallorca.jpg";
import bangkokImg from "@/assets/bangkok.jpg";
import malagaImg from "@/assets/malaga.jpg";

export type HotelTag = "rooftop" | "resort" | "quiet" | "spa";

export type Hotel = {
  rank: number;
  name: string;
  neighborhood: string;
  score: number;
  pricePerNight: string;
  poolType: string;
  highlight: string;
  description: string;
  vibe?: string;
  bestTime?: string;
  tags?: HotelTag[];
};

export type City = {
  slug: string;
  name: string;
  country: string;
  tagline: string;
  intro: string;
  image: string;
  hotels: Hotel[];
};

export const barcelonaTop10: Hotel[] = [
  {
    rank: 1,
    name: "Hotel Arts Barcelona",
    neighborhood: "Barceloneta",
    score: 9.6,
    pricePerNight: "from $620",
    poolType: "Two outdoor pools · sea view",
    highlight: "Dream beachfront location",
    description:
      "Two pools in a lush garden with direct Mediterranean views. Cabanas, cocktails and the city's best sunsets.",
    vibe: "Resort in the city — palms, sea breeze, calm elegance",
    bestTime: "June–September, late afternoon",
    tags: ["resort", "spa"],
  },
  {
    rank: 2,
    name: "The Barcelona EDITION",
    neighborhood: "El Born",
    score: 9.4,
    pricePerNight: "from $410",
    poolType: "Rooftop pool · skyline",
    highlight: "Best rooftop vibe",
    description:
      "Deep-blue mosaic pool on the roof, palm trees and a DJ at sunset. In the heart of El Born — close to every tapas bar.",
    vibe: "Cool, young, DJ sets at sunset",
    bestTime: "July–August, 6–10pm",
    tags: ["rooftop"],
  },
  {
    rank: 3,
    name: "Mandarin Oriental Barcelona",
    neighborhood: "Passeig de Gràcia",
    score: 9.3,
    pricePerNight: "from $780",
    poolType: "Rooftop pool · 24th floor",
    highlight: "Luxury on Passeig de Gràcia",
    description:
      "Two pools in the Terrat rooftop garden with 360° views of Eixample. World-class spa and Michelin dining at the same address.",
    vibe: "Quiet, grown-up, world-class service",
    bestTime: "Year-round — heated",
    tags: ["rooftop", "spa", "quiet"],
  },
  {
    rank: 4,
    name: "Sir Victor Hotel",
    neighborhood: "Eixample",
    score: 9.1,
    pricePerNight: "from $360",
    poolType: "Rooftop pool · La Pedrera view",
    highlight: "Bohemian rooftop bar",
    description:
      "A small but well-curated rooftop pool overlooking Gaudí's La Pedrera. Cool design, young crowd, perfect for long afternoons.",
    vibe: "Bohemian, design-led, young crowd",
    bestTime: "May–October, afternoon",
    tags: ["rooftop"],
  },
  {
    rank: 5,
    name: "W Barcelona",
    neighborhood: "Barceloneta",
    score: 8.9,
    pricePerNight: "from $480",
    poolType: "Three pools · beach",
    highlight: "Most party-friendly by the sea",
    description:
      "The iconic sail by the beach. The Wet Deck pool is the city's party epicenter every summer Saturday.",
    vibe: "Party, high energy, big groups",
    bestTime: "Saturdays June–August",
    tags: ["resort"],
  },
  {
    rank: 6,
    name: "Hotel SOFIA Barcelona",
    neighborhood: "Diagonal",
    score: 9.0,
    pricePerNight: "from $340",
    poolType: "Rooftop pool · skyline",
    highlight: "Sky Bar 26",
    description:
      "Rooftop pool on the 26th floor with 360° views over Barcelona. Modern, minimalist luxury away from the tourist crush.",
    vibe: "Modern, minimalist, calmer",
    bestTime: "June–September, evenings",
    tags: ["rooftop", "spa", "quiet"],
  },
  {
    rank: 7,
    name: "Almanac Barcelona",
    neighborhood: "Passeig de Gràcia",
    score: 9.0,
    pricePerNight: "from $460",
    poolType: "Rooftop pool · plunge",
    highlight: "Sleek boutique",
    description:
      "Small rooftop plunge pool with DJs in the evening. Discreet luxury a stone's throw from Casa Batlló.",
    vibe: "Boutique, intimate, polished",
    bestTime: "May–September, afternoon",
    tags: ["rooftop", "quiet"],
  },
  {
    rank: 8,
    name: "Cotton House Hotel",
    neighborhood: "Eixample",
    score: 8.8,
    pricePerNight: "from $320",
    poolType: "Rooftop pool · plunge",
    highlight: "Classic Eixample charm",
    description:
      "A small plunge pool on top of a 19th-century palace. Breakfast on the terrace, drinks in the library.",
    vibe: "Classic, calm, grown-up",
    bestTime: "May–October, mornings",
    tags: ["quiet"],
  },
  {
    rank: 9,
    name: "ME Barcelona",
    neighborhood: "Eixample",
    score: 8.8,
    pricePerNight: "from $300",
    poolType: "Rooftop pool · party",
    highlight: "Rooftop party",
    description:
      "Pool and rooftop bar on the 11th floor, one of the city's most active summer evenings. Great location in central Eixample.",
    vibe: "Energetic, drink-led, party",
    bestTime: "Thursday–Saturday nights",
    tags: ["rooftop"],
  },
  {
    rank: 10,
    name: "Kimpton Vividora",
    neighborhood: "Gòtic",
    score: 8.7,
    pricePerNight: "from $290",
    poolType: "Rooftop pool · plunge",
    highlight: "Best location in the Old Town",
    description:
      "Small rooftop pool right in the Gothic Quarter. Not the biggest pool, but unbeatable atmosphere under the stars.",
    vibe: "Charming, romantic, evening light",
    bestTime: "June–September, after 7pm",
    tags: ["rooftop", "quiet"],
  },
  {
    rank: 11,
    name: "Soho House Barcelona",
    neighborhood: "Gòtic",
    score: 8.7,
    pricePerNight: "from $380",
    poolType: "Rooftop pool · harbour view",
    highlight: "Members' club rooftop",
    description:
      "A small but iconic rooftop pool overlooking the port. The 19th-century building, the palms and the sunset crowd make this one of the city's most cinematic pools.",
    vibe: "Members' club, polished, evenings",
    bestTime: "May–September, late afternoon",
    tags: ["rooftop", "quiet"],
  },
  {
    rank: 12,
    name: "H10 Cubik",
    neighborhood: "Via Laietana",
    score: 8.6,
    pricePerNight: "from $260",
    poolType: "Rooftop plunge · skyline",
    highlight: "Old Town rooftop value",
    description:
      "A compact rooftop with a plunge pool, sunbeds and a 360° view over the Old Town. Great value for the location.",
    vibe: "Casual, sociable, daytime",
    bestTime: "June–September, midday",
    tags: ["rooftop"],
  },
  {
    rank: 13,
    name: "Yurbban Trafalgar",
    neighborhood: "El Born",
    score: 8.6,
    pricePerNight: "from $230",
    poolType: "Rooftop plunge · skyline",
    highlight: "Boutique rooftop on a budget",
    description:
      "Tiny rooftop pool with one of the best skyline panoramas in Born. The breakfast on the terrace alone justifies the booking.",
    vibe: "Boutique, friendly, low-key",
    bestTime: "May–October, mornings",
    tags: ["rooftop"],
  },
  {
    rank: 14,
    name: "Ohla Eixample",
    neighborhood: "Eixample",
    score: 8.6,
    pricePerNight: "from $310",
    poolType: "Rooftop pool · skyline",
    highlight: "Glass-bottom rooftop",
    description:
      "A glass-bottom pool that hangs over the rooftop edge with a Sagrada Família line of sight. Architectural drama with a Michelin-starred restaurant downstairs.",
    vibe: "Design-led, grown-up, dramatic",
    bestTime: "June–September, evenings",
    tags: ["rooftop", "spa"],
  },
  {
    rank: 15,
    name: "Pestana Arena Barcelona",
    neighborhood: "Sant Antoni",
    score: 8.5,
    pricePerNight: "from $250",
    poolType: "Rooftop pool · skyline",
    highlight: "Sant Antoni newcomer",
    description:
      "A wide, modern rooftop pool overlooking Las Arenas. Sunset DJs in summer and a calmer crowd than the central rooftops.",
    vibe: "Modern, neighbourhood, relaxed",
    bestTime: "May–September, afternoons",
    tags: ["rooftop"],
  },
  {
    rank: 16,
    name: "The Wittmore",
    neighborhood: "Gòtic",
    score: 8.5,
    pricePerNight: "from $340",
    poolType: "Rooftop plunge · adults-only",
    highlight: "Adults-only Old Town hideaway",
    description:
      "An intimate rooftop plunge in the Gothic Quarter, adults-only, with a tiny solarium and great cocktails. A very different mood from the party rooftops.",
    vibe: "Quiet, romantic, grown-up",
    bestTime: "May–October, late afternoon",
    tags: ["rooftop", "quiet"],
  },
  {
    rank: 17,
    name: "Hotel 1898",
    neighborhood: "La Rambla",
    score: 8.4,
    pricePerNight: "from $290",
    poolType: "Rooftop pool · skyline",
    highlight: "Best location on La Rambla",
    description:
      "A surprisingly tranquil rooftop above the bustle of La Rambla, with views over the cathedral and the harbour. Heated indoor pool too.",
    vibe: "Classic, calm, central",
    bestTime: "Year-round",
    tags: ["rooftop", "spa"],
  },
  {
    rank: 18,
    name: "NH Collection Gran Hotel Calderón",
    neighborhood: "Eixample",
    score: 8.4,
    pricePerNight: "from $260",
    poolType: "Rooftop pool · skyline",
    highlight: "Two pools, central Eixample",
    description:
      "One of the few hotels in the centre with a proper swimmable rooftop pool plus an indoor pool. Reliable, big, and well-located on Rambla Catalunya.",
    vibe: "Reliable, family-friendly, central",
    bestTime: "May–October",
    tags: ["rooftop", "spa"],
  },
  {
    rank: 19,
    name: "Hotel Casa Fuster",
    neighborhood: "Gràcia",
    score: 8.3,
    pricePerNight: "from $330",
    poolType: "Rooftop plunge · skyline",
    highlight: "Modernist landmark",
    description:
      "A small rooftop plunge on top of a Domènech i Montaner palace at the top of Passeig de Gràcia. Live jazz on Thursdays in the lounge below.",
    vibe: "Classic, elegant, evenings",
    bestTime: "May–September",
    tags: ["rooftop", "quiet"],
  },
  {
    rank: 20,
    name: "Hotel Brummell",
    neighborhood: "Poble-sec",
    score: 8.3,
    pricePerNight: "from $220",
    poolType: "Outdoor plunge · garden",
    highlight: "Neighbourhood plunge with yoga",
    description:
      "A tucked-away plunge pool in a leafy interior courtyard in Poble-sec. Yoga in the morning, natural wine on the terrace at night.",
    vibe: "Bohemian, neighbourhood, calm",
    bestTime: "May–October, mornings",
    tags: ["quiet"],
  },
];



export const cities: City[] = [
  {
    slug: "barcelona",
    name: "Barcelona",
    country: "Spain",
    tagline: "Rooftop pools with the Sagrada Família in the background",
    intro:
      "Barcelona is a city where the rooftops matter as much as the streets. Here we rank the hotels that combine Gaudí views, Mediterranean breezes and crystal-clear blue water.",
    image: barcelonaImg,
    hotels: barcelonaTop10,
  },
  {
    slug: "paris",
    name: "Paris",
    country: "France",
    tagline: "Discreet luxury and pools beneath the Eiffel Tower",
    intro:
      "Paris keeps its pools tucked behind Haussmannian facades. Here are the hotels where you swim in marble, mosaic and golden light — with the Eiffel Tower as your neighbor.",
    image: parisImg,
    hotels: [],
  },
  {
    slug: "london",
    name: "London",
    country: "United Kingdom",
    tagline: "Sky pools high above the Thames",
    intro:
      "In ten years London went from 'no pools' to home of Europe's most spectacular sky pools.",
    image: londonImg,
    hotels: [],
  },
  {
    slug: "new-york",
    name: "New York",
    country: "USA",
    tagline: "Rooftop pools with skyscrapers in the background",
    intro: "Manhattan's pools are nearly always on the roof — and often worth the hype.",
    image: newyorkImg,
    hotels: [],
  },
  {
    slug: "gran-canaria",
    name: "Gran Canaria",
    country: "Spain",
    tagline: "Volcanic coastline and year-round pool weather",
    intro:
      "Gran Canaria's resort hotels turn the Atlantic into a backdrop — infinity pools above black-rock cliffs, palm-lined decks and warm water from January to December.",
    image: granCanariaImg,
    hotels: [],
  },
  {
    slug: "mallorca",
    name: "Mallorca",
    country: "Spain",
    tagline: "Cliffside pools above the Mediterranean",
    intro:
      "From Deià to Cap de Formentor, Mallorca hides some of Europe's most beautifully placed hotel pools — pine forests, stone terraces and that very specific Balearic blue.",
    image: mallorcaImg,
    hotels: [],
  },
  {
    slug: "bangkok",
    name: "Bangkok",
    country: "Thailand",
    tagline: "Sky pools high above the tropical metropolis",
    intro:
      "Bangkok perfected the rooftop infinity pool. We rank the city's most spectacular sky pools — the ones with the skyline view, the cocktail program and the warm tropical evenings.",
    image: bangkokImg,
    hotels: [],
  },
  {
    slug: "malaga",
    name: "Málaga",
    country: "Spain",
    tagline: "Andalusian rooftops above the Costa del Sol",
    intro:
      "Málaga's hotel scene has grown up fast — rooftop pools with cathedral views, port-side resorts and warm Andalusian evenings that stretch long into October.",
    image: malagaImg,
    hotels: [],
  },
];

export const getCity = (slug: string) => cities.find((c) => c.slug === slug);

/* ---------------- Guides / articles ---------------- */

export type Guide = {
  slug: string; // e.g. "barcelona/luxury-pool-hotels"
  citySlug: string;
  articleSlug: string;
  title: string;
  city: string;
  category: string;
  excerpt: string;
  readingTime: string;
  date: string; // ISO
  image: string;
};

export const guides: Guide[] = [
  {
    slug: "barcelona/luxury-pool-hotels",
    citySlug: "barcelona",
    articleSlug: "luxury-pool-hotels",
    title: "Top 10 luxury hotels with the best pools in Barcelona",
    city: "Barcelona",
    category: "Big guide",
    excerpt:
      "The complete ranking of Barcelona's ten best hotel pools — from iconic Hotel Arts to secret rooftop plunges in Gòtic.",
    readingTime: "9 min",
    date: "2026-04-28",
    image: barcelonaImg,
  },
  {
    slug: "barcelona/rooftop-pool-hotels",
    citySlug: "barcelona",
    articleSlug: "rooftop-pool-hotels",
    title: "Best rooftop pools in Barcelona",
    city: "Barcelona",
    category: "Rooftop",
    excerpt:
      "Seven rooftop pools where the view matters as much as the water. With hours, dress code and the cost of getting in as a non-guest.",
    readingTime: "5 min",
    date: "2026-04-21",
    image: barcelonaImg,
  },
  {
    slug: "barcelona/pool-hotels-near-beach",
    citySlug: "barcelona",
    articleSlug: "pool-hotels-near-beach",
    title: "Pool hotels near the beach in Barcelona",
    city: "Barcelona",
    category: "Beach",
    excerpt:
      "Hotels in Barceloneta and Poblenou where you can combine the sea with a really good hotel pool. Plus a hidden gem in Diagonal Mar.",
    readingTime: "6 min",
    date: "2026-04-14",
    image: barcelonaImg,
  },
  {
    slug: "barcelona/pool-season",
    citySlug: "barcelona",
    articleSlug: "pool-season",
    title: "When are the pools open in Barcelona? Season & opening hours",
    city: "Barcelona",
    category: "Practical",
    excerpt:
      "Everything about pool season in Barcelona — when do the rooftop pools open, which are open year-round, and how early in the year is it warm enough?",
    readingTime: "4 min",
    date: "2026-04-07",
    image: barcelonaImg,
  },
];

export const getGuide = (slug: string) => guides.find((g) => g.slug === slug);
export const getGuideByParts = (citySlug: string, articleSlug: string) =>
  guides.find((g) => g.citySlug === citySlug && g.articleSlug === articleSlug);
export const getCityGuides = (citySlug: string) =>
  guides.filter((g) => g.citySlug === citySlug);
