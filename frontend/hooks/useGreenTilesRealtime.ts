"use client";

import { useEffect } from "react";
import { getSupabaseBrowser } from "@/lib/supabase-browser";

export function useGreenTilesRealtime(onInsert: () => void) {
  useEffect(() => {
    const supabase = getSupabaseBrowser();
    if (!supabase) return;

    const channel = supabase
      .channel("green_tiles_changes")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "green_tiles" },
        () => {
          onInsert();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [onInsert]);
}
