import type { Hotel } from "@/data/hotels";

/**
 * "Off season pool hotels" — hotels whose OUTDOOR pool is heated, so the pool
 * is usable outside the normal high season.
 *
 * Two inputs feed the section:
 *  1. the city's existing ranked hotels (kept, flagged when their pool is heated), and
 *  2. curated extras below, for hotels not (yet) in the main ranking.
 * The final list is capped at MAX_OFF_SEASON entries.
 */
export const MAX_OFF_SEASON = 50;

export type OffSeasonHotel = {
  name: string;
  neighborhood: string;
  poolType: string;
  /** Months the heated outdoor pool is normally usable. */
  heatedMonths: string;
  /** e.g. "1 of 2 pools heated" */
  heatedPools: string;
  note: string;
  score?: number;
  /** true when the hotel already appears in the city's main ranking. */
  fromRanking?: boolean;
  source: "ranking" | "database" | "editorial";
  slug?: string | null;
};

const HEAT_WORDS = /heated|heating|year-?round|all year|winter|thalasso|thermal/i;

/** Does an existing ranked hotel qualify as an off-season (heated outdoor) pool? */
export function rankedHotelIsHeatedOutdoor(h: Hotel): boolean {
  const text = `${h.poolType} ${h.description} ${h.highlight} ${h.bestTime}`;
  if (/indoor pool only/i.test(text)) return false;
  const outdoor = /outdoor|rooftop|infinity|seawater|lagoon|terrace|courtyard|private pool|beachfront|plunge/i.test(
    text,
  );
  return outdoor && HEAT_WORDS.test(text);
}

