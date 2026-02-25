# 🌍 Green World — Base Onchain Click Game (Cursor Spec)

## 🧠 Overview

Green World is a simple onchain interaction game built on Base.

Users click on a desert world map.
Each click sends an onchain transaction.
When the transaction confirms, the clicked coordinate turns green.

**Core loop:**

1. User clicks map
2. Transaction sent on Base
3. Contract emits event
4. Frontend listens
5. Tile becomes green

Goal: maximize onchain interactions with extremely simple UX.

---

## 🎯 MVP Scope (Keep It Simple)

### MUST HAVE

* Clickable grid world map
* Onchain transaction per click
* Tile turns green after tx success
* Small ETH fee per interaction
* Event-based updates

### NOT in MVP

* No NFT mint
* No ownership logic
* No complex game mechanics
* No heavy onchain storage

---

## 🏗️ High-Level Architecture

```
Frontend (Next.js + React)
        ↓
Wallet (wagmi + viem)
        ↓
Smart Contract (Base)
        ↓
Event Emission
        ↓
Frontend Event Listener
        ↓
Map Update (tile → green)
```

---

## 🧱 Tech Stack

### Frontend

* Next.js (App Router)
* React
* TypeScript
* wagmi
* viem
* Canvas or lightweight grid renderer

### Blockchain

* Base Mainnet
* Solidity ^0.8.20
* Minimal storage design
* Event-driven state

### Optional (later)

* The Graph or custom indexer
* Redis cache
* Leaderboard service

---

## 🪙 Smart Contract Requirements

### Contract Name

`GreenWorld`

### Core Function

```
greenify(uint256 x, uint256 y) external payable
```

### Behavior

* Requires minimum ETH payment
* Emits event with coordinates
* Does NOT store full map onchain (MVP)

### Event

```
event TileGreenified(address indexed user, uint256 x, uint256 y);
```

### Variables

* `price` (modifiable later)
* `owner`
* `withdraw()` function

### Design Principles

* Keep gas minimal
* Prefer events over storage
* Optimize for high tx count

---

## 🗺️ Map System

### Coordinate Model (IMPORTANT)

Use **grid coordinates**, NOT lat/lng.

Example grid:

```
width: 1000
height: 500
```

Each tile identified by:

```
(x, y)
```

### Why Grid?

* deterministic
* cheap
* easy indexing
* fast rendering
* perfect for viral pixel games

---

## 🎨 Frontend Map Behavior

### User Flow

1. User opens app
2. Map loads
3. User clicks tile
4. Wallet pops
5. Tx sent
6. Wait for confirmation
7. Tile turns green

### Visual States

Tile states:

* default (desert)
* pending (optional)
* green (confirmed)

---

## 🔌 Frontend–Contract Interaction

### On Click

Frontend must:

1. Calculate grid coordinate
2. Call `greenify(x, y)`
3. Send required ETH
4. Wait for receipt

### After Confirmation

Two acceptable MVP methods:

**Method A (fast MVP)**
Update tile after tx receipt.

**Method B (better)**
Listen to `TileGreenified` event and update map.

Preferred for production: **Method B**

---

## 💰 Monetization Model

Target revenue:

* ~0.02 USD per transaction

Contract price:

* adjustable by owner later
* start very low for growth

Important:

* total user cost = gas + protocol fee
* UX must show expected cost

---

## ⚠️ Anti-Spam (Post-MVP)

Not required for first release, but planned:

* per-wallet cooldown
* dynamic pricing
* per-tile lock
* bot filtering

Design contract with upgrade path in mind.

---

## 📡 Event Indexing (Phase 2)

For scaling:

Option A:

* wagmi event listener only (MVP)

Option B:

* The Graph indexer
* reconstruct full map
* serve via API

---

## 🚀 Performance Considerations

### Must

* avoid full onchain map storage
* avoid heavy loops in contract
* keep frontend rendering lightweight

### Nice to have later

* chunked map loading
* viewport rendering
* tile batching

---

## 🔐 Security Notes

* validate payment in contract
* owner-only withdraw
* no unbounded loops
* no user-controlled storage growth

---

## 📦 Suggested Project Structure

```
/green-world
  /contracts
    GreenWorld.sol

  /frontend
    /app
    /components
      MapCanvas.tsx
      Tile.tsx
    /lib
      wagmi.ts
      contract.ts
    /hooks
      useGreenify.ts
      useTileEvents.ts

  /docs
    spec.md
```

---

## 🧪 MVP Success Criteria

Product is considered working when:

* User can click any tile
* Wallet transaction succeeds
* Event is emitted on Base
* Tile visually turns green
* Owner can withdraw fees

---

## 🔮 Future Expansion (Not Now)

* Tile ownership
* NFT mint per region
* Leaderboard
* Country wars
* Seasonal resets
* Social sharing
* Airdrop mechanics

---

## 🧭 Development Order (IMPORTANT)

Cursor should implement in this order:

1. Smart contract (minimal)
2. Deploy to Base testnet
3. Basic clickable grid
4. Wallet connection
5. Send transaction on click
6. Listen for events
7. Turn tile green
8. Add polish

---

**Philosophy:**
Ship fast → prove interaction → then gamify.

---

END OF SPEC
