import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-server";
import { GRID_WIDTH, GRID_HEIGHT } from "@/lib/config";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const supabaseAdmin = getSupabaseAdmin();
  const totalTiles = GRID_WIDTH * GRID_HEIGHT;
  if (!supabaseAdmin) {
    return NextResponse.json({ totalGreen: 0, totalTiles });
  }
  const { count, error } = await supabaseAdmin
    .from("green_tiles")
    .select("id", { count: "exact", head: true });
  if (error) {
    return NextResponse.json({ totalGreen: 0, totalTiles });
  }
  return NextResponse.json({ totalGreen: count ?? 0, totalTiles });
}
