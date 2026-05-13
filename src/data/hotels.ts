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

export const parisTop20: Hotel[] = [
  { rank: 1, name: "Cheval Blanc Paris", neighborhood: "Pont-Neuf", score: 9.7, pricePerNight: "from $2,400", poolType: "Indoor pool · Dior Spa", highlight: "City's most beautiful indoor pool", description: "A 30-meter mosaic pool deep inside the Dior Spa, lit by Murano glass. The most polished swim in Paris, period.", vibe: "Discreet, hushed, world-class", bestTime: "Year-round, weekday mornings", tags: ["spa", "quiet"] },
  { rank: 2, name: "Ritz Paris", neighborhood: "Place Vendôme", score: 9.6, pricePerNight: "from $1,800", poolType: "Indoor pool · Ritz Club", highlight: "Legendary Ritz Club pool", description: "A trompe-l'œil sky above warm water under columns. The Ritz Club's pool feels like swimming inside a Belle Époque painting.", vibe: "Old-world luxury, golden light", bestTime: "Year-round", tags: ["spa", "quiet"] },
  { rank: 3, name: "Four Seasons George V", neighborhood: "Champs-Élysées", score: 9.5, pricePerNight: "from $1,900", poolType: "Indoor pool · spa", highlight: "Best spa pool on the Right Bank", description: "A 17-meter mosaic pool wrapped around marble columns. Calm, warm and tucked under the famous flower-filled hotel.", vibe: "Plush, grown-up, very Parisian", bestTime: "Year-round", tags: ["spa", "quiet"] },
  { rank: 4, name: "Le Bristol Paris", neighborhood: "Faubourg Saint-Honoré", score: 9.4, pricePerNight: "from $1,500", poolType: "Rooftop pool · teak deck", highlight: "Rooftop pool shaped like a yacht", description: "A wood-clad rooftop pool on the 6th floor with a Sacré-Cœur skyline view. Feels like a private boat above Paris.", vibe: "Elegant, light-filled, family-friendly", bestTime: "May–September", tags: ["rooftop", "spa"] },
  { rank: 5, name: "Hôtel de Crillon", neighborhood: "Place de la Concorde", score: 9.3, pricePerNight: "from $1,700", poolType: "Indoor pool · Sense Spa", highlight: "Sense Spa hideaway", description: "An intimate vaulted indoor pool under the 18th-century palace. Perfect for a long Parisian winter afternoon.", vibe: "Quiet, classical, romantic", bestTime: "Year-round", tags: ["spa", "quiet"] },
  { rank: 6, name: "Bulgari Hôtel Paris", neighborhood: "Avenue George V", score: 9.3, pricePerNight: "from $2,100", poolType: "Indoor pool · 25m gold mosaic", highlight: "25m gold-mosaic pool", description: "A vast 25-meter pool clad in golden mosaic tiles, deep below ground in the Bulgari Spa. The longest indoor swim in Paris luxury.", vibe: "Italian glamour, contemporary", bestTime: "Year-round", tags: ["spa", "quiet"] },
  { rank: 7, name: "Mandarin Oriental Paris", neighborhood: "Rue Saint-Honoré", score: 9.2, pricePerNight: "from $1,400", poolType: "Indoor pool · spa", highlight: "Asian-inspired spa pool", description: "A long indoor pool in a contemporary spa, hidden behind the historic facade. One of the calmest pools in central Paris.", vibe: "Modern Asian luxury", bestTime: "Year-round", tags: ["spa", "quiet"] },
  { rank: 8, name: "Hôtel Plaza Athénée", neighborhood: "Avenue Montaigne", score: 9.1, pricePerNight: "from $1,600", poolType: "Indoor pool · Dior Spa", highlight: "Dior Institut pool", description: "A small but exquisite indoor pool inside the Dior Institut, with the iconic red awnings outside. Pure couture comfort.", vibe: "Couture, polished, romantic", bestTime: "Year-round", tags: ["spa", "quiet"] },
  { rank: 9, name: "Le Royal Monceau Raffles", neighborhood: "Champs-Élysées", score: 9.0, pricePerNight: "from $1,200", poolType: "Indoor pool · 23m My Blend by Clarins", highlight: "23m wellness pool", description: "A 23-meter pool with underwater music in the Clarins Spa. Bright, contemporary and surprisingly playful.", vibe: "Contemporary, art-led, family-friendly", bestTime: "Year-round", tags: ["spa"] },
  { rank: 10, name: "The Peninsula Paris", neighborhood: "Avenue Kléber", score: 9.0, pricePerNight: "from $1,500", poolType: "Indoor pool · marble", highlight: "Marble basement pool", description: "A serene marble-walled pool deep in the spa with mood lighting and silence. A short walk from the Arc de Triomphe.", vibe: "Calm, modern, grown-up", bestTime: "Year-round", tags: ["spa", "quiet"] },
  { rank: 11, name: "Shangri-La Paris", neighborhood: "Trocadéro", score: 8.9, pricePerNight: "from $1,300", poolType: "Indoor pool · Chi Spa", highlight: "Eiffel Tower neighbours", description: "A long indoor pool in a hushed spa, with rooms upstairs that look directly at the Eiffel Tower.", vibe: "Asian luxury, romantic, calm", bestTime: "Year-round", tags: ["spa", "quiet"] },
  { rank: 12, name: "Hôtel Lutetia", neighborhood: "Saint-Germain", score: 8.8, pricePerNight: "from $1,100", poolType: "Indoor pool · 17m Akasha Spa", highlight: "Left Bank wellness", description: "A 17-meter Roman-style pool under arches in the Akasha Spa. The best swim on the Left Bank.", vibe: "Left Bank, classic, polished", bestTime: "Year-round", tags: ["spa", "quiet"] },
  { rank: 13, name: "Park Hyatt Paris-Vendôme", neighborhood: "Place Vendôme", score: 8.8, pricePerNight: "from $1,200", poolType: "Indoor pool · spa", highlight: "Hidden Vendôme spa pool", description: "A small mosaic pool tucked under the Vendôme building. Discreet, warm and very quiet.", vibe: "Discreet, modern, business-friendly", bestTime: "Year-round", tags: ["spa", "quiet"] },
  { rank: 14, name: "La Réserve Paris", neighborhood: "Champs-Élysées", score: 8.8, pricePerNight: "from $1,400", poolType: "Indoor pool · 16m Nescens Spa", highlight: "Nescens Spa pool", description: "A 16-meter pool under a domed glass ceiling in the Nescens Spa. Feels like a private bath in a Haussmannian mansion.", vibe: "Townhouse luxury, intimate", bestTime: "Year-round", tags: ["spa", "quiet"] },
  { rank: 15, name: "Hôtel Costes", neighborhood: "Rue Saint-Honoré", score: 8.7, pricePerNight: "from $900", poolType: "Indoor pool · candle-lit", highlight: "Famously moody pool", description: "A black-tiled indoor pool, candle-lit, with the Costes soundtrack playing softly. Iconic.", vibe: "Sensual, dim, fashion crowd", bestTime: "Year-round", tags: ["spa"] },
  { rank: 16, name: "Hôtel Brach Paris", neighborhood: "16th arrondissement", score: 8.6, pricePerNight: "from $700", poolType: "Indoor pool · 22m Philippe Starck", highlight: "Starck-designed pool", description: "A 22-meter pool with brass details and warm woods in a Starck-designed wellness floor. Younger and more playful than the palaces.", vibe: "Design-led, contemporary, young", bestTime: "Year-round", tags: ["spa"] },
  { rank: 17, name: "Hôtel Molitor MGallery", neighborhood: "Auteuil", score: 8.5, pricePerNight: "from $400", poolType: "Outdoor & indoor pools · Art Deco", highlight: "Iconic Art Deco lido", description: "The legendary Molitor — two huge Art Deco pools (one outdoor, one indoor) reborn as a hotel. The most cinematic swim in Paris.", vibe: "Art Deco, sociable, energetic", bestTime: "May–September outdoor, year-round indoor", tags: ["resort", "spa"] },
  { rank: 18, name: "Mama Shelter Paris West", neighborhood: "Porte de Versailles", score: 8.3, pricePerNight: "from $220", poolType: "Indoor pool · plunge", highlight: "Affordable pool stay", description: "A small heated indoor pool in a young, design-led hotel. Rare in Paris at this price point.", vibe: "Playful, young, casual", bestTime: "Year-round", tags: ["spa"] },
  { rank: 19, name: "Maison Albar Le Vendome", neighborhood: "Opéra", score: 8.3, pricePerNight: "from $500", poolType: "Indoor pool · plunge", highlight: "Boutique central plunge", description: "A small but warm indoor pool in a boutique hotel near the Opéra. Often almost empty.", vibe: "Boutique, calm, central", bestTime: "Year-round", tags: ["spa", "quiet"] },
  { rank: 20, name: "Sofitel Paris Le Faubourg", neighborhood: "Faubourg Saint-Honoré", score: 8.2, pricePerNight: "from $600", poolType: "Indoor pool · spa", highlight: "Reliable luxury pool", description: "A bright indoor pool in a contemporary spa, two minutes from Place de la Concorde. A reliable, grown-up choice.", vibe: "Contemporary, polished, central", bestTime: "Year-round", tags: ["spa"] },
];

