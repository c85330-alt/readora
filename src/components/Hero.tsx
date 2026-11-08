import React from 'react';
import { LogIn, BookOpen, ArrowRight, Sparkles, UserPlus, Crown } from 'lucide-react';
import { User } from '../types';

interface HeroProps {
  currentUser: User | null;
  onExploreClick: () => void;
  onOpenLogin: () => void;
  onOpenSignup: () => void;
  onRequestLogout: () => void;
  onBecomeHostClick: () => void;
  onOpenHostDashboard?: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  currentUser,
  onExploreClick,
  onOpenLogin,
  onOpenSignup,
  onRequestLogout,
  onBecomeHostClick,
  onOpenHostDashboard,
}) => {
  return (
    <section className="relative pt-24 pb-12 sm:pt-32 sm:pb-20 md:pt-36 md:pb-28 overflow-hidden bg-[#F4F0E5]">
      {/* Decorative subtle background blobs */}
      <div className="absolute top-12 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-b from-[#EBE5D5] to-transparent rounded-full blur-3xl -z-10 opacity-70 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
        {/* Central Hero Core */}
        <div className="relative z-10 max-w-3xl mx-auto">
          {/* Main Headline: Where Books Bring Us Together, Readora */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-[62px] font-extrabold text-[#19221C] tracking-tight leading-[1.2] mx-auto mb-4 sm:mb-6 text-balance break-words">
            Where Books Bring Us Together,{' '}
            <span className="text-[#2D6A4F] font-serif-accent font-extrabold italic relative inline-block px-1">
              Readora
              {/* Playful brush doodle stroke */}
              <svg
                className="absolute -bottom-1.5 sm:-bottom-2 left-0 w-full h-2.5 sm:h-3 text-[#2D6A4F]/30 overflow-visible"
                viewBox="0 0 100 20"
                preserveAspectRatio="none"
              >
                <path
                  d="M 2,15 Q 50,5 98,13"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
              </svg>
            </span>
          </h1>

          {/* Launch Copy Subtitle */}
          <p className="text-xs sm:text-base text-[#526055] max-w-2xl mx-auto font-normal leading-relaxed mb-6 sm:mb-8 text-pretty px-2">
            같은 문장에 머물고, 같은 생각에 설레는 순간.<br className="hidden sm:inline" />
            혼자 읽으면 지나쳤을 이야기들이 우리가 함께하는 시간 속에서 더 깊어집니다.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 sm:gap-3.5 mb-8 sm:mb-14 w-full sm:w-auto">
            {!currentUser ? (
              <>
                {/* Before Login: [로그인] and [회원가입하기] */}
                <button
                  onClick={onOpenLogin}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-[#DF612D] hover:bg-[#c95221] text-white text-sm sm:text-base font-semibold shadow-sm hover:shadow transition-all cursor-pointer group active:scale-[0.98]"
                >
                  <LogIn className="w-4 h-4" />
                  <span>로그인</span>
                </button>

                <button
                  onClick={onOpenSignup}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-white hover:bg-[#F5EFE4] text-[#19221C] border border-[#DDD4C3] text-sm sm:text-base font-semibold transition-all cursor-pointer shadow-xs group active:scale-[0.98]"
                >
                  <UserPlus className="w-4 h-4 text-[#DF612D]" />
                  <span>회원가입하기</span>
                </button>
              </>
            ) : (
              <>
                {/* After Login: [모임 찾기] and [호스트 지원] */}
                <button
                  onClick={onExploreClick}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-[#DF612D] hover:bg-[#c95221] text-white text-sm sm:text-base font-semibold shadow-sm hover:shadow transition-all cursor-pointer group active:scale-[0.98]"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>모임 찾기</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>

                {currentUser.role === 'host' && onOpenHostDashboard ? (
                  <button
                    onClick={onOpenHostDashboard}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-amber-600 hover:bg-amber-700 text-white text-sm sm:text-base font-semibold transition-all cursor-pointer shadow-xs group active:scale-[0.98]"
                  >
                    <Crown className="w-4 h-4 text-amber-200 group-hover:rotate-12 transition-transform" />
                    <span>호스트 모임 관리</span>
                  </button>
                ) : (
                  <button
                    onClick={onBecomeHostClick}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-white hover:bg-[#F5EFE4] text-[#19221C] border border-[#DDD4C3] text-sm sm:text-base font-semibold transition-all cursor-pointer shadow-xs group active:scale-[0.98]"
                  >
                    <Sparkles className="w-4 h-4 text-[#DF612D] group-hover:rotate-12 transition-transform" />
                    <span>호스트 지원</span>
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {/* 3 Photo Cards: On mobile, 1 featured gathering photo + 2 complementary photos below in 2 cols */}
        <div className="relative max-w-6xl xl:max-w-7xl mx-auto mt-2">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-5 lg:gap-6 items-center">
            
            {/* 1st Card (Book & Coffee) - order 2 on mobile, order 1 on md */}
            <div
              onClick={onExploreClick}
              className="col-span-1 order-2 md:order-1 group relative aspect-[4/3] sm:aspect-[16/11] rounded-2xl sm:rounded-3xl overflow-hidden shadow-md sm:shadow-xl border-2 sm:border-4 border-white bg-amber-50 cursor-pointer transition-all duration-300 ease-out md:-rotate-1 lg:-rotate-2 hover:rotate-0 hover:-translate-y-2 hover:scale-[1.03]"
            >
              <img
                src="https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=800&q=80"
                alt="책과 따뜻한 커피"
                className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-108"
              />
            </div>

            {/* 3rd Card (Featured Gathering) - spans 2 cols on mobile, order 1 on mobile, order 2 on md */}
            <div
              onClick={onExploreClick}
              className="col-span-2 md:col-span-1 order-1 md:order-2 group relative aspect-[16/10] sm:aspect-[16/11] rounded-2xl sm:rounded-3xl overflow-hidden shadow-lg sm:shadow-xl border-2 sm:border-4 border-white bg-amber-50 cursor-pointer transition-all duration-300 ease-out hover:-translate-y-2 hover:scale-[1.03] z-10"
            >
              <img
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80"
                alt="Calgary Korean Book Club readers gathering"
                className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-108"
              />
            </div>

            {/* 2nd Card (Warm Reading Moment) - order 3 on mobile and md */}
            <div
              onClick={onExploreClick}
              className="col-span-1 order-3 md:order-3 group relative aspect-[4/3] sm:aspect-[16/11] rounded-2xl sm:rounded-3xl overflow-hidden shadow-md sm:shadow-xl border-2 sm:border-4 border-white bg-amber-50 cursor-pointer transition-all duration-300 ease-out md:rotate-1 lg:rotate-2 hover:rotate-0 hover:-translate-y-2 hover:scale-[1.03]"
            >
              <img
                src="https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=800&q=80"
                alt="따뜻한 분위기 속에서 책을 읽는 독서 시간"
                className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-108"
              />
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};

