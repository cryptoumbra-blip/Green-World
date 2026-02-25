import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const LIMIT = 10;

export type RecentActivityItem = {
  user_address: string;
  tx_hash: string | null;
  created_at: string;
  x: number;
  y: number;
};

export async function GET() {
  const supabaseAdmin = getSupabaseAdmin();
  if (!supabaseAdmin) {
    return NextResponse.json([]);
  }
  const { data, error } = await supabaseAdmin
    .from("green_tiles")
    .select("user_address, tx_hash, created_at, x, y")
    .order("created_at", { ascending: false })
    .limit(LIMIT);
  if (error) {
    return NextResponse.json([], { status: 200 });
  }
  return NextResponse.json(data ?? []);
}
