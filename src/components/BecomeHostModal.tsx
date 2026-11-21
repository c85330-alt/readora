import React from 'react';
import { X, Sparkles, Clock, Mail, BookOpen } from 'lucide-react';
import { User } from '../types';

interface BecomeHostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitApplication?: any;
  onOpenCreateClub?: any;
  currentUser?: User | null;
  onExploreClubs?: () => void;
}

export const BecomeHostModal: React.FC<BecomeHostModalProps> = ({
  isOpen,
  onClose,
  onExploreClubs
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-[#191919]/60 backdrop-blur-xs overflow-y-auto">
      <div
        className="relative w-full max-w-lg bg-[#FBF9E9] rounded-2xl shadow-2xl border border-[#191919]/20 my-auto sm:my-8 overflow-hidden p-5 sm:p-8 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg bg-[#FFFDF4] hover:bg-[#FFE57E] text-[#191919] transition-colors cursor-pointer border border-[#191919]/15"
          aria-label="닫기"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Icon & Badge */}
        <div className="w-16 h-16 rounded-2xl bg-[#FFE57E] text-[#191919] flex items-center justify-center mx-auto mb-4 border border-[#191919]/15">
          <Clock className="w-8 h-8" />
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#FFFDF4] text-[#F16B47] text-xs font-bold border border-[#191919]/15 mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>서비스 준비 중 (Coming Soon)</span>
        </div>

        {/* Heading */}
        <h3 className="text-xl sm:text-2xl font-extrabold text-[#191919] tracking-tight mb-3">
          호스트 지원 기능은<br />현재 준비 중입니다
        </h3>

        {/* Description */}
        <p className="text-xs sm:text-sm text-[#191919]/70 leading-relaxed mb-6">
          리도라(Readora)의 더 따뜻하고 풍성한 독서모임 운영을 위해 호스트 지원 혜택 및 세부 선발 프로세스를 정비하고 있습니다.<br />
          빠른 시일 내에 정식으로 오픈할 예정이니 많은 관심과 기대를 부탁드립니다!
        </p>

        {/* Contact info card */}
        <div className="bg-[#FFFDF4] rounded-xl p-4 border border-[#191919]/15 text-left mb-6 space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-bold text-[#191919]">
            <Mail className="w-4 h-4 text-[#F16B47]" />
            <span>호스트 사전 제안 및 문의</span>
          </div>
          <p className="text-xs text-[#191919]/65 leading-relaxed">
            모임 개설 제안 또는 협업 문의는 대표 이메일로 보내주시면 운영팀에서 친절히 안내해 드립니다.
          </p>
          <div className="pt-1">
            <a
              href="mailto:readoracontact@gmail.com"
              className="inline-block text-xs font-bold text-[#F16B47] hover:underline"
            >
              readoracontact@gmail.com
            </a>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-[#FFE57E] hover:bg-[#ffd94a] text-[#191919] border border-[#191919]/20 text-xs sm:text-sm font-bold transition-colors cursor-pointer"
          >
            확인하였습니다
          </button>
          {onExploreClubs && (
            <button
              onClick={() => {
                onClose();
                onExploreClubs();
              }}
              className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-[#FFFDF4] hover:bg-[#191919] hover:text-white text-[#191919] border border-[#191919]/20 text-xs sm:text-sm font-semibold transition-colors cursor-pointer inline-flex items-center justify-center gap-1.5"
            >
              <BookOpen className="w-3.5 h-3.5 text-[#F16B47]" />
              <span>진행 중인 모임 둘러보기</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
