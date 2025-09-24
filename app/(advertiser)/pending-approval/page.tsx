"use client";
'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Clock, CheckCircle, AlertCircle, Mail, Phone, 
  Building2, User, Calendar, Shield, Info,
  ArrowRight, FileText, Sparkles, Coffee, RefreshCw
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'react-hot-toast';

export default function PendingApprovalPage() {
  const router = useRouter();
  const supabase = createClient();
  const [advertiserInfo, setAdvertiserInfo] = useState<any>(null);
  const [submittedAt, setSubmittedAt] = useState<Date | null>(null);
  const [estimatedTime, setEstimatedTime] = useState('24-48시간');

  useEffect(() => {
    checkApprovalStatus();
    const interval = setInterval(checkApprovalStatus, 30000); // 30초마다 체크
    return () => clearInterval(interval);
  }, []);

  const checkApprovalStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      // 광고주 정보 조회
      const { data: advertiser } = await supabase
        .from('advertisers')
        .select('*')
        .eq('id', user.id)
        .single();

      if (advertiser) {
        setAdvertiserInfo(advertiser);
        setSubmittedAt(new Date(advertiser.created_at));

        // 승인되었으면 대시보드로 이동
        if (advertiser.is_verified) {
          toast.success('승인이 완료되었습니다! 대시보드로 이동합니다.');
          router.push('/dashboard');
        }
      }
    } catch (error) {
      console.error('승인 상태 확인 오류:', error);
    }
  };

  const getTimeSinceSubmission = () => {
    if (!submittedAt) return '계산 중...';
    
    const now = new Date();
    const diff = now.getTime() - submittedAt.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}시간 ${minutes}분 전`;
    }
    return `${minutes}분 전`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl p-8"
        >
          {/* 상태 헤더 */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-yellow-100 rounded-full mb-4">
              <Clock className="w-10 h-10 text-yellow-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              승인 대기 중
            </h1>
            <p className="text-gray-600">
              광고주 계정이 검토 중입니다. 곧 완료될 예정이에요!
            </p>
          </div>

          {/* 진행 상태 */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="font-semibold">신청 완료</p>
                  <p className="text-sm text-gray-500">{getTimeSinceSubmission()}</p>
                </div>
              </div>

              <div className="flex-1 mx-4">
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-gradient-to-r from-purple-500 to-purple-600"
                    initial={{ width: '0%' }}
                    animate={{ width: '50%' }}
                    transition={{ duration: 1 }}
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-gray-400">승인 완료</p>
                  <p className="text-sm text-gray-400">예정</p>
                </div>
              </div>
            </div>
          </div>

          {/* 제출된 정보 */}
          {advertiserInfo && (
            <div className="bg-gray-50 rounded-lg p-6 mb-8">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-purple-600" />
                제출된 정보
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">회사명</p>
                  <p className="font-semibold">{advertiserInfo.company_name}</p>
                </div>
                <div>
                  <p className="text-gray-500">사업자등록번호</p>
                  <p className="font-semibold">{advertiserInfo.business_registration}</p>
                </div>
                <div>
                  <p className="text-gray-500">담당자</p>
                  <p className="font-semibold">{advertiserInfo.contact_name}</p>
                </div>
                <div>
                  <p className="text-gray-500">직책</p>
                  <p className="font-semibold">{advertiserInfo.contact_position}</p>
                </div>
                {advertiserInfo.contact_phone && (
                  <div>
                    <p className="text-gray-500">연락처</p>
                    <p className="font-semibold">{advertiserInfo.contact_phone}</p>
                  </div>
                )}
                {advertiserInfo.website && (
                  <div>
                    <p className="text-gray-500">웹사이트</p>
                    <p className="font-semibold">{advertiserInfo.website}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 예상 시간 안내 */}
          <div className="bg-purple-50 rounded-lg p-6 mb-8">
            <div className="flex items-start gap-4">
              <Info className="w-6 h-6 text-purple-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-purple-900 mb-2">
                  승인 프로세스 안내
                </h3>
                <ul className="space-y-2 text-sm text-purple-800">
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600">•</span>
                    <span>일반적으로 영업일 기준 1-2일 내 처리됩니다</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600">•</span>
                    <span>제출하신 사업자 정보를 검증 중입니다</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600">•</span>
                    <span>승인 완료 시 이메일로 즉시 안내드립니다</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600">•</span>
                    <span>급한 경우 고객센터로 문의해주세요</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* FAQ */}
          <div className="mb-8">
            <h3 className="font-semibold mb-4">자주 묻는 질문</h3>
            <div className="space-y-3">
              <details className="border rounded-lg p-4 cursor-pointer hover:bg-gray-50">
                <summary className="font-medium">승인이 거절되는 경우는 언제인가요?</summary>
                <p className="mt-3 text-sm text-gray-600">
                  사업자등록번호가 유효하지 않거나, 제출된 정보가 불충분한 경우에만 거절됩니다.
                  대부분의 정상적인 기업은 승인됩니다.
                </p>
              </details>
              <details className="border rounded-lg p-4 cursor-pointer hover:bg-gray-50">
                <summary className="font-medium">승인 후 바로 캠페인을 시작할 수 있나요?</summary>
                <p className="mt-3 text-sm text-gray-600">
                  네! 승인 즉시 모든 기능을 이용하실 수 있으며, AI 매칭 시스템이 
                  최적의 인플루언서를 추천해드립니다.
                </p>
              </details>
              <details className="border rounded-lg p-4 cursor-pointer hover:bg-gray-50">
                <summary className="font-medium">추가 서류가 필요한가요?</summary>
                <p className="mt-3 text-sm text-gray-600">
                  일반적으로 추가 서류는 필요하지 않습니다. 특별한 경우에만 
                  이메일로 요청드릴 수 있습니다.
                </p>
              </details>
            </div>
          </div>

          {/* 연락처 */}
          <div className="border-t pt-6 flex flex-col md:flex-row items-center justify-between">
            <div className="mb-4 md:mb-0">
              <p className="text-sm text-gray-500 mb-2">문의사항이 있으신가요?</p>
              <div className="flex items-center gap-4">
                <a 
                  href="mailto:support@itda.app"
                  className="flex items-center gap-2 text-purple-600 hover:text-purple-700"
                >
                  <Mail className="w-4 h-4" />
                  support@itda.app
                </a>
                <a 
                  href="tel:02-1234-5678"
                  className="flex items-center gap-2 text-purple-600 hover:text-purple-700"
                >
                  <Phone className="w-4 h-4" />
                  02-1234-5678
                </a>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push('/')}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                홈으로
              </button>
              <button
                onClick={checkApprovalStatus}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                상태 새로고침
              </button>
            </div>
          </div>
        </motion.div>

        {/* 추가 정보 카드 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-6 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-6 text-white"
        >
          <div className="flex items-center gap-4">
            <Sparkles className="w-8 h-8" />
            <div>
              <h3 className="font-bold text-lg mb-1">승인 대기 중에도 준비하세요!</h3>
              <p className="text-sm text-white/90">
                캠페인 아이디어를 구상하고, 타겟 인플루언서를 미리 탐색해보세요.
                승인 즉시 빠르게 시작할 수 있습니다.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}