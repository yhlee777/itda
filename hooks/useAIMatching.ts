// hooks/useAIMatching.ts
import { useState, useCallback } from 'react';
import { callEdgeFunction } from '@/lib/supabase/edge-functions';

// AI 매칭 응답 타입 정의
interface AIMatchingResponse {
  matches: Array<{
    id: string;
    influencer_id: string;
    score: number;
    name: string;
    username: string;
    avatar?: string;
    followers_count: number;
    engagement_rate: number;
    categories: string[];
    strengths: string[];
    estimated_reach: number;
    estimated_price: number;
  }>;
  total_count: number;
  filters_applied: any;
}

export function useAIMatching() {
  const [isLoading, setIsLoading] = useState(false);
  const [matches, setMatches] = useState<AIMatchingResponse['matches']>([]);
  const [error, setError] = useState<string | null>(null);

  const runMatching = useCallback(async (campaignId: string, filters?: any) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // callEdgeFunction은 { data, error } 객체를 반환합니다
      const { data, error: apiError } = await callEdgeFunction<AIMatchingResponse>('ai-matching', {
        campaignId,
        filters
      });
      
      // 에러 체크
      if (apiError) {
        throw apiError;
      }
      
      // data가 있고 matches가 있는지 확인
      if (data && data.matches) {
        setMatches(data.matches);
        return data;
      } else {
        // matches가 없으면 빈 배열
        setMatches([]);
        return { matches: [], total_count: 0, filters_applied: filters };
      }
    } catch (err: any) {
      setError(err.message || 'AI 매칭 중 오류가 발생했습니다.');
      console.error('Matching error:', err);
      setMatches([]);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 매칭 점수로 정렬
  const sortByScore = useCallback(() => {
    setMatches(prev => [...prev].sort((a, b) => b.score - a.score));
  }, []);

  // 팔로워 수로 정렬
  const sortByFollowers = useCallback(() => {
    setMatches(prev => [...prev].sort((a, b) => b.followers_count - a.followers_count));
  }, []);

  // 참여율로 정렬
  const sortByEngagement = useCallback(() => {
    setMatches(prev => [...prev].sort((a, b) => b.engagement_rate - a.engagement_rate));
  }, []);

  // 특정 매치 제거
  const removeMatch = useCallback((influencerId: string) => {
    setMatches(prev => prev.filter(match => match.influencer_id !== influencerId));
  }, []);

  // 매칭 결과 초기화
  const clearMatches = useCallback(() => {
    setMatches([]);
    setError(null);
  }, []);

  return {
    matches,
    isLoading,
    error,
    runMatching,
    sortByScore,
    sortByFollowers,
    sortByEngagement,
    removeMatch,
    clearMatches,
    matchCount: matches.length
  };
}

// ============================================
// Mock 버전 (Edge Function 없이 테스트용)
// ============================================
export function useAIMatchingMock() {
  const [isLoading, setIsLoading] = useState(false);
  const [matches, setMatches] = useState<AIMatchingResponse['matches']>([]);
  const [error, setError] = useState<string | null>(null);

  const runMatching = useCallback(async (campaignId: string, filters?: any) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // 1초 지연 시뮬레이션
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock 데이터 생성
      const mockMatches: AIMatchingResponse['matches'] = [
        {
          id: '1',
          influencer_id: 'inf-001',
          score: 95,
          name: '김뷰티',
          username: '@kimbeauty',
          avatar: 'https://i.pravatar.cc/150?img=1',
          followers_count: 150000,
          engagement_rate: 5.8,
          categories: ['뷰티', '패션'],
          strengths: ['높은 참여율', '타겟 연령 일치', '뷰티 전문성'],
          estimated_reach: 45000,
          estimated_price: 3000000
        },
        {
          id: '2',
          influencer_id: 'inf-002',
          score: 88,
          name: '이패션',
          username: '@leefashion',
          avatar: 'https://i.pravatar.cc/150?img=2',
          followers_count: 85000,
          engagement_rate: 4.2,
          categories: ['패션', '라이프'],
          strengths: ['일관된 콘텐츠', '브랜드 경험 다수'],
          estimated_reach: 25500,
          estimated_price: 2000000
        },
        {
          id: '3',
          influencer_id: 'inf-003',
          score: 82,
          name: '박일상',
          username: '@dailypark',
          avatar: 'https://i.pravatar.cc/150?img=3',
          followers_count: 50000,
          engagement_rate: 6.5,
          categories: ['라이프', '푸드'],
          strengths: ['매우 높은 참여율', '충성도 높은 팔로워'],
          estimated_reach: 20000,
          estimated_price: 1500000
        }
      ];
      
      // 필터 적용 시뮬레이션
      let filteredMatches = [...mockMatches];
      
      if (filters?.minFollowers) {
        filteredMatches = filteredMatches.filter(
          m => m.followers_count >= filters.minFollowers
        );
      }
      
      if (filters?.minEngagement) {
        filteredMatches = filteredMatches.filter(
          m => m.engagement_rate >= filters.minEngagement
        );
      }
      
      if (filters?.categories?.length > 0) {
        filteredMatches = filteredMatches.filter(
          m => m.categories.some(cat => filters.categories.includes(cat))
        );
      }
      
      setMatches(filteredMatches);
      
      return {
        matches: filteredMatches,
        total_count: filteredMatches.length,
        filters_applied: filters
      };
      
    } catch (err: any) {
      setError(err.message || 'Mock 매칭 중 오류가 발생했습니다.');
      console.error('Mock matching error:', err);
      setMatches([]);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    matches,
    isLoading,
    error,
    runMatching,
    matchCount: matches.length
  };
}

// ============================================
// 사용 예제 컴포넌트
// ============================================
/*
import { useAIMatching } from '@/hooks/useAIMatching';

export function AIMatchingComponent() {
  const { 
    matches, 
    isLoading, 
    error, 
    runMatching,
    sortByScore,
    matchCount 
  } = useAIMatching();
  
  // 또는 Mock 버전 사용 (테스트용)
  // const { ... } = useAIMatchingMock();

  const handleSearch = async () => {
    await runMatching('campaign-123', {
      minFollowers: 10000,
      minEngagement: 3,
      categories: ['뷰티', '패션'],
      budget: 2000000
    });
  };

  return (
    <div>
      <button 
        onClick={handleSearch}
        disabled={isLoading}
        className="px-4 py-2 bg-purple-600 text-white rounded"
      >
        {isLoading ? 'AI 매칭 중...' : 'AI 매칭 시작'}
      </button>
      
      {error && (
        <div className="text-red-500 mt-2">{error}</div>
      )}
      
      {matchCount > 0 && (
        <div className="mt-4">
          <h3>매칭 결과: {matchCount}명</h3>
          <button onClick={sortByScore}>점수순</button>
          
          <div className="space-y-4 mt-4">
            {matches.map(match => (
              <div key={match.id} className="border p-4 rounded">
                <div className="flex items-center gap-4">
                  <img 
                    src={match.avatar} 
                    alt={match.name}
                    className="w-12 h-12 rounded-full"
                  />
                  <div>
                    <h4 className="font-bold">{match.name}</h4>
                    <p className="text-sm text-gray-500">{match.username}</p>
                  </div>
                  <div className="ml-auto">
                    <div className="text-2xl font-bold text-purple-600">
                      {match.score}점
                    </div>
                  </div>
                </div>
                
                <div className="mt-2 flex gap-4 text-sm">
                  <span>팔로워 {match.followers_count.toLocaleString()}</span>
                  <span>참여율 {match.engagement_rate}%</span>
                  <span className="text-green-600">
                    예상 단가 {match.estimated_price.toLocaleString()}원
                  </span>
                </div>
                
                <div className="mt-2">
                  {match.strengths.map((strength, idx) => (
                    <span 
                      key={idx}
                      className="inline-block px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs mr-2"
                    >
                      {strength}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
*/