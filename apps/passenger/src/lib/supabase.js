import { createClient } from '@supabase/supabase-js';

// Same project as the live PWA (urugendo-bolt)
export const SUPABASE_URL = 'https://zrvcqlyowqfrqdidozrk.supabase.co';
export const SUPABASE_ANON_KEY =
  'sb_publishable_0_K8ivC1kuXNMg2k74Jt9g_KhvZ-71Y';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});
