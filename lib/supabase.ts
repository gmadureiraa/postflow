import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

if (!url || !key) {
  if (typeof window !== "undefined") {
    console.warn(
      "[supabase] Client is null — missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. " +
      "All Supabase operations will be skipped. Auth, saves, and profile updates will not work."
    );
  }
}

export const supabase = url && key ? createClient(url, key) : null;
