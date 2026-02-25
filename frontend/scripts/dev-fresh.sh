#!/bin/sh
# Eski cache ve chunk 404'lerini önlemek için temiz başlat.
cd "$(dirname "$0")/.."
rm -rf .next
echo "Cache silindi. Dev server başlatılıyor..."
echo "Açılan adresi (örn. http://localhost:3000) YENİ sekmede aç, Cmd+Shift+R ile yenile."
exec npm run dev
