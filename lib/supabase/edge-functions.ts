// lib/supabase/edge-functions.ts
import { createClient } from '@/lib/supabase/client';

export async function callEdgeFunction<T = any>(
  functionName: string,
  payload?: any
): Promise<{ data: T | null; error: Error | null }> {
  try {
    const supabase = createClient();
    
    const { data, error } = await supabase.functions.invoke(functionName, {
      body: payload
    });

    if (error) throw error;
    
    return { data, error: null };
  } catch (error) {
    console.error(`Edge Function ${functionName} error:`, error);
    return { 
      data: null, 
      error: error instanceof Error ? error : new Error('Unknown error') 
    };
  }
}