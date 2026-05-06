import barcelonaImg from "@/assets/barcelona.jpg";
import parisImg from "@/assets/paris.jpg";
import londonImg from "@/assets/london.jpg";
import newyorkImg from "@/assets/newyork.jpg";

export type Hotel = {
  rank: number;
  name: string;
  neighborhood: string;
  score: number;
  pricePerNight: string;
  poolType: string;
  highlight: string;
  description: string;
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
    pricePerNight: "från 6 200 kr",
    poolType: "Två utomhuspooler · havsutsikt",
    highlight: "Drömläge vid stranden",
    description:
      "Två pooler i en frodig trädgård med direkt utsikt över Medelhavet. Cabanas, cocktails och stadens snyggaste solnedgångar.",
  },
  {
    rank: 2,
    name: "The Barcelona EDITION",
    neighborhood: "El Born",
    score: 9.4,
    pricePerNight: "från 4 100 kr",
    poolType: "Takpool · skyline",
    highlight: "Bästa rooftop-vibet",
    description:
      "Mörkblå mosaikpool på taket, palmer och DJ vid solnedgång. Mitt i El Born – nära alla tapasbarer.",
  },
  {
    rank: 3,
    name: "Mandarin Oriental Barcelona",
    neighborhood: "Passeig de Gràcia",
    score: 9.3,
    pricePerNight: "från 7 800 kr",
    poolType: "Takpool · 24:e vån",
    highlight: "Lyx på Passeig de Gràcia",
    description:
      "Två pooler i takträdgården Terrat med 360°-utsikt över Eixample. Spa i världsklass och Michelin-mat på samma adress.",
  },
  {
    rank: 4,
    name: "Sir Victor Hotel",
    neighborhood: "Eixample",
    score: 9.1,
    pricePerNight: "från 3 600 kr",
    poolType: "Takpool · La Pedrera-vy",
    highlight: "Bohemisk takbar",
    description:
      "En liten men välkurerad pool på taket med utsikt mot Gaudís La Pedrera. Cool design, ung publik, perfekt för långa eftermiddagar.",
  },
  {
    rank: 5,
    name: "W Barcelona",
    neighborhood: "Barceloneta",
    score: 8.9,
    pricePerNight: "från 4 800 kr",
    poolType: "Tre pooler · strand",
    highlight: "Festigast vid havet",
    description:
      "Det ikoniska seglet vid stranden. Wet Deck-poolen är stadens partyepicentrum varje sommarlördag.",
  },
  {
    rank: 6,
    name: "Hotel SOFIA Barcelona",
    neighborhood: "Diagonal",
    score: 9.0,
    pricePerNight: "från 3 400 kr",
    poolType: "Takpool · skyline",
    highlight: "Sky Bar 26",
    description:
      "Takpool på 26:e våningen med 360°-vy över Barcelona. Modern, minimalistisk lyx en bit från turistkrysset.",
  },
  {
    rank: 7,
    name: "Almanac Barcelona",
    neighborhood: "Passeig de Gràcia",
    score: 9.0,
    pricePerNight: "från 4 600 kr",
    poolType: "Takpool · plunge",
    highlight: "Stilrent boutique",
    description:
      "Liten plunge-pool på taket med DJ:s om kvällen. Diskret lyx ett stenkast från Casa Batlló.",
  },
  {
    rank: 8,
    name: "Cotton House Hotel",
    neighborhood: "Eixample",
    score: 8.8,
    pricePerNight: "från 3 200 kr",
    poolType: "Takpool · plunge",
    highlight: "Klassisk Eixample-charm",
    description:
      "En liten plunge-pool på taket av ett 1800-talspalats. Frukost på terrassen, drinkar i biblioteket.",
  },
  {
    rank: 9,
    name: "ME Barcelona",
    neighborhood: "Eixample",
    score: 8.8,
    pricePerNight: "från 3 000 kr",
    poolType: "Takpool · party",
    highlight: "Rooftop-fest",
    description:
      "Pool och takbar på 11:e våningen, en av stadens mest aktiva sommarkvällar. Bra läge i centrala Eixample.",
  },
  {
    rank: 10,
    name: "Kimpton Vividora",
    neighborhood: "Gòtic",
    score: 8.7,
    pricePerNight: "från 2 900 kr",
    poolType: "Takpool · plunge",
    highlight: "Bästa läget i Gamla stan",
    description:
      "Liten takpool mitt i gotiska kvarteren. Inte den största poolen, men oslagbar känsla under stjärnorna.",
  },
];

