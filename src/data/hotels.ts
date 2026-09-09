import barcelonaImg from "@/assets/barcelona.jpg";
import parisImg from "@/assets/paris.jpg";
import londonImg from "@/assets/london.jpg";
import newyorkImg from "@/assets/newyork.jpg";
import granCanariaImg from "@/assets/gran-canaria.jpg";
import mallorcaImg from "@/assets/mallorca.jpg";
import bangkokImg from "@/assets/bangkok.jpg";
import malagaImg from "@/assets/malaga.jpg";
import losAngelesImg from "@/assets/los-angeles.jpg";
import sydneyImg from "@/assets/sydney.jpg";
import creteImg from "@/assets/crete.jpg";

export type City = {
  slug: string;
  name: string;
  country: string;
  tagline: string;
  intro: string;
  image: string;
};














export const cities: City[] = [
  {
    slug: "barcelona",
    name: "Barcelona",
    country: "Spain",
    tagline: "Rooftop pools with the Sagrada Família in the background",
    intro:
      "Barcelona is a city where the rooftops matter as much as the streets. Here we rank the hotels that combine Gaudí views, Mediterranean breezes and crystal-clear blue water.",
    image: barcelonaImg,
  },
  {
    slug: "paris",
    name: "Paris",
    country: "France",
    tagline: "Discreet luxury and pools beneath the Eiffel Tower",
    intro:
      "Paris keeps its pools tucked behind Haussmannian facades. Here are the hotels where you swim in marble, mosaic and golden light — with the Eiffel Tower as your neighbor.",
    image: parisImg,
  },
  {
    slug: "london",
    name: "London",
    country: "United Kingdom",
    tagline: "Sky pools high above the Thames",
    intro:
      "In ten years London went from 'no pools' to home of Europe's most spectacular sky pools.",
    image: londonImg,
  },
  {
    slug: "new-york",
    name: "New York",
    country: "USA",
    tagline: "Rooftop pools with skyscrapers in the background",
    intro: "Manhattan's pools are nearly always on the roof — and often worth the hype.",
    image: newyorkImg,
  },
  {
    slug: "gran-canaria",
    name: "Gran Canaria",
    country: "Spain",
    tagline: "Volcanic coastline and year-round pool weather",
    intro:
      "Gran Canaria's resort hotels turn the Atlantic into a backdrop — infinity pools above black-rock cliffs, palm-lined decks and warm water from January to December.",
    image: granCanariaImg,
  },
  {
    slug: "mallorca",
    name: "Mallorca",
    country: "Spain",
    tagline: "Cliffside pools above the Mediterranean",
    intro:
      "From Deià to Cap de Formentor, Mallorca hides some of Europe's most beautifully placed hotel pools — pine forests, stone terraces and that very specific Balearic blue.",
    image: mallorcaImg,
  },
  {
    slug: "bangkok",
    name: "Bangkok",
    country: "Thailand",
    tagline: "Sky pools high above the tropical metropolis",
    intro:
      "Bangkok perfected the rooftop infinity pool. We rank the city's most spectacular sky pools — the ones with the skyline view, the cocktail program and the warm tropical evenings.",
    image: bangkokImg,
  },
  {
    slug: "malaga",
    name: "Málaga",
    country: "Spain",
    tagline: "Andalusian rooftops above the Costa del Sol",
    intro:
      "Málaga's hotel scene has grown up fast — rooftop pools with cathedral views, port-side resorts and warm Andalusian evenings that stretch long into October.",
    image: malagaImg,
  },
  {
    slug: "los-angeles",
    name: "Los Angeles",
    country: "USA",
    tagline: "Hollywood pool decks under California sun",
    intro:
      "From Bel Air's pink-tiled icon to rooftop infinity pools above the Sunset Strip, Los Angeles invented the cinematic hotel pool. Year-round sun, palm trees and cabanas included.",
    image: losAngelesImg,
  },
  {
    slug: "sydney",
    name: "Sydney",
    country: "Australia",
    tagline: "Harbour-view pools facing the Opera House",
    intro:
      "Sydney's best hotel pools are aimed straight at the harbour — rooftop decks framing the Opera House, sky-high indoor pools above Circular Quay and one boutique that lets you swim in the harbour itself.",
    image: sydneyImg,
  },
  {
    slug: "crete",
    name: "Crete",
    country: "Greece",
    tagline: "Private seawater pools above the Cretan Sea",
    intro:
      "Crete does pools at two extremes: sprawling lagoon resorts on the north coast and tiny private plunge pools cut into the cliffs around Elounda. We rank the island's best, from Chania rooftops to Mirabello Bay infinity edges.",
    image: creteImg,
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
