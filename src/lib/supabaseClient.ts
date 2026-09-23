import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnionKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnionKey) {
  throw new Error(
    "Missing Supabase environment variables. Check your .env.local file.",
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnionKey);
