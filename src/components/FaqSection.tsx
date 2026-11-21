import React, { useState } from 'react';
import { Plus, Minus } from 'lucide-react';

const FAQS = [
  {
    q: '책에 대한 배경지식이나 문학 지식이 많지 않아도 괜찮나요?',
    a: '네, 전혀 걱정하지 않으셔도 됩니다! 리도라는 전문적인 비평이 아니라 책을 읽고 느낀 각자의 생각과 일상을 편하게 나누는 자리입니다. 모임 전까지 책을 완독하고 발제 질문을 가볍게 떠올려 오시면 누구나 즐겁게 대화에 참여할 수 있습니다.',
  },
  {
    q: '모임 장소와 주차는 어떻게 되나요?',
    a: '독서모임은 캘거리 다운타운의 Alforno Cafe, 17th Ave의 Analog Coffee, 켄싱턴의 Higher Ground, 중앙도서관 토론룸 등 접근성이 좋고 주차가 편리한 곳에서 열립니다. 각 모임 상세 페이지 및 "내 모임 관리"에서 정확한 주차 지원 및 C-Train 안내를 확인하실 수 있습니다.',
  },
  {
    q: '일정에 변동이 생기면 취소나 환불이 가능한가요?',
    a: '모임 시작 48시간 전까지는 "내 모임 관리"에서 클릭 한 번으로 수수료 없이 100% 취소 및 환불이 가능합니다. 다른 대기자 분들을 위해 일정이 어려워지셨을 경우 미리 취소해주시면 감사하겠습니다.',
  },
  {
    q: '일반 회원도 호스트가 되어 모임을 열 수 있나요?',
    a: '네! 리도라(Readora)는 누구나 호스트가 될 수 있는 커뮤니티 플랫폼을 지향합니다. 상단 "호스트 지원" 메뉴를 통해 추천하고 싶은 도서와 아이디어를 남겨주시면, 운영진과의 가벼운 티타임 후 공식 모임으로 개설하고 공간 예약 및 활동비 지원을 제공해 드립니다.',
  },
];

export const FaqSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (i: number) => {
    setOpenIndex(openIndex === i ? null : i);
  };

  return (
    <section className="py-16 sm:py-24 bg-[#FBF9E9]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-10 sm:mb-12">
          <p className="font-display-en text-xs font-bold tracking-[0.16em] uppercase text-[#191919]/55 mb-3">
            FAQ
          </p>
          <h2 className="text-3xl sm:text-4xl font-black text-[#191919] tracking-tight">
            자주 묻는 질문
          </h2>
          <p className="text-sm text-[#191919]/65 mt-2">
            모임 신청 전 궁금한 점을 미리 확인해 보세요.
          </p>
        </div>

        <div className="border-t border-[#191919]/15 divide-y divide-[#191919]/15">
          {FAQS.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div key={idx} className="transition-colors">
                <button
                  onClick={() => toggle(idx)}
                  className="w-full py-5 sm:py-6 px-2 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-[#FFFDF4] transition-colors"
                >
                  <span className="text-sm sm:text-base font-bold text-[#191919] leading-snug">
                    {faq.q}
                  </span>
                  <span
                    className={`w-8 h-8 rounded-lg border border-[#191919]/15 flex items-center justify-center shrink-0 transition-colors ${
                      isOpen ? 'bg-[#FFE57E] text-[#191919]' : 'bg-[#FFFDF4] text-[#191919]'
                    }`}
                  >
                    {isOpen ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  </span>
                </button>

                {isOpen && (
                  <div className="px-2 pb-6 text-sm text-[#191919]/75 leading-relaxed">
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
