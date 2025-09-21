// utils/supabase/component.ts
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// Server Component용 클라이언트 (읽기 전용)
export async function createSupabaseServerComponentClient() {
  const cookieStore = cookies();
  
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set() {
          // Server Components는 쿠키 설정 불가
        },
        remove() {
          // Server Components는 쿠키 제거 불가
        }
      }
    }
  );
}