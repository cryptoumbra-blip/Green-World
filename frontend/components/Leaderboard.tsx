"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";

type Entry = { rank: number; address: string; count: number };

function formatAddress(addr: string) {
  if (!addr || addr.length < 10) return "—";
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

type LeaderboardProps = { refreshTrigger?: string | null };

export function Leaderboard({ refreshTrigger }: LeaderboardProps) {
  const { address } = useAccount();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLeaderboard = () => {
    fetch("/api/leaderboard", { cache: "no-store" })
      .then((r) => r.json())
      .then((data: Entry[]) => {
        if (Array.isArray(data)) setEntries(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchLeaderboard();
    const t = setInterval(fetchLeaderboard, 15000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (refreshTrigger) fetchLeaderboard();
  }, [refreshTrigger]);

  const currentAddressLower = address?.toLowerCase();

  return (
    <aside className="leaderboard">
      <h2 className="leaderboard-title">🏆 Leaderboard</h2>
      {loading ? (
        <p className="leaderboard-loading">Loading…</p>
      ) : entries.length === 0 ? (
        <p className="leaderboard-empty">No green tiles yet. Be the first to click!</p>
      ) : (
        <ol className="leaderboard-list">
          {entries.map((e) => (
            <li
              key={e.address}
              className={`leaderboard-row ${currentAddressLower === e.address.toLowerCase() ? "is-you" : ""}`}
            >
              <span className="leaderboard-rank">{e.rank}</span>
              <span className="leaderboard-address" title={e.address}>
                {formatAddress(e.address)}
              </span>
              <span className="leaderboard-count">{e.count} tx</span>
            </li>
          ))}
        </ol>
      )}
    </aside>
  );
}
