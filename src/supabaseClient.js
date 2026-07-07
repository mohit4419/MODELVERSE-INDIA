import { createClient } from "@supabase/supabase-js";

// ==========================================
// SUPABASE CONFIGURATION
// Replace the values below with your actual
// Supabase Project URL and Anon/Public Key.
// ==========================================

const envUrl = 
  (import.meta.env?.VITE_SUPABASE_URL) || 
  (typeof process !== 'undefined' && process.env?.VITE_SUPABASE_URL) || 
  (typeof process !== 'undefined' && process.env?.SUPABASE_URL) || 
  "https://azffjicefmbamgfcgkbg.supabase.co";

const envKey = 
  (import.meta.env?.VITE_SUPABASE_API_KEY) || 
  (typeof process !== 'undefined' && process.env?.VITE_SUPABASE_API_KEY) || 
  (typeof process !== 'undefined' && process.env?.SUPABASE_API_KEY) || 
  (typeof process !== 'undefined' && process.env?.SUPABASE_PUBLISHABLE_KEY) || 
  "sb_publishable_X2GIhIwel60_QNixrGNYuw_wI7HCsOx";

const getCleanUrl = (url) => {
  if (!url) return '';
  return url.trim().replace(/\/rest\/v1\/?$/, '').replace(/\/$/, '');
};

const SUPABASE_URL = getCleanUrl(envUrl);
const SUPABASE_PUBLIC_KEY = envKey.trim();

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLIC_KEY);
