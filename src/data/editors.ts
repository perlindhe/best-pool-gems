export type Editor = {
  slug: string;
  name: string;
  role: string;
  bio: string;
  focus: string[];
  since: string;
};

/**
 * Identifiable editorial contributors. Only add a person here when they are a
 * real, named contributor — bylines must never invent a reviewer.
 */
export const editors: Editor[] = [
  {
    slug: "per-lindhe",
    name: "Per Lindhe",
    role: "Founder & editor",
    bio: "Per founded BestPoolHotels to answer a question booking sites never do: is the pool actually any good? He builds and maintains the Pool Score methodology, sets the verification standard for every hotel record, and reviews each ranking before it is published.",
    focus: ["Pool Score methodology", "Verification standards", "Barcelona", "Gran Canaria"],
    since: "2025",
  },
  {
    slug: "editorial-team",
    name: "BestPoolHotels Editorial",
    role: "Research & verification desk",
    bio: "The research desk cross-checks pool facts against each hotel's own website, official amenity data and independent guest reports, and records the sources behind every published fact. It does not claim on-site visits: hotels we have personally visited are labelled as such on their page.",
    focus: ["Fact verification", "Source citation", "Data integrity checks"],
    since: "2025",
  },
];

export function getEditor(slug: string) {
  return editors.find((e) => e.slug === slug) ?? null;
}
