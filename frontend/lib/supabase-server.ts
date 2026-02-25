import { createClient, SupabaseClient } from "@supabase/supabase-js";

let _client: SupabaseClient | null | undefined = undefined;

export function getSupabaseAdmin(): SupabaseClient | null {
  if (_client !== undefined) return _client;
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    _client = url && key ? createClient(url, key) : null;
  } catch {
    _client = null;
  }
  return _client;
}
