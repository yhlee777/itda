import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

export function useUserType() {
  const [userType, setUserType] = useState<'influencer' | 'advertiser' | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    checkUserType();
  }, []);

  const checkUserType = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setUserType(null);
        return;
      }

      const { data } = await supabase
        .from('users')
        .select('user_type')
        .eq('id', user.id)
        .single();

      setUserType(data?.user_type as 'influencer' | 'advertiser');
    } finally {
      setLoading(false);
    }
  };

  return { userType, loading };
}