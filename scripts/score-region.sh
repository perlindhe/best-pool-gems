#!/usr/bin/env bash
# Re-score all hotels of a city in small batches.
# Usage: scripts/score-region.sh <city_slug> <total> [batch]
set -u
CITY="$1"; TOTAL="$2"; BATCH="${3:-5}"
KEY=$(grep -m1 VITE_SUPABASE_PUBLISHABLE_KEY .env | cut -d= -f2- | tr -d '"' | tr -d "'")
OFF=0
while [ "$OFF" -lt "$TOTAL" ]; do
  echo "=== $CITY offset=$OFF ==="
  curl -s -X POST -H "apikey: $KEY" \
    "http://localhost:8080/api/public/hooks/auto-score-all?city_slug=$CITY&limit=$BATCH&offset=$OFF" \
    | head -c 2000
  echo
  OFF=$((OFF + BATCH))
done
echo "DONE $CITY"
