import type { Guide } from "@/data/hotels";

export type GuideContent = {
  hero: string;
  body: { heading?: string; paragraphs: string[] }[];
};

export const guideContent: Record<string, GuideContent> = {
  "barcelona/topp-10-lyxhotell-pool": {
    hero: "Den definitiva listan över Barcelonas tio bästa hotellpooler — från ikoner till hemliga takplunger.",
    body: [
      {
        heading: "Hur vi rankar",
        paragraphs: [
          "Vi har personligen besökt varje hotell i listan under de senaste två åren. Rankingen baseras på tre kriterier: utsikt, vatten och vibe. Inga hotell har betalat för sin placering.",
          "Du hittar hela topp 10-listan med priser, läge och vad som gör varje pool speciell på vår dedikerade Barcelona-sida.",
        ],
      },
      {
        heading: "Tre snabba favoriter",
        paragraphs: [
          "**Hotel Arts Barcelona** — bästa kombinationen av strand och pool, två stora utomhuspooler med havsutsikt.",
          "**The Barcelona EDITION** — coolaste rooftop-vibet med DJ vid solnedgång och mörkblå mosaikpool.",
          "**Mandarin Oriental Barcelona** — stadens mest sofistikerade pooltakträdgård på 24:e våningen.",
        ],
      },
      {
        heading: "Värt att veta",
        paragraphs: [
          "De flesta takpooler i Barcelona öppnar i mitten av maj och stänger i slutet av september. Vill du sima året runt — välj inomhusspa på Mandarin eller Hotel Arts.",
        ],
      },
    ],
  },
  "barcelona/rooftop-pooler": {
    hero: "Sju takpooler där utsikten är minst lika viktig som vattnet — med tider, dresscode och insläpp för icke-gäster.",
    body: [
      {
        heading: "De bästa rooftop-poolerna",
        paragraphs: [
          "**The Barcelona EDITION** (El Born) — DJ från 18:00, dresscode smart casual, ofta köer på lördagar.",
          "**Hotel SOFIA Sky Bar 26** (Diagonal) — bästa 360°-utsikten, lugnare än Edition.",
          "**ME Barcelona** (Eixample) — partyvibe, drinkar till midnatt.",
          "**Mandarin Oriental Terrat** (Passeig de Gràcia) — diskret, vuxet, två pooler.",
          "**Sir Victor** (Eixample) — bohemiskt, La Pedrera i sikte.",
          "**Almanac** (Passeig de Gràcia) — liten plunge, stora vyer.",
          "**Kimpton Vividora** (Gòtic) — mest charmiga läget i Gamla stan.",
        ],
      },
      {
        heading: "Tips för icke-gäster",
        paragraphs: [
          "Många takpooler säljer dagspass eller minimispend (50–80 €). Boka i förväg via hotellets hemsida — Edition och Mandarin är ofta fullbokade redan vid lunch.",
        ],
      },
    ],
  },
  "barcelona/poolhotell-nara-stranden": {
    hero: "Hotell i Barceloneta och Poblenou där du kan kombinera Medelhavet med en riktigt bra hotellpool.",
    body: [
      {
        heading: "Vid stranden i Barceloneta",
        paragraphs: [
          "**Hotel Arts Barcelona** — två pooler i trädgården, 50 meter från stranden.",
          "**W Barcelona** — det ikoniska seglet, tre pooler och Wet Deck-festen.",
        ],
      },
      {
        heading: "Lugnare alternativ i Poblenou & Diagonal Mar",
        paragraphs: [
          "**Hotel SB Diagonal Zero** — takpool med havsutsikt, mycket prisvärt jämfört med Barceloneta.",
          "**Meliá Barcelona Sky** — 24:e våningens takpool, tio minuter från stranden i Poblenou.",
        ],
      },
      {
        heading: "Geheimtipset",
        paragraphs: [
          "**Hotel Pulitzer** har ingen strand alls — men en av stadens charmigaste små takpooler och ligger 15 minuter från Barceloneta med metro. Ofta hälften så dyrt.",
        ],
      },
    ],
  },
  "barcelona/poolsasong-oppettider": {
    hero: "Allt om poolsäsongen i Barcelona — när öppnar takpoolerna och vilka är öppna året runt?",
    body: [
      {
        heading: "Säsong i korthet",
        paragraphs: [
          "**Maj–september** är högsäsong för takpooler. De flesta öppnar runt 15 maj och stänger 30 september.",
          "**Juni–augusti** är de varmaste månaderna med vattentemperaturer på 24–27°C.",
          "**April och oktober** kan vara behagligt, men många pooler är då stängda eller har begränsade öppettider.",
        ],
      },
      {
        heading: "Pooler öppna året runt",
        paragraphs: [
          "**Mandarin Oriental** — uppvärmd takpool öppen även vintertid.",
          "**Hotel Arts** — inomhusspa med uppvärmd pool året runt.",
          "**Bulgari-spats** finns inte i Barcelona ännu, men ovan två är säkra kort.",
        ],
      },
      {
        heading: "Typiska öppettider",
        paragraphs: [
          "Takpooler är oftast öppna 10:00–20:00 för hotellgäster. Rooftop-barer med pool öppnar runt 17:00 för icke-gäster, men poolen själv är då stängd för bad.",
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
