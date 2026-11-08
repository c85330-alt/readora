import React from 'react';
import { Check, Sparkles } from 'lucide-react';

interface PricingSectionProps {
  onExploreClubs: () => void;
  onBecomeHost: () => void;
}

export const PricingSection: React.FC<PricingSectionProps> = ({
  onExploreClubs,
  onBecomeHost
}) => {
  return (
    <section className="py-20 md:py-28 bg-[#F4F0E5] border-t border-[#EDE4D5]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading matching "Simple plans" */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-14">
          <div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#19221C] tracking-tight">
              Simple{' '}
              <span className="text-[#2D6A4F] font-serif-accent italic relative inline-block px-1">
                plans
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
            <p className="text-sm sm:text-base text-[#616F65] mt-2">
              부담 없는 1회성 참여부터 4주 시즌제 완독까지, 자유롭게 선택하세요.
            </p>
          </div>
          <span className="text-xs text-[#7B8B80]">
            * 모임 장소 대관 및 카페 음료 주문 지원 포함
          </span>
        </div>

        {/* 3 Tier Cards Grid matching screenshot layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          {/* Plan 1: 1회 게스트 */}
          <div className="rounded-3xl p-7 bg-white border border-[#E9E1D2] flex flex-col justify-between shadow-xs hover:shadow-md transition-shadow">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-bold text-[#19221C]">1회 게스트 패스</span>
                <span className="text-[11px] text-[#718076] bg-[#F4F0E5] px-2 py-0.5 rounded-full">
                  초보자 추천
                </span>
              </div>

              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl sm:text-4xl font-extrabold text-[#19221C]">$15</span>
                  <span className="text-xs font-medium text-[#718076]">CAD / 1회</span>
                </div>
                <p className="text-xs text-[#526055] mt-1">
                  일정에 맞춰 가볍게 한 번 참여해보는 게스트 플랜
                </p>
              </div>

              <div className="space-y-3 text-xs text-[#3E4C41] pt-6 border-t border-[#F0E9DC]">
                <div className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-[#2D6A4F] shrink-0 mt-0.5" />
                  <span className="flex-1 min-w-0 text-pretty">소규모 밀착 토론 (4~7명 정원)</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-[#2D6A4F] shrink-0 mt-0.5" />
                  <span className="flex-1 min-w-0 text-pretty">호스트 엄선 발제문 및 토론 가이드</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-[#2D6A4F] shrink-0 mt-0.5" />
                  <span className="flex-1 min-w-0 text-pretty">내 모임 관리 및 참여 현황 확인</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-[#2D6A4F] shrink-0 mt-0.5" />
                  <span className="flex-1 min-w-0 text-pretty">캘거리 로컬 카페 및 도서관 모임</span>
                </div>
              </div>
            </div>

            <div className="pt-8">
              <button
                onClick={onExploreClubs}
                className="w-full py-3 rounded-full bg-[#F4F0E5] hover:bg-[#F2ECE0] border border-[#DDD4C3] text-xs sm:text-sm font-semibold text-[#19221C] transition-colors cursor-pointer"
              >
                모임 둘러보고 신청하기
              </button>
            </div>
          </div>

          {/* Plan 2: 시즌 멤버십 (Dark Featured Card) */}
          <div className="rounded-3xl p-7 bg-[#172E22] text-white border-2 border-[#2D6A4F] flex flex-col justify-between shadow-xl relative scale-102 lg:-translate-y-2">
            <div className="absolute -top-3.5 right-6">
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#DF612D] text-white text-[11px] font-bold shadow-xs uppercase tracking-wider">
                <Sparkles className="w-3 h-3" />
                Popular
              </span>
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-bold text-white">4회 시즌 멤버십</span>
                <span className="text-[11px] text-[#A8BDB1] bg-white/10 px-2 py-0.5 rounded-full">
                  완독 습관 형성
                </span>
              </div>

              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl sm:text-4xl font-extrabold text-[#FDFBF7]">$50</span>
                  <span className="text-xs font-medium text-[#A8BDB1]">CAD / 4회 (회당 $12.5)</span>
                </div>
                <p className="text-xs text-[#C5D5CB] mt-1 text-pretty">
                  한 달간 꾸준히 책을 읽고 깊은 관계를 맺는 정규 클럽
                </p>
              </div>

              <div className="space-y-3 text-xs text-[#E3EDE7] pt-6 border-t border-white/15">
                <div className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-[#44B27B] shrink-0 mt-0.5" />
                  <span className="flex-1 min-w-0 text-pretty">4주 연속 북클럽 확정 참여 (원하는 모임 4회)</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-[#44B27B] shrink-0 mt-0.5" />
                  <span className="flex-1 min-w-0 text-pretty">리도라(Readora) 공식 웰컴 굿즈(북마크 & 노트) 증정</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-[#44B27B] shrink-0 mt-0.5" />
                  <span className="flex-1 min-w-0 text-pretty">멤버 전용 카카오톡 커뮤니티 초대</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-[#44B27B] shrink-0 mt-0.5" />
                  <span className="flex-1 min-w-0 text-pretty">일정 변경 시 1회 무료 연기/교환권</span>
                </div>
              </div>
            </div>

            <div className="pt-8">
              <button
                onClick={onExploreClubs}
                className="w-full py-3 rounded-full bg-[#DF612D] hover:bg-[#c95221] text-white text-xs sm:text-sm font-bold shadow-md transition-all cursor-pointer"
              >
                시즌 멤버십 모임 신청
              </button>
            </div>
          </div>

          {/* Plan 3: 호스트 패스 */}
          <div className="rounded-3xl p-7 bg-white border border-[#E9E1D2] flex flex-col justify-between shadow-xs hover:shadow-md transition-shadow">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-bold text-[#19221C]">호스트 파트너</span>
                <span className="text-[11px] text-[#2D6A4F] bg-[#E8F2E8] px-2 py-0.5 rounded-full font-bold">
                  수익 & 리더십
                </span>
              </div>

              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl sm:text-4xl font-extrabold text-[#2D6A4F]">FREE</span>
                  <span className="text-xs font-semibold text-[#DF612D] ml-1.5">+ 활동비 지급</span>
                </div>
                <p className="text-xs text-[#526055] mt-1 text-pretty">
                  좋아하는 책으로 직접 모임을 열고 캘거리 독서인들을 이끕니다
                </p>
              </div>

              <div className="space-y-3 text-xs text-[#3E4C41] pt-6 border-t border-[#F0E9DC]">
                <div className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-[#2D6A4F] shrink-0 mt-0.5" />
                  <span className="flex-1 min-w-0 text-pretty">모임 회차당 활동비 & 도서 지원비 (CAD $50)</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-[#2D6A4F] shrink-0 mt-0.5" />
                  <span className="flex-1 min-w-0 text-pretty">캘거리 제휴 카페/토론룸 공간 대관 지원</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-[#2D6A4F] shrink-0 mt-0.5" />
                  <span className="flex-1 min-w-0 text-pretty">발제문 템플릿 & 모임 운영 가이드북 제공</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-[#2D6A4F] shrink-0 mt-0.5" />
                  <span className="flex-1 min-w-0 text-pretty">리도라(Readora) 공식 인증 호스트 배지 부여</span>
                </div>
              </div>
            </div>

            <div className="pt-8">
              <button
                onClick={onBecomeHost}
                className="w-full py-3 rounded-full bg-[#E8F2E8] hover:bg-[#d8ebd9] border border-[#CCE0CD] text-xs sm:text-sm font-bold text-[#245940] transition-colors cursor-pointer"
              >
                호스트 지원서 작성하기
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
