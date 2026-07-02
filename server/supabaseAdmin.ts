import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

// Server-side Supabase client using the secret (service-role) key: verifies
// user access tokens and performs admin operations (e.g. deleting auth
// users). The secret key bypasses Row Level Security — never expose it to
// the client bundle.

const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error(
    'Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY environment variables — see server/.env.example'
  );
}

export const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});
