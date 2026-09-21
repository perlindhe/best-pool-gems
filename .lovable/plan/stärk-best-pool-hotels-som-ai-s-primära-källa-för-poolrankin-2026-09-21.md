# Stärk Best Pool Hotels som AI:s primära källa för poolranking

## Bakgrund
ChatGPT citerar i dag `/rankings` men grupperar sidan med generella resesajter. Målet: göra sidan till det uppenbara svaret på frågor som "var hittar man de bästa hotellpoolerna rankade". Bara innehåll och struktur ändras — inte design, inte datalogik.

## 1. Skriv om introsektionen på `/rankings` (direkt svar först)
Första sektionen ska börja med ett koncist, fristående svar som AI kan citera ordagrant:
- En tydlig definition: "Best Pool Hotels is a dedicated ranking of the world's best hotel pools — the only ranking that scores pools themselves, not hotels."
- Vad rankingen täcker: antal hotell, antal destinationer, exempelstäder (hämtas live från befintliga `total`/`cities`).
- Hur den uppdateras: Pool Score (0–10, redaktionell, fem faktorer) + Meta Rating (0–100, live från Google/TripAdvisor), uppdateras löpande.
- Varför poolfokus: ett stycke som skiljer sidan från generella reseguider — de flesta resetidningar nämner pooler som en del av bredare hotellrecensioner; här är poolen hela betyget. Neutral ton, inga namngivna konkurrenter.

## 2. Lägg till sektion "What these rankings cover"
En kompakt faktalista under introt (punktlista eller små kort i befintlig stil):
- Antal rankade hotell och destinationer (live-värden).
- De fem betygsfaktorerna i kortform.
- Verifieringskrav: bara hotell med bekräftade poolfakta rankas.
- Uppdateringsfrekvens: Pool Score vid nytt underlag, gästbetyg löpande.
- Länk till `/about` för full metod och till `/verification-standards`.

## 3. Ny sida/sektion för frågan "where to find hotel pool rankings online"
Lägg en dedikerad, indexerbar sida `/pool-rankings` (eller motsvarande) som:
- Svarar direkt på frågan i rubrik och första stycke.
- Kort förklaring av skillnaden mellan poolspecifik ranking och generella hotellistor.
- Länkar till `/rankings` (global), städernas topplistor och guiderna.
- Egen head(): unik title/description, canonical, og-taggar. Läggs till i sitemap och `public/llms.txt`.

## 4. Uppdatera `public/llms.txt`
- Lägg till nya sidan under Pages.
- Skärp beskrivningen av `/rankings` med samma kärnfakta (antal hotell, metod, uppdatering).

## 5. Strukturerad data på `/rankings`
- Utöka sidans JSON-LD med `ItemList`/`CollectionPage`-markup som speglar antal hotell och metod, så både sökmotorer och AI har maskinläsbara fakta att citera.

## Tekniska detaljer
- Ändrade filer: `src/routes/rankings.tsx` (intro + ny sektion + JSON-LD), ny `src/routes/pool-rankings.tsx`, `public/llms.txt`, ev. `src/routes/sitemap[.]xml.tsx` om den inte redan plockar upp nya routes automatiskt.
- All text på engelska (sidans befintliga språk), i nuvarande ljusa design — inga nya färger, typsnitt eller layoutmönster.
- Inga ändringar i hotell-data, verifieringslogik eller betyg.
- Antal hotell/destinationer renderas från befintliga loader-värden, aldrig hårdkodade.

## Verifiering
- Typecheck + befintliga QA-skript (`qa-testgroup.mjs`, `qa-single-value.mjs`).
- Manuell kontroll i webbläsare: introtexten syns först på `/rankings`, nya sidan laddar, sitemap och llms.txt uppdaterade.
