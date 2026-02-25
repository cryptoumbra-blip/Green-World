"use client";

import dynamic from "next/dynamic";
import { useCallback, useState, useEffect, useRef, useMemo } from "react";
import { useAccount } from "wagmi";
import { useGreenify } from "@/hooks/useGreenify";

const WorldScene = dynamic(() => import("@/components/WorldScene").then((m) => ({ default: m.WorldScene })), {
  ssr: false,
  loading: () => (
    <div className="map-loading">
      <img src="/logo.png" alt="Green World" className="map-loading-logo" />
      <div className="map-loading-spinner" />
      <span className="map-loading-text">Loading map…</span>
    </div>
  ),
});
import { useContractPrice } from "@/hooks/useContractPrice";
import { GREEN_WORLD_ADDRESS, GRID_WIDTH, GRID_HEIGHT } from "@/lib/config";
import { Leaderboard } from "@/components/Leaderboard";
import { GlobalProgress } from "@/components/GlobalProgress";
import { RecentActivity } from "@/components/RecentActivity";
import { WalletConnectOrAddress } from "@/components/WalletConnectOrAddress";
import { useGreenTilesRealtime } from "@/hooks/useGreenTilesRealtime";
import { useIsMobile } from "@/hooks/useIsMobile";
import { useMiniapp } from "@/contexts/MiniappContext";

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [greenTiles, setGreenTiles] = useState<Set<string>>(new Set());
  const [exactPositions, setExactPositions] = useState<Map<string, [number, number, number]>>(new Map());
  const [tileUsers, setTileUsers] = useState<Map<string, string>>(new Map());
  const [stats, setStats] = useState({ totalGreen: 0, totalTiles: GRID_WIDTH * GRID_HEIGHT });
  const lastGreenifyRef = useRef<{ x: number; y: number; position: [number, number, number] } | null>(null);
  const clickFeedbackTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const txStatusTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [leaderboardRefreshKey, setLeaderboardRefreshKey] = useState<string | null>(null);
  const { isConnected, address } = useAccount();
  const { price } = useContractPrice();
  const { greenify, isPending, writeError, hash, isSuccess } = useGreenify();

  const userTileKeys = useMemo(() => {
    if (!address) return new Set<string>();
    const lower = address.toLowerCase();
    return new Set(
      Array.from(tileUsers.entries())
        .filter(([, u]) => u?.toLowerCase() === lower)
        .map(([k]) => k)
    );
  }, [address, tileUsers]);

  useEffect(() => setMounted(true), []);

  useEffect(() => () => {
    if (clickFeedbackTimeoutRef.current) clearTimeout(clickFeedbackTimeoutRef.current);
    if (txStatusTimeoutRef.current) clearTimeout(txStatusTimeoutRef.current);
  }, []);

  const addGreenTile = useCallback(
    (x: number, y: number, position: [number, number, number], userAddress?: string) => {
      const key = `${x},${y}`;
      lastGreenifyRef.current = { x, y, position };
      setGreenTiles((prev) => new Set(prev).add(key));
      setExactPositions((prev) => new Map(prev).set(key, position));
      if (userAddress) setTileUsers((prev) => new Map(prev).set(key, userAddress));
    },
    []
  );

  const refreshStats = useCallback(() => {
    fetch("/api/stats", { cache: "no-store" })
      .then((r) => r.json())
      .then((data: { totalGreen?: number; totalTiles?: number }) => {
        if (typeof data.totalGreen === "number") setStats((s) => ({ ...s, totalGreen: data.totalGreen! }));
        if (typeof data.totalTiles === "number") setStats((s) => ({ ...s, totalTiles: data.totalTiles! }));
      })
      .catch(() => {});
  }, []);

  const refreshGreenTiles = useCallback(() => {
    fetch("/api/green-tiles", { cache: "no-store" })
      .then((r) => r.json())
      .then(
        (data: {
          x: number;
          y: number;
          pos_x?: number;
          pos_y?: number;
          pos_z?: number;
          user_address?: string | null;
        }[]) => {
          if (!Array.isArray(data) || !data.length) return;
          setGreenTiles((prev) => {
            const next = new Set(prev);
            for (const t of data) next.add(`${t.x},${t.y}`);
            return next;
          });
          setExactPositions((prev) => {
            const next = new Map(prev);
            for (const t of data) {
              if (
                typeof t.pos_x === "number" &&
                typeof t.pos_y === "number" &&
                typeof t.pos_z === "number"
              ) {
                next.set(`${t.x},${t.y}`, [t.pos_x, t.pos_y, t.pos_z]);
              }
            }
            return next;
          });
          setTileUsers((prev) => {
            const next = new Map(prev);
            for (const t of data) {
              if (t.user_address) next.set(`${t.x},${t.y}`, t.user_address);
            }
            return next;
          });
        }
      )
      .catch(() => {});
  }, []);

  const refreshAllFromSupabase = useCallback(() => {
    setLeaderboardRefreshKey((prev) => (prev ?? "") + "-live");
    refreshStats();
    refreshGreenTiles();
  }, [refreshStats, refreshGreenTiles]);

  useGreenTilesRealtime(refreshAllFromSupabase);

  useEffect(() => {
    if (!isSuccess || !hash || !address) return;
    const last = lastGreenifyRef.current;
    if (!last) return;
    lastGreenifyRef.current = null;
    setTxStatus("confirmed");
    if (txStatusTimeoutRef.current) clearTimeout(txStatusTimeoutRef.current);
    txStatusTimeoutRef.current = setTimeout(() => setTxStatus(null), 2500);
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    fetch("/api/green-tiles", { cache: "no-store", method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        x: last.x,
        y: last.y,
        pos_x: last.position[0],
        pos_y: last.position[1],
        pos_z: last.position[2],
        txHash: hash,
        userAddress: address,
      }),
    })
      .then((r) => {
        if (r.ok) {
          setLeaderboardRefreshKey(hash);
          refreshStats();
          timeoutId = setTimeout(() => {
            setLeaderboardRefreshKey((prev) => (prev ? `${prev}-retry` : null));
            refreshStats();
          }, 2500);
        }
      })
      .catch(() => {});
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [isSuccess, hash, address, refreshStats]);

  useEffect(() => {
    refreshGreenTiles();
  }, [refreshGreenTiles]);

  useEffect(() => {
    refreshStats();
    const t = setInterval(refreshStats, 15000);
    return () => clearInterval(t);
  }, [refreshStats]);

  useEffect(() => {
    if (leaderboardRefreshKey) refreshStats();
  }, [leaderboardRefreshKey, refreshStats]);

  useEffect(() => {
    if (writeError) setTxStatus(null);
  }, [writeError]);

  const noContract = !GREEN_WORLD_ADDRESS;
  const handleTileClick = useCallback(
    (x: number, y: number, position: [number, number, number]) => {
      const showFeedback = (msg: string) => {
        if (clickFeedbackTimeoutRef.current) clearTimeout(clickFeedbackTimeoutRef.current);
        setClickFeedback(msg);
        clickFeedbackTimeoutRef.current = setTimeout(() => setClickFeedback(null), 3000);
      };
      if (!isConnected || !address) {
        showFeedback("Connect wallet to plant a tree");
        return;
      }
      if (noContract) {
        showFeedback("Contract not configured");
        return;
      }
      if (isPending) {
        showFeedback("Transaction in progress…");
        return;
      }
      if (!price || price === BigInt(0)) {
        const isProd = typeof window !== "undefined" && !window.location.hostname.match(/^localhost$/i);
        showFeedback(isProd ? "Loading price… (check Base network & RPC)" : "Loading price…");
        return;
      }
      setTxStatus("pending");
      greenify(x, y, price);
      queueMicrotask(() => addGreenTile(x, y, position, address));
    },
    [isConnected, price, isPending, address, greenify, addGreenTile, noContract]
  );

  const isMobile = useIsMobile();
  const { isMiniApp } = useMiniapp();
  const useMobileLayout = isMobile || isMiniApp === true;
  const [mobileTab, setMobileTab] = useState<"home" | "leaderboard" | "activity">("home");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [clickFeedback, setClickFeedback] = useState<string | null>(null);
  const [txStatus, setTxStatus] = useState<"pending" | "confirmed" | null>(null);

  return (
    <main className={`app-shell ${useMobileLayout ? "app-shell-mobile-layout" : ""}`}>
      {/* Desktop: sol sidebar + sağ köşe UI (mobil/miniapp'te gizlenir) */}
      {!useMobileLayout && (
        <>
          <div className="leaderboard-sidebar">
            <Leaderboard refreshTrigger={mounted ? leaderboardRefreshKey ?? undefined : undefined} />
          </div>
          <div className="corner-ui">
            <div className="corner-wallet">
              <WalletConnectOrAddress />
            </div>
            {mounted && (
              <GlobalProgress totalGreen={stats.totalGreen} totalTiles={stats.totalTiles} />
            )}
            <RecentActivity refreshTrigger={mounted ? leaderboardRefreshKey ?? undefined : undefined} />
          </div>
        </>
      )}

      {/* Mobil / Miniapp: hamburger (cüzdan drawer) */}
      {useMobileLayout && (
        <>
          <button
            type="button"
            className="mobile-hamburger"
            onClick={() => setDrawerOpen(true)}
            aria-label="Menü"
          >
            <span className="mobile-hamburger-bar" />
            <span className="mobile-hamburger-bar" />
            <span className="mobile-hamburger-bar" />
          </button>
          <div
            className={`mobile-drawer ${drawerOpen ? "mobile-drawer-open" : ""}`}
            aria-hidden={!drawerOpen}
          >
            <div className="mobile-drawer-backdrop" onClick={() => setDrawerOpen(false)} />
            <div className="mobile-drawer-panel">
              <div className="mobile-drawer-header">
                <span className="mobile-drawer-title">Wallet</span>
                <button
                  type="button"
                  className="mobile-drawer-close"
                  onClick={() => setDrawerOpen(false)}
                  aria-label="Kapat"
                >
                  ×
                </button>
              </div>
              <div className="mobile-drawer-body">
                <WalletConnectOrAddress />
              </div>
            </div>
          </div>
        </>
      )}

      {/* İçerik: mobilde tab’a göre, masaüstünde sadece globe */}
      {clickFeedback && (
        <div className="click-feedback" role="status">
          {clickFeedback}
        </div>
      )}

      {/* Transaction status — haritanın altında, yeşil */}
      {txStatus && (
        <div className={`tx-status-bar tx-status-bar--${txStatus}`} role="status" aria-live="polite">
          {txStatus === "pending" && (
            <>
              <span className="tx-status-bar__spinner" aria-hidden />
              <span className="tx-status-bar__text">Transaction pending confirmation</span>
            </>
          )}
          {txStatus === "confirmed" && (
            <>
              <span className="tx-status-bar__icon tx-status-bar__icon--check" aria-hidden>✓</span>
              <span className="tx-status-bar__text">Transaction confirmed</span>
            </>
          )}
        </div>
      )}

      <div className={`globe-wrap ${useMobileLayout ? "globe-wrap-mobile" : ""}`}>
        {!useMobileLayout ? (
          <WorldScene
            greenTiles={greenTiles}
            exactPositions={exactPositions}
            userTileKeys={userTileKeys}
            onTileClick={handleTileClick}
            disabled={!isConnected || isPending || noContract}
          />
        ) : useMobileLayout && mobileTab === "home" ? (
          <>
            <WorldScene
              greenTiles={greenTiles}
              exactPositions={exactPositions}
              userTileKeys={userTileKeys}
              onTileClick={handleTileClick}
              disabled={!isConnected || isPending || noContract}
            />
            {mounted && (
              <div className="mobile-home-progress">
                <GlobalProgress totalGreen={stats.totalGreen} totalTiles={stats.totalTiles} />
              </div>
            )}
          </>
        ) : mobileTab === "leaderboard" ? (
          <div className="mobile-panel">
            <Leaderboard refreshTrigger={mounted ? leaderboardRefreshKey ?? undefined : undefined} />
          </div>
        ) : (
          <div className="mobile-panel">
            <RecentActivity refreshTrigger={mounted ? leaderboardRefreshKey ?? undefined : undefined} />
          </div>
        )}
      </div>

      {/* Mobil / Miniapp: alt navigasyon */}
      {useMobileLayout && (
        <nav className="mobile-bottom-nav">
          <button
            type="button"
            className={`mobile-nav-item ${mobileTab === "home" ? "active" : ""}`}
            onClick={() => setMobileTab("home")}
          >
            <span className="mobile-nav-icon" aria-hidden>🌍</span>
            <span className="mobile-nav-label">World</span>
          </button>
          <button
            type="button"
            className={`mobile-nav-item ${mobileTab === "leaderboard" ? "active" : ""}`}
            onClick={() => setMobileTab("leaderboard")}
          >
            <span className="mobile-nav-icon" aria-hidden>🏆</span>
            <span className="mobile-nav-label">Leaderboard</span>
          </button>
          <button
            type="button"
            className={`mobile-nav-item ${mobileTab === "activity" ? "active" : ""}`}
            onClick={() => setMobileTab("activity")}
          >
            <span className="mobile-nav-icon" aria-hidden>📋</span>
            <span className="mobile-nav-label">Activity</span>
          </button>
        </nav>
      )}
    </main>
  );
}
