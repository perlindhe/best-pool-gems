# Prioritet 1 — en enda sanning per hotell

## Vad jag hittade (kontrollerat, inte gissat)

Sajten har idag **två parallella datakällor**:

| Källa | Används av |
| --- | --- |
| Databasen (verifierade fakta, betyg, källor, verifieringsdatum) | Hotellprofilen, /rankings, jämförelsesidor, sitemap |
| En handskriven fil i koden (`src/data/hotels.ts`, med egna Pool Score och delpoäng) | Destinationssidorna (t.ex. /barcelona), guiderna, startsidans listor, menyn |

Det förklarar allt i punkt 1–4: Hotel Arts har ett betyg i guiden och ett annat på sin profil, antalet verifierade skiljer sig mellan startsidan och Barcelona, och poolfakta kan säga olika saker på olika sidor. Det är inte många småfel — det är ett fel, på ett ställe.

## Vad jag gör

### 1. Slå ihop de två källorna
Destinationssidor, guider och startsidan börjar hämta hotellens uppgifter från databasen, precis som hotellprofilen redan gör: Pool Score och delpoäng, antal pooler, pooltyp, uppvärmning, inne/ute, takpool, året runt, barn, dagspass, öppettider och säsong, verifieringsstatus och senaste verifieringsdatum.

Kodfilen behåller bara sådant som verkligen är redaktionellt och inte finns i databasen — stadsbeskrivningar, guidetexter, bilder till stadskorten. De hårdkodade betygen och poolfakta tas bort därifrån, så att de inte kan hamna i otakt igen.

Inget hotell och ingen redaktionell text raderas. Adresserna ändras inte.

### 2. Motsägelsekontroll som blockerar publicering
Den befintliga kvalitetskontrollen i admin byggs ut med de kontroller du listar: olika betyg på olika sidor, olika antal pooler, uppvärmd och inte uppvärmd samtidigt, pooltyp som skiljer sig, verifierad utan källor, verifieringsdatum i framtiden, destinationssidans totalsiffror mot databasen, och hotell som ligger i en ranking utan att uppfylla rankingens filter.

Allvarliga motsägelser markeras som blockerande: hotellet kan inte sättas till "verified/published" förrän de är lösta, och det syns direkt i admin vilka som är blockerade.

### 3. En enda definition av verifieringssiffran
Siffran betyder **verifierade hotellprofiler** (status `verified` + `published`). Samma beräkning, från databasen, används på startsidan, på varje destinationssida och i guiderna — ingen sida räknar längre på egen hand.

### 4. Ett enda Pool Score
Ett betyg per hotell, från databasen, överallt. Guiderna får ingen egen poäng. Om ett hotell saknar fullständigt underlag visas "Not yet scored" i stället för ett påhittat värde, och det räknas inte in i topplistan — samma regel som redan gäller på profilerna.

### 5. www och den gamla Voyager-adressen
- Jag lägger in en permanent omdirigering i appen så att www-adresser och gamla sidvägar går till `https://bestpoolhotels.com` med status 301, i stället för den tillfälliga 302 som webbhotellet gör idag.
- Jag söker igenom kod och databas efter kvarvarande Voyager-innehåll och adresser och rapporterar vad jag hittar innan något tas bort.
- Jag kontrollerar att varje indexerbar sida har en canonical-adress utan www och att den stämmer med sitemap.

## Bilder och redaktörer
Enligt dina svar: gästuppladdade foton döljs och bilder från hotellets egna kanaler behålls — det gör jag i nästa omgång, inte nu. Punkt 18 (redaktörsprofiler) hoppar jag över helt.

## Tekniska noteringar
Berörda filer: `src/data/hotels.ts`, `src/data/collections.ts`, `src/data/guideContent.ts`, `src/routes/$citySlug.index.tsx`, `src/routes/$citySlug.$articleSlug.tsx`, `src/routes/index.tsx`, `src/routes/barcelona.luxury-pool-hotels.tsx`, `src/components/HotelCard.tsx`, `src/components/CollectionPage.tsx`, `src/lib/city-hub.functions.ts`, `src/server/canonical-hotels.server.ts`, `src/server/integrity.server.ts`, `src/routes/admin.index.tsx`, `src/routes/__root.tsx` (redirect-hantering), `src/routes/sitemap[.]xml.tsx`.

Databas: inga rader tas bort. Eventuellt en additiv kolumn för blockerande QA-status.

## Ordning
1. Slå ihop datakällorna (punkt 1) — allt annat hänger på den
2. Verifieringssiffra och ett Pool Score (punkt 3 och 4)
3. Motsägelsekontroll med publiceringsspärr (punkt 2)
4. 301-omdirigeringar och Voyager-genomgång (punkt 5)
5. Kort rapport: vad som ändrats, vilka motsägelser som hittats, antal verifierade före och efter
