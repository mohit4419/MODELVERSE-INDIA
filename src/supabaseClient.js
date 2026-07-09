import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL ||
  process.env.SUPABASE_URL ||
  "";

const SUPABASE_PUBLIC_KEY =
  import.meta.env.VITE_SUPABASE_API_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_API_KEY ||
  process.env.SUPABASE_PUBLISHABLE_KEY ||
  process.env.VITE_SUPABASE_API_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY ||
  "";

if (!SUPABASE_URL) {
  console.error("❌ SUPABASE_URL is missing.");
}

if (!SUPABASE_PUBLIC_KEY) {
  console.error("❌ SUPABASE_PUBLIC_KEY / PUBLISHABLE_KEY is missing.");
}

export const supabase = createClient(
  SUPABASE_URL.replace(/\/$/, ""),
  SUPABASE_PUBLIC_KEY
);