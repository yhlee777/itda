// components/chat/ContractProposalModal.tsx
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, FileText, DollarSign, Calendar, CheckCircle,
  AlertCircle, Plus, Minus, Info, Loader2, Shield,Send
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'react-hot-toast';
import { format, addDays } from 'date-fns';
import { ko } from 'date-fns/locale';

interface ContractProposalModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomId: string;
  userType: 'influencer' | 'advertiser';
  currentUserId: string;
  existingProposal?: any;
}

export default function ContractProposalModal({
  isOpen,
  onClose,
  roomId,
  userType,
  currentUserId,
  existingProposal
}: ContractProposalModalProps) {
  const supabase = createClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // 계약 조건 상태
  const [proposedPrice, setProposedPrice] = useState(existingProposal?.proposed_price || '');
  const [deadline, setDeadline] = useState(
    existingProposal?.deadline || format(addDays(new Date(), 14), 'yyyy-MM-dd')
  );
  const [deliverables, setDeliverables] = useState(existingProposal?.deliverables || [
    { type: 'feed', count: 3, description: '피드 포스트' },
    { type: 'reels', count: 2, description: '릴스 영상' },
    { type: 'story', count: 5, description: '스토리' }
  ]);
  const [paymentTerms, setPaymentTerms] = useState(existingProposal?.payment_terms || 'completion');
  const [notes, setNotes] = useState(existingProposal?.notes || '');
  const [requirements, setRequirements] = useState(existingProposal?.requirements || []);
  const [newRequirement, setNewRequirement] = useState('');

  // 딜리버러블 추가/삭제
  const addDeliverable = () => {
    setDeliverables([...deliverables, { type: '', count: 1, description: '' }]);
  };

  const removeDeliverable = (index: number) => {
    setDeliverables(deliverables.filter((_, i) => i !== index));
  };

  const updateDeliverable = (index: number, field: string, value: any) => {
    const updated = [...deliverables];
    updated[index] = { ...updated[index], [field]: value };
    setDeliverables(updated);
  };

  // 요구사항 추가
  const addRequirement = () => {
    if (newRequirement.trim()) {
      setRequirements([...requirements, newRequirement.trim()]);
      setNewRequirement('');
    }
  };

  // 계약 제안 전송
  const submitProposal = async () => {
    if (!proposedPrice || !deadline || deliverables.length === 0) {
      toast.error('필수 정보를 모두 입력해주세요');
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. 채팅방에서 상대방 ID 가져오기
      const { data: chatRoom } = await supabase
        .from('chat_rooms')
        .select('advertiser_id, influencer_id, campaign_id')
        .eq('id', roomId)
        .single();

      if (!chatRoom) throw new Error('채팅방을 찾을 수 없습니다');

      const proposedTo = userType === 'advertiser' 
        ? chatRoom.influencer_id 
        : chatRoom.advertiser_id;

      // 2. 계약 제안 생성
      const { data: proposal, error: proposalError } = await supabase
        .from('contract_proposals')
        .insert({
          chat_room_id: roomId,
          campaign_id: chatRoom.campaign_id,
          proposed_by: currentUserId,
          proposed_to: proposedTo,
          proposed_price: parseFloat(proposedPrice),
          deliverables,
          deadline,
          payment_terms: paymentTerms,
          requirements,
          notes,
          status: 'pending',
          expires_at: addDays(new Date(), 7).toISOString()
        })
        .select()
        .single();

      if (proposalError) throw proposalError;

      // 3. 시스템 메시지로 계약 제안 전송
      const { error: messageError } = await supabase
        .from('messages')
        .insert({
          chat_room_id: roomId,
          sender_id: currentUserId,
          sender_type: userType,
          content: `계약 제안을 보냈습니다: ${formatCurrency(proposedPrice)}`,
          message_type: 'contract',
          contract_id: proposal.id
        });

      if (messageError) throw messageError;

      // 4. 상대방에게 알림 전송
      await supabase
        .from('notifications')
        .insert({
          user_id: proposedTo,
          type: 'contract_proposal',
          title: '새로운 계약 제안',
          message: `${userType === 'advertiser' ? '광고주' : '인플루언서'}님이 계약을 제안했습니다`,
          metadata: {
            proposal_id: proposal.id,
            room_id: roomId,
            amount: proposedPrice
          }
        });

      toast.success('계약 제안을 전송했습니다!');
      onClose();
    } catch (error) {
      console.error('Contract proposal error:', error);
      toast.error('계약 제안 전송 실패');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 금액 포맷팅
  const formatCurrency = (amount: string) => {
    const num = parseFloat(amount);
    if (num >= 10000) {
      return `${(num / 10000).toFixed(0)}만원`;
    }
    return `${num.toLocaleString()}원`;
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* 헤더 */}
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <Shield className="w-8 h-8" />
                <h2 className="text-2xl font-bold">계약 제안서</h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-purple-100">
              {existingProposal ? '계약 수정' : '새로운 계약 조건을 제안하세요'}
            </p>
          </div>

          {/* 본문 */}
          <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
            {/* 금액 설정 */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <DollarSign className="w-4 h-4 text-green-600" />
                제안 금액
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={proposedPrice}
                  onChange={(e) => setProposedPrice(e.target.value)}
                  placeholder="5000000"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
                  원
                </span>
              </div>
              {proposedPrice && (
                <p className="mt-1 text-sm text-purple-600">
                  ≈ {formatCurrency(proposedPrice)}
                </p>
              )}
            </div>

            {/* 마감일 설정 */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 text-blue-600" />
                콘텐츠 제출 기한
              </label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                min={format(new Date(), 'yyyy-MM-dd')}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-600"
              />
            </div>

            {/* 딜리버러블 설정 */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
                <FileText className="w-4 h-4 text-purple-600" />
                콘텐츠 요구사항
              </label>
              <div className="space-y-3">
                {deliverables.map((item, index) => (
                  <div key={index} className="flex gap-2">
                    <select
                      value={item.type}
                      onChange={(e) => updateDeliverable(index, 'type', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600"
                    >
                      <option value="">선택</option>
                      <option value="feed">피드 포스트</option>
                      <option value="reels">릴스</option>
                      <option value="story">스토리</option>
                      <option value="youtube">유튜브</option>
                      <option value="blog">블로그</option>
                    </select>
                    <input
                      type="number"
                      value={item.count}
                      onChange={(e) => updateDeliverable(index, 'count', parseInt(e.target.value))}
                      min="1"
                      className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600"
                    />
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) => updateDeliverable(index, 'description', e.target.value)}
                      placeholder="설명"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600"
                    />
                    <button
                      onClick={() => removeDeliverable(index)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <button
                  onClick={addDeliverable}
                  className="flex items-center gap-2 px-4 py-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  항목 추가
                </button>
              </div>
            </div>

            {/* 결제 조건 */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                결제 조건
              </label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => setPaymentTerms('advance')}
                  className={`p-3 rounded-lg border-2 transition-colors ${
                    paymentTerms === 'advance'
                      ? 'border-purple-600 bg-purple-50 text-purple-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <p className="font-medium text-sm">선불</p>
                  <p className="text-xs text-gray-600 mt-1">100%</p>
                </button>
                <button
                  onClick={() => setPaymentTerms('split')}
                  className={`p-3 rounded-lg border-2 transition-colors ${
                    paymentTerms === 'split'
                      ? 'border-purple-600 bg-purple-50 text-purple-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <p className="font-medium text-sm">분할</p>
                  <p className="text-xs text-gray-600 mt-1">50/50</p>
                </button>
                <button
                  onClick={() => setPaymentTerms('completion')}
                  className={`p-3 rounded-lg border-2 transition-colors ${
                    paymentTerms === 'completion'
                      ? 'border-purple-600 bg-purple-50 text-purple-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <p className="font-medium text-sm">후불</p>
                  <p className="text-xs text-gray-600 mt-1">완료 후</p>
                </button>
              </div>
            </div>

            {/* 추가 요구사항 */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                추가 요구사항
              </label>
              <div className="space-y-2">
                {requirements.map((req, index) => (
                  <div key={index} className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="flex-1 text-sm">{req}</span>
                    <button
                      onClick={() => setRequirements(requirements.filter((_, i) => i !== index))}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newRequirement}
                    onChange={(e) => setNewRequirement(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addRequirement())}
                    placeholder="예: 브랜드 태그 필수"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600"
                  />
                  <button
                    onClick={addRequirement}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                  >
                    추가
                  </button>
                </div>
              </div>
            </div>

            {/* 메모 */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                메모 (선택)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="추가로 전달하고 싶은 내용을 작성하세요"
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-600"
              />
            </div>

            {/* 안내 문구 */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex gap-3">
                <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">계약 제안 안내</p>
                  <ul className="space-y-1 text-xs">
                    <li>• 상대방은 7일 이내에 응답해야 합니다</li>
                    <li>• 수정 제안을 받을 수 있습니다</li>
                    <li>• 최종 합의 후 전자 서명으로 계약이 체결됩니다</li>
                    <li>• ITDA가 안전한 거래를 보장합니다</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* 푸터 */}
          <div className="bg-gray-50 px-6 py-4 border-t flex justify-between items-center">
            <div className="text-sm text-gray-600">
              총 제안 금액: <span className="font-bold text-purple-600">{formatCurrency(proposedPrice || '0')}</span>
            </div>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-6 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
              >
                취소
              </button>
              <button
                onClick={submitProposal}
                disabled={isSubmitting || !proposedPrice || deliverables.length === 0}
                className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    전송 중...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    제안 전송
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}