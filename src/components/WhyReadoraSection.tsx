import React from 'react';

const VALUE_PILLARS = [
  {
    number: '01.',
    title: '책은 가볍게',
    description:
      '책에 대한 많은 지식이 없어도 괜찮아요. 책을 읽고 느낀 솔직한 감상과 마음에 남은 한 문장만 들고 와도 충분히 함께할 수 있어요.',
    accent: 'bg-[#FFE57E]',
  },
  {
    number: '02.',
    title: '대화는 자유롭게',
    description:
      '정답을 맞히거나 책 내용을 발표하는 자리가 아니에요. 서로의 생각과 캘거리의 일상을 편안하게 나눠요.',
    accent: 'bg-[#B9D8E6]',
  },
  {
    number: '03.',
    title: '인연은 오래오래',
    description:
      '책 한 권으로 시작된 반가운 첫 인사가 따뜻한 커피 한 잔과 웃음으로 이어져 소중한 인연이 됩니다.',
    accent: 'bg-[#F16B47]',
  },
];

export const WhyReadoraSection: React.FC = () => {
  return (
    <section id="guide-section" className="py-16 sm:py-24 bg-[#FBF9E9] scroll-mt-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Centered Editorial Headline */}
        <div className="text-center max-w-3xl mx-auto mb-14 sm:mb-16">
          <p className="font-display-en text-xs font-bold tracking-[0.16em] uppercase text-[#191919]/55 mb-4">
            WHY READORA
          </p>
          <h2 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight leading-[1.12] text-[#191919]">
            책만 읽고
            <br />
            헤어지기엔{' '}
            <span className="text-[#F16B47]">아쉽잖아!</span>
          </h2>
        </div>

        {/* 3 Numbered Editorial Value Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {VALUE_PILLARS.map((pillar) => (
            <div
              key={pillar.number}
              className="pt-6 border-t border-[#191919]/20 flex flex-col justify-between gap-3"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-display-en text-xl sm:text-2xl font-bold text-[#191919] tabular-nums">
                    {pillar.number}
                  </span>
                  <span
                    aria-hidden="true"
                    className={`w-3 h-3 rounded-full border border-[#191919]/20 ${pillar.accent}`}
                  />
                </div>
                <h3 className="text-lg sm:text-xl font-extrabold text-[#191919]">
                  {pillar.title}
                </h3>
                <p className="text-sm text-[#191919]/75 leading-relaxed">
                  {pillar.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
