import React, { useState, useEffect } from 'react';
import { 
  Sparkles, PlusCircle, ShieldCheck, 
  LogOut, User as UserIcon, LogIn, Crown, Menu, X, ChevronRight, BookOpen 
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
  onOpenCreateClub,
  onScrollToExplore,
  joinedCount
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
          // Top zone: always visible
          if (currentScrollY <= 60) {
            setIsVisible(true);
          } else if (deltaY > 8) {
            // Scrolling down with clear momentum -> smoothly hide (only if mobile menu is closed)
            if (!isMobileMenuOpen) {
              setIsVisible(false);
            }
          } else if (deltaY < -6) {
            // Scrolling up -> smoothly reappear
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

  const isAdmin = currentUser?.role === 'admin';
  const isHost = currentUser?.role === 'host';

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 bg-[#F4F0E5]/95 backdrop-blur-md border-b border-[#E8DFCE] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] will-change-transform ${
          isVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0 pointer-events-none'
        }`}
      >
        <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between relative">
          {/* Brand Logo */}
          <div className="flex items-center gap-2 sm:gap-3 z-10 shrink-0">
            <a href="#" className="flex items-center gap-1.5 sm:gap-2 group">
              <span className="font-[Arial,sans-serif] text-xl sm:text-2xl sm:text-3xl font-extrabold tracking-tight text-[#1D2520] group-hover:text-[#DF612D] transition-colors">
                리도라
              </span>
              <span className="text-[9px] sm:text-[11px] font-semibold tracking-[0.2em] text-[#19221C] uppercase pl-1.5 sm:pl-2 border-l border-[#C8BFB0] transition-colors font-sans">
                Book Club
              </span>
            </a>

            {isAdmin && (
              <button
                onClick={onOpenAdmin}
                className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#172E22] text-emerald-300 text-xs font-semibold hover:bg-[#234332] transition-colors cursor-pointer"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>관리자 대시보드</span>
              </button>
            )}

            {isHost && onOpenHostDashboard && (
              <button
                onClick={onOpenHostDashboard}
                className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold transition-colors cursor-pointer shadow-xs"
              >
                <Crown className="w-3.5 h-3.5 text-amber-200" />
                <span>호스트 모임 관리</span>
              </button>
            )}
          </div>

          {/* Center Navigation Links - Desktop Centered */}
          <nav className="hidden md:flex items-center justify-center gap-7 lg:gap-8 text-sm font-medium text-[#465349] absolute left-1/2 -translate-x-1/2">
            <button 
              onClick={onScrollToExplore}
              className="hover:text-[#DF612D] transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              모임 찾기
            </button>
            
            <button 
              onClick={currentUser ? onOpenMyPage : onOpenLogin}
              className="hover:text-[#DF612D] transition-colors flex items-center gap-1.5 cursor-pointer relative"
            >
              <span>마이페이지</span>
              {currentUser && joinedCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-[#DF612D] text-white text-[11px] font-bold flex items-center justify-center animate-pulse">
                  {joinedCount}
                </span>
              )}
            </button>

            {isHost && onOpenHostDashboard ? (
              <button 
                onClick={onOpenHostDashboard}
                className="hover:text-[#DF612D] transition-colors flex items-center gap-1.5 cursor-pointer font-bold text-amber-800"
              >
                <Crown className="w-4 h-4 text-amber-600" />
                <span>호스트 모임 관리</span>
              </button>
            ) : (
              <button 
                onClick={onOpenBecomeHost}
                className="hover:text-[#DF612D] transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-[#DF612D]" />
                <span>호스트 지원</span>
              </button>
            )}
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 z-10">
            {currentUser ? (
              <div className="flex items-center gap-1.5 sm:gap-2">
                {/* Desktop User Identity Chip */}
                <button
                  onClick={onOpenMyPage}
                  className={`hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-full border transition-colors cursor-pointer ${
                    isHost
                      ? 'bg-amber-50 text-amber-900 border-amber-300 hover:border-amber-500 hover:bg-amber-100'
                      : 'bg-white/80 text-stone-700 border-[#E0D8C8] hover:border-[#DF612D] hover:bg-white'
                  }`}
                  title="마이페이지 (개인정보 및 참여 모임 관리)"
                >
                  {isHost ? (
                    <Crown className="w-3.5 h-3.5 text-amber-600" />
                  ) : (
                    <UserIcon className="w-3.5 h-3.5 text-[#DF612D]" />
                  )}
                  <span className="max-w-[70px] truncate">{currentUser.name}님</span>
                  <span className="text-[10px] font-bold bg-[#DF612D]/10 text-[#DF612D] px-1.5 py-0.5 rounded-full">
                    MY
                  </span>
                </button>

                {/* Explore Button (Desktop & Tablet) */}
                <button
                  onClick={onScrollToExplore}
                  className="hidden md:inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold bg-[#DF612D] hover:bg-[#c95221] text-white px-4 py-2 sm:px-5 sm:py-2 rounded-full shadow-xs hover:shadow transition-all cursor-pointer"
                >
                  <span>모임 찾기</span>
                </button>

                {/* Logout Button (Desktop) */}
                <button
                  onClick={onRequestLogout}
                  className="hidden md:inline-flex items-center gap-1 text-xs sm:text-sm font-semibold bg-white hover:bg-[#F5EFE4] text-[#19221C] border border-[#DDD4C3] px-3.5 py-2 rounded-full transition-colors cursor-pointer shadow-xs"
                >
                  <LogOut className="w-3.5 h-3.5 text-stone-500" />
                  <span>로그아웃</span>
                </button>

                {/* Mobile Quick "My" button */}
                <button
                  onClick={onOpenMyPage}
                  className="md:hidden inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-white border border-[#DDD4C3] text-xs font-bold text-[#19221C]"
                >
                  <UserIcon className="w-3.5 h-3.5 text-[#DF612D]" />
                  <span>내 모임</span>
                  {joinedCount > 0 && (
                    <span className="w-4 h-4 rounded-full bg-[#DF612D] text-white text-[10px] font-bold flex items-center justify-center">
                      {joinedCount}
                    </span>
                  )}
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1 sm:gap-2">
                <button
                  onClick={onOpenLogin}
                  className="text-xs sm:text-sm font-semibold text-[#19221C] hover:text-[#DF612D] px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-full hover:bg-stone-200/50 transition-colors cursor-pointer"
                >
                  로그인
                </button>
                <button
                  onClick={onOpenSignup}
                  className="inline-flex items-center gap-1 text-xs sm:text-sm font-semibold bg-[#DF612D] hover:bg-[#c95221] text-white px-3 sm:px-5 py-1.5 sm:py-2.5 rounded-full shadow-xs hover:shadow transition-all cursor-pointer"
                >
                  <span>회원가입</span>
                </button>
              </div>
            )}

            {/* Mobile Hamburger Menu Toggle Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-[#19221C] hover:bg-black/5 active:bg-black/10 transition-colors cursor-pointer"
              aria-label={isMobileMenuOpen ? '메뉴 닫기' : '메뉴 열기'}
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5 text-[#DF612D]" />
              ) : (
                <Menu className="w-5 h-5 text-[#19221C]" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer / Dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-[#F4F0E5] border-t border-[#E8DFCE] px-4 pt-3 pb-6 space-y-3 shadow-xl animate-in slide-in-from-top-2 duration-200 max-h-[82vh] overflow-y-auto">
            {/* User status card on mobile */}
            {currentUser && (
              <div className="bg-white p-3.5 rounded-2xl border border-[#E0D8C8] flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-[#DF612D]/10 text-[#DF612D] flex items-center justify-center font-bold">
                    <UserIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-xs text-[#19221C]">{currentUser.name}님</span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-900">
                        {currentUser.role === 'admin' ? '관리자' : currentUser.role === 'host' ? '호스트' : '회원'}
                      </span>
                    </div>
                    <span className="text-[11px] text-stone-500 font-mono">{currentUser.email}</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onOpenMyPage();
                  }}
                  className="px-2.5 py-1 rounded-lg bg-[#DF612D] text-white text-xs font-bold"
                >
                  마이페이지
                </button>
              </div>
            )}

            {/* Nav list */}
            <div className="bg-white rounded-2xl border border-[#E0D8C8] divide-y divide-stone-100 overflow-hidden text-xs font-semibold">
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onScrollToExplore();
                }}
                className="w-full px-4 py-3 text-left text-[#19221C] hover:bg-stone-50 flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5">
                  <BookOpen className="w-4 h-4 text-[#DF612D]" />
                  <span>모임 찾기 (독서모임 탐색)</span>
                </div>
                <ChevronRight className="w-4 h-4 text-stone-400" />
              </button>


              {isHost && onOpenHostDashboard ? (
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onOpenHostDashboard();
                  }}
                  className="w-full px-4 py-3 text-left text-amber-900 hover:bg-amber-50/50 flex items-center justify-between font-bold"
                >
                  <div className="flex items-center gap-2.5">
                    <Crown className="w-4 h-4 text-amber-600" />
                    <span>호스트 모임 관리 센터</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-stone-400" />
                </button>
              ) : (
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onOpenBecomeHost();
                  }}
                  className="w-full px-4 py-3 text-left text-[#19221C] hover:bg-stone-50 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5">
                    <Sparkles className="w-4 h-4 text-[#DF612D]" />
                    <span>호스트 지원 안내</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-stone-400" />
                </button>
              )}

              {isAdmin && (
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onOpenAdmin();
                  }}
                  className="w-full px-4 py-3 text-left text-emerald-900 hover:bg-emerald-50/50 flex items-center justify-between font-bold"
                >
                  <div className="flex items-center gap-2.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>총괄 관리자 대시보드</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-stone-400" />
                </button>
              )}
            </div>

            {/* Quick Action footer in mobile menu */}
            <div className="pt-2">
              {currentUser ? (
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onRequestLogout();
                  }}
                  className="w-full py-2.5 rounded-xl bg-white border border-[#DDD4C3] text-stone-700 text-xs font-bold hover:bg-stone-100 flex items-center justify-center gap-1.5"
                >
                  <LogOut className="w-3.5 h-3.5 text-stone-500" />
                  <span>로그아웃</span>
                </button>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      onOpenLogin();
                    }}
                    className="py-2.5 rounded-xl bg-white border border-[#DDD4C3] text-[#19221C] text-xs font-bold text-center"
                  >
                    로그인
                  </button>
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      onOpenSignup();
                    }}
                    className="py-2.5 rounded-xl bg-[#DF612D] text-white text-xs font-bold text-center shadow-xs"
                  >
                    회원가입하기
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </header>
    </>
  );
};

