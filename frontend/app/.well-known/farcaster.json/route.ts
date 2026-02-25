import { NextResponse } from "next/server";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://greenworld.fun";
const LOGO_URL = `${BASE_URL}/logo.png`;

export async function GET() {
  const manifest = {
    accountAssociation: {
      header: "eyJmaWQiOjI4NDAwNTMsInR5cGUiOiJjdXN0b2R5Iiwia2V5IjoiMHhmNzZEQkFhRkU3RTVBODAyYTk4OWZlOTExMjlmMEZFZmQ2MDA3ODM4In0",
      payload: "eyJkb21haW4iOiJncmVlbndvcmxkLmZ1biJ9",
      signature: "0Q2Vrr4ygigOwJOkMCfcHGw2H3QrxlTd3FDxDyANVzFIdfqv4FK4RRIHuN9lE7OZK//W6DbXQjZpyxJAMgyNvRw=",
    },
    miniapp: {
      version: "1",
      name: "Green World",
      homeUrl: BASE_URL,
      iconUrl: LOGO_URL,
      splashImageUrl: LOGO_URL,
      splashBackgroundColor: "#0a0a12",
      subtitle: "Greenify the world on Base",
      description: "Click the globe to plant trees onchain. Pay per tile, see the world turn green.",
      screenshotUrls: [LOGO_URL],
      primaryCategory: "games",
      tags: ["base", "game", "onchain", "green"],
      heroImageUrl: LOGO_URL,
      tagline: "Plant trees onchain",
      ogTitle: "Green World",
      ogDescription: "Greenify the world on Base — click to plant trees.",
      ogImageUrl: LOGO_URL,
      noindex: false,
    },
  };

  return NextResponse.json(manifest);
}
