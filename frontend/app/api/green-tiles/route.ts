import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const supabaseAdmin = getSupabaseAdmin();
  if (!supabaseAdmin) {
    return NextResponse.json([]);
  }
  const { data, error } = await supabaseAdmin
    .from("green_tiles")
    .select("x, y, pos_x, pos_y, pos_z, user_address")
    .order("created_at", { ascending: true });
  if (error) {
    return NextResponse.json([], { status: 200 });
  }
  return NextResponse.json(data ?? []);
}

export async function POST(request: Request) {
  const supabaseAdmin = getSupabaseAdmin();
  if (!supabaseAdmin) {
    return NextResponse.json({ ok: true });
  }
  try {
    const body = await request.json();
    const { x, y, pos_x, pos_y, pos_z, txHash, userAddress } = body as {
      x?: number;
      y?: number;
      pos_x?: number;
      pos_y?: number;
      pos_z?: number;
      txHash?: string;
      userAddress?: string;
    };
    if (typeof x !== "number" || typeof y !== "number") {
      return NextResponse.json({ error: "x, y required" }, { status: 400 });
    }
    await supabaseAdmin.from("green_tiles").insert({
      x,
      y,
      pos_x: typeof pos_x === "number" ? pos_x : null,
      pos_y: typeof pos_y === "number" ? pos_y : null,
      pos_z: typeof pos_z === "number" ? pos_z : null,
      tx_hash: txHash ?? null,
      user_address: userAddress ?? null,
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
