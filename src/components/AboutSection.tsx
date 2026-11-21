import React from 'react';

export const AboutSection: React.FC = () => {
  return (
    <section className="py-16 sm:py-22 bg-[#FBF9E9]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative">
          {/* Tilted Soft Cream Backing Sheet */}
          <div
            aria-hidden="true"
            className="hidden sm:block absolute inset-0 rounded-2xl bg-[#FFE57E]/25 border border-[#191919]/15 -rotate-1 translate-y-1"
          />

          {/* Top-Right Paperclip Detail */}
          <svg
            aria-hidden="true"
            viewBox="0 0 24 44"
            fill="none"
            className="hidden sm:block absolute -top-4 right-8 sm:right-12 w-5 h-10 z-20 text-[#191919]/65"
          >
            <path
              d="M17 13V30C17 34.9706 12.9706 39 8 39C3.02944 39 2 34.9706 2 30V10C2 5.58172 5.58172 2 10 2C14.4183 2 18 5.58172 18 10V27C18 29.7614 15.7614 32 13 32C10.2386 32 8 29.7614 8 27V12"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          </svg>

          {/* Foreground Note Card */}
          <div className="relative bg-[#FFFDF4] rounded-2xl border border-[#191919]/15 p-7 sm:p-11 md:p-14 shadow-xs">
            {/* Eyebrow & Heading */}
            <div className="mb-7">
              <p className="font-display-en text-xs font-bold tracking-[0.12em] uppercase text-[#F16B47]">
                OUR STORY · ABOUT READORA
              </p>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-[#191919] mt-2">
                우리의 이야기는 책에서 시작돼요.
              </h2>
            </div>

            {/* Founder Note Body Copy */}
            <div className="space-y-4 text-sm sm:text-base text-[#191919]/80 leading-relaxed">
              <p>
                낯선 도시에서 새로운 사람을 만나는 일은 생각보다 쉽지 않죠.
              </p>
              <p>
                리도라는 책 한 권을 핑계로 사람들이 모이고, 이야기를 나누고, 새로운 인연을 만드는 곳이에요.
              </p>
              <p>
                책에 대한 많은 지식이 없어도 괜찮아요.
              </p>
              <p className="text-[#191919]">
                어려운 비평보다 함께 이야기를 나누며 보내는 시간이 더 중요하니까요.
              </p>
            </div>

            {/* Dashed Quote Callout */}
            <div className="mt-8 px-5 py-4 rounded-xl bg-[#FFE57E]/25 border border-dashed border-[#191919]/25">
              <p className="text-xs sm:text-sm font-bold text-[#191919] leading-relaxed">
                “혼자 읽으면 책장을 덮고 끝나지만, 함께 읽으면 그날의 대화와 새로운 친구가 남아요.”
              </p>
            </div>

            {/* Bottom Signature Bar */}
            <div className="mt-8 flex items-end justify-between gap-4">
              <div>
                <p className="text-sm font-bold text-[#191919]">READORA Calgary</p>
                <p className="text-xs text-[#191919]/55 mt-0.5">
                  Social Book Club Community
                </p>
              </div>
              <span className="font-display-en text-xs font-semibold tracking-[0.08em] uppercase text-[#191919]/65">
                READ. MEET. REPEAT.
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
