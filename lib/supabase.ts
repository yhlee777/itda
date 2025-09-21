// lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// 타입 정의 없이 클라이언트 생성 (any 타입으로)
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Edge Function 호출 헬퍼
export async function callEdgeFunction(functionName: string, body: any) {
  const { data, error } = await supabase.functions.invoke(functionName, {
    body: JSON.stringify(body),
  })
  
  if (error) throw error
  return data
}

// 사용자 타입 확인 - ✅ any 타입 추가
export async function getUserType(userId: string) {
  const { data, error } = await supabase
    .from('users')
    .select('user_type')
    .eq('id', userId)
    .single() as any  // ← 여기에 as any 추가!
  
  return data?.user_type
}