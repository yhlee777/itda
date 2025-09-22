// lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/types/database';

let client: ReturnType<typeof createBrowserClient<Database>> | undefined;

export function createClient() {
  // 이미 client가 있으면 재사용
  if (client) return client;
  
  // 브라우저 환경 체크
  if (typeof window === 'undefined') {
    throw new Error('createClient must be called in browser environment');
  }
  
  client = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  return client;
}