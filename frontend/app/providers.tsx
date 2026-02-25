"use client";

import "@rainbow-me/rainbowkit/styles.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { WagmiProvider } from "wagmi";
import { config } from "@/lib/wagmi";
import { miniappConfig } from "@/lib/wagmi-miniapp";
import { MiniappProvider, useMiniapp } from "@/contexts/MiniappContext";

const queryClient = new QueryClient();

function ProvidersInner({ children }: { children: React.ReactNode }) {
  const { isMiniApp } = useMiniapp();
  const wagmiConfig = isMiniApp === true ? miniappConfig : config;

  return (
    <WagmiProvider key={isMiniApp === true ? "miniapp" : "web"} config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        {isMiniApp === true ? children : <RainbowKitProvider>{children}</RainbowKitProvider>}
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <MiniappProvider>
      <ProvidersInner>{children}</ProvidersInner>
    </MiniappProvider>
  );
}
