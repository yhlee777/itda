// utils/supabase.ts
import { createBrowserClient, createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// 브라우저 클라이언트 (Client Components용)
export function createSupabaseBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// 서버 클라이언트 (Server Components/API Routes용)
export function createSupabaseServerClient() {
  const cookieStore = cookies();
  
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: any) {
          cookieStore.set({ name, value: '', ...options });
        }
      }
    }
  );
}

// Admin 클라이언트 (Service Role Key 사용)
export function createSupabaseAdminClient() {
  const { createClient } = require('@supabase/supabase-js');
  
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );
}

// Server Component용 클라이언트 (캐싱 포함)
export async function createSupabaseServerComponentClient() {
  const { cookies: getCookies } = await import('next/headers');
  const cookieStore = getCookies();
  
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          // Server Components는 쿠키 설정 불가
          return;
        },
        remove(name: string, options: any) {
          // Server Components는 쿠키 제거 불가
          return;
        }
      }
    }
  );
}