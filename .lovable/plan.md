# Evidence-based Pool Score

En ny, transparent betygsmodell med fem mätbara faktorer, separerad från verifieringsstatus och från hur starkt underlaget är. Den körs först på tio testhotell. Övriga hotell behåller nuvarande visning tills du godkänner utrullningen.

## Vad du kommer se

En poängruta på hotellsidan:

```text
Evidence-based Pool Score
8.2/10  (82/100)

Guest pool sentiment       31.6/40
Heating                    13.0/15
Number of pools            11.0/15
Pool size                  16.0/20
Independent recognition    10.0/10

Confidence: High
Last verified: 17 September 2026
Checked by: [redaktör]
Score version: evidence-v1
```

Saknas en obligatorisk faktor visas i stället "Pool Score pending — more verified data required" (eller "…confidence too low"). Aldrig noll, aldrig "unknown", aldrig fler än en decimal.

## Tre skilda begrepp

- **Pool Score** — kvalitet, 0–100 internt, visas som 0–10.
- **Verification Status** — research pending / partially verified / fully verified / conflicting data / no active pool.
- **Confidence** — low / medium / high.

Status och confidence påverkar aldrig siffran, bara om den får publiceras och rankas.

## Underlag som måste samlas in

Idag finns högst tre poolkommentarer per hotell och nästan inga verifierade poolmått, så inget hotell når kravet på fem kommentarer. Därför ingår insamling i arbetet:

1. **Gästkommentarer** hämtas automatiskt från de recensionskällor projektet redan har tillgång till (Google Places, TripAdvisor, samt webbinsamling av publika recensionssidor). Varje kommentar sparas med källa, länk, författare, datum och texthash.
2. **Poolrelevans och sentiment** klassificeras per kommentar (positive/neutral/negative/unclear/irrelevant). Hotellets egen marknadstext räknas aldrig som gästkommentar.
3. **Dubbletter** slås ihop på hash och normaliserad text; max tre kommentarer per person eller vistelse räknas.
4. **Externa omnämnanden** föreslås automatiskt med förslag på källnivå A/B/C — inga poäng ges förrän du godkänt varje källa i granskningssidan.
5. **Poolstorlek** registreras bara när yta eller längd är belagd i en källa. Aldrig uppskattat från foto eller ord som "large pool".

## Granskningssida för redaktören

En intern, icke-indexerbar sida där du per hotell ser: antal relevanta kommentarer, fördelning positiva/neutrala/negativa, borttagna dubbletter, justerad positiv andel, alla fem delpoäng, uppvärmningskategori, pooler per kategori, verifierad yta/längd, kvalificerade externa källor med nivå, totalpoäng, Confidence, Verification Status, QA-fel, godkänd av och datum.

Du kan godkänna eller avvisa: sentimentklassificering, dubblettborttagning, källnivå, poolkategori och slutligt betyg. Först efter ditt godkännande blir ett betyg publikt.

## Ranking och indexering

Ett hotell rankas bara vid fully verified, confidence ≠ low, totalpoäng finns, godkänt av redaktör och inga blockerande QA-fel. Alla andra statusar: ingen rankingposition, ingen nollpoäng, ingen placering längst ner, `noindex, follow` och utanför sitemap.

## Testgrupp (tio hotell)

The Siam, Hotel June West LA, Hotel 1898, Hotel Can Bordoy, Park Hyatt Sydney, Hotel Arts Barcelona, W Sydney, Porto Elounda Golf & Spa Resort, Grand Hotel Central, Bvlgari Hotel London. Alla tio finns i databasen. Modellen appliceras inte på övriga hotell förrän du godkänt resultatet.

## Teknisk genomförandeplan

**Databas (migrationer)**

- `pool_comments`: hotel_id, source, source_url, author, published_at, raw_text, normalized_text, text_hash (unik per hotell), relevance, sentiment, is_owner_content, stay_group_key, editor_override_sentiment, approved_by/at.
- `external_mentions`: hotel_id, url (unik), publication, author, published_at, tier (A/B/C), is_about_pool, is_positive, excluded_reason, approved_by/at.
- `hotel_pools`: nya kolumner `area_sqm numeric`, `size_source_url text`, `size_verified boolean`.
- `pool_scores_evidence`: hela `PoolScoreRecord` — fem delpoäng, total_points, score_out_of_ten, verification_status, confidence_level, score_version (`evidence-v1`), calculated_at, approved_by, approved_at, plus inputs-snapshot (jsonb) för spårbarhet.
- GRANT + RLS på alla nya tabeller: publik SELECT bara på det som visas publikt, admin via `is_admin()`, service_role full.
- Gamla `pool_scores` rörs inte men läses inte längre för testgruppens hotell.

**Kod**

- `src/lib/evidence-score.ts` — rena funktioner: `scoreGuestSentiment`, `scoreHeating`, `scorePoolCount`, `scorePoolSize`, `scoreExternalRecognition`, `calculateConfidence`, `calculateEvidenceScore`, `evidenceVerificationStatus`. Returnerar `null` där underlag saknas; ingen omfördelning av saknade poäng.
- `src/lib/hotel-status.ts` behåller status-, uppvärmnings- och poolkategori­logiken som redan är central, men poolkategorier mappas till de nya namnen (`shared_swimming_pool`, `children_pool`, `jacuzzi_hot_tub` osv.) och `calculateVerificationStatus` byter till objektsignaturen `{ hotel, pools, sources, editorialScores, qaErrors }`.
- Insamling som serverfunktioner: `collectPoolComments`, `classifyPoolComments` (Lovable AI, `openai/gpt-6-astra`), `suggestExternalMentions`. Automatikpausen gäller fortfarande: de körs bara manuellt från granskningssidan och bara för testgruppen.
- Visning: ny `EvidenceScorePanel` på hotellprofilen, aktiv endast för testgruppens tio slugs; övriga hotell visar nuvarande ruta oförändrad.
- Ranking, index/noindex, sitemap och strukturerad data läser samma gate-funktion.

**Tester**

- `scripts/qa-evidence-score.mjs` med det angivna testscenariot: 31.6 + 13 + 11 + 16 + 10 = 81.6 → 8.2/10, 82/100, Confidence High.
- Enhetstester per faktor: under fem kommentarer ger `null`, privata pooler höjer inte poolantalet, jacuzzi räknas inte som pool, dubblett räknas en gång, saknad storlek blockerar betyg, samma artikel ger poäng en gång.
- Renderingstester (befintliga `qa-single-value.mjs` utökas): ingen sida visar ett gammalt betyg, `null`, `NaN` eller tekniska statusnamn.

**Leveransrapport** efter testgruppen: databasändringar, nya funktioner, avvecklade fält, per hotell antal kommentarer, dubbletter, sentimentfördelning, alla fem delpoäng, källor och nivåer, total, Confidence, status, orsak till uteblivet betyg, samtliga testresultat och kvarvarande frågor. Ingen utrullning till övriga hotell utan ditt godkännande.

## Utanför denna plan

Webbplatsens design ändras bara där den nya poängrutan kräver det. Inga nya hotell, inga massuppdateringar, ingen automatisk verifiering.