/** Curated hotels with heated outdoor pools, keyed by city slug. */
export const offSeasonExtras: Record<string, OffSeasonHotel[]> = {
  crete: [
    { name: "Elounda Peninsula All Suite Hotel", neighborhood: "Elounda", poolType: "Private heated seawater pools", heatedMonths: "April–November", heatedPools: "All suite pools heated", note: "Every suite has its own heated seawater pool on the peninsula, warmed well past summer.", score: 9.3, source: "editorial" },
    { name: "Elounda Gulf Villas", neighborhood: "Elounda", poolType: "Private heated villa pools", heatedMonths: "April–October", heatedPools: "All villa pools heated", note: "Villa pools are individually heated on request, which makes April and October swims realistic.", score: 9.0, source: "editorial" },
    { name: "Elounda Beach Hotel & Villas", neighborhood: "Elounda", poolType: "Heated outdoor pool · private pools", heatedMonths: "April–October", heatedPools: "Main pool + villa pools heated", note: "The seafront main pool is heated in shoulder season alongside the heated villa pools.", score: 8.9, source: "editorial" },
    { name: "St. Nicolas Bay Resort Hotel & Villas", neighborhood: "Agios Nikolaos", poolType: "Heated outdoor pool · private suite pools", heatedMonths: "April–October", heatedPools: "2 of 4 pools heated", note: "One of the outdoor pools plus several private suite pools stay heated either side of summer.", score: 8.8, source: "editorial" },
    { name: "Candia Park Village", neighborhood: "Agios Nikolaos", poolType: "Heated outdoor pool · seawater pool", heatedMonths: "April–October", heatedPools: "1 of 3 pools heated", note: "A family village where the central outdoor pool is heated for spring and autumn stays.", score: 8.2, source: "editorial" },
    { name: "Wyndham Grand Crete Mirabello Bay", neighborhood: "Agios Nikolaos", poolType: "Heated outdoor pool · private pools", heatedMonths: "April–October", heatedPools: "1 of 5 pools heated", note: "Terraced bay-facing pools with one heated deck kept open outside high season.", score: 8.3, source: "editorial" },
    { name: "Minos Palace Hotel & Suites", neighborhood: "Agios Nikolaos", poolType: "Heated outdoor pool · adults only", heatedMonths: "April–October", heatedPools: "1 of 2 pools heated", note: "Adults-only peninsula resort with a heated outdoor pool facing Mirabello Bay.", score: 8.5, source: "editorial" },
    { name: "Sensimar Royal Blue Resort & Spa", neighborhood: "Panormo, Rethymno", poolType: "Heated outdoor pool · thalasso spa", heatedMonths: "April–October", heatedPools: "1 of 3 pools heated", note: "Heated seawater pool plus a thalassotherapy circuit that runs through the cooler months.", score: 8.6, source: "editorial" },
    { name: "Grecotel Creta Palace", neighborhood: "Rethymno", poolType: "Heated outdoor pool · lagoon pools", heatedMonths: "April–October", heatedPools: "1 of 6 pools heated", note: "One of the big beachfront pools is heated so the resort works from early spring.", score: 8.7, source: "editorial" },
    { name: "Grecotel Caramel Boutique Resort", neighborhood: "Adelianos Kampos, Rethymno", poolType: "Heated outdoor pool · private pools", heatedMonths: "April–October", heatedPools: "Private pools heated on request", note: "Beach-house style villas whose private pools can be heated for shoulder-season stays.", score: 8.6, source: "editorial" },
    { name: "Rithymna Beach Hotel", neighborhood: "Adelianos Kampos, Rethymno", poolType: "Heated outdoor pool · indoor pool", heatedMonths: "April–October", heatedPools: "1 of 5 pools heated", note: "Heated outdoor pool and a separate indoor pool for genuinely cool days.", score: 8.1, source: "editorial" },
    { name: "Pleiades Luxurious Villas", neighborhood: "Agios Nikolaos", poolType: "Private heated villa pools", heatedMonths: "March–November", heatedPools: "All villa pools heated", note: "Hillside villas where each private pool can be heated year-round on request.", score: 8.4, source: "editorial" },
    { name: "Blue Bay Resort & Spa", neighborhood: "Agia Pelagia", poolType: "Heated outdoor pool", heatedMonths: "April–October", heatedPools: "1 of 4 pools heated", note: "Hillside resort above Agia Pelagia keeping one outdoor pool heated in shoulder season.", score: 7.9, source: "editorial" },
    { name: "Out of the Blue Capsis Elite Resort", neighborhood: "Agia Pelagia", poolType: "Heated outdoor pools · seawater", heatedMonths: "April–October", heatedPools: "2 of 8 pools heated", note: "A peninsula of pools; a couple are heated so the resort opens early and closes late.", score: 8.4, source: "editorial" },
    { name: "Terra Creta Suites & Villas", neighborhood: "Kolymbari, Chania", poolType: "Private heated pools", heatedMonths: "April–November", heatedPools: "All suite pools heated", note: "Small adults-leaning property with heated private pools on every terrace.", score: 8.3, source: "editorial" },
    { name: "Kalliston Resort & Spa", neighborhood: "Chania", poolType: "Heated outdoor pool · adults only", heatedMonths: "April–October", heatedPools: "1 of 2 pools heated", note: "Adults-only resort near Chania where the main outdoor pool is heated in spring and autumn.", score: 8.2, source: "editorial" },
    { name: "Domes Noruz Chania", neighborhood: "Chania / Kalamaki", poolType: "Heated outdoor pool · private pools", heatedMonths: "April–October", heatedPools: "1 of 3 pools heated", note: "Adults-only sister of Domes Zeen with a heated main pool a step from the beach.", score: 8.7, source: "editorial" },
    { name: "Anemos Luxury Grand Resort", neighborhood: "Georgioupolis", poolType: "Heated outdoor pool · indoor pool", heatedMonths: "April–October", heatedPools: "1 of 5 pools heated", note: "Big beachfront resort with a heated outdoor pool plus a heated indoor pool and spa.", score: 8.3, source: "editorial" },
    { name: "Mythos Palace Resort & Spa", neighborhood: "Georgioupolis", poolType: "Heated outdoor pool", heatedMonths: "April–October", heatedPools: "1 of 3 pools heated", note: "Garden resort keeping a heated outdoor pool open through the shoulder months.", score: 7.9, source: "editorial" },
    { name: "Kiani Beach Resort", neighborhood: "Kalyves, Chania", poolType: "Heated outdoor pool", heatedMonths: "April–October", heatedPools: "1 of 2 pools heated", note: "Family resort on Souda Bay with a heated main pool for cooler weeks.", score: 7.8, source: "editorial" },
    { name: "Giannoulis Grand Bay Beach Resort", neighborhood: "Falassarna, Chania", poolType: "Heated outdoor pool · adults only", heatedMonths: "April–October", heatedPools: "1 of 3 pools heated", note: "Adults-only resort above Falassarna with a heated outdoor pool facing the sunset coast.", score: 8.1, source: "editorial" },
    { name: "Ikaros Beach Luxury Resort & Spa", neighborhood: "Malia", poolType: "Heated outdoor pool · private pools", heatedMonths: "April–October", heatedPools: "1 of 4 pools heated", note: "Beachfront resort with heated main pool and a run of heated private bungalow pools.", score: 8.4, source: "editorial" },
    { name: "Cretan Malia Park", neighborhood: "Malia", poolType: "Heated outdoor pool · garden setting", heatedMonths: "April–October", heatedPools: "1 of 2 pools heated", note: "Palm-garden design hotel that heats its main pool for spring and autumn.", score: 8.3, source: "editorial" },
    { name: "Aquila Rithymna Beach", neighborhood: "Rethymno", poolType: "Heated outdoor pool · indoor pool", heatedMonths: "April–October", heatedPools: "1 of 4 pools heated", note: "Long-standing beachfront resort with heated outdoor and indoor pools.", score: 8.0, source: "editorial" },
    { name: "Aquila Atlantis Hotel", neighborhood: "Heraklion", poolType: "Heated rooftop pool", heatedMonths: "April–November", heatedPools: "1 of 1 pool heated", note: "City hotel in Heraklion whose rooftop pool is heated well past the beach season.", score: 7.9, source: "editorial" },
    { name: "Galaxy Hotel Iraklio", neighborhood: "Heraklion", poolType: "Heated outdoor pool · courtyard", heatedMonths: "Year-round", heatedPools: "1 of 1 pool heated", note: "Sheltered courtyard pool heated all year — the most reliable winter swim in Heraklion.", score: 8.0, source: "editorial" },
    { name: "Metropole Urban Hotel", neighborhood: "Heraklion", poolType: "Heated rooftop pool", heatedMonths: "April–October", heatedPools: "1 of 1 pool heated", note: "Small rooftop pool over the city centre, heated outside the summer peak.", score: 7.6, source: "editorial" },
    { name: "Aquila Elounda Village", neighborhood: "Elounda", poolType: "Heated outdoor pool · private pools", heatedMonths: "April–October", heatedPools: "2 of 5 pools heated", note: "Village-style resort with heated main pool and heated private suite pools.", score: 8.2, source: "editorial" },
    { name: "Porto Elounda Golf & Spa Resort", neighborhood: "Elounda", poolType: "Heated seawater pools · private pools", heatedMonths: "April–November", heatedPools: "Most pools heated", note: "Heated seawater pools throughout the resort plus a thalasso spa for off-season stays.", score: 9.0, source: "editorial" },
    { name: "Kalimera Kriti Sissi Bay", neighborhood: "Sissi", poolType: "Heated outdoor pool · heated indoor pool", heatedMonths: "April–October", heatedPools: "1 of 6 pools heated", note: "Bay resort that heats one outdoor pool and keeps the indoor pool warm all season.", score: 8.1, source: "editorial" },
  ],
};
