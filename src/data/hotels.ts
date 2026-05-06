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

export const cities: City[] = [
  {
    slug: "barcelona",
    name: "Barcelona",
    country: "Spanien",
    tagline: "Takpooler med Sagrada Família i bakgrunden",
    intro:
      "Barcelona är en stad där taken är lika viktiga som gatorna. Här rankar vi hotellen som kombinerar Gaudí-utsikt, medelhavsbris och kristallklart blått vatten.",
    image: barcelonaImg,
    hotels: [
      {
        rank: 1,
        name: "Hotel Arts Barcelona",
        neighborhood: "Barceloneta",
        score: 9.6,
        pricePerNight: "från 6 200 kr",
        poolType: "Utomhuspool · havsutsikt",
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
    ],
  },
  {
    slug: "paris",
    name: "Paris",
    country: "Frankrike",
    tagline: "Diskret lyx och pooler under Eiffeltornet",
    intro:
      "Paris bevarar sina pooler bakom haussmannska fasader. Här är hotellen där du simmar i marmor, mosaik och guldljus – med Eiffeltornet som granne.",
    image: parisImg,
    hotels: [
      {
        rank: 1,
        name: "Shangri-La Paris",
        neighborhood: "Trocadéro",
        score: 9.7,
        pricePerNight: "från 18 500 kr",
        poolType: "Inomhuspool · spa",
        highlight: "Eiffeltornet i fönstret",
        description:
          "En av få pooler i Paris med direkt utsikt över Eiffeltornet. Lugn, ljus och oändligt elegant.",
      },
      {
        rank: 2,
        name: "Molitor Paris – MGallery",
        neighborhood: "16e",
        score: 9.4,
        pricePerNight: "från 3 900 kr",
        poolType: "Två pooler · art déco",
        highlight: "Ikonisk art déco",
        description:
          "Den legendariska poolen där bikinin lanserades 1946. Sommartid blir taket en festplats med DJ-set.",
      },
      {
        rank: 3,
        name: "Le Royal Monceau – Raffles",
        neighborhood: "Champs-Élysées",
        score: 9.3,
        pricePerNight: "från 12 200 kr",
        poolType: "Inomhuspool 23 m",
        highlight: "Längsta hotellpoolen",
        description:
          "En av de längsta hotellpoolerna i Paris, dramatiskt ljus och Clarins-spa. Perfekt för seriösa simmare.",
      },
      {
        rank: 4,
        name: "Hôtel de Crillon",
        neighborhood: "Place de la Concorde",
        score: 9.2,
        pricePerNight: "från 16 000 kr",
        poolType: "Inomhuspool · marmor",
        highlight: "Diskret palatslyx",
        description:
          "En liten guldskimrande pool djupt nere i Crillons spa. Fullkomlig stillhet i hjärtat av Paris.",
      },
      {
        rank: 5,
        name: "Hôtel Lutetia",
        neighborhood: "Saint-Germain",
        score: 9.0,
        pricePerNight: "från 8 800 kr",
        poolType: "Inomhuspool 17 m",
        highlight: "Vänsterstrandens favorit",
        description:
          "En klassisk valvad pool i kalksten. Akademins författare om dagen, modeveckans gäster om kvällen.",
      },
    ],
  },
  {
    slug: "london",
    name: "London",
    country: "Storbritannien",
    tagline: "Skypools högt över Themsen",
    intro:
      "London har på tio år gått från att vara ‘inga pooler’ till att vara hem för Europas mest spektakulära skypools. Här är de bästa.",
    image: londonImg,
    hotels: [
      {
        rank: 1,
        name: "Pan Pacific London",
        neighborhood: "City",
        score: 9.5,
        pricePerNight: "från 4 600 kr",
        poolType: "Inomhuspool 18,5 m",
        highlight: "Lugn mitt i City",
        description:
          "En lång, mörkblå inomhuspool på fjärde våningen. Ljust, modernt och förvånansvärt stilla för Londonmått.",
      },
      {
        rank: 2,
        name: "Shangri-La The Shard",
        neighborhood: "London Bridge",
        score: 9.4,
        pricePerNight: "från 6 900 kr",
        poolType: "Skypool · 52:a vån",
        highlight: "Höjdpunkten",
        description:
          "Stadens högst belägna hotellpool. Glaspartier från golv till tak och hela London under fötterna.",
      },
      {
        rank: 3,
        name: "Berkeley Hotel",
        neighborhood: "Knightsbridge",
        score: 9.3,
        pricePerNight: "från 9 400 kr",
        poolType: "Takpool · soltak",
        highlight: "Soltaket öppnas",
        description:
          "Glastaket öppnas vid sol och pelarna ger en romersk badhuskänsla mitt i Knightsbridge.",
      },
      {
        rank: 4,
        name: "Bulgari Hotel London",
        neighborhood: "Knightsbridge",
        score: 9.2,
        pricePerNight: "från 11 000 kr",
        poolType: "Inomhuspool 25 m",
        highlight: "Italienskt spa",
        description:
          "Det djupaste, lugnaste spat i London. 25 meter ren marmor i en miljö som känns som ett smyckeskrin.",
      },
      {
        rank: 5,
        name: "Mondrian Shoreditch",
        neighborhood: "Shoreditch",
        score: 8.9,
        pricePerNight: "från 3 200 kr",
        poolType: "Takpool · skyline",
        highlight: "East Londons hetaste tak",
        description:
          "Liten pool, stor utsikt över City och The Shard. DJ:s, cocktails och en yngre publik.",
      },
    ],
  },
  {
    slug: "new-york",
    name: "New York",
    country: "USA",
    tagline: "Rooftop-pooler med skyskrapor i bakgrunden",
    intro:
      "Manhattans pooler är nästan alltid på taket – och nästan alltid värda hypen. Här är de fem som verkligen levererar.",
    image: newyorkImg,
    hotels: [
      {
        rank: 1,
        name: "The Williamsburg Hotel",
        neighborhood: "Brooklyn",
        score: 9.4,
        pricePerNight: "från 4 200 kr",
        poolType: "Takpool · Manhattan-vy",
        highlight: "Bästa skyline-vyn",
        description:
          "Den mest fotograferade poolen i Brooklyn. Direkt utsikt över Manhattan och taklounge med drinkar långt in på natten.",
      },
      {
        rank: 2,
        name: "Soho House New York",
        neighborhood: "Meatpacking",
        score: 9.3,
        pricePerNight: "från 5 800 kr",
        poolType: "Takpool · medlemmar+gäster",
        highlight: "Original-rooftopen",
        description:
          "Den som startade hela rooftop-trenden i NYC. Fortfarande lika cool – cabanas, brunch och Hudson-vy.",
      },
      {
        rank: 3,
        name: "Equinox Hotel Hudson Yards",
        neighborhood: "Hudson Yards",
        score: 9.2,
        pricePerNight: "från 6 500 kr",
        poolType: "Inom- och utomhuspool",
        highlight: "Stadens bästa spa",
        description:
          "Lap-pool inomhus, jacuzzi utomhus med Hudson-utsikt och 5 250 m² spa. För dig som vill träna lika mycket som du chillar.",
      },
      {
        rank: 4,
        name: "The Standard High Line",
        neighborhood: "Meatpacking",
        score: 9.0,
        pricePerNight: "från 3 800 kr",
        poolType: "Hot tub · takbar",
        highlight: "Le Bain-festen",
        description:
          "Liten plunge-pool på Le Bain men en av planetens mest legendariska takbarer. Köa förbi i kapprocken.",
      },
      {
        rank: 5,
        name: "1 Hotel Brooklyn Bridge",
        neighborhood: "Dumbo",
        score: 8.9,
        pricePerNight: "från 5 200 kr",
        poolType: "Takpool · säsong",
        highlight: "Brooklyn Bridge i sikte",
        description:
          "Pool och bar med direktblick över Brooklyn Bridge och Lower Manhattan. Naturen tar plats även på taket.",
      },
    ],
  },
];

export const getCity = (slug: string) => cities.find((c) => c.slug === slug);
