# Web + Mini App Dual Support

Green World runs both as a normal web app (RainbowKit + browser wallets) and as a Farcaster/Base Mini App (SDK + in-app wallet). This document is the single reference for the integration.

## 1. Farcaster Mini Apps

**Source:** [miniapps.farcaster.xyz](https://miniapps.farcaster.xyz/)

- **Purpose:** Native-like apps inside Farcaster/Base; one-click discovery, integrated Ethereum wallet, passwordless sign-in.
- **SDK:** `@farcaster/miniapp-sdk`
  - **`sdk.actions.ready()`:** Must be called once the app is loaded; hides the splash and shows the app. If not called, users see an infinite loading screen.
  - **`sdk.isInMiniApp()`:** Returns whether the app is running inside a Mini App (iframe/WebView). Use this to branch between web and miniapp behavior.
  - **Wallet:** EIP-1193 provider via `sdk.wallet.getEthereumProvider()`. Recommended: use Wagmi with **`@farcaster/miniapp-wagmi-connector`** so connect/sign/tx stay consistent.
- **Wagmi in miniapp:** `createConfig({ chains: [base], connectors: [farcasterMiniApp()] })`. Inside the Mini App the user is already signed in; the connector connects automatically and no modal is needed.

## 2. Base – Migrate Existing App to Mini App

**Source:** [docs.base.org – Migrate an Existing App](https://docs.base.org/mini-apps/quickstart/migrate-existing-apps)

### Steps (summary)

1. **Add SDK:** `npm i @farcaster/miniapp-sdk` and `@farcaster/miniapp-wagmi-connector`.
2. **Display:** Call `sdk.actions.ready()` when the app is ready (e.g. in a React `useEffect`, as early as possible).
3. **Manifest:** Serve `https://your-domain.com/.well-known/farcaster.json`. In Next.js: create a route `app/.well-known/farcaster.json/route.ts` that returns the manifest JSON on GET.
4. **Manifest content:** Top-level `accountAssociation` (header, payload, signature) and `miniapp` object. Fill `accountAssociation` after domain verification in Base Build (see below).
5. **Embed metadata:** Required for rich embeds and launch. In Next.js: in `layout.tsx`, use `generateMetadata()` and set `other['fc:miniapp']` to a JSON string (version, imageUrl, button with title and action `launch_miniapp`, name, url, splashImageUrl, splashBackgroundColor).
6. **Preview and publish:** Validate manifest and embed in [Base Build Preview](https://www.base.dev/preview). Publish by posting your app URL in the Base app.

### Manifest field reference

- **accountAssociation:** Proves domain ownership. Generate at [Base Build – Account association](https://www.base.dev/preview?tab=account): enter App URL, verify, then paste the generated `header`, `payload`, and `signature` into the manifest.
- **miniapp:**  
  - Identity: `version`, `name`, `homeUrl`, `iconUrl`  
  - Loading: `splashImageUrl`, `splashBackgroundColor`  
  - Discovery: `primaryCategory` (e.g. `games`, `social`), `tags`, optional `noindex`  
  - Display: `subtitle`, `description`, `screenshotUrls`, `heroImageUrl`, `tagline`, `ogTitle`, `ogDescription`, `ogImageUrl`  
  - Optional: `webhookUrl` (only if using notifications).  
  Set `noindex: true` for development/staging to avoid search indexing.

### Embed metadata (fc:miniapp)

Used when the app is shared; required for the app to display correctly. Structure (as in layout `generateMetadata`):

- `version`: `"next"`
- `imageUrl`: URL of embed image
- `button.title`: e.g. "Play Now"
- `button.action`: `type: "launch_miniapp"`, `name`, `url`, `splashImageUrl`, `splashBackgroundColor`

## 3. Architecture (Web vs Mini App)

- **Web:** Current behavior unchanged: RainbowKit + default connectors; user clicks Connect and picks a wallet.
- **Mini App:** Wagmi uses only the `farcasterMiniApp()` connector; RainbowKit is not mounted. UI shows a simple “Connected: 0x…” style address. Call `sdk.actions.ready()` when in miniapp (or always; harmless on web).

## 4. Environment

- **NEXT_PUBLIC_APP_URL:** Base URL of the deployed app (e.g. `https://green-world.vercel.app`). Used in manifest `homeUrl` and embed metadata `url` / image URLs. Optional for local dev.
- **NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID:** Still used for web (RainbowKit); not used in miniapp.
