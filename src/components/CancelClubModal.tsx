import React, { useState } from 'react';
import { X, AlertTriangle, ShieldCheck, Mail, RefreshCw } from 'lucide-react';
import { BookClub, RSVPRecord } from '../types';

interface CancelClubModalProps {
  isOpen: boolean;
  onClose: () => void;
  club: BookClub | null;
  applicants: RSVPRecord[];
  onConfirmCancel: (clubId: string, reason: string) => void;
}

export const CancelClubModal: React.FC<CancelClubModalProps> = ({
  isOpen,
  onClose,
  club,
  applicants,
  onConfirmCancel
}) => {
  if (!isOpen || !club) return null;

  const [cancelReason, setCancelReason] = useState('호스트 개인 일정 변경');
  const [customReason, setCustomReason] = useState('');

  const handleConfirm = () => {
    const finalReason = cancelReason === '직접 입력' ? customReason : cancelReason;
    onConfirmCancel(club.id, finalReason);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div 
        className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-stone-200 overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 bg-red-600 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="닫기"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-sm tracking-wide">모임 취소 확인</span>
          </div>

          <h3 className="text-xl font-bold">
            '{club.bookTitle}' 모임을 취소하시겠습니까?
          </h3>
          <p className="text-xs text-red-100 mt-1">
            취소 처리 시 해당 모임의 모집이 즉시 중단되며 복구할 수 없습니다.
          </p>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {/* Club Info Preview */}
          <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200 flex items-center gap-3">
            <img
              src={club.coverImage}
              alt={club.bookTitle}
              className="w-12 h-16 object-cover rounded-lg shadow-2xs shrink-0"
            />
            <div className="min-w-0 flex-1">
              <h4 className="font-bold text-xs text-[#19221C] truncate">
                {club.title}
              </h4>
              <p className="text-[11px] text-stone-500 mt-0.5 truncate">
                일시: {club.dateTime} · {club.venueName}
              </p>
              <div className="mt-1 flex items-center gap-2">
                <span className="text-[11px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full border border-red-200">
                  현재 신청자 {applicants.length}명
                </span>
              </div>
            </div>
          </div>

          {/* 100% Refund Policy Banner */}
          <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 space-y-1.5 text-xs text-amber-900">
            <div className="font-bold flex items-center gap-1.5 text-amber-800">
              <ShieldCheck className="w-4 h-4 text-amber-600" />
              <span>신청 회원 100% 전액 환불 및 안내 알림 보장</span>
            </div>
            <p className="text-[11px] text-amber-800 leading-relaxed">
              모임 취소 확정 즉시 신청하신 모든 회원({applicants.length}명)에게 취소 안내 알림(이메일/연락처)이 전송되며, 결제된 참가비(CAD ${club.feeCAD || 15})는 전액 환불 처리됩니다.
            </p>
          </div>

          {/* Cancellation Reason Selector */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1.5">
              취소 사유 선택
            </label>
            <select
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs bg-white focus:outline-none focus:border-red-500 cursor-pointer mb-2"
            >
              <option value="호스트 개인 일정 변경">호스트 개인 긴급 일정 변경</option>
              <option value="모임 진행 장소 대관 불가">모임 진행 장소(카페/도서관) 대관 불가 사정</option>
              <option value="최소 인원(4명) 미달">진행 최소 인원(4명) 미달로 인한 취소</option>
              <option value="기상 악화 (캘거리 폭설/한파)">캘거리 기상 악화(폭설, 혹한)로 인한 안전상 취소</option>
              <option value="직접 입력">기타 사유 직접 입력</option>
            </select>

            {cancelReason === '직접 입력' && (
              <textarea
                rows={2}
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                placeholder="신청자에게 전달할 취소 사유를 작성해주세요"
                className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs bg-white focus:outline-none focus:border-red-500"
              />
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-white hover:bg-stone-100 text-stone-700 border border-stone-300 text-xs font-semibold cursor-pointer transition-colors"
          >
            돌아가기 (취소 안 함)
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-sm cursor-pointer transition-colors"
          >
            모임 취소 확정하기
          </button>
        </div>
      </div>
    </div>
  );
};