export const londonTop20: Hotel[] = [
  { rank: 1, name: "The Berkeley", neighborhood: "Knightsbridge", score: 9.6, pricePerNight: "from $900", poolType: "Rooftop pool · retractable roof", highlight: "Rooftop pool with sliding roof", description: "A heated 18-meter rooftop pool with a retractable roof — open to the sky in summer, glass-covered in winter. Hyde Park on one side.", vibe: "Polished, grown-up, year-round", bestTime: "Year-round", tags: ["rooftop", "spa"] },
  { rank: 2, name: "The Ned", neighborhood: "City of London", score: 9.4, pricePerNight: "from $500", poolType: "Rooftop pool · members' club", highlight: "Rooftop pool with St Paul's view", description: "A heated rooftop pool on a former bank with a direct line of sight to St Paul's. Members and hotel guests only.", vibe: "Members' club, design-led, energetic", bestTime: "May–September", tags: ["rooftop"] },
  { rank: 3, name: "Bvlgari Hotel London", neighborhood: "Knightsbridge", score: 9.4, pricePerNight: "from $1,100", poolType: "Indoor pool · 25m gold mosaic", highlight: "25m gold-tiled spa pool", description: "A long, candle-lit indoor pool in a basement spa clad in dark wood and gold mosaic. Among London's quietest swims.", vibe: "Dark, sensual, hushed", bestTime: "Year-round", tags: ["spa", "quiet"] },
  { rank: 4, name: "Pan Pacific London", neighborhood: "Bishopsgate", score: 9.2, pricePerNight: "from $450", poolType: "Indoor pool · 18.5m skyline view", highlight: "Pool with Liverpool Street skyline", description: "An 18.5-meter indoor pool on the spa floor with floor-to-ceiling glass overlooking the City skyline.", vibe: "Modern, business, light-filled", bestTime: "Year-round", tags: ["spa"] },
  { rank: 5, name: "Four Seasons Ten Trinity Square", neighborhood: "Tower Hill", score: 9.1, pricePerNight: "from $700", poolType: "Indoor pool · 14m Roman-style", highlight: "Roman-style basement pool", description: "A 14-meter indoor pool deep beneath the Beaux-Arts building near the Tower of London. Very private.", vibe: "Heritage, hushed, romantic", bestTime: "Year-round", tags: ["spa", "quiet"] },
  { rank: 6, name: "Mandarin Oriental Hyde Park", neighborhood: "Knightsbridge", score: 9.0, pricePerNight: "from $1,200", poolType: "Indoor pool · 17m spa", highlight: "Hyde Park spa pool", description: "A 17-meter indoor pool in a serene spa overlooking Hyde Park. One of London's most refined swims.", vibe: "Polished, classic, calm", bestTime: "Year-round", tags: ["spa", "quiet"] },
  { rank: 7, name: "Shangri-La The Shard", neighborhood: "London Bridge", score: 9.0, pricePerNight: "from $700", poolType: "Indoor pool · 52nd floor sky view", highlight: "Highest hotel pool in London", description: "An infinity-edge pool on the 52nd floor of the Shard with a panoramic view of the Thames and the City.", vibe: "Sky-high, modern, dramatic", bestTime: "Year-round, sunset", tags: ["spa"] },
  { rank: 8, name: "Corinthia London", neighborhood: "Whitehall", score: 8.9, pricePerNight: "from $800", poolType: "Indoor pool · ESPA Life", highlight: "ESPA Life flagship pool", description: "A long indoor pool in the ESPA Life spa under amphitheatre seating. The most extensive spa floor in central London.", vibe: "Modern, grown-up, calm", bestTime: "Year-round", tags: ["spa", "quiet"] },
  { rank: 9, name: "The Lanesborough", neighborhood: "Hyde Park Corner", score: 8.9, pricePerNight: "from $1,400", poolType: "Indoor pool · 18m Club & Spa", highlight: "Club & Spa pool", description: "An 18-meter indoor pool with a vaulted ceiling and underwater speakers in the Lanesborough Club & Spa.", vibe: "Townhouse luxury, exclusive", bestTime: "Year-round", tags: ["spa", "quiet"] },
  { rank: 10, name: "Rosewood London", neighborhood: "Holborn", score: 8.8, pricePerNight: "from $700", poolType: "Indoor pool · Sense Spa", highlight: "Sense Spa pool", description: "A small but warm indoor pool in the Sense Spa under the Edwardian Belle Époque building. Quiet and refined.", vibe: "Heritage, quiet, refined", bestTime: "Year-round", tags: ["spa", "quiet"] },
  { rank: 11, name: "Royal Lancaster London", neighborhood: "Bayswater", score: 8.7, pricePerNight: "from $300", poolType: "Indoor pool · 18m hotel spa", highlight: "Big hotel pool by Hyde Park", description: "An 18-meter indoor pool with classic loungers, a sauna and a steam room — right next to Hyde Park.", vibe: "Classic, family-friendly, central", bestTime: "Year-round", tags: ["spa"] },
  { rank: 12, name: "The Dilly London", neighborhood: "Piccadilly", score: 8.6, pricePerNight: "from $250", poolType: "Indoor pool · Art Deco 21m", highlight: "Art Deco basement pool", description: "A spectacular 21-meter Art Deco pool below the famous Piccadilly building. One of London's most underrated swims.", vibe: "Art Deco, calm, central", bestTime: "Year-round", tags: ["spa", "quiet"] },
  { rank: 13, name: "ME London", neighborhood: "Strand", score: 8.6, pricePerNight: "from $350", poolType: "Indoor plunge · spa", highlight: "Design-led plunge", description: "A small black-tiled plunge pool inside a Foster + Partners building on the Strand. Sleek, minimalist, dramatic.", vibe: "Design-led, modern, dark", bestTime: "Year-round", tags: ["spa"] },
  { rank: 14, name: "The Biltmore Mayfair", neighborhood: "Mayfair", score: 8.5, pricePerNight: "from $400", poolType: "Indoor pool · spa", highlight: "Mayfair spa pool", description: "A long indoor pool in a quiet basement spa on Grosvenor Square. A rare pool in core Mayfair.", vibe: "Mayfair, grown-up, business-friendly", bestTime: "Year-round", tags: ["spa", "quiet"] },
  { rank: 15, name: "Pullman London St Pancras", neighborhood: "King's Cross", score: 8.4, pricePerNight: "from $230", poolType: "Indoor pool · spa", highlight: "Pool near St Pancras", description: "A clean, warm indoor pool steps from the Eurostar terminal. Brilliant for layovers and long weekends.", vibe: "Practical, modern, central", bestTime: "Year-round", tags: ["spa"] },
  { rank: 16, name: "Park Plaza Westminster Bridge", neighborhood: "Waterloo", score: 8.4, pricePerNight: "from $260", poolType: "Indoor pool · spa", highlight: "Big pool opposite Big Ben", description: "A spacious indoor pool in a busy spa, two minutes from the London Eye. Family-friendly and reliable.", vibe: "Family-friendly, busy, central", bestTime: "Year-round", tags: ["spa"] },
  { rank: 17, name: "InterContinental London Park Lane", neighborhood: "Mayfair", score: 8.3, pricePerNight: "from $500", poolType: "Indoor pool · spa", highlight: "Spa pool above Hyde Park", description: "A polished indoor pool in a corner spa overlooking Hyde Park Corner. Sunlight pours in all afternoon.", vibe: "Classic, business, calm", bestTime: "Year-round", tags: ["spa"] },
  { rank: 18, name: "K West Hotel & Spa", neighborhood: "Shepherd's Bush", score: 8.2, pricePerNight: "from $200", poolType: "Indoor hydro pool · spa", highlight: "Best-value London spa pool", description: "A hydrotherapy pool in a generous spa floor in west London — outstanding value compared with central hotels.", vibe: "Wellness, casual, west London", bestTime: "Year-round", tags: ["spa"] },
  { rank: 19, name: "Andaz London Liverpool Street", neighborhood: "Liverpool Street", score: 8.2, pricePerNight: "from $260", poolType: "Indoor lap pool · gym", highlight: "Quiet City lap pool", description: "A clean lap pool in a Hyatt-run gym, mostly used by guests. Refreshingly empty in the City.", vibe: "Modern, casual, City", bestTime: "Year-round", tags: ["spa"] },
  { rank: 20, name: "Conrad London St James", neighborhood: "Westminster", score: 8.1, pricePerNight: "from $400", poolType: "Indoor pool · spa", highlight: "Westminster spa pool", description: "A bright indoor pool in a discreet spa close to St James's Park. Underused and very calm.", vibe: "Discreet, central, calm", bestTime: "Year-round", tags: ["spa", "quiet"] },
];

