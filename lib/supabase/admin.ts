import { createClient, SupabaseClient } from '@supabase/supabase-js';

export function createAdminClient(): SupabaseClient<any> { // eslint-disable-line @typescript-eslint/no-explicit-any
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set');
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceRoleKey,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
