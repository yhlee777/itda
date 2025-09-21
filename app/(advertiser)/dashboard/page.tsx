'use client';

import { useState, useEffect } from 'react';
import { useAIMatching } from '@/hooks/useAIMatching';
import { supabase } from '@/lib/supabase';

export default function DashboardPage() {
  const [campaigns, setCampaigns] = useState([]);
  const { runMatching, matches, isLoading } = useAIMatching();

  useEffect(() => {
    loadCampaigns();
  }, []);

  const loadCampaigns = async () => {
    const { data, error } = await supabase
      .from('campaigns')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error) {
      setCampaigns(data || []);
    }
  };

  const handleRunMatching = async (campaignId: string) => {
    const result = await runMatching(campaignId, {
      minFollowers: 10000,
      minEngagement: 3.0
    });

    if (result) {
      alert(`매칭 완료! ${result.matches.length}명의 인플루언서를 찾았습니다.`);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">광고주 대시보드</h1>
      
      {/* 캠페인 목록 */}
      <div className="grid gap-4">
        {campaigns.map((campaign: any) => (
          <div key={campaign.id} className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-semibold">{campaign.name}</h3>
            <p className="text-gray-600 text-sm mb-3">{campaign.description}</p>
            <button
              onClick={() => handleRunMatching(campaign.id)}
              disabled={isLoading}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:bg-gray-400"
            >
              {isLoading ? 'AI 매칭 중...' : 'AI 매칭 시작'}
            </button>
          </div>
        ))}
      </div>

      {/* 매칭 결과 */}
      {matches.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">매칭 결과</h2>
          <div className="grid gap-3">
            {matches.map((match: any) => (
              <div key={match.id} className="bg-gray-50 p-3 rounded-lg">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-medium">{match.name}</h4>
                    <p className="text-sm text-gray-600">
                      팔로워: {match.followers_count.toLocaleString()} | 
                      참여율: {match.engagement_rate}%
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-purple-600">
                      {match.matchScore}점
                    </div>
                    <button className="text-sm text-blue-600 hover:underline">
                      프로필 보기
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}