export const newYorkTop20: Hotel[] = [
  { rank: 1, name: "Equinox Hotel Hudson Yards", neighborhood: "Hudson Yards", score: 9.6, pricePerNight: "from $700", poolType: "Indoor & outdoor 25m pools", highlight: "25m saltwater pool with skyline view", description: "A 25-meter saltwater indoor pool plus an outdoor sun deck pool above Hudson Yards. The best hotel-pool pair in New York.", vibe: "Wellness-led, modern, energetic", bestTime: "May–September outdoor, year-round indoor", tags: ["rooftop", "spa"] },
  { rank: 2, name: "Soho House New York", neighborhood: "Meatpacking", score: 9.4, pricePerNight: "from $500", poolType: "Rooftop pool · members' club", highlight: "Iconic rooftop pool", description: "A heated rooftop pool overlooking the Hudson, the famous wood deck and a permanent summer crowd.", vibe: "Members' club, scene, summer", bestTime: "May–September", tags: ["rooftop"] },
  { rank: 3, name: "The Standard High Line", neighborhood: "Meatpacking", score: 9.2, pricePerNight: "from $400", poolType: "Rooftop dipping pool · Le Bain", highlight: "Le Bain rooftop dipping pool", description: "The legendary Le Bain dipping pool on the rooftop of the Standard, with the Hudson on one side and the High Line below.", vibe: "Party, scene, late-night", bestTime: "May–September, evenings", tags: ["rooftop"] },
  { rank: 4, name: "Mandarin Oriental New York", neighborhood: "Columbus Circle", score: 9.1, pricePerNight: "from $1,000", poolType: "Indoor pool · 35th floor", highlight: "Sky pool over Central Park", description: "A 75-foot lap pool on the 35th floor of the Time Warner Center with floor-to-ceiling windows and a Central Park view.", vibe: "Sky-high, calm, world-class", bestTime: "Year-round", tags: ["spa", "quiet"] },
  { rank: 5, name: "1 Hotel Brooklyn Bridge", neighborhood: "DUMBO", score: 9.0, pricePerNight: "from $500", poolType: "Rooftop pool · Manhattan view", highlight: "Rooftop pool with Manhattan skyline", description: "A small rooftop pool with one of New York's most cinematic views — the Brooklyn Bridge on one side, Lower Manhattan on the other.", vibe: "Wellness, scenic, evenings", bestTime: "May–September", tags: ["rooftop"] },
  { rank: 6, name: "The Peninsula New York", neighborhood: "Midtown", score: 9.0, pricePerNight: "from $1,100", poolType: "Indoor pool · 23rd floor spa", highlight: "Top-floor pool", description: "A glass-walled indoor pool on the 23rd floor with a side-on view of Fifth Avenue. Polished and very quiet.", vibe: "Classic, polished, grown-up", bestTime: "Year-round", tags: ["spa", "quiet"] },
  { rank: 7, name: "Four Seasons Downtown", neighborhood: "Tribeca", score: 8.9, pricePerNight: "from $900", poolType: "Indoor pool · 75ft lap", highlight: "75ft Tribeca lap pool", description: "A 75-foot lap pool in a serene basement spa under the Tribeca tower. One of the longest hotel pools in the city.", vibe: "Modern, hushed, downtown", bestTime: "Year-round", tags: ["spa", "quiet"] },
  { rank: 8, name: "Park Hyatt New York", neighborhood: "Midtown", score: 8.9, pricePerNight: "from $850", poolType: "Indoor pool · 25m skyline", highlight: "25m skyline lap pool", description: "A 25-meter pool on the 25th floor with underwater music and views down 57th Street to Central Park.", vibe: "Sky-high, calm, modern", bestTime: "Year-round", tags: ["spa", "quiet"] },
  { rank: 9, name: "The Beekman", neighborhood: "Financial District", score: 8.8, pricePerNight: "from $400", poolType: "Indoor lap pool · spa", highlight: "Historic atrium hotel", description: "A heated lap pool in a discreet wellness space inside the famous nine-story atrium hotel.", vibe: "Heritage, intimate, downtown", bestTime: "Year-round", tags: ["spa", "quiet"] },
  { rank: 10, name: "Six Senses New York", neighborhood: "Chelsea", score: 8.8, pricePerNight: "from $700", poolType: "Indoor pool · 25m wellness", highlight: "Wellness flagship pool", description: "A 25-meter pool in the multi-floor Six Senses spa under XI Towers. The most ambitious wellness pool in Manhattan.", vibe: "Wellness, modern, design-led", bestTime: "Year-round", tags: ["spa", "quiet"] },
  { rank: 11, name: "The William Vale", neighborhood: "Williamsburg", score: 8.7, pricePerNight: "from $350", poolType: "Outdoor pool · 60ft rooftop", highlight: "60ft Brooklyn rooftop pool", description: "A 60-foot outdoor pool on a wide rooftop deck in Williamsburg with a clear Manhattan skyline view.", vibe: "Brooklyn, summer, sociable", bestTime: "May–September", tags: ["rooftop"] },
  { rank: 12, name: "Dream Downtown", neighborhood: "Chelsea", score: 8.6, pricePerNight: "from $300", poolType: "Outdoor pool · glass-bottom", highlight: "Glass-bottom rooftop pool", description: "A glass-bottom pool you can see through from the lobby below — the most photographed pool in Chelsea.", vibe: "Party, design-led, summer", bestTime: "May–September", tags: ["rooftop"] },
  { rank: 13, name: "PUBLIC Hotel", neighborhood: "Lower East Side", score: 8.5, pricePerNight: "from $260", poolType: "Indoor lap pool · members' club", highlight: "Hidden LES pool", description: "A small heated indoor lap pool in a stylish basement, often near-empty. A real find downtown.", vibe: "Design-led, downtown, low-key", bestTime: "Year-round", tags: ["spa"] },
  { rank: 14, name: "Hotel Indigo Lower East Side", neighborhood: "Lower East Side", score: 8.5, pricePerNight: "from $280", poolType: "Indoor pool · 14th floor", highlight: "Indoor sky pool", description: "An indoor pool on the 14th floor with floor-to-ceiling glass facing south over the LES.", vibe: "Modern, sky-high, casual", bestTime: "Year-round", tags: ["spa"] },
  { rank: 15, name: "James New York NoMad", neighborhood: "NoMad", score: 8.4, pricePerNight: "from $300", poolType: "Outdoor rooftop pool", highlight: "NoMad rooftop dip", description: "A small outdoor rooftop pool in NoMad with a buzzy bar and an Empire State Building view.", vibe: "Sociable, summer, midtown", bestTime: "May–September", tags: ["rooftop"] },
  { rank: 16, name: "Aliz Hotel Times Square", neighborhood: "Times Square", score: 8.3, pricePerNight: "from $260", poolType: "Indoor pool · 60th floor", highlight: "Highest hotel pool in NYC", description: "An indoor pool on the 60th floor with one of the highest hotel-pool views in the city, looking south over Times Square.", vibe: "Sky-high, busy, central", bestTime: "Year-round", tags: ["spa"] },
  { rank: 17, name: "Le Parker Meridien", neighborhood: "Midtown", score: 8.3, pricePerNight: "from $400", poolType: "Indoor pool · 42nd floor", highlight: "42nd-floor lap pool", description: "A 42-foot indoor pool on the top floor with a glass roof and a Central Park view.", vibe: "Classic, light-filled, family-friendly", bestTime: "Year-round", tags: ["spa"] },
  { rank: 18, name: "Westin New York at Times Square", neighborhood: "Times Square", score: 8.2, pricePerNight: "from $300", poolType: "Indoor pool · spa", highlight: "Reliable midtown spa pool", description: "A clean, big indoor pool in the spa — solid and family-friendly in the heart of Times Square.", vibe: "Family-friendly, central, busy", bestTime: "Year-round", tags: ["spa"] },
  { rank: 19, name: "The Dominick", neighborhood: "Soho", score: 8.2, pricePerNight: "from $600", poolType: "Indoor pool · 46th floor", highlight: "Sky pool above Soho", description: "A long indoor pool on the 46th floor of the Dominick with a Hudson view to the west.", vibe: "Modern, sky-high, calm", bestTime: "Year-round", tags: ["spa"] },
  { rank: 20, name: "The Plaza", neighborhood: "Midtown", score: 8.1, pricePerNight: "from $900", poolType: "Indoor pool · 25m Guerlain Spa", highlight: "Guerlain Spa basement pool", description: "A 25-meter indoor pool in the historic basement spa, surprisingly modern under the legendary Plaza facade.", vibe: "Heritage, polished, classic", bestTime: "Year-round", tags: ["spa", "quiet"] },
];

