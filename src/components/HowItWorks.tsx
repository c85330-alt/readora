import React from 'react';
import { Search, TicketCheck, Coffee } from 'lucide-react';

const STEPS = [
  {
    number: '1.',
    title: '마음에 드는 모임 찾기',
    description:
      '캘거리 카페와 도서관에서 열리는 다양한 모임 중, 끌리는 책과 일정·장소를 편하게 둘러보세요.',
    metaLeft: '도서 · 일정 탐색',
    metaRight: '캘거리 전역 거점',
    icon: Search,
    accentBg: 'bg-[#B9D8E6]',
  },
  {
    number: '2.',
    title: '가볍게 신청하기',
    description:
      '참여하고 싶은 모임을 선택해 신청을 완료하면, 내 모임 페이지에서 일정과 발제 질문을 바로 확인할 수 있어요.',
    metaLeft: '클릭 한 번 신청',
    metaRight: '48시간 전 100% 환불',
    icon: TicketCheck,
    accentBg: 'bg-[#FFE57E]',
  },
  {
    number: '3.',
    title: '책 들고 새로운 사람 만나기',
    description:
      '모임 당일 책 한 권과 가벼운 마음으로 놀러 오세요. 새로운 사람들과 웃고 이야기하는 시간이 기다려요.',
    metaLeft: '소규모 오프라인',
    metaRight: '자유로운 북토크',
    icon: Coffee,
    accentBg: 'bg-[#F16B47]/20',
  },
];

export const HowItWorks: React.FC = () => {
  return (
    <section
      id="guide-section"
      className="py-16 sm:py-24 bg-[#FBF9E9] border-t border-[#191919]/12 scroll-mt-20"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-14">
          <p className="font-display-en text-xs font-bold tracking-[0.16em] uppercase text-[#191919]/55 mb-3">
            HOW IT WORKS
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-[#191919]">
            리도라, 이렇게 즐겨요!
          </h2>
        </div>

        {/* 3 Clean Minimalist Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {STEPS.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.number}
                className="bg-[#FFFDF4] rounded-2xl border border-[#191919]/15 p-6 sm:p-7 flex flex-col justify-between transition-colors hover:border-[#191919]/40"
              >
                <div>
                  {/* Minimalist Editorial Card Graphic */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center -space-x-2">
                      <span
                        className={`w-11 h-11 rounded-lg border border-[#191919]/20 flex items-center justify-center ${step.accentBg}`}
                      >
                        <Icon className="w-5 h-5 text-[#191919]" />
                      </span>
                      <span className="w-9 h-9 rounded-lg border border-[#191919]/15 bg-[#FBF9E9] -rotate-6" />
                    </div>
                    <span className="font-display-en text-sm font-bold text-[#191919]/45 tabular-nums">
                      STEP 0{step.number.replace('.', '')}
                    </span>
                  </div>

                  <h3 className="text-lg sm:text-xl font-extrabold text-[#191919] mb-2.5">
                    {step.number} {step.title}
                  </h3>

                  <p className="text-sm text-[#191919]/75 leading-relaxed">
                    {step.description}
                  </p>
                </div>

                {/* Unboxed Clean Spec Footer */}
                <div className="mt-7 pt-4 border-t border-[#191919]/10 flex items-center justify-between text-xs font-medium text-[#191919]/60">
                  <span>{step.metaLeft}</span>
                  <span>{step.metaRight}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
