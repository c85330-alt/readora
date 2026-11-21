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
  onOpenMyPage,
}) => {
  const handleScrollToGuide = () => {
    document.getElementById('guide-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="bg-[#191919] text-[#FBF9E9]">
      {/* Main Dark Footer */}
      <footer className="py-12 sm:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-10 border-b border-[#FBF9E9]/12">
            {/* Brand Column */}
            <div className="md:col-span-5 space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-2xl font-black tracking-tight text-[#FBF9E9]">
                  리도라
                </span>
                <span className="font-display-en text-[11px] font-semibold tracking-[0.16em] uppercase text-[#FFE57E]">
                  READORA
                </span>
              </div>
              <p className="text-sm text-[#FBF9E9]/70 leading-relaxed max-w-sm">
                우리가 책으로 만나는 시간. 캘거리에서 책 한 권으로 시작되는 가볍고 따뜻한 만남.
              </p>
              <div className="pt-2">
                <a
                  href="mailto:readoracontact@gmail.com"
                  className="inline-flex items-center gap-2 text-xs sm:text-sm text-[#FBF9E9]/85 hover:text-[#FFE57E] transition-colors"
                >
                  <Mail className="w-4 h-4 text-[#F16B47]" />
                  <span>readoracontact@gmail.com</span>
                </a>
              </div>
            </div>

            {/* Navigation Links */}
            <div className="md:col-span-4 space-y-3">
              <h4 className="font-display-en text-xs font-bold uppercase tracking-[0.14em] text-[#FBF9E9]/50">
                NAVIGATION
              </h4>
              <ul className="grid grid-cols-2 gap-y-2.5 gap-x-4 text-sm text-[#FBF9E9]/80">
                <li>
                  <button
                    onClick={onExploreClubs}
                    className="hover:text-[#FFE57E] transition-colors cursor-pointer"
                  >
                    모임 둘러보기
                  </button>
                </li>
                <li>
                  <button
                    onClick={handleScrollToGuide}
                    className="hover:text-[#FFE57E] transition-colors cursor-pointer"
                  >
                    이용 안내
                  </button>
                </li>
                <li>
                  <button
                    onClick={onOpenMyPage || onOpenMyChapters}
                    className="hover:text-[#FFE57E] transition-colors cursor-pointer"
                  >
                    마이페이지
                  </button>
                </li>
                <li>
                  <button
                    onClick={onOpenMyChapters}
                    className="hover:text-[#FFE57E] transition-colors cursor-pointer"
                  >
                    내 모임 관리
                  </button>
                </li>
                <li>
                  <button
                    onClick={onBecomeHost}
                    className="hover:text-[#FFE57E] transition-colors cursor-pointer"
                  >
                    호스트 지원
                  </button>
                </li>
              </ul>
            </div>

            {/* Slogan Column */}
            <div className="md:col-span-3 md:text-right space-y-2">
              <p className="font-display-en text-xs font-bold uppercase tracking-[0.14em] text-[#FBF9E9]/50">
                SLOGAN
              </p>
              <p className="font-display-en text-base font-bold text-[#FFE57E]">
                READ. MEET. REPEAT.
              </p>
              <p className="text-xs text-[#FBF9E9]/60">
                Calgary, Alberta · Canada
              </p>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-[#FBF9E9]/50">
            <p>© 2026 리도라 (Readora). All rights reserved.</p>
            <p className="font-display-en tracking-wider uppercase">
              BOOK CLUB PLATFORM
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};