export const granCanariaTop20: Hotel[] = [
  { rank: 1, name: "Seaside Grand Hotel Residencia", neighborhood: "Maspalomas", score: 9.5, pricePerNight: "from $700", poolType: "Outdoor pool · palm garden", highlight: "Iconic Maspalomas pool", description: "A heated outdoor pool surrounded by 1,000 palm trees, just behind the Maspalomas dunes. Adults-only, hushed and grand.", vibe: "Adults-only, hushed, grand", bestTime: "Year-round", tags: ["resort", "spa", "quiet"] },
  { rank: 2, name: "Bohemia Suites & Spa", neighborhood: "Playa del Inglés", score: 9.3, pricePerNight: "from $300", poolType: "Rooftop pool · adults-only", highlight: "Rooftop pool over the dunes", description: "A heated rooftop pool with dune views, daybeds and an evening DJ. Adults-only and design-led.", vibe: "Adults-only, design-led, romantic", bestTime: "Year-round", tags: ["rooftop", "resort", "spa"] },
  { rank: 3, name: "Lopesan Costa Meloneras", neighborhood: "Meloneras", score: 9.0, pricePerNight: "from $260", poolType: "Six outdoor pools · resort", highlight: "Six pools and dune views", description: "A vast resort with six outdoor pools, palm-lined decks and a clifftop boardwalk to the dunes.", vibe: "Family resort, big, sociable", bestTime: "Year-round", tags: ["resort"] },
  { rank: 4, name: "Salobre Hotel Resort & Serenity", neighborhood: "Salobre", score: 9.0, pricePerNight: "from $240", poolType: "Outdoor infinity pool · golf", highlight: "Infinity pool over the desert", description: "An infinity pool that seems to flow into the volcanic landscape behind the golf course. Calm and panoramic.", vibe: "Adults-only wing, golf, calm", bestTime: "Year-round", tags: ["resort"] },
  { rank: 5, name: "Lopesan Baobab Resort", neighborhood: "Meloneras", score: 8.9, pricePerNight: "from $230", poolType: "Outdoor pool · African-themed", highlight: "African-themed lagoon pool", description: "A large lagoon-shaped outdoor pool with a crocodile-pond bridge in an African-themed resort.", vibe: "Family resort, themed, lively", bestTime: "Year-round", tags: ["resort"] },
  { rank: 6, name: "Hotel Cordial Mogán Playa", neighborhood: "Mogán", score: 8.9, pricePerNight: "from $260", poolType: "Multiple outdoor pools · gardens", highlight: "Pools in a botanical garden", description: "Several outdoor pools woven through a botanical garden in Puerto de Mogán. Calm, green and family-run feel.", vibe: "Garden, family-friendly, calm", bestTime: "Year-round", tags: ["resort", "quiet"] },
  { rank: 7, name: "Radisson Blu Resort & Spa Mogán", neighborhood: "Mogán", score: 8.8, pricePerNight: "from $220", poolType: "Outdoor infinity · ocean view", highlight: "Cliffside infinity pool", description: "An infinity pool perched on a cliff above Mogán's beach, with a wide Atlantic horizon.", vibe: "Couples, calm, cliffside", bestTime: "Year-round", tags: ["resort"] },
  { rank: 8, name: "Gloria Palace Royal", neighborhood: "Amadores", score: 8.7, pricePerNight: "from $200", poolType: "Outdoor pools · Amadores beach", highlight: "Steps from Amadores beach", description: "A clifftop hotel with outdoor pools above the calm Amadores cove. Very family-friendly.", vibe: "Family resort, beach, sunny", bestTime: "Year-round", tags: ["resort"] },
  { rank: 9, name: "ROBINSON Esquinzo Playa", neighborhood: "Pasito Blanco", score: 8.6, pricePerNight: "from $240", poolType: "Outdoor pool · adults-friendly", highlight: "Active resort pool", description: "A wide outdoor pool inside a sports-led resort. Yoga, kite surfing and tennis on the same property.", vibe: "Active, sociable, design-led", bestTime: "Year-round", tags: ["resort"] },
  { rank: 10, name: "Hotel Riu Palace Maspalomas", neighborhood: "Maspalomas", score: 8.6, pricePerNight: "from $220", poolType: "Outdoor pool · seafront", highlight: "Seafront family pool", description: "An iconic Maspalomas hotel right at the dunes with a big seafront pool deck.", vibe: "Family resort, classic, sunny", bestTime: "Year-round", tags: ["resort"] },
  { rank: 11, name: "Lopesan Villa del Conde", neighborhood: "Meloneras", score: 8.6, pricePerNight: "from $260", poolType: "Outdoor pool · church-shaped", highlight: "Distinctive village-style resort", description: "A village-shaped resort built around a faux Canarian church, with multiple outdoor pools and a generous spa.", vibe: "Family resort, themed, calm", bestTime: "Year-round", tags: ["resort", "spa"] },
  { rank: 12, name: "Hotel Riu Palace Meloneras", neighborhood: "Meloneras", score: 8.5, pricePerNight: "from $230", poolType: "Outdoor pool · seafront", highlight: "Big classic pool deck", description: "A wide outdoor pool deck along the Meloneras boardwalk with direct sea access and reliable sun.", vibe: "Family resort, busy, sunny", bestTime: "Year-round", tags: ["resort"] },
  { rank: 13, name: "Sheraton Gran Canaria Salobre", neighborhood: "Salobre", score: 8.4, pricePerNight: "from $250", poolType: "Outdoor pool · golf", highlight: "Mountain-view pool", description: "An outdoor pool with a desert and golf-course backdrop, great for grown-ups looking for a quieter resort.", vibe: "Calm, golf, grown-up", bestTime: "Year-round", tags: ["resort"] },
  { rank: 14, name: "Hotel Faro a Lopesan Collection Hotel", neighborhood: "Maspalomas", score: 8.4, pricePerNight: "from $260", poolType: "Outdoor pool · adults-only", highlight: "Adults-only Maspalomas pool", description: "A long heated pool right next to the famous Maspalomas lighthouse. Adults-only and grown-up.", vibe: "Adults-only, polished, calm", bestTime: "Year-round", tags: ["resort", "quiet"] },
  { rank: 15, name: "H10 Playa Meloneras Palace", neighborhood: "Meloneras", score: 8.3, pricePerNight: "from $230", poolType: "Outdoor pool · seafront", highlight: "Seafront sunbed pool", description: "A long seafront pool with a wide sunbed deck and a quieter, grown-up atmosphere.", vibe: "Couples, classic, beach", bestTime: "Year-round", tags: ["resort"] },
  { rank: 16, name: "Aequora Lanzarote Suites", neighborhood: "Puerto Rico", score: 8.2, pricePerNight: "from $200", poolType: "Outdoor pool · cliffside", highlight: "Cliffside family pool", description: "A cliffside resort with multiple outdoor pools above Puerto Rico beach. Excellent for kids.", vibe: "Family, cliffside, lively", bestTime: "Year-round", tags: ["resort"] },
  { rank: 17, name: "Cordial Mogán Solaz", neighborhood: "Mogán", score: 8.2, pricePerNight: "from $200", poolType: "Outdoor pool · adults-only", highlight: "Adults-only Mogán hideaway", description: "A small adults-only hotel in Mogán with a calm outdoor pool and direct access to the marina.", vibe: "Adults-only, calm, marina", bestTime: "Year-round", tags: ["resort", "quiet"] },
  { rank: 18, name: "Bull Reina Isabel & Spa", neighborhood: "Las Palmas", score: 8.1, pricePerNight: "from $180", poolType: "Rooftop pool · skyline", highlight: "Las Palmas city rooftop", description: "A rooftop pool above Las Canteras beach in the capital, with a long city view from a Bauhaus building.", vibe: "City, beach, family-friendly", bestTime: "Year-round", tags: ["rooftop"] },
  { rank: 19, name: "Santa Catalina, a Royal Hideaway Hotel", neighborhood: "Las Palmas", score: 8.1, pricePerNight: "from $300", poolType: "Outdoor pool · garden", highlight: "Historic city hotel pool", description: "An outdoor pool inside the lush gardens of the most historic hotel in Las Palmas, recently fully restored.", vibe: "Heritage, polished, calm", bestTime: "Year-round", tags: ["spa", "quiet"] },
  { rank: 20, name: "AC Hotel Gran Canaria", neighborhood: "Las Palmas", score: 8.0, pricePerNight: "from $160", poolType: "Rooftop pool · plunge", highlight: "Best-value city rooftop", description: "A small rooftop plunge pool with a panoramic Las Palmas view — the best-value rooftop in town.", vibe: "City, modern, casual", bestTime: "Year-round", tags: ["rooftop"] },
];

export const mallorcaTop20: Hotel[] = [
  { rank: 1, name: "Belmond La Residencia", neighborhood: "Deià", score: 9.6, pricePerNight: "from $900", poolType: "Two outdoor pools · Tramuntana view", highlight: "Two pools above Deià", description: "Two outdoor pools on a hillside terrace overlooking the village of Deià and the Tramuntana mountains. The most romantic pools in Mallorca.", vibe: "Romantic, mountain, cinematic", bestTime: "May–October", tags: ["resort", "spa", "quiet"] },
  { rank: 2, name: "Cap Rocat", neighborhood: "Cala Blava", score: 9.5, pricePerNight: "from $1,200", poolType: "Outdoor pool · sea fortress", highlight: "Pool inside a sea fortress", description: "A long outdoor pool carved into the rock of a 19th-century military fortress, with the Bay of Palma on the horizon.", vibe: "Adults-only, dramatic, hushed", bestTime: "May–October", tags: ["resort", "spa", "quiet"] },
  { rank: 3, name: "Castell Son Claret", neighborhood: "Es Capdellà", score: 9.4, pricePerNight: "from $700", poolType: "Outdoor pool · Tramuntana", highlight: "Country-estate pool", description: "A wide outdoor pool on a private estate at the foot of the Tramuntana, with a Michelin-starred restaurant on site.", vibe: "Country estate, calm, grown-up", bestTime: "May–October", tags: ["resort", "spa", "quiet"] },
  { rank: 4, name: "Park Hyatt Mallorca", neighborhood: "Canyamel", score: 9.3, pricePerNight: "from $600", poolType: "Outdoor & infinity pools", highlight: "Hilltop infinity pool", description: "A hilltop infinity pool with a view across the bay of Canyamel, plus several quieter pools in the gardens below.", vibe: "Hilltop, polished, family-friendly", bestTime: "May–October", tags: ["resort", "spa"] },
  { rank: 5, name: "Hotel Cap Vermell Grand", neighborhood: "Canyamel", score: 9.2, pricePerNight: "from $700", poolType: "Outdoor pool · 50m mosaic", highlight: "50m blue-mosaic pool", description: "A 50-meter mosaic pool in a Mallorcan-village-style resort. One of the largest hotel pools on the island.", vibe: "Polished, family-friendly, big", bestTime: "May–October", tags: ["resort", "spa"] },
  { rank: 6, name: "Jumeirah Port Sóller", neighborhood: "Port de Sóller", score: 9.1, pricePerNight: "from $700", poolType: "Two infinity pools · cliffside", highlight: "Cliffside infinity pools", description: "Two infinity pools on a cliff above Port de Sóller, with the lighthouse and the bay below.", vibe: "Cliffside, romantic, polished", bestTime: "May–October", tags: ["resort", "spa"] },
  { rank: 7, name: "Hotel Formentor", neighborhood: "Cap de Formentor", score: 9.0, pricePerNight: "from $800", poolType: "Outdoor pool · pine forest", highlight: "Pool in a pine forest", description: "An outdoor pool surrounded by century-old pines, steps from the beach at Formentor. Recently fully restored.", vibe: "Heritage, calm, beach", bestTime: "May–October", tags: ["resort", "quiet"] },
  { rank: 8, name: "Bikini Island & Mountain Hotel Port de Sóller", neighborhood: "Port de Sóller", score: 8.9, pricePerNight: "from $300", poolType: "Outdoor pool · adults-only", highlight: "Hilltop adults-only pool", description: "A small outdoor pool with sweeping views of Port de Sóller. Young, design-led and adults-only.", vibe: "Adults-only, design-led, young", bestTime: "May–October", tags: ["resort"] },
  { rank: 9, name: "Sant Francesc Hotel Singular", neighborhood: "Palma", score: 8.9, pricePerNight: "from $400", poolType: "Rooftop plunge · old town", highlight: "Best rooftop plunge in Palma", description: "A small rooftop plunge inside a 19th-century palace in the heart of Palma's old town. Cathedral spires in the distance.", vibe: "Boutique, romantic, city", bestTime: "April–October", tags: ["rooftop", "quiet"] },
  { rank: 10, name: "Es Princep", neighborhood: "Palma", score: 8.8, pricePerNight: "from $400", poolType: "Rooftop pool · cathedral view", highlight: "Rooftop pool with cathedral view", description: "A heated rooftop pool overlooking Palma cathedral and the bay. Stylish, central and adults-only.", vibe: "Adults-only, polished, city", bestTime: "April–October", tags: ["rooftop"] },
  { rank: 11, name: "Carrossa Hotel", neighborhood: "Artà", score: 8.7, pricePerNight: "from $260", poolType: "Outdoor pool · countryside", highlight: "Country-estate pool", description: "A long outdoor pool on a quiet estate near Artà. Yoga in the morning, slow dinners under almond trees at night.", vibe: "Countryside, slow, calm", bestTime: "May–October", tags: ["resort", "quiet"] },
  { rank: 12, name: "Hotel Can Bordoy Grand House & Garden", neighborhood: "Palma", score: 8.7, pricePerNight: "from $500", poolType: "Outdoor pool · secret garden", highlight: "Secret-garden pool in Palma", description: "A heated outdoor pool inside a hidden garden in Palma's old town. One of the most romantic urban pools in Spain.", vibe: "Boutique, romantic, secret", bestTime: "May–October", tags: ["quiet"] },
  { rank: 13, name: "Hotel Mar i Vent", neighborhood: "Banyalbufar", score: 8.6, pricePerNight: "from $260", poolType: "Outdoor pool · cliff terrace", highlight: "Cliffside village pool", description: "A small outdoor pool on a cliff terrace in tiny Banyalbufar, looking straight out at the open Mediterranean.", vibe: "Family-run, calm, cliffside", bestTime: "May–October", tags: ["quiet"] },
  { rank: 14, name: "Predi Son Jaumell", neighborhood: "Capdepera", score: 8.6, pricePerNight: "from $400", poolType: "Outdoor pool · countryside", highlight: "Country-house pool", description: "An outdoor pool in the gardens of a 17th-century farmhouse with a Michelin-starred restaurant attached.", vibe: "Country house, slow, gourmet", bestTime: "May–October", tags: ["resort", "quiet"] },
  { rank: 15, name: "Pleta de Mar Grand Luxury Hotel", neighborhood: "Canyamel", score: 8.6, pricePerNight: "from $700", poolType: "Outdoor pool · cliffside", highlight: "Cliffside adults-only pool", description: "A clifftop outdoor pool above Canyamel beach. Adults-only, low-key and very quiet.", vibe: "Adults-only, cliffside, calm", bestTime: "May–October", tags: ["resort", "quiet"] },
  { rank: 16, name: "Hotel Es Saletes", neighborhood: "Ses Salines", score: 8.5, pricePerNight: "from $300", poolType: "Outdoor pool · garden", highlight: "Garden pool in the south", description: "A heated outdoor pool in a quiet garden near the salt flats. Easy access to Es Trenc beach.", vibe: "Family-run, calm, beach-adjacent", bestTime: "May–October", tags: ["quiet"] },
  { rank: 17, name: "Iberostar Selection Playa de Muro", neighborhood: "Playa de Muro", score: 8.4, pricePerNight: "from $260", poolType: "Outdoor pool · seafront", highlight: "Seafront family resort", description: "A wide outdoor pool deck on the Playa de Muro seafront. Big, sunny and family-friendly.", vibe: "Family resort, big, sunny", bestTime: "May–October", tags: ["resort"] },
  { rank: 18, name: "Mallorca Rocks Hotel", neighborhood: "Magaluf", score: 8.3, pricePerNight: "from $220", poolType: "Outdoor pool · party deck", highlight: "Party pool deck", description: "A big outdoor pool fronted by an open-air concert deck. The summer party capital of Mallorca.", vibe: "Party, summer, energetic", bestTime: "June–August", tags: ["resort"] },
  { rank: 19, name: "Hotel Saratoga", neighborhood: "Palma", score: 8.2, pricePerNight: "from $250", poolType: "Rooftop pool · skyline", highlight: "City rooftop with cathedral view", description: "A rooftop pool above the Saratoga in central Palma. The cathedral, the bay and the old town all in one frame.", vibe: "City, family-friendly, central", bestTime: "April–October", tags: ["rooftop"] },
  { rank: 20, name: "Es Racó d'Artà", neighborhood: "Artà", score: 8.2, pricePerNight: "from $300", poolType: "Outdoor pool · countryside", highlight: "Eco country-estate pool", description: "A natural-style pool in a quiet eco-resort outside Artà. Slow, vegetarian, very off-grid.", vibe: "Eco, slow, countryside", bestTime: "May–October", tags: ["quiet"] },
];

