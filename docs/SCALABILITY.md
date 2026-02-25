# Ölçeklenebilirlik – Binlerce Tx / Yoğun Kullanım

## Kısa cevap

**Evet, ileride yavaşlama yaşanabilir** — özellikle **frontend (3D harita)** ve **yeşil tile listesini tek seferde çekme** kısmında. Kontrat ve Base ağı tarafı genelde sorun çıkarmaz.

---

## 1. Kontrat (Base) ✅ En rahat

- Her yeşillendirme = 1 tx; kontrat **sadece event yayınlıyor**, tile listesi tutmuyor.
- Base yüksek TPS kaldırır; darboğaz genelde **kullanıcının gas ödemesi**, sistem tarafında değil.
- **Risk:** Düşük.

---

## 2. Supabase ⚠️ Orta risk

| Nokta | Durum | Not |
|-------|--------|-----|
| **green_tiles tablosu** | Satır sayısı = toplam tx sayısı. 100k+ satırda sorgular yavaşlayabilir. | `(x,y)`, `created_at` index’leri var; gerekirse partition / arşiv. |
| **GET /api/green-tiles** | Şu an **tüm satırları** döndürüyor. | 50k+ tile’da hem sorgu hem JSON büyür; sayfa açılışı yavaşlar. |
| **Leaderboard / stats / recent** | Limit’li (10, count, 10). | RPC + count + limit iyi ölçeklenir. |
| **Realtime** | Çok sayıda eşzamanlı kullanıcı + sık INSERT. | Supabase Realtime limitlerine dikkat; gerekirse polling ağırlıklı kullanım. |

**Öneri:**  
- GET green-tiles’a **limit** veya **pagination** eklemek (örn. son 10k veya sayfa bazlı).  
- İleride tile sayısı çok artarsa “sadece görünen bölge” veya özet veri API’si düşünülebilir.

---

## 3. Frontend (3D harita) 🔴 En kritik

**Neden ağaçlar yavaşlatır?**  
Her ağaç = 3 mesh (gövde, taban, taç) = 3 GPU draw call + 1 React bileşeni. 10.000 ağaç = 30.000 draw call her frame; tarayıcı ve GPU bunu kaldıramayınca FPS düşer, sayfa takılır.

**Yapılan:**  
- **Render cap** uygulandı: `MAX_TREES_RENDERED = 5000`. En fazla 5000 ağaç çiziliyor; **senin diktiğin ağaçlar her zaman öncelikli**, kalan slotlar diğer kullanıcılarınkilerle dolduruluyor. Böylece 50k+ tile olsa bile ekranda 5000’i geçmez, risk minimuma iner.

**İleride eklenebilecekler:**  
- **LOD (Level of Detail):** Kamera uzaktayken ağaç = basit nokta/konu, yaklaşınca tam ağaç.  
- **Instancing:** Tüm ağaçları tek `InstancedMesh` ile çizmek (çok daha az draw call).  
- **View-dependent:** Sadece kameranın gördüğü bölgedeki tile’ları çizmek.

---

## 4. Next.js API

- Route’lar stateless; Supabase ve kontrat çağrılarına bağlı.  
- **Yeşil tile listesini sınırlamadığın sürece** en ağır kısım GET green-tiles ve JSON boyutu olur; API “yavaş” hissi büyük ölçüde bundan gelir.

---

## Özet tablo

| Katman | Binlerce tx / günlük aşırı kullanım | Önlem (kısa) |
|--------|-------------------------------------|--------------|
| **Kontrat / Base** | Genelde sorun yok | — |
| **Supabase** | Tablo büyüdükçe GET yavaşlayabilir | Limit / pagination, index |
| **GET green-tiles** | Çok tile = yavaş + büyük JSON | Limit veya pagination |
| **Frontend (ağaçlar)** | 10k+ ağaçta FPS düşer | Render cap, LOD, view-dependent |

**Sonuç:**  
Kontrat tarafı rahat; **yavaşlama riski en çok “tüm tile’ları tek seferde çekip hepsini 3D’de çizmek”ten** gelir.  
Binlerce anlık tx veya günlük aşırı kullanımda **yavaşlama yaşamamak için** render cap (örn. max 3000–5000 ağaç) ve GET green-tiles’a limit/pagination eklemek en etkili ilk adımlar olur.
