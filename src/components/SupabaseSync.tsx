"use client";

import { useEffect } from "react";
import { useLibrary } from "@/lib/store";
import { isSupabaseConfigured } from "@/lib/supabase/client";

/**
 * Mounted once in the root layout. When Supabase is configured, it pulls the
 * latest data from the cloud and replaces the in-memory store. Until then the
 * LocalStorage cache provides an instant render (no spinner flash).
 */
export function SupabaseSync() {
  const sync = useLibrary((s) => s.syncFromRemote);

  useEffect(() => {
    if (isSupabaseConfigured) {
      sync();
    }
  }, [sync]);

  return null;
}