export const bangkokTop20: Hotel[] = [
  { rank: 1, name: "Sindhorn Kempinski Hotel Bangkok", neighborhood: "Langsuan", score: 9.5, pricePerNight: "from $260", poolType: "Outdoor pool · 60m sky garden", highlight: "60m pool in a sky garden", description: "A 60-meter outdoor pool in an elevated garden facing Lumphini Park. Possibly the longest hotel pool in central Bangkok.", vibe: "Garden-in-the-sky, polished", bestTime: "Year-round, late afternoon", tags: ["rooftop", "spa"] },
  { rank: 2, name: "The Standard Bangkok Mahanakhon", neighborhood: "Silom", score: 9.4, pricePerNight: "from $230", poolType: "Outdoor pool · skyline", highlight: "Pool inside Mahanakhon tower", description: "A wide outdoor pool on the podium of the iconic Mahanakhon tower with skyline views in every direction.", vibe: "Design-led, playful, energetic", bestTime: "Year-round", tags: ["rooftop"] },
  { rank: 3, name: "Capella Bangkok", neighborhood: "Chao Phraya River", score: 9.4, pricePerNight: "from $700", poolType: "Outdoor pool · riverside", highlight: "Riverside pool with city skyline", description: "A long, sculptural outdoor pool right on the Chao Phraya river. The most refined hotel pool in Bangkok.", vibe: "World-class, hushed, riverside", bestTime: "Year-round", tags: ["resort", "spa", "quiet"] },
  { rank: 4, name: "The Siam", neighborhood: "Dusit", score: 9.3, pricePerNight: "from $500", poolType: "Outdoor pool · 25m mosaic", highlight: "Bill Bensley pool design", description: "A 25-meter blue-mosaic pool in a Bensley-designed garden by the river. Adults-only and very calm.", vibe: "Boutique, adults-only, design-led", bestTime: "Year-round", tags: ["resort", "spa", "quiet"] },
  { rank: 5, name: "Mandarin Oriental Bangkok", neighborhood: "Riverside", score: 9.2, pricePerNight: "from $600", poolType: "Outdoor pool · riverside garden", highlight: "Legendary riverside pool", description: "A heritage outdoor pool in tropical gardens by the river. The grande dame of Bangkok hotel pools.", vibe: "Heritage, polished, family-friendly", bestTime: "Year-round", tags: ["resort", "spa"] },
  { rank: 6, name: "Park Hyatt Bangkok", neighborhood: "Ploenchit", score: 9.1, pricePerNight: "from $400", poolType: "Rooftop pool · 9th floor", highlight: "Skyline pool above Central Embassy", description: "A heated outdoor pool on the 9th floor of the Central Embassy tower with a long urban view.", vibe: "Modern, polished, business", bestTime: "Year-round", tags: ["rooftop", "spa"] },
  { rank: 7, name: "SO/ Bangkok", neighborhood: "Sathorn", score: 9.0, pricePerNight: "from $230", poolType: "Outdoor pool · 10th floor", highlight: "10th-floor park-view pool", description: "A heated outdoor pool on the 10th floor with daybeds and one of the best Lumphini Park views in town.", vibe: "Design-led, playful, sociable", bestTime: "Year-round", tags: ["rooftop"] },
  { rank: 8, name: "Rosewood Bangkok", neighborhood: "Ploenchit", score: 9.0, pricePerNight: "from $450", poolType: "Outdoor pool · garden", highlight: "Tropical garden pool", description: "A long outdoor pool wrapped around a tropical garden, on the podium of the architecturally striking Rosewood tower.", vibe: "Polished, modern, calm", bestTime: "Year-round", tags: ["spa", "quiet"] },
  { rank: 9, name: "Anantara Siam Bangkok", neighborhood: "Ratchadamri", score: 8.9, pricePerNight: "from $260", poolType: "Outdoor pool · 27m lagoon", highlight: "27m lagoon pool", description: "A 27-meter lagoon-style outdoor pool in lush gardens, in the heart of central Bangkok.", vibe: "Resort-in-the-city, family-friendly", bestTime: "Year-round", tags: ["resort", "spa"] },
  { rank: 10, name: "The Peninsula Bangkok", neighborhood: "Riverside", score: 8.9, pricePerNight: "from $400", poolType: "Outdoor pool · three-tier riverside", highlight: "Three-tier riverside pool", description: "A three-level outdoor pool that cascades toward the Chao Phraya river. Brilliantly designed for sunsets.", vibe: "Polished, family-friendly, riverside", bestTime: "Year-round", tags: ["resort", "spa"] },
  { rank: 11, name: "137 Pillars Suites Bangkok", neighborhood: "Sukhumvit", score: 8.8, pricePerNight: "from $260", poolType: "Rooftop infinity · 27th floor", highlight: "27th-floor infinity pool", description: "A small rooftop infinity pool on the 27th floor with a long view down Sukhumvit. Adults-only.", vibe: "Adults-only, boutique, romantic", bestTime: "Year-round", tags: ["rooftop", "quiet"] },
  { rank: 12, name: "The Okura Prestige Bangkok", neighborhood: "Ploenchit", score: 8.8, pricePerNight: "from $260", poolType: "Outdoor infinity · 25th floor", highlight: "Cantilevered infinity pool", description: "A 25th-floor infinity pool that hangs out over central Bangkok. Iconic shot of the city skyline.", vibe: "Modern, polished, business", bestTime: "Year-round", tags: ["rooftop"] },
  { rank: 13, name: "Lebua at State Tower", neighborhood: "Riverside", score: 8.7, pricePerNight: "from $250", poolType: "Outdoor pool · 11th floor", highlight: "Pool below the Sky Bar tower", description: "A wide outdoor pool on the 11th floor of the famous Lebua tower (home of the Sky Bar). Big and sociable.", vibe: "Sociable, sky-high, scenic", bestTime: "Year-round", tags: ["rooftop"] },
  { rank: 14, name: "Banyan Tree Bangkok", neighborhood: "Sathorn", score: 8.7, pricePerNight: "from $260", poolType: "Outdoor pool · 21st floor", highlight: "Sky pool with Vertigo bar", description: "A 21st-floor outdoor pool in the same tower as the famous Vertigo & Moon Bar. Calm by day, lively at night.", vibe: "Sky-high, polished, romantic", bestTime: "Year-round", tags: ["rooftop", "spa"] },
  { rank: 15, name: "Eastin Grand Hotel Sathorn", neighborhood: "Sathorn", score: 8.6, pricePerNight: "from $140", poolType: "Outdoor infinity · 6th floor", highlight: "Best-value Sathorn infinity pool", description: "A heated outdoor infinity pool above the BTS line. Excellent value for a proper rooftop swim in central Bangkok.", vibe: "Value, modern, business", bestTime: "Year-round", tags: ["rooftop"] },
  { rank: 16, name: "Pullman Bangkok King Power", neighborhood: "Ratchathewi", score: 8.5, pricePerNight: "from $130", poolType: "Outdoor pool · garden", highlight: "Lagoon-style city pool", description: "A lagoon-shaped outdoor pool with cabanas in a quiet garden near Victory Monument. Surprisingly resort-like.", vibe: "Resort-in-the-city, family-friendly", bestTime: "Year-round", tags: ["resort"] },
  { rank: 17, name: "Sofitel Bangkok Sukhumvit", neighborhood: "Sukhumvit", score: 8.5, pricePerNight: "from $180", poolType: "Outdoor pool · 7th floor", highlight: "Big Sukhumvit pool", description: "A wide outdoor pool deck on the 7th floor with daybeds and a poolside bar. Reliable in the centre of Sukhumvit.", vibe: "Polished, family-friendly, central", bestTime: "Year-round", tags: ["spa"] },
  { rank: 18, name: "Avani+ Riverside Bangkok", neighborhood: "Charoen Nakhon", score: 8.4, pricePerNight: "from $130", poolType: "Rooftop infinity · river view", highlight: "Rooftop infinity over the river", description: "A rooftop infinity pool overlooking the Chao Phraya from the quieter side of the river. One of Bangkok's best sunsets.", vibe: "Modern, sociable, sunset", bestTime: "Year-round", tags: ["rooftop"] },
  { rank: 19, name: "Hyatt Regency Bangkok Sukhumvit", neighborhood: "Sukhumvit", score: 8.3, pricePerNight: "from $160", poolType: "Outdoor pool · 8th floor", highlight: "Reliable Sukhumvit pool", description: "A bright outdoor pool deck on the 8th floor in the heart of Nana. Easy, central and family-friendly.", vibe: "Family-friendly, central, modern", bestTime: "Year-round", tags: ["spa"] },
  { rank: 20, name: "Akyra Thonglor Bangkok", neighborhood: "Thonglor", score: 8.2, pricePerNight: "from $130", poolType: "Rooftop pool · plunge", highlight: "Best Thonglor rooftop dip", description: "A small heated rooftop plunge pool above Thonglor with a city view. Great after a long night in the neighbourhood.", vibe: "Boutique, neighbourhood, modern", bestTime: "Year-round", tags: ["rooftop"] },
];

