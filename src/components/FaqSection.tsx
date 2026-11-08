import React, { useState } from 'react';
import { Plus, Minus, HelpCircle } from 'lucide-react';

const FAQS = [
  {
    q: '책을 다 완독하지 못해도 모임에 참석할 수 있나요?',
    a: '네, 가능합니다! 완독을 권장해 드리지만, 절반 정도만 읽으셨더라도 편안하게 오셔서 다른 분들의 이야기를 듣고 나의 생각을 나누실 수 있습니다. 모임 전 발제 질문을 미리 읽어오시면 더욱 풍성한 대화가 가능합니다.'
  },
  {
    q: '모임 장소와 주차는 어떻게 되나요?',
    a: '독서모임은 캘거리 다운타운의 Alforno Cafe, 17th Ave의 Analog Coffee, 켄싱턴의 Higher Ground, 중앙도서관 토론룸 등 접근성이 좋고 주차가 편리한 곳에서 열립니다. 각 모임 상세 페이지 및 "내 모임 관리"에서 정확한 주차 지원 및 C-Train 안내를 확인하실 수 있습니다.'
  },
  {
    q: '일정에 변동이 생기면 취소나 환불이 가능한가요?',
    a: '모임 시작 48시간 전까지는 "내 모임 관리"에서 클릭 한 번으로 수수료 없이 100% 취소 및 환불이 가능합니다. 다른 대기자 분들을 위해 일정이 어려워지셨을 경우 미리 취소해주시면 감사하겠습니다.'
  },
  {
    q: '일반 회원도 호스트가 되어 모임을 열 수 있나요?',
    a: '네! 리도라(Readora)는 누구나 호스트가 될 수 있는 커뮤니티 플랫폼을 지향합니다. 상단 "호스트 지원" 메뉴를 통해 추천하고 싶은 도서와 아이디어를 남겨주시면, 운영진과의 가벼운 티타임 후 공식 모임으로 개설하고 공간 예약 및 활동비 지원을 제공해 드립니다.'
  }
];

export const FaqSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (i: number) => {
    setOpenIndex(openIndex === i ? null : i);
  };

  return (
    <section className="py-12 sm:py-20 md:py-28 bg-[#F4F0E5] border-t border-[#EDE4D5]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading matching "No stress, no surprises" */}
        <div className="text-center max-w-xl mx-auto mb-8 sm:mb-14">
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-[#19221C] tracking-tight">
            No stress, no{' '}
            <span className="text-[#2D6A4F] font-serif-accent italic relative inline-block px-1">
              surprises
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
          <p className="text-xs sm:text-base text-[#616F65] mt-2">
            캘거리 독서모임 참가 전 자주 묻는 질문들을 모았습니다.
          </p>
        </div>

        {/* Accordion List matching reference screenshot */}
        <div className="space-y-2.5 sm:space-y-3">
          {FAQS.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl sm:rounded-3xl bg-white border border-[#E9E1D2] overflow-hidden transition-all shadow-xs"
              >
                <button
                  onClick={() => toggle(idx)}
                  className="w-full p-4 sm:p-6 text-left flex items-center justify-between gap-3 sm:gap-4 cursor-pointer hover:bg-[#F4F0E5]/60 transition-colors"
                >
                  <span className="text-xs sm:text-base font-bold text-[#19221C] leading-snug">
                    {faq.q}
                  </span>
                  <div
                    className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                      isOpen ? 'bg-[#E8F2E8] text-[#2D6A4F]' : 'bg-[#F4F0E5] text-[#718076]'
                    }`}
                  >
                    {isOpen ? <Minus className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                  </div>
                </button>

                {isOpen && (
                  <div className="px-4 sm:px-6 py-4 sm:py-6 text-xs sm:text-sm text-[#546257] leading-relaxed border-t border-[#F2EAE0]">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
