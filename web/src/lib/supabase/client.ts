import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { env } from "../env";
import type { Database } from "./types";

export const supabase = createClient<Database>(env.supabaseUrl, env.supabaseAnonKey);

export const supabaseAdmin = env.supabaseServiceKey
  ? createClient<Database>(env.supabaseUrl, env.supabaseServiceKey)
  : null;

export function getSupabaseAdminClient(): SupabaseClient<Database> {
  if (!supabaseAdmin) {
    throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY");
  }
  return supabaseAdmin;
}