export const malagaTop20: Hotel[] = [
  { rank: 1, name: "Gran Hotel Miramar", neighborhood: "La Malagueta", score: 9.5, pricePerNight: "from $400", poolType: "Outdoor pool · seafront garden", highlight: "Belle Époque seafront pool", description: "A heated outdoor pool in a palm garden of a Belle Époque palace, steps from La Malagueta beach. The grand dame of Málaga hotels.", vibe: "Heritage, polished, seafront", bestTime: "April–October", tags: ["resort", "spa"] },
  { rank: 2, name: "Palacio Solecio", neighborhood: "Old Town", score: 9.2, pricePerNight: "from $260", poolType: "Rooftop plunge · cathedral view", highlight: "Rooftop plunge with cathedral view", description: "A small rooftop plunge above an 18th-century palace in the old town, with a direct view of the cathedral.", vibe: "Boutique, romantic, central", bestTime: "April–October", tags: ["rooftop", "quiet"] },
  { rank: 3, name: "Only YOU Hotel Málaga", neighborhood: "Soho", score: 9.1, pricePerNight: "from $230", poolType: "Rooftop pool · port view", highlight: "Rooftop with port view", description: "A heated rooftop pool with a long view across the port and Alcazaba. Younger, design-led crowd.", vibe: "Design-led, sociable, central", bestTime: "April–October", tags: ["rooftop"] },
  { rank: 4, name: "Vincci Selección Posada del Patio", neighborhood: "Old Town", score: 8.9, pricePerNight: "from $200", poolType: "Rooftop plunge · old town", highlight: "Rooftop plunge in old town", description: "A small rooftop plunge with views of the old town. Polished, central and very calm.", vibe: "Boutique, polished, calm", bestTime: "April–October", tags: ["rooftop", "quiet"] },
  { rank: 5, name: "Molina Lario", neighborhood: "Cathedral", score: 8.9, pricePerNight: "from $220", poolType: "Rooftop plunge · cathedral view", highlight: "Pool right next to the cathedral", description: "A heated rooftop plunge pool basically touching the cathedral spire. Among the best central rooftops in Andalusia.", vibe: "Romantic, central, polished", bestTime: "April–October", tags: ["rooftop"] },
  { rank: 6, name: "AC Hotel Málaga Palacio", neighborhood: "Cathedral", score: 8.8, pricePerNight: "from $200", poolType: "Rooftop pool · cathedral view", highlight: "Iconic cathedral-view rooftop", description: "A long-running favourite — rooftop pool with one of the original cathedral views in central Málaga.", vibe: "Classic, central, family-friendly", bestTime: "April–October", tags: ["rooftop"] },
  { rank: 7, name: "Soho Boutique Hotel Equitativa", neighborhood: "Soho", score: 8.7, pricePerNight: "from $170", poolType: "Rooftop plunge · skyline", highlight: "Soho rooftop plunge", description: "A small rooftop plunge in a refurbished 1930s building in Málaga's Soho district.", vibe: "Boutique, neighbourhood, modern", bestTime: "April–October", tags: ["rooftop"] },
  { rank: 8, name: "H10 Croma Málaga", neighborhood: "Old Town", score: 8.6, pricePerNight: "from $180", poolType: "Rooftop plunge · old town", highlight: "Best-value central rooftop", description: "A rooftop plunge with sun loungers and a bar above an old-town building. Very good value for the location.", vibe: "Modern, central, casual", bestTime: "April–October", tags: ["rooftop"] },
  { rank: 9, name: "NH Málaga", neighborhood: "Centre", score: 8.5, pricePerNight: "from $160", poolType: "Rooftop pool · skyline", highlight: "Reliable central rooftop", description: "A heated rooftop pool with sun loungers in central Málaga. Big enough to actually swim in.", vibe: "Family-friendly, central, modern", bestTime: "April–October", tags: ["rooftop"] },
  { rank: 10, name: "Salles Hotel Málaga Centro", neighborhood: "Centre", score: 8.5, pricePerNight: "from $170", poolType: "Rooftop pool · plunge", highlight: "Quiet central rooftop", description: "A small rooftop plunge pool in central Málaga that rarely gets crowded. Good last-minute bookings.", vibe: "Calm, central, modern", bestTime: "April–October", tags: ["rooftop", "quiet"] },
  { rank: 11, name: "Ilunion Málaga", neighborhood: "Soho", score: 8.4, pricePerNight: "from $150", poolType: "Rooftop pool · port view", highlight: "Big rooftop on a budget", description: "A surprisingly large heated rooftop pool with port views and very fair prices in Málaga's Soho district.", vibe: "Value, family-friendly, modern", bestTime: "April–October", tags: ["rooftop"] },
  { rank: 12, name: "Vincci Posada del Patio", neighborhood: "Old Town", score: 8.4, pricePerNight: "from $200", poolType: "Rooftop plunge · old town", highlight: "Rooftop above Roman walls", description: "A rooftop plunge above the preserved Roman walls in the old town, with a direct line of sight to the Alcazaba.", vibe: "Heritage, central, calm", bestTime: "April–October", tags: ["rooftop", "quiet"] },
  { rank: 13, name: "Soho Boutique Cobertizo de Málaga", neighborhood: "Old Town", score: 8.3, pricePerNight: "from $140", poolType: "Rooftop plunge · skyline", highlight: "Hidden old-town rooftop", description: "A tiny rooftop plunge tucked above a quiet street in the old town. Often empty.", vibe: "Boutique, hidden, calm", bestTime: "April–October", tags: ["rooftop", "quiet"] },
  { rank: 14, name: "Soho Boutique Castillo de Santa Catalina", neighborhood: "El Limonar", score: 8.3, pricePerNight: "from $260", poolType: "Outdoor pool · garden", highlight: "Castle-garden pool", description: "An outdoor pool in the garden of a 1930s castle-style mansion above La Malagueta. Romantic and historic.", vibe: "Heritage, romantic, garden", bestTime: "April–October", tags: ["resort", "quiet"] },
  { rank: 15, name: "Barceló Málaga", neighborhood: "Train Station", score: 8.2, pricePerNight: "from $170", poolType: "Indoor pool · spa", highlight: "Reliable city spa pool", description: "A clean indoor pool in a generous spa next to María Zambrano station. Great for stopovers and rainy days.", vibe: "Modern, family-friendly, practical", bestTime: "Year-round", tags: ["spa"] },
  { rank: 16, name: "Hotel Sallés Málaga Centro", neighborhood: "Centre", score: 8.2, pricePerNight: "from $160", poolType: "Rooftop pool · skyline", highlight: "Quiet rooftop find", description: "A small heated rooftop pool steps from Calle Larios. Very peaceful for the location.", vibe: "Calm, central, polished", bestTime: "April–October", tags: ["rooftop", "quiet"] },
  { rank: 17, name: "Parador de Málaga Gibralfaro", neighborhood: "Gibralfaro", score: 8.1, pricePerNight: "from $200", poolType: "Outdoor pool · castle view", highlight: "Pool with the best Málaga view", description: "An outdoor pool above the Gibralfaro castle with a panoramic view over the bullring, the city and the bay.", vibe: "Heritage, panoramic, calm", bestTime: "April–October", tags: ["resort", "quiet"] },
  { rank: 18, name: "Sercotel Málaga", neighborhood: "Centre", score: 8.0, pricePerNight: "from $140", poolType: "Rooftop pool · plunge", highlight: "Affordable city rooftop", description: "A small heated rooftop plunge with daybeds. Great-value rooftop hotel in central Málaga.", vibe: "Value, casual, central", bestTime: "April–October", tags: ["rooftop"] },
  { rank: 19, name: "Las Arenas Hotel Málaga", neighborhood: "La Malagueta", score: 8.0, pricePerNight: "from $180", poolType: "Outdoor pool · seafront", highlight: "Seafront family pool", description: "An outdoor pool right on La Malagueta promenade, with direct beach access. Big sun terrace.", vibe: "Family-friendly, beach, sunny", bestTime: "April–October", tags: ["resort"] },
  { rank: 20, name: "Petit Palace Plaza Málaga", neighborhood: "Old Town", score: 7.9, pricePerNight: "from $150", poolType: "Rooftop plunge · skyline", highlight: "Compact rooftop dip", description: "A very small rooftop plunge with a panoramic view of the cathedral and the port. Best for sunset.", vibe: "Boutique, central, casual", bestTime: "April–October", tags: ["rooftop"] },
];

