import { createBrowserClient } from '@supabase/ssr';

// 브라우저 클라이언트 (Client Components용)
export function createSupabaseBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}