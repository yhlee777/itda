import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/types/database';

let client: ReturnType<typeof createBrowserClient<Database>> | undefined;

export function createClient() {
  if (client) return client;
  
  if (typeof window === 'undefined') {
    throw new Error('createClient must be called in browser environment');
  }
  
  client = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  return client;
}
export const supabase = typeof window !== 'undefined' ? createClient() : null!;
