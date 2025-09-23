// lib/supabase/client.ts
// 기존 createClient 함수 유지하면서 타입 수정

import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/types/database.types'; // ✅ 수정된 import 경로

// 기존 함수 유지 (하위 호환성)
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// 기본 export도 추가 (기존 코드 호환용)
export default createClient;