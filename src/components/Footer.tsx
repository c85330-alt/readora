import React from 'react';
import { Mail } from 'lucide-react';

interface FooterProps {
  onExploreClubs: () => void;
  onBecomeHost: () => void;
  onOpenMyChapters: () => void;
  onOpenMyPage?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onExploreClubs,
  onBecomeHost,
  onOpenMyChapters,
  onOpenMyPage
}) => {

  return (
    <div>
      {/* Pre-Footer CTA Banner matching the screenshot */}
      <section className="bg-[#FDECE0] border-t border-[#F5D8C4] py-12 sm:py-20 relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-[#19221C] tracking-tight leading-tight mb-3 sm:mb-4">
            Where Books Bring Us Together,{' '}
            <span className="text-[#2D6A4F] font-serif-accent italic relative inline-block px-1">
              Readora
              <svg
                className="absolute -bottom-1.5 left-0 w-full h-2.5 text-[#2D6A4F]/30"
                viewBox="0 0 100 20"
                preserveAspectRatio="none"
              >
                <path
                  d="M 2,15 Q 50,5 98,13"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />
              </svg>
            </span>
          </h2>

          <p className="text-xs sm:text-base text-[#56655B] max-w-xl mx-auto mb-6 sm:mb-8 text-balance">
            같은 문장에 머물고, 같은 생각에 설레는 순간.<br className="hidden sm:inline" />
            혼자 읽으면 지나쳤을 이야기들이 우리가 함께하는 시간 속에서 더 깊어집니다.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 sm:gap-3">
            <button
              onClick={onExploreClubs}
              className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-[#DF612D] hover:bg-[#c95221] active:scale-[0.98] text-white text-xs sm:text-sm font-semibold shadow-sm hover:shadow transition-all cursor-pointer"
            >
              모임 찾아보고 신청하기
            </button>
            <button
              onClick={onBecomeHost}
              className="w-full sm:w-auto px-6 py-3.5 rounded-full bg-white hover:bg-[#FAF4ED] active:scale-[0.98] text-[#19221C] border border-[#DFC9B7] text-xs sm:text-sm font-semibold transition-all cursor-pointer shadow-2xs"
            >
              호스트로 시작하기
            </button>
          </div>
        </div>
      </section>

      {/* Main Dark Forest Green Footer */}
      <footer className="bg-[#122A1E] text-white py-10 sm:py-16 border-t border-[#1C3E2D]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-8 sm:gap-10">
            {/* Column 1: Brand Info */}
            <div className="space-y-4 max-w-md">
              <div className="flex items-center gap-2">
                <span className="font-[Arial,sans-serif] text-2xl font-extrabold tracking-tight text-[#FDFBF7]">
                  리도라
                </span>
                <span className="text-[10px] sm:text-[11px] font-semibold tracking-[0.22em] text-[#E8DCC9] uppercase pl-2 border-l border-white/20">
                  Book Club
                </span>
              </div>

              <p className="text-xs text-[#A1B5A9] leading-relaxed max-w-sm">
                우리가 책으로 만나는 시간, 리도라(Readora).<br />
                서로 다른 생각을 나누고, 함께 읽는 즐거움을 경험해 보세요.
              </p>

              <div className="pt-2 text-xs text-[#CBD8D1] space-y-1">
                <p className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-[#DF612D]" />
                  <a
                    href="mailto:readoracontact@gmail.com"
                    className="hover:text-white hover:underline transition-colors"
                  >
                    readoracontact@gmail.com
                  </a>
                </p>
              </div>
            </div>

            {/* Column 2: Quick Links */}
            <div className="space-y-3 shrink-0">
              <h4 className="text-xs font-bold text-[#E2ECE6] uppercase tracking-wider">
                Platform Pages
              </h4>
              <ul className="space-y-2 text-xs text-[#A8BDB1]">
                <li>
                  <button onClick={onExploreClubs} className="hover:text-white transition-colors cursor-pointer">
                    모임 탐색 (Clubs)
                  </button>
                </li>
                <li>
                  <button onClick={onOpenMyPage || onOpenMyChapters} className="hover:text-white transition-colors cursor-pointer">
                    마이페이지 (My Page)
                  </button>
                </li>
                <li>
                  <button onClick={onOpenMyChapters} className="hover:text-white transition-colors cursor-pointer">
                    내 모임 관리 (My Clubs)
                  </button>
                </li>
                <li>
                  <button onClick={onBecomeHost} className="hover:text-white transition-colors cursor-pointer">
                    호스트 지원 (Become a Host)
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
