// app/(auth)/pending-approval/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { 
  Clock, CheckCircle, Mail, Phone, Globe, 
  Building2, AlertCircle, ArrowRight, RefreshCw 
} from 'lucide-react';

export default function PendingApprovalPage() {
  const router = useRouter();
  const supabase = createClient();
  const [advertiserInfo, setAdvertiserInfo] = useState<any>(null);
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    loadAdvertiserInfo();
    // 5분마다 자동으로 승인 상태 체크
    const interval = setInterval(checkApprovalStatus, 300000);
    return () => clearInterval(interval);
  }, []);

  const loadAdvertiserInfo = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      const { data } = await supabase
        .from('advertisers')
        .select('*')
        .eq('id', user.id)
        .single();

      if (data) {
        setAdvertiserInfo(data);
        // 이미 승인된 경우 대시보드로 이동
        if (data.is_verified) {
          router.push('/dashboard');
        }
      }
    } catch (error) {
      console.error('Error loading advertiser info:', error);
    }
  };

  const checkApprovalStatus = async () => {
    setIsChecking(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('advertisers')
        .select('is_verified, rejection_reason')
        .eq('id', user.id)
        .single();

      if (data?.is_verified) {
        // 승인됨!
        const celebration = (await import('canvas-confetti')).default;
        celebration({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
        
        setTimeout(() => {
          router.push('/dashboard');
        }, 2000);
      } else if (data?.rejection_reason) {
        // 거절됨
        alert(`승인이 거절되었습니다.\n사유: ${data.rejection_reason}`);
      }
    } catch (error) {
      console.error('Error checking approval:', error);
    } finally {
      setIsChecking(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl"
      >
        {/* 메인 카드 */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
          {/* 헤더 */}
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-8 text-white">
            <div className="flex items-center justify-center mb-4">
              <div className="p-4 bg-white/20 rounded-full backdrop-blur-sm">
                <Clock className="w-12 h-12" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-center mb-2">
              승인 대기 중입니다
            </h1>
            <p className="text-center text-white/90">
              관리자가 회원님의 정보를 검토하고 있습니다
            </p>
          </div>

          {/* 컨텐츠 */}
          <div className="p-8">
            {/* 진행 상태 */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold">회원가입 완료</p>
                    <p className="text-sm text-gray-500">정보 제출 완료</p>
                  </div>
                </div>
                
                <div className="flex-1 mx-4">
                  <div className="h-1 bg-gray-200 rounded-full">
                    <motion.div 
                      className="h-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full"
                      initial={{ width: "0%" }}
                      animate={{ width: "50%" }}
                      transition={{ duration: 1, delay: 0.5 }}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center animate-pulse">
                    <Clock className="w-6 h-6 text-gray-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-400">검토 중</p>
                    <p className="text-sm text-gray-400">24시간 이내</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 제출된 정보 */}
            {advertiserInfo && (
              <div className="bg-gray-50 rounded-xl p-6 mb-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-purple-600" />
                  제출된 정보
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">회사명</span>
                    <span className="font-medium">{advertiserInfo.company_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">사업자등록번호</span>
                    <span className="font-medium">{advertiserInfo.business_registration}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">담당자</span>
                    <span className="font-medium">{advertiserInfo.contact_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">제출일시</span>
                    <span className="font-medium">
                      {new Date(advertiserInfo.created_at).toLocaleDateString('ko-KR')}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* 안내 메시지 */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
              <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-semibold text-blue-900 mb-1">승인 절차 안내</p>
                  <ul className="text-blue-700 space-y-1">
                    <li>• 보통 24시간 이내에 승인이 완료됩니다</li>
                    <li>• 승인 완료 시 이메일로 안내드립니다</li>
                    <li>• 추가 서류가 필요한 경우 연락드릴 예정입니다</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* 액션 버튼 */}
            <div className="flex gap-3">
              <button
                onClick={checkApprovalStatus}
                disabled={isChecking}
                className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isChecking ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    확인 중...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-5 h-5" />
                    승인 상태 확인
                  </>
                )}
              </button>
              
              <button
                onClick={handleLogout}
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
              >
                로그아웃
              </button>
            </div>

            {/* 문의 정보 */}
            <div className="mt-8 pt-6 border-t text-center">
              <p className="text-sm text-gray-600 mb-3">승인 관련 문의사항이 있으신가요?</p>
              <div className="flex justify-center gap-4">
                <a href="mailto:support@itda.com" className="flex items-center gap-2 text-purple-600 hover:text-purple-700">
                  <Mail className="w-4 h-4" />
                  <span className="text-sm">support@itda.com</span>
                </a>
                <a href="tel:02-1234-5678" className="flex items-center gap-2 text-purple-600 hover:text-purple-700">
                  <Phone className="w-4 h-4" />
                  <span className="text-sm">02-1234-5678</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}