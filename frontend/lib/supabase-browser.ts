"use client";

import { createClient, SupabaseClient } from "@supabase/supabase-js";

let _client: SupabaseClient | null | undefined = undefined;

export function getSupabaseBrowser(): SupabaseClient | null {
  if (typeof window === "undefined") return null;
  if (_client !== undefined) return _client;
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    _client = url && anonKey ? createClient(url, anonKey) : null;
  } catch {
    _client = null;
  }
  return _client;
}
