import React from 'react';
import { LogOut, AlertCircle, X } from 'lucide-react';

interface LogoutConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  userName?: string;
}

export const LogoutConfirmModal: React.FC<LogoutConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  userName
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-[#19221C]/60 backdrop-blur-xs transition-opacity animate-fade-in"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div 
        className="relative bg-white rounded-3xl max-w-sm w-full p-6 sm:p-7 shadow-2xl border border-stone-200 z-10 text-center transform transition-all animate-scale-in"
        role="dialog"
        aria-modal="true"
      >
        {/* Close icon */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
          aria-label="닫기"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Warning Icon Graphic */}
        <div className="w-14 h-14 rounded-2xl bg-[#FDEEE3] text-[#DF612D] flex items-center justify-center mx-auto mb-4.5 shadow-xs">
          <LogOut className="w-7 h-7" />
        </div>

        {/* Title */}
        <h3 className="text-xl font-extrabold text-[#19221C] mb-2 tracking-tight">
          로그아웃하시겠습니까?
        </h3>

        {/* Body Description */}
        <p className="text-sm text-[#526055] leading-relaxed mb-6">
          {userName ? (
            <span className="font-semibold text-[#19221C]">{userName}</span>
          ) : '현재'}{' '}
          계정에서 안전하게 로그아웃됩니다.<br />
          언제든 다시 로그인하여 모임 신청 내역과 관심 목록을 확인하실 수 있습니다.
        </p>

        {/* Buttons */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 px-4 rounded-full border border-stone-300 text-stone-700 text-sm font-semibold hover:bg-stone-50 transition-colors cursor-pointer"
          >
            취소
          </button>
          
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="flex-1 py-3 px-4 rounded-full bg-[#DF612D] hover:bg-[#c95221] text-white text-sm font-semibold shadow-sm hover:shadow transition-all cursor-pointer"
          >
            로그아웃
          </button>
        </div>
      </div>
    </div>
  );
};
