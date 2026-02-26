"use client";

import { createContext, useContext, useState, useEffect, useRef } from "react";
import { sdk } from "@farcaster/miniapp-sdk";

type MiniappContextValue = {
  isMiniApp: boolean | null;
};

const MiniappContext = createContext<MiniappContextValue>({ isMiniApp: null });

/** Miniapp iframe bazen geç yanıt veriyor; önce 600ms, iframe’deyse 1200ms ile tekrar dene */
async function detectMiniApp(): Promise<boolean> {
  let value = await sdk.isInMiniApp(600);
  if (!value && typeof window !== "undefined" && window.self !== window.top) {
    value = await sdk.isInMiniApp(1200);
  }
  return value;
}

export function MiniappProvider({ children }: { children: React.ReactNode }) {
  const [isMiniApp, setIsMiniApp] = useState<boolean | null>(null);
  const addMiniAppTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let cancelled = false;
    detectMiniApp()
      .then((value) => {
        if (!cancelled) {
          setIsMiniApp(value);
          if (value) {
            sdk.actions.ready();
            addMiniAppTimeoutRef.current = setTimeout(() => {
              sdk.actions.addMiniApp().catch(() => {});
            }, 800);
          }
        }
      })
      .catch(() => {
        if (!cancelled) setIsMiniApp(false);
      });
    return () => {
      cancelled = true;
      if (addMiniAppTimeoutRef.current) {
        clearTimeout(addMiniAppTimeoutRef.current);
        addMiniAppTimeoutRef.current = null;
      }
    };
  }, []);

  // Miniapp’ta header’ı gizlemek için body class (layout’ta CSS ile kullanılır)
  useEffect(() => {
    if (isMiniApp === true) {
      document.body.classList.add("is-miniapp");
    } else {
      document.body.classList.remove("is-miniapp");
    }
    return () => document.body.classList.remove("is-miniapp");
  }, [isMiniApp]);

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
