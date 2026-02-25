import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://green-world.vercel.app";
const LOGO_URL = `${BASE_URL}/logo.png`;

export async function generateMetadata(): Promise<Metadata> {
  const fcMiniapp = {
    version: "next",
    imageUrl: LOGO_URL,
    button: {
      title: "Play Green World",
      action: {
        type: "launch_miniapp",
        name: "Green World",
        url: BASE_URL,
        splashImageUrl: LOGO_URL,
        splashBackgroundColor: "#0a0a12",
      },
    },
  };

  return {
    title: "Green World",
    description: "Base onchain click game — greenify the desert.",
    icons: {
      icon: "/logo.png",
      apple: "/logo.png",
    },
    openGraph: {
      type: "website",
      url: BASE_URL,
      siteName: "Green World",
      title: "Green World",
      description: "Greenify the world on Base — click to plant trees.",
      images: [{ url: LOGO_URL, width: 1200, height: 630, alt: "Green World" }],
    },
    twitter: {
      card: "summary_large_image",
      title: "Green World",
      description: "Greenify the world on Base — click to plant trees.",
      images: [LOGO_URL],
    },
    other: {
      "fc:miniapp": JSON.stringify(fcMiniapp),
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,600;0,9..40,700;1,9..40,400&display=swap" rel="stylesheet" />
      </head>
      <body>
        <header className="site-header">
          <a href="/" className="site-logo-link" aria-label="Green World – Ana sayfa">
            <img src="/logo.png" alt="Green World" className="site-logo" />
          </a>
        </header>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
