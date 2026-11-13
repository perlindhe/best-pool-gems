# Minska krediter från automatiska batchjobb

## Mål
Inga AI-krediter ska dras automatiskt i bakgrunden. Betyg räknas bara om när du själv väljer det, och med en hård gräns per körning.

## Ändringar
1. **Stäng av det automatiska betygsjobbet**: ta bort schemat `evidence-auto-scoring`. Det körs i dag var tredje timme den 1:a varje månad. Inga fler automatiska AI-körningar.
2. **Stäng av kvartalsjobbet för foton och Google-betyg**: det använder inga AI-krediter, men det håller backend aktiv. Det tas bort och kan köras med en knapp i stället.
3. **Lägg till en knapp i adminpanelen**: "Räkna om nu (max 10 hotell)". Före varje körning visas en uppskattning av hur många krediter den drar. Knappen hoppar över hotell som räknats om de senaste 25 dagarna och hotell som redan har fullständiga fakta.
4. **Hård gräns i koden**: högst 10 hotell per körning och högst 1 körning åt gången. Körningen pausas direkt om AI-taket nås.
5. **Sänk AI-taket för arbetsytan från 100 till 10 credits per månad** som en extra spärr. Det kräver ditt godkännande på ett kort i chatten.

## Resultat
- Automatisk AI-kostnad: 0 credits per månad.
- En manuell körning med 10 hotell på Gemini Flash: uppskattningsvis under 1 credit.
- Den fasta kostnaden för att hålla databasen igång, cirka 56 credits per månad, påverkas inte.

## Tekniskt
- Avregistrera cron-jobben med `cron.unschedule`.
- Knappen anropar `runEvidenceAutomation` med `limit=10` och använder den befintliga lease-låsningen.
- Ändra AI Gateway-gränsen via `credits--update_limit`.
