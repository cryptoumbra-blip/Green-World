# Green World

Minimal Base onchain click game: click a tile → send `greenify(x, y)` → tile turns green after confirmation. Event-driven, no full map storage.

## Tech

- **Contract:** Solidity ^0.8.20, event-only state
- **Frontend:** Next.js 14, React, TypeScript, wagmi, viem, RainbowKit (cüzdan bağlantısı)
- **Chain:** Base (mainnet)

## Quick start

### 1. Deploy contract

```bash
cd contracts
cp .env.example .env   # optional: set PRIVATE_KEY, BASE_RPC_URL
npm install
npm run compile
npm run deploy:base
# Or testnet: npm run deploy:base-sepolia
```

Copy the printed contract address.

### 2. Run frontend

```bash
cd frontend
echo "NEXT_PUBLIC_GREEN_WORLD_ADDRESS=0xYourDeployedAddress" > .env.local
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), connect wallet, click a tile. After the tx confirms, the tile turns green (and stays green via `TileGreenified` events).

**Sharp background:** For a crisp full-screen space background, replace `frontend/public/space-bg.jpg` with an image at least **1920×1080** (or 2560×1440 for large/Retina screens). The default image is 720×1280 and will look soft when scaled.

## Contract

- **GreenWorld.sol**
  - `greenify(uint256 x, uint256 y)` — payable; requires `msg.value >= price`; emits `TileGreenified(user, x, y)`.
  - `price` — minimum wei per tile (owner can change via `setPrice`).
  - `withdraw()` — owner-only, withdraws contract balance.

Grid is **900×450** pixels: 1 click = 1 pixel at that exact position. Config in `frontend/lib/config.ts` (`GRID_WIDTH`, `GRID_HEIGHT`).

## Kayıt / storage (Supabase)

- **Onchain:** Sadece `greenify(x, y)` tx’i — çöl gezegeni yeşillendirme işlemi Base’de kalıyor.
- **Supabase:** Hangi koordinatın yeşil olduğu `green_tiles (x, y, tx_hash, user_address, created_at)` tablosunda. Tx onaylanınca API ile yazılıyor; sayfa açılışında bu tablodan yükleniyor.
- **Kurulum:** Supabase projesi oluştur, `frontend/supabase-schema.sql` içindeki tabloyu çalıştır. `frontend/.env.local` içine:
  - `NEXT_PUBLIC_SUPABASE_URL=...`
  - `SUPABASE_SERVICE_ROLE_KEY=...`
  Supabase yoksa API boş döner / yazmaz; uygulama yine çalışır (yeşiller sadece bu oturumda).

## Env

- **contracts:** `PRIVATE_KEY`, `BASE_RPC_URL` or `BASE_SEPOLIA_RPC_URL`
- **frontend:** `NEXT_PUBLIC_GREEN_WORLD_ADDRESS` (zorunlu), `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` (RainbowKit/WalletConnect için, [cloud.walletconnect.com](https://cloud.walletconnect.com) ücretsiz), `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` (Supabase için)

## Project layout

```
contracts/
  GreenWorld.sol
  scripts/deploy.js
  hardhat.config.js
frontend/
  app/           # layout, page, providers
  components/    # MapCanvas
  hooks/         # useGreenify, useTileEvents, usePastTileEvents, useContractPrice
  lib/           # wagmi, contract ABI, config
```
