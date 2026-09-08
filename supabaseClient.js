// ============================================================
// Supabase connection setup
// ============================================================
// 1. Go to your Supabase project → Project Settings → Data API
//    Copy the "Project URL" and paste it below.
// 2. Go to Project Settings → API Keys
//    Copy the "publishable" key (or "anon" "public" key on older projects)
//    and paste it below.
//
// This key is safe to expose in frontend code — it's the public key,
// not the secret/service_role key.
// ============================================================

const SUPABASE_URL = "https://sgknpybkaombhaqywsqf.supabase.co";       // e.g. "https://abcdefgh.supabase.co"
const SUPABASE_KEY = "sb_publishable__Ksp3RjgUiVds6dno4Et-Q_-NrH1VUu";         // e.g. "sb_publishable_xxxxxxxx" or the anon key

// This creates one shared connection object that every page will use.
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
