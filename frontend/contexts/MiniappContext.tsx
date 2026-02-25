"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { sdk } from "@farcaster/miniapp-sdk";

type MiniappContextValue = {
  isMiniApp: boolean | null;
};

const MiniappContext = createContext<MiniappContextValue>({ isMiniApp: null });

export function MiniappProvider({ children }: { children: React.ReactNode }) {
  const [isMiniApp, setIsMiniApp] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    sdk
      .isInMiniApp()
      .then((value) => {
        if (!cancelled) {
          setIsMiniApp(value);
          if (value) sdk.actions.ready();
        }
      })
      .catch(() => {
        if (!cancelled) setIsMiniApp(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <MiniappContext.Provider value={{ isMiniApp }}>
      {children}
    </MiniappContext.Provider>
  );
}

export function useMiniapp(): MiniappContextValue {
  const ctx = useContext(MiniappContext);
  if (!ctx) throw new Error("useMiniapp must be used within MiniappProvider");
  return ctx;
}
