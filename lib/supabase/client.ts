import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/lib/database.types";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Use this in client components ("use client"). Deliberately kept in its own
// file, separate from the server client in ./server.ts — that file imports
// next/headers, which is server-only. If both clients lived in one module,
// any client component importing the browser client would pull next/headers
// into the browser bundle and fail to build.
export function createClient() {
  return createBrowserClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY);
}
