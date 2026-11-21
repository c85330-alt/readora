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
        className="fixed inset-0 bg-[#191919]/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div
        className="relative bg-[#FBF9E9] rounded-2xl max-w-sm w-full p-6 sm:p-7 shadow-2xl border border-[#191919]/20 z-10 text-center"
        role="dialog"
        aria-modal="true"
      >
        {/* Close icon */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-[#191919]/50 hover:text-[#191919] hover:bg-[#FFFDF4] transition-colors cursor-pointer"
          aria-label="닫기"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Warning Icon Graphic */}
        <div className="w-14 h-14 rounded-xl bg-[#FFE57E] text-[#191919] border border-[#191919]/15 flex items-center justify-center mx-auto mb-4.5">
          <LogOut className="w-7 h-7" />
        </div>

        {/* Title */}
        <h3 className="text-xl font-extrabold text-[#191919] mb-2 tracking-tight">
          로그아웃하시겠습니까?
        </h3>

        {/* Body Description */}
        <p className="text-sm text-[#191919]/70 leading-relaxed mb-6">
          {userName ? (
            <span className="font-bold text-[#191919]">{userName}</span>
          ) : '현재'}{' '}
          계정에서 안전하게 로그아웃됩니다.<br />
          언제든 다시 로그인하여 모임 신청 내역과 관심 목록을 확인하실 수 있습니다.
        </p>

        {/* Buttons */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 px-4 rounded-lg border border-[#191919]/20 bg-[#FFFDF4] text-[#191919] text-sm font-bold hover:bg-[#191919]/5 transition-colors cursor-pointer"
          >
            취소
          </button>

          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="flex-1 py-3 px-4 rounded-lg bg-[#191919] hover:bg-[#333333] text-[#FFE57E] text-sm font-bold transition-colors cursor-pointer"
          >
            로그아웃
          </button>
        </div>
      </div>
    </div>
  );
};
