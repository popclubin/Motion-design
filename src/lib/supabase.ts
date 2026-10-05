import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
export const isSupabaseConfigured = Boolean(url && anonKey);

if (import.meta.env.DEV && !isSupabaseConfigured) {
  console.warn(
    '[supabase] VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY are not set — auth and data calls will fail. Copy .env.example to .env.local and fill them in.',
  );
}

// Fall back to a syntactically valid placeholder so the client can construct
// without a real project configured; calls against it simply fail at runtime.
export const supabase = createClient<Database>(
  url || 'https://placeholder.supabase.co',
  anonKey || 'placeholder-anon-key',
);
