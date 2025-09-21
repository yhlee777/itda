import { useState, useCallback } from 'react';
import { callEdgeFunction } from '@/lib/supabase';

export function useAIMatching() {
  const [isLoading, setIsLoading] = useState(false);
  const [matches, setMatches] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const runMatching = useCallback(async (campaignId: string, filters?: any) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await callEdgeFunction('ai-matching', {
        campaignId,
        filters
      });
      
      setMatches(data.matches);
      return data;
    } catch (err: any) {
      setError(err.message);
      console.error('Matching error:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    matches,
    isLoading,
    error,
    runMatching
  };
}