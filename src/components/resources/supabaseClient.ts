import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let resourcesSupabaseClient: SupabaseClient | null = null;

export function getResourcesSupabaseClient() {
  if (resourcesSupabaseClient) {
    return resourcesSupabaseClient;
  }

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;

  resourcesSupabaseClient = createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });

  return resourcesSupabaseClient;
}