export const losAngelesTop20: Hotel[] = [
  { rank: 1, name: "Hotel Bel-Air", neighborhood: "Bel Air", score: 9.6, pricePerNight: "from $900", poolType: "Outdoor pool · pink heated", highlight: "Pink-tiled icon in a canyon garden", description: "A heated outdoor pool with rose-pink tiles, surrounded by 12 acres of canyon gardens, swans on the lake and a private cabana program.", vibe: "Hollywood legend, hushed, romantic", bestTime: "Year-round", tags: ["resort", "spa", "quiet"] },
  { rank: 2, name: "The Beverly Hills Hotel", neighborhood: "Beverly Hills", score: 9.5, pricePerNight: "from $850", poolType: "Outdoor pool · 1937 cabanas", highlight: "Most photographed pool in LA", description: "The iconic banana-leaf pool with green-and-white striped cabanas, a Hollywood institution since 1937.", vibe: "Old Hollywood, polished, social", bestTime: "Year-round", tags: ["resort", "spa"] },
  { rank: 3, name: "Sunset Tower Hotel", neighborhood: "West Hollywood", score: 9.3, pricePerNight: "from $560", poolType: "Outdoor pool · Sunset Strip view", highlight: "Art deco pool above Sunset Strip", description: "A heated outdoor pool on a terrace above the Sunset Strip with skyline and Hollywood Hills views.", vibe: "Art deco, classic, grown-up", bestTime: "Year-round", tags: ["quiet"] },
  { rank: 4, name: "Chateau Marmont", neighborhood: "West Hollywood", score: 9.2, pricePerNight: "from $700", poolType: "Outdoor pool · garden", highlight: "Hollywood's most secret pool", description: "A small heated outdoor pool tucked into the gardens behind the Chateau, off-limits to non-guests and famously discreet.", vibe: "Bohemian, secretive, legendary", bestTime: "Year-round", tags: ["quiet"] },
  { rank: 5, name: "Waldorf Astoria Beverly Hills", neighborhood: "Beverly Hills", score: 9.2, pricePerNight: "from $750", poolType: "Rooftop pool · skyline", highlight: "Rooftop pool over Beverly Hills", description: "A heated rooftop pool on the 12th floor with cabanas and a sweeping view from the Hollywood sign to the Pacific.", vibe: "Modern luxury, polished, adults", bestTime: "Year-round", tags: ["rooftop", "spa"] },
  { rank: 6, name: "The Beverly Hilton", neighborhood: "Beverly Hills", score: 9.1, pricePerNight: "from $400", poolType: "Outdoor pool · Aqua Star", highlight: "Largest heated pool in Beverly Hills", description: "The famous Aqua Star pool — a vast heated outdoor pool with private cabanas, home of the Golden Globes pool deck.", vibe: "Resort-in-the-city, lively", bestTime: "Year-round", tags: ["resort"] },
  { rank: 7, name: "Fairmont Miramar Hotel & Bungalows", neighborhood: "Santa Monica", score: 9.0, pricePerNight: "from $500", poolType: "Outdoor pool · garden", highlight: "Garden pool steps from the Pacific", description: "A heated outdoor pool surrounded by century-old fig trees and bungalows, two blocks from Santa Monica beach.", vibe: "Coastal, polished, calm", bestTime: "Year-round", tags: ["resort", "spa"] },
  { rank: 8, name: "Shutters on the Beach", neighborhood: "Santa Monica", score: 9.0, pricePerNight: "from $700", poolType: "Outdoor & indoor pools · beachfront", highlight: "Pool right on Santa Monica beach", description: "A heated outdoor pool and a glass-walled indoor pool directly on the sand at Santa Monica beach.", vibe: "Beach house, family-friendly, calm", bestTime: "Year-round", tags: ["resort", "spa"] },
  { rank: 9, name: "Pendry West Hollywood", neighborhood: "West Hollywood", score: 8.9, pricePerNight: "from $550", poolType: "Rooftop pool · Sunset Strip", highlight: "Rooftop pool with skyline view", description: "A heated rooftop pool on Sunset Boulevard with cabanas, a poolside bar and a view straight to downtown LA.", vibe: "Modern, sociable, polished", bestTime: "Year-round", tags: ["rooftop", "spa"] },
  { rank: 10, name: "The Maybourne Beverly Hills", neighborhood: "Beverly Hills", score: 8.9, pricePerNight: "from $700", poolType: "Rooftop pool · Mediterranean", highlight: "Rooftop pool with Hollywood Hills view", description: "A heated rooftop pool on the 8th floor with cabanas and a long view across Beverly Hills to the Hollywood Hills.", vibe: "European luxury, polished, calm", bestTime: "Year-round", tags: ["rooftop", "spa"] },
  { rank: 11, name: "The Hollywood Roosevelt", neighborhood: "Hollywood", score: 8.8, pricePerNight: "from $300", poolType: "Outdoor pool · David Hockney mural", highlight: "Hockney-painted bottom", description: "An outdoor pool with a David Hockney mural on the bottom, in the courtyard of Hollywood's oldest hotel.", vibe: "Hollywood history, lively, social", bestTime: "Year-round", tags: ["resort"] },
  { rank: 12, name: "Mondrian Los Angeles", neighborhood: "West Hollywood", score: 8.7, pricePerNight: "from $350", poolType: "Outdoor pool · Skybar", highlight: "Pool next to legendary Skybar", description: "An outdoor pool on the 12th-floor terrace shared with the legendary Skybar, with a long view of the city.", vibe: "Sociable, design-led, energetic", bestTime: "Year-round", tags: ["rooftop"] },
  { rank: 13, name: "1 Hotel West Hollywood", neighborhood: "West Hollywood", score: 8.7, pricePerNight: "from $500", poolType: "Rooftop pool · skyline", highlight: "Rooftop pool with downtown view", description: "A heated rooftop pool on the Sunset Strip with cabanas, planted in living greenery and overlooking downtown LA.", vibe: "Eco-luxury, modern, polished", bestTime: "Year-round", tags: ["rooftop", "spa"] },
  { rank: 14, name: "The Proper Hotel Santa Monica", neighborhood: "Santa Monica", score: 8.6, pricePerNight: "from $500", poolType: "Rooftop pool · ocean view", highlight: "Rooftop pool with Pacific view", description: "A heated rooftop pool with daybeds, a Mediterranean restaurant and a long view across the Pacific.", vibe: "Design-led, calm, coastal", bestTime: "Year-round", tags: ["rooftop"] },
  { rank: 15, name: "Andaz West Hollywood", neighborhood: "West Hollywood", score: 8.5, pricePerNight: "from $350", poolType: "Rooftop pool · Sunset Strip", highlight: "Rooftop pool above Sunset", description: "A heated rooftop pool with cabanas above the legendary 'Riot House' on the Sunset Strip.", vibe: "Casual, central, modern", bestTime: "Year-round", tags: ["rooftop"] },
  { rank: 16, name: "The Standard Downtown LA", neighborhood: "Downtown", score: 8.5, pricePerNight: "from $260", poolType: "Rooftop pool · skyline", highlight: "Bright red rooftop pool", description: "A small heated rooftop pool with red waterbed pods and a 360° view of downtown LA's skyline.", vibe: "Playful, design-led, lively", bestTime: "Year-round", tags: ["rooftop"] },
  { rank: 17, name: "Hotel Casa del Mar", neighborhood: "Santa Monica", score: 8.4, pricePerNight: "from $600", poolType: "Outdoor pool · oceanfront", highlight: "Pool above the Pacific", description: "A heated outdoor pool on a terrace directly above the sand at Santa Monica beach.", vibe: "Heritage, beach, polished", bestTime: "Year-round", tags: ["resort", "spa"] },
  { rank: 18, name: "Conrad Los Angeles", neighborhood: "Downtown", score: 8.4, pricePerNight: "from $450", poolType: "Rooftop pool · Grand Avenue", highlight: "Pool above the Walt Disney Concert Hall", description: "A heated rooftop pool on the 8th floor of the Frank Gehry-designed tower, overlooking Grand Avenue.", vibe: "Modern, polished, central", bestTime: "Year-round", tags: ["rooftop", "spa"] },
  { rank: 19, name: "Hotel June West LA", neighborhood: "Westchester", score: 8.2, pricePerNight: "from $230", poolType: "Outdoor pool · courtyard", highlight: "Mid-century courtyard pool", description: "An outdoor pool in a leafy courtyard of a renovated mid-century motor lodge near LAX. Surprisingly stylish.", vibe: "Mid-century, casual, calm", bestTime: "Year-round", tags: ["quiet"] },
  { rank: 20, name: "The LINE Hotel LA", neighborhood: "Koreatown", score: 8.1, pricePerNight: "from $230", poolType: "Outdoor pool · neon-tile", highlight: "Pool deck with cabanas", description: "An outdoor pool with neon-blue tile and curtained cabanas on the upper deck of a Koreatown landmark.", vibe: "Design-led, sociable, neighbourhood", bestTime: "Year-round", tags: ["rooftop"] },
];

