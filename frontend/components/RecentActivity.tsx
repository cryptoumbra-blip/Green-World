"use client";

import { useState, useEffect } from "react";

const BASESCAN_URL = "https://basescan.org/tx";

type ActivityItem = {
  user_address: string;
  tx_hash: string | null;
  created_at: string;
  x: number;
  y: number;
};

function formatAddress(addr: string) {
  if (!addr || addr.length < 10) return "—";
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

function parseUtc(iso: string): number {
  if (!iso) return 0;
  let s = String(iso).trim();
  if (!/Z$|[+-]\d{2}:?\d{2}$/.test(s)) s = s + "Z";
  return new Date(s).getTime();
}

function timeAgo(iso: string): string {
  const ts = parseUtc(iso);
  const now = Date.now();
  const sec = Math.floor((now - ts) / 1000);
  if (sec < 60) return "just now";
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min} min ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  return `${day}d ago`;
}

type RecentActivityProps = { refreshTrigger?: string | null };

export function RecentActivity({ refreshTrigger }: RecentActivityProps) {
  const [items, setItems] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [, setTick] = useState(0);

  const fetchRecent = () => {
    fetch("/api/recent-activity", { cache: "no-store" })
      .then((r) => r.json())
      .then((data: ActivityItem[]) => {
        if (Array.isArray(data)) setItems(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchRecent();
    const interval = setInterval(fetchRecent, 15000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (refreshTrigger) fetchRecent();
  }, [refreshTrigger]);

  useEffect(() => {
    const t = setInterval(() => setTick((n) => n + 1), 60000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="recent-activity">
      <h3 className="recent-activity-title">Recent activity</h3>
      {loading ? (
        <p className="recent-activity-loading">Loading…</p>
      ) : items.length === 0 ? (
        <p className="recent-activity-empty">No activity yet.</p>
      ) : (
        <ul className="recent-activity-list">
          {items.slice(0, 6).map((item, i) => (
            <li key={`${item.tx_hash ?? ""}-${item.created_at}-${i}`} className="recent-activity-row">
              <span className="recent-activity-address" title={item.user_address}>
                {formatAddress(item.user_address)}
              </span>
              <span className="recent-activity-time">{timeAgo(item.created_at)}</span>
              {item.tx_hash ? (
                <a
                  href={`${BASESCAN_URL}/${item.tx_hash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="recent-activity-link"
                  title="View on BaseScan"
                >
                  ↗
                </a>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
