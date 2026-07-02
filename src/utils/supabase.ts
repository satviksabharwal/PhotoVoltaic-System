import { createClient } from '@supabase/supabase-js';

// ----------------------------------------------------------------------
// Supabase client — handles authentication (signup, login, password reset).
// Sessions are persisted in localStorage and refreshed automatically, so the
// rest of the app never touches tokens directly: `utils/api.ts` attaches the
// current access token to every backend request via an axios interceptor.
//
// The URL and anon key are public values (RLS guards the data); they are
// inlined at build time by Create React App from REACT_APP_* variables.
// ----------------------------------------------------------------------

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabasePublishableKey = process.env.REACT_APP_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabasePublishableKey) {
  throw new Error(
    'Missing REACT_APP_SUPABASE_URL / REACT_APP_SUPABASE_PUBLISHABLE_KEY. ' +
      'Copy them from your Supabase dashboard (Settings → API Keys) into .env.development — see .env.example.'
  );
}

export const supabase = createClient(supabaseUrl, supabasePublishableKey);
