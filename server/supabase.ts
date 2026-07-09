import dotenv from 'dotenv';
dotenv.config();

import { createClient } from '@supabase/supabase-js';
import { Request, Response, NextFunction } from 'express';

const supabaseUrl =
  process.env.SUPABASE_URL?.trim() ||
  process.env.VITE_SUPABASE_URL?.trim() ||
  "";
// On the server, we prefer the Secret/Service Key for admin/secure tasks, but can fallback to the Publishable/Anon key
const supabaseKey =
  process.env.SUPABASE_SECRET_KEY?.trim() ||
  process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ||
  process.env.SUPABASE_ANON_KEY?.trim() ||
  process.env.SUPABASE_PUBLISHABLE_KEY?.trim() ||
  process.env.VITE_SUPABASE_API_KEY?.trim() ||
  "";
console.log("===== SUPABASE ENV CHECK =====");
console.log("SUPABASE_URL:", process.env.SUPABASE_URL);
console.log("VITE_SUPABASE_URL:", process.env.VITE_SUPABASE_URL);

console.log(
  "SUPABASE_SECRET_KEY:",
  process.env.SUPABASE_SECRET_KEY ? "FOUND" : "MISSING"
);

console.log(
  "SUPABASE_SERVICE_ROLE_KEY:",
  process.env.SUPABASE_SERVICE_ROLE_KEY ? "FOUND" : "MISSING"
);

console.log(
  "SUPABASE_PUBLISHABLE_KEY:",
  process.env.SUPABASE_PUBLISHABLE_KEY ? "FOUND" : "MISSING"
);

console.log(
  "SUPABASE_ANON_KEY:",
  process.env.SUPABASE_ANON_KEY ? "FOUND" : "MISSING"
);

console.log(
  "VITE_SUPABASE_API_KEY:",
  process.env.VITE_SUPABASE_API_KEY ? "FOUND" : "MISSING"
);

console.log("==============================");

export let supabaseAdmin: any = null;
export let isSupabaseConfigured = false;

if (supabaseUrl && supabaseKey) {
  try {
    supabaseAdmin = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    });
    isSupabaseConfigured = true;
    console.log('[Supabase Server] Successfully initialized Supabase admin client.');
  } catch (err) {
    console.error('[Supabase Server] Failed to initialize Supabase admin client:', err);
  }
} else {
  console.warn('[Supabase Server] Missing SUPABASE_URL or SUPABASE_SECRET_KEY/PUBLISHABLE_KEY. Server-side Supabase is disabled or in fallback mode.');
}

// Extend Express Request interface to hold user data
export interface AuthenticatedRequest extends Request {
  user?: any;
  supabaseToken?: string;
}

/**
 * Express middleware to verify Supabase Auth token from Authorization header.
 */
export async function requireSupabaseAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing or invalid Authorization header' });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized: Token not provided' });
  }

  if (!isSupabaseConfigured || !supabaseAdmin) {
    // Fallback if Supabase is not configured
    return res.status(503).json({ error: 'Service Unavailable: Supabase server is not configured' });
  }

  try {
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !user) {
      return res.status(401).json({ error: 'Unauthorized: Invalid Supabase token', details: error?.message });
    }

    req.user = user;
    req.supabaseToken = token;
    next();
  } catch (err: any) {
    console.error('[Supabase Server] Auth verification error:', err);
    return res.status(500).json({ error: 'Internal Server Error during auth verification', details: err.message });
  }
}

/**
 * Optional middleware that parses the user but doesn't block unauthorized requests.
 */
export async function optionalSupabaseAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    if (token && isSupabaseConfigured && supabaseAdmin) {
      try {
        const { data: { user } } = await supabaseAdmin.auth.getUser(token);
        if (user) {
          req.user = user;
          req.supabaseToken = token;
        }
      } catch (err) {
        console.warn('[Supabase Server] Optional auth verification failed:', err);
      }
    }
  }
  next();
}