export const cities: City[] = [
  {
    slug: "barcelona",
    name: "Barcelona",
    country: "Spanien",
    tagline: "Takpooler med Sagrada Família i bakgrunden",
    intro:
      "Barcelona är en stad där taken är lika viktiga som gatorna. Här rankar vi hotellen som kombinerar Gaudí-utsikt, medelhavsbris och kristallklart blått vatten.",
    image: barcelonaImg,
    hotels: barcelonaTop10,
  },
  {
    slug: "paris",
    name: "Paris",
    country: "Frankrike",
    tagline: "Diskret lyx och pooler under Eiffeltornet",
    intro:
      "Paris bevarar sina pooler bakom haussmannska fasader. Här är hotellen där du simmar i marmor, mosaik och guldljus – med Eiffeltornet som granne.",
    image: parisImg,
    hotels: [],
  },
  {
    slug: "london",
    name: "London",
    country: "Storbritannien",
    tagline: "Skypools högt över Themsen",
    intro:
      "London har på tio år gått från ‘inga pooler’ till hem för Europas mest spektakulära skypools.",
    image: londonImg,
    hotels: [],
  },
  {
    slug: "new-york",
    name: "New York",
    country: "USA",
    tagline: "Rooftop-pooler med skyskrapor i bakgrunden",
    intro: "Manhattans pooler är nästan alltid på taket – och ofta värda hypen.",
    image: newyorkImg,
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
    title: "Topp 10 lyxhotell med bäst pooler i Barcelona",
    city: "Barcelona",
    category: "Stor guide",
    excerpt:
      "Den kompletta rankingen av Barcelonas tio bästa hotellpooler — från ikoniska Hotel Arts till hemliga takplunger i Gòtic.",
    readingTime: "9 min",
    date: "2026-04-28",
    image: barcelonaImg,
  },
  {
    slug: "barcelona/rooftop-pool-hotels",
    citySlug: "barcelona",
    articleSlug: "rooftop-pool-hotels",
    title: "Bästa rooftop-pooler i Barcelona",
    city: "Barcelona",
    category: "Rooftop",
    excerpt:
      "Sju takpooler där utsikten är minst lika viktig som vattnet. Med tider, dresscode och vad det kostar att gå in som icke-gäst.",
    readingTime: "5 min",
    date: "2026-04-21",
    image: barcelonaImg,
  },
  {
    slug: "barcelona/pool-hotels-near-beach",
    citySlug: "barcelona",
    articleSlug: "pool-hotels-near-beach",
    title: "Poolhotell nära stranden i Barcelona",
    city: "Barcelona",
    category: "Strand",
    excerpt:
      "Hotell i Barceloneta och Poblenou där du kan kombinera havet med en riktigt bra hotellpool. Plus en geheimtipp i Diagonal Mar.",
    readingTime: "6 min",
    date: "2026-04-14",
    image: barcelonaImg,
  },
  {
    slug: "barcelona/pool-season",
    citySlug: "barcelona",
    articleSlug: "pool-season",
    title: "När är poolerna öppna i Barcelona? Säsong & öppettider",
    city: "Barcelona",
    category: "Praktiskt",
    excerpt:
      "Allt om poolsäsongen i Barcelona — när öppnar takpoolerna, vilka är öppna året runt och hur tidigt på året är det varmt nog?",
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
