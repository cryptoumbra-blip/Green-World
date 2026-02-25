import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export type LeaderboardEntry = { rank: number; address: string; count: number };

function rowToEntry(row: Record<string, unknown>, i: number): LeaderboardEntry {
  const address = row.address ?? row.Address ?? "";
  const count = row.count ?? row.Count ?? 0;
  return {
    rank: i + 1,
    address: String(address),
    count: Number(count),
  };
}

export async function GET() {
  const supabaseAdmin = getSupabaseAdmin();
  if (!supabaseAdmin) {
    return NextResponse.json([]);
  }
  const { data, error } = await supabaseAdmin.rpc("get_leaderboard", { lim: 10 });
  if (!error && Array.isArray(data) && data.length > 0) {
    const entries: LeaderboardEntry[] = data.map((row: Record<string, unknown>, i: number) =>
      rowToEntry(row, i)
    );
    return NextResponse.json(entries);
  }
  const { data: fallbackData, error: fallbackError } = await supabaseAdmin
    .from("green_tiles")
    .select("user_address")
    .not("user_address", "is", null)
    .range(0, 9999);
  if (fallbackError) {
    return NextResponse.json([], { status: 200 });
  }
  const counts = new Map<string, number>();
  for (const row of fallbackData ?? []) {
    const addr = (row.user_address as string) || "";
    if (addr) counts.set(addr.toLowerCase(), (counts.get(addr.toLowerCase()) ?? 0) + 1);
  }
  const entries: LeaderboardEntry[] = Array.from(counts.entries())
    .map(([address, count]) => ({ address, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)
    .map((e, i) => ({ rank: i + 1, address: e.address, count: e.count }));
  return NextResponse.json(entries);
}
