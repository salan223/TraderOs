/**
 * Only the public URL and anon (or publishable) key are read here. Both are
 * designed to be visible in the browser; Row Level Security in Postgres is
 * what protects your data. Secret keys (service role, market data, AI) must
 * never be given a NEXT_PUBLIC_ prefix and are only read in server code.
 * Trader OS never uses the service-role key at all.
 */
export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "";

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);