export const sydneyTop20: Hotel[] = [
  { rank: 1, name: "Park Hyatt Sydney", neighborhood: "The Rocks", score: 9.7, pricePerNight: "from $900", poolType: "Rooftop pool · Opera House view", highlight: "Pool facing the Opera House", description: "A heated rooftop pool on the 4th floor looking straight across the harbour at the Sydney Opera House. The most iconic pool view in Australia.", vibe: "World-class, polished, harbour", bestTime: "Year-round", tags: ["rooftop", "spa"] },
  { rank: 2, name: "Crown Towers Sydney", neighborhood: "Barangaroo", score: 9.5, pricePerNight: "from $700", poolType: "Indoor & outdoor infinity · harbour", highlight: "Three-pool floor with harbour view", description: "A 25-meter indoor lap pool plus an outdoor infinity pool overlooking Darling Harbour, on a dedicated wellness floor.", vibe: "Modern luxury, polished, big", bestTime: "Year-round", tags: ["spa"] },
  { rank: 3, name: "Capella Sydney", neighborhood: "CBD", score: 9.4, pricePerNight: "from $700", poolType: "Indoor pool · 20m heritage", highlight: "20m pool inside heritage sandstone", description: "A 20-meter heated indoor pool in a vaulted spa space inside a restored 1912 heritage building.", vibe: "Heritage luxury, hushed, refined", bestTime: "Year-round", tags: ["spa", "quiet"] },
  { rank: 4, name: "Four Seasons Hotel Sydney", neighborhood: "The Rocks", score: 9.2, pricePerNight: "from $500", poolType: "Outdoor pool · 20m harbour view", highlight: "20m heated pool with bridge view", description: "A 20-meter heated outdoor pool on a sun terrace with a direct view of the Harbour Bridge.", vibe: "Polished, family-friendly, harbour", bestTime: "Year-round", tags: ["spa"] },
  { rank: 5, name: "Shangri-La Sydney", neighborhood: "The Rocks", score: 9.1, pricePerNight: "from $400", poolType: "Indoor pool · harbour-floor", highlight: "Sky-high indoor pool", description: "A heated indoor pool on a high floor of the Shangri-La tower with floor-to-ceiling windows over the harbour.", vibe: "Polished, family-friendly, sky-high", bestTime: "Year-round", tags: ["spa"] },
  { rank: 6, name: "InterContinental Sydney", neighborhood: "Circular Quay", score: 9.0, pricePerNight: "from $400", poolType: "Indoor pool · 31st floor", highlight: "31st-floor pool with harbour view", description: "A heated indoor pool on the 31st floor with a panoramic view of Circular Quay and the Harbour Bridge.", vibe: "Heritage, business, polished", bestTime: "Year-round", tags: ["spa"] },
  { rank: 7, name: "The Langham Sydney", neighborhood: "Millers Point", score: 9.0, pricePerNight: "from $500", poolType: "Indoor pool · 20m skylit", highlight: "20m skylit indoor pool", description: "A 20-meter heated indoor pool under a curved skylight, in a quiet wing of The Langham near Walsh Bay.", vibe: "Classic, hushed, family-friendly", bestTime: "Year-round", tags: ["spa", "quiet"] },
  { rank: 8, name: "W Sydney", neighborhood: "Darling Harbour", score: 8.9, pricePerNight: "from $400", poolType: "Indoor pool · longest hotel pool", highlight: "Australia's longest hotel pool", description: "A 25-meter heated indoor pool with a glass wall over Darling Harbour, lit in colour at night. Australia's longest hotel pool.", vibe: "Design-led, sociable, modern", bestTime: "Year-round", tags: ["spa"] },
  { rank: 9, name: "Hyatt Regency Sydney", neighborhood: "Darling Harbour", score: 8.8, pricePerNight: "from $300", poolType: "Outdoor pool · podium", highlight: "Outdoor pool over Darling Harbour", description: "A heated outdoor pool on the podium with cabanas and a long view across Darling Harbour to the city.", vibe: "Modern, big, family-friendly", bestTime: "Year-round", tags: ["rooftop"] },
  { rank: 10, name: "Sofitel Sydney Darling Harbour", neighborhood: "Darling Harbour", score: 8.8, pricePerNight: "from $300", poolType: "Outdoor pool · 4th-floor podium", highlight: "Glass-edged podium pool", description: "A heated outdoor pool with a glass edge on the 4th-floor podium, with a city skyline view.", vibe: "Modern, polished, central", bestTime: "Year-round", tags: ["rooftop", "spa"] },
  { rank: 11, name: "QT Sydney", neighborhood: "CBD", score: 8.7, pricePerNight: "from $300", poolType: "Indoor pool · heritage", highlight: "Heritage indoor pool", description: "A heated indoor lap pool inside a restored State Theatre building. Quiet and very atmospheric.", vibe: "Boutique, design-led, calm", bestTime: "Year-round", tags: ["spa", "quiet"] },
  { rank: 12, name: "Pier One Sydney Harbour", neighborhood: "Walsh Bay", score: 8.7, pricePerNight: "from $300", poolType: "No pool — harbour swim deck", highlight: "Plunge in the harbour itself", description: "A boutique hotel built on a 1912 pier with a netted swim platform that lets you plunge directly into Sydney Harbour at high tide.", vibe: "Heritage, harbour, unique", bestTime: "October–April", tags: ["quiet"] },
  { rank: 13, name: "Ace Hotel Sydney", neighborhood: "Surry Hills", score: 8.6, pricePerNight: "from $260", poolType: "Indoor pool · spa", highlight: "Quiet basement lap pool", description: "A small heated indoor lap pool in the spa of the Surry Hills Ace, perfect for a calm post-Bourke Street swim.", vibe: "Design-led, neighbourhood, calm", bestTime: "Year-round", tags: ["spa", "quiet"] },
  { rank: 14, name: "Hotel Indigo Sydney Potts Point", neighborhood: "Potts Point", score: 8.5, pricePerNight: "from $260", poolType: "Rooftop pool · skyline", highlight: "Rooftop pool above Potts Point", description: "A small heated rooftop pool with daybeds and a long view across Potts Point and the harbour.", vibe: "Boutique, neighbourhood, modern", bestTime: "Year-round", tags: ["rooftop"] },
  { rank: 15, name: "Crowne Plaza Coogee Beach", neighborhood: "Coogee", score: 8.5, pricePerNight: "from $260", poolType: "Outdoor pool · beachfront", highlight: "Beachfront outdoor pool", description: "A heated outdoor pool on the deck right above Coogee Beach, with the Tasman Sea on the horizon.", vibe: "Beach, family-friendly, casual", bestTime: "October–April", tags: ["resort"] },
  { rank: 16, name: "Sir Stamford at Circular Quay", neighborhood: "Circular Quay", score: 8.4, pricePerNight: "from $260", poolType: "Outdoor pool · courtyard", highlight: "Quiet courtyard pool", description: "A heated outdoor pool in the heritage courtyard of Sir Stamford, steps from Circular Quay.", vibe: "Classic, calm, central", bestTime: "Year-round", tags: ["quiet"] },
  { rank: 17, name: "Pullman Quay Grand Sydney Harbour", neighborhood: "East Circular Quay", score: 8.4, pricePerNight: "from $300", poolType: "Indoor pool · Opera House view", highlight: "Indoor pool with Opera House view", description: "A heated indoor pool with floor-to-ceiling windows and a direct view of the Sydney Opera House across the cove.", vibe: "Polished, family-friendly, harbour", bestTime: "Year-round", tags: ["spa"] },
  { rank: 18, name: "The Old Clare Hotel", neighborhood: "Chippendale", score: 8.3, pricePerNight: "from $250", poolType: "Rooftop pool · plunge", highlight: "Rooftop plunge above Chippendale", description: "A small rooftop plunge with daybeds and city views, on a converted 1940s pub-and-brewery in Chippendale.", vibe: "Boutique, neighbourhood, calm", bestTime: "October–April", tags: ["rooftop"] },
  { rank: 19, name: "Sheraton Grand Sydney Hyde Park", neighborhood: "CBD", score: 8.2, pricePerNight: "from $300", poolType: "Indoor pool · 22nd floor", highlight: "22nd-floor indoor pool", description: "A heated 20-meter indoor pool on the 22nd floor with a panoramic view of Hyde Park and the city.", vibe: "Modern, business, family-friendly", bestTime: "Year-round", tags: ["spa"] },
  { rank: 20, name: "Hotel Ravesis", neighborhood: "Bondi", score: 8.0, pricePerNight: "from $230", poolType: "No pool — Bondi Icebergs nearby", highlight: "Boutique stay above Bondi Beach", description: "A small art-deco boutique opposite Bondi Beach. No hotel pool, but the legendary Bondi Icebergs ocean pool is a 5-minute walk.", vibe: "Beach, boutique, neighbourhood", bestTime: "October–April", tags: ["quiet"] },
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
    hotels: parisTop20,
  },
  {
    slug: "london",
    name: "London",
    country: "United Kingdom",
    tagline: "Sky pools high above the Thames",
    intro:
      "In ten years London went from 'no pools' to home of Europe's most spectacular sky pools.",
    image: londonImg,
    hotels: londonTop20,
  },
  {
    slug: "new-york",
    name: "New York",
    country: "USA",
    tagline: "Rooftop pools with skyscrapers in the background",
    intro: "Manhattan's pools are nearly always on the roof — and often worth the hype.",
    image: newyorkImg,
    hotels: newYorkTop20,
  },
  {
    slug: "gran-canaria",
    name: "Gran Canaria",
    country: "Spain",
    tagline: "Volcanic coastline and year-round pool weather",
    intro:
      "Gran Canaria's resort hotels turn the Atlantic into a backdrop — infinity pools above black-rock cliffs, palm-lined decks and warm water from January to December.",
    image: granCanariaImg,
    hotels: granCanariaTop20,
  },
  {
    slug: "mallorca",
    name: "Mallorca",
    country: "Spain",
    tagline: "Cliffside pools above the Mediterranean",
    intro:
      "From Deià to Cap de Formentor, Mallorca hides some of Europe's most beautifully placed hotel pools — pine forests, stone terraces and that very specific Balearic blue.",
    image: mallorcaImg,
    hotels: mallorcaTop20,
  },
  {
    slug: "bangkok",
    name: "Bangkok",
    country: "Thailand",
    tagline: "Sky pools high above the tropical metropolis",
    intro:
      "Bangkok perfected the rooftop infinity pool. We rank the city's most spectacular sky pools — the ones with the skyline view, the cocktail program and the warm tropical evenings.",
    image: bangkokImg,
    hotels: bangkokTop20,
  },
  {
    slug: "malaga",
    name: "Málaga",
    country: "Spain",
    tagline: "Andalusian rooftops above the Costa del Sol",
    intro:
      "Málaga's hotel scene has grown up fast — rooftop pools with cathedral views, port-side resorts and warm Andalusian evenings that stretch long into October.",
    image: malagaImg,
    hotels: malagaTop20,
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
