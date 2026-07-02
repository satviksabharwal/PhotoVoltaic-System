import { createClient } from '@supabase/supabase-js';

// ----------------------------------------------------------------------
// Supabase client — handles authentication (signup, login, password reset).
// Sessions are persisted in localStorage and refreshed automatically, so the
// rest of the app never touches tokens directly: `utils/api.ts` attaches the
// current access token to every backend request via an axios interceptor.
//
// The URL and anon key are public values (RLS guards the data); they are
// inlined at build time by Vite from VITE_* variables.
// ----------------------------------------------------------------------

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabasePublishableKey) {
  throw new Error(
    'Missing VITE_SUPABASE_URL / VITE_SUPABASE_PUBLISHABLE_KEY. ' +
      'Copy them from your Supabase dashboard (Settings → API Keys) into .env.development — see .env.example.'
  );
}

export const supabase = createClient(supabaseUrl, supabasePublishableKey);
