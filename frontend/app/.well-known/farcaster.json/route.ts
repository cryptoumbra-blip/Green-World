import { NextResponse } from "next/server";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://green-world.vercel.app";
const LOGO_URL = `${BASE_URL}/logo.png`;

export async function GET() {
  const manifest = {
    accountAssociation: {
      header: "",
      payload: "",
      signature: "",
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
      noindex: process.env.NODE_ENV !== "production",
    },
  };

  return NextResponse.json(manifest);
}
