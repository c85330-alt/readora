import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  LogOut,
  User as UserIcon,
  Crown,
  Menu,
  X,
  ChevronRight,
  BookOpen,
  Compass,
  Sparkles,
} from 'lucide-react';
import { User } from '../types';

interface NavbarProps {
  currentUser: User | null;
  onOpenLogin: () => void;
  onOpenSignup: () => void;
  onRequestLogout: () => void;
  onOpenAdmin: () => void;
  onOpenHostDashboard?: () => void;
  onOpenMyChapters: () => void;
  onOpenMyPage: () => void;
  onOpenBecomeHost: () => void;
  onOpenCreateClub: () => void;
  onScrollToExplore: () => void;
  onScrollToGuide?: () => void;
  joinedCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  onOpenLogin,
  onOpenSignup,
  onRequestLogout,
  onOpenAdmin,
  onOpenHostDashboard,
  onOpenMyChapters,
  onOpenMyPage,
  onOpenBecomeHost,
  onScrollToExplore,
  onScrollToGuide,
  joinedCount,
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    let ticking = false;
    let prevScrollY = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const deltaY = currentScrollY - prevScrollY;

      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (currentScrollY <= 60) {
            setIsVisible(true);
          } else if (deltaY > 8 && !isMobileMenuOpen) {
            setIsVisible(false);
          } else if (deltaY < -6) {
            setIsVisible(true);
          }
          prevScrollY = currentScrollY;
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isMobileMenuOpen]);

  const handleGuideClick = () => {
    if (onScrollToGuide) {
      onScrollToGuide();
      return;
    }
    document.getElementById('guide-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  const isAdmin = currentUser?.role === 'admin';
  const isHost = currentUser?.role === 'host';

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 bg-[#FBF9E9]/95 backdrop-blur-sm transition-transform duration-300 ease-out ${
        isVisible ? 'translate-y-0' : '-translate-y-full'
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-18 flex items-center justify-between gap-4">
        {/* Left: Brand Wordmark + Tagline + Optional Role Shortcut */}
        <div className="flex items-center gap-3 shrink-0 min-w-0">
          <div className="flex items-baseline gap-2 shrink-0">
            <a
              href="#"
              className="text-xl sm:text-2xl font-black tracking-tight text-[#191919] hover:text-[#F16B47] transition-colors whitespace-nowrap"
            >
              리도라
            </a>
            <span className="font-display-en text-[11px] sm:text-xs font-semibold tracking-[0.04em] text-[#191919]/55 whitespace-nowrap">
              read. meet. repeat.
            </span>
          </div>

          {isAdmin && (
            <button
              onClick={onOpenAdmin}
              className="hidden lg:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#191919] text-[#FFE57E] text-xs font-bold hover:bg-[#F16B47] hover:text-white transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>관리자</span>
            </button>
          )}

          {isHost && onOpenHostDashboard && (
            <button
              onClick={onOpenHostDashboard}
              className="hidden lg:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#191919] text-[#FFE57E] text-xs font-bold hover:bg-[#F16B47] hover:text-white transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              <Crown className="w-3.5 h-3.5" />
              <span>호스트 센터</span>
            </button>
          )}
        </div>

        {/* Center Navigation Links (Desktop) */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-semibold text-[#191919]/75">
          <button
            onClick={onScrollToExplore}
            className="hover:text-[#191919] transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            모임 둘러보기
          </button>

          <button
            onClick={handleGuideClick}
            className="hover:text-[#191919] transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            이용 안내
          </button>

          {isHost && onOpenHostDashboard ? (
            <button
              onClick={onOpenHostDashboard}
              className="text-[#F16B47] hover:text-[#191919] transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              호스트 관리
            </button>
          ) : (
            <button
              onClick={onOpenBecomeHost}
              className="hover:text-[#191919] transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              호스트 지원
            </button>
          )}
        </nav>

        {/* Right Primary Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {currentUser ? (
            <>
              <button
                onClick={onOpenMyPage}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 min-h-[40px] rounded-lg bg-[#FFE57E] hover:bg-[#ffd94a] text-[#191919] border border-[#191919]/15 text-xs sm:text-sm font-bold transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                <UserIcon className="w-3.5 h-3.5 shrink-0" />
                <span>마이페이지</span>
                {joinedCount > 0 && (
                  <span className="ml-0.5 px-1.5 py-0.5 rounded bg-[#191919] text-[#FFE57E] text-[10px] font-bold tabular-nums leading-none">
                    {joinedCount}
                  </span>
                )}
              </button>

              <button
                onClick={onRequestLogout}
                className="hidden md:inline-flex items-center gap-1.5 px-3 py-2 min-h-[40px] rounded-lg border border-[#191919]/20 bg-[#FFFDF4] hover:bg-[#191919] hover:text-white text-[#191919] text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>로그아웃</span>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={onOpenLogin}
                className="px-3.5 py-2 min-h-[40px] rounded-lg bg-[#FFE57E] hover:bg-[#ffd94a] text-[#191919] border border-[#191919]/15 text-xs sm:text-sm font-bold transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                로그인
              </button>
              <button
                onClick={onOpenSignup}
                className="hidden sm:inline-flex items-center px-3.5 py-2 min-h-[40px] rounded-lg border border-[#191919]/20 bg-[#FFFDF4] hover:bg-[#191919] hover:text-white text-[#191919] text-xs sm:text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                회원가입
              </button>
            </>
          )}

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden inline-flex items-center justify-center w-11 h-11 rounded-lg border border-[#191919]/15 bg-[#FFFDF4] text-[#191919] hover:bg-[#FFE57E] transition-colors cursor-pointer"
            aria-label={isMobileMenuOpen ? '메뉴 닫기' : '메뉴 열기'}
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-[#FBF9E9] border-t border-[#191919]/15 px-4 pt-3 pb-6 space-y-3 shadow-lg max-h-[82vh] overflow-y-auto">
          {currentUser && (
            <div className="bg-[#FFFDF4] p-3.5 rounded-xl border border-[#191919]/15 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-[#191919] truncate">
                    {currentUser.name}님
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#FFE57E] text-[#191919]">
                    {currentUser.role === 'admin'
                      ? '관리자'
                      : currentUser.role === 'host'
                        ? '호스트'
                        : '회원'}
                  </span>
                </div>
                <p className="text-xs text-[#191919]/60 font-mono truncate mt-0.5">
                  {currentUser.email}
                </p>
              </div>
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onOpenMyChapters();
                }}
                className="px-3 py-2 rounded-lg bg-[#191919] text-[#FFE57E] text-xs font-bold shrink-0 cursor-pointer"
              >
                내 모임
              </button>
            </div>
          )}

          <div className="bg-[#FFFDF4] rounded-xl border border-[#191919]/15 divide-y divide-[#191919]/10 text-sm font-semibold">
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                onScrollToExplore();
              }}
              className="w-full px-4 py-3.5 text-left text-[#191919] hover:bg-[#FFE57E]/25 flex items-center justify-between cursor-pointer"
            >
              <span className="flex items-center gap-2.5">
                <BookOpen className="w-4 h-4 text-[#F16B47]" />
                <span>모임 둘러보기</span>
              </span>
              <ChevronRight className="w-4 h-4 text-[#191919]/40" />
            </button>

            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                handleGuideClick();
              }}
              className="w-full px-4 py-3.5 text-left text-[#191919] hover:bg-[#FFE57E]/25 flex items-center justify-between cursor-pointer"
            >
              <span className="flex items-center gap-2.5">
                <Compass className="w-4 h-4 text-[#191919]" />
                <span>이용 안내</span>
              </span>
              <ChevronRight className="w-4 h-4 text-[#191919]/40" />
            </button>

            {isHost && onOpenHostDashboard ? (
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onOpenHostDashboard();
                }}
                className="w-full px-4 py-3.5 text-left text-[#F16B47] hover:bg-[#FFE57E]/25 flex items-center justify-between font-bold cursor-pointer"
              >
                <span className="flex items-center gap-2.5">
                  <Crown className="w-4 h-4" />
                  <span>호스트 모임 관리 센터</span>
                </span>
                <ChevronRight className="w-4 h-4 text-[#191919]/40" />
              </button>
            ) : (
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onOpenBecomeHost();
                }}
                className="w-full px-4 py-3.5 text-left text-[#191919] hover:bg-[#FFE57E]/25 flex items-center justify-between cursor-pointer"
              >
                <span className="flex items-center gap-2.5">
                  <Sparkles className="w-4 h-4 text-[#F16B47]" />
                  <span>호스트 지원 안내</span>
                </span>
                <ChevronRight className="w-4 h-4 text-[#191919]/40" />
              </button>
            )}

            {isAdmin && (
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onOpenAdmin();
                }}
                className="w-full px-4 py-3.5 text-left text-[#191919] hover:bg-[#FFE57E]/25 flex items-center justify-between font-bold cursor-pointer"
              >
                <span className="flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-[#F16B47]" />
                  <span>총괄 관리자 대시보드</span>
                </span>
                <ChevronRight className="w-4 h-4 text-[#191919]/40" />
              </button>
            )}
          </div>

          <div className="pt-1">
            {currentUser ? (
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onRequestLogout();
                }}
                className="w-full py-3 rounded-lg bg-[#FFFDF4] border border-[#191919]/20 text-[#191919] text-sm font-bold flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>로그아웃</span>
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onOpenLogin();
                  }}
                  className="py-3 rounded-lg bg-[#FFFDF4] border border-[#191919]/20 text-[#191919] text-sm font-bold cursor-pointer"
                >
                  로그인
                </button>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onOpenSignup();
                  }}
                  className="py-3 rounded-lg bg-[#FFE57E] border border-[#191919]/20 text-[#191919] text-sm font-bold cursor-pointer"
                >
                  회원가입하기
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
