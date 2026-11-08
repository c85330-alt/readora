import React from 'react';

export const StatsStory: React.FC = () => {
  return (
    <section className="py-20 md:py-28 bg-[#F4F0E5] border-t border-[#E6DFD2]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Title */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="text-3xl sm:text-4xl md:text-[44px] font-extrabold text-[#19221C] tracking-tight leading-tight">
            Building strong connections through shared{' '}
            <span className="text-[#2D6A4F] font-serif-accent italic relative inline-block px-1">
              reading experiences
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
          <div className="mt-4">
            <span className="inline-block px-4 py-1.5 rounded-full bg-white border border-[#DDD4C3] text-xs font-semibold text-[#546258]">
              Our story in Calgary
            </span>
          </div>
        </div>

        {/* Big Card with Dark Badge matching the reference image */}
        <div className="relative rounded-3xl overflow-hidden bg-white border border-[#E9E1D2] shadow-lg grid grid-cols-1 lg:grid-cols-12 items-center">
          {/* Left Dark Stats Box */}
          <div className="lg:col-span-5 bg-[#172E22] text-white p-8 sm:p-10 flex flex-col justify-between h-full">
            <div className="space-y-8">
              <div>
                <div className="text-4xl sm:text-5xl font-extrabold text-[#FDFBF7] tracking-tight">
                  450+
                </div>
                <p className="text-xs sm:text-sm text-[#A8BDB1] mt-1">
                  Calgary readers since 2024
                </p>
              </div>

              <div className="pt-6 border-t border-white/10 flex items-baseline justify-between">
                <div>
                  <span className="text-xs text-[#A8BDB1] block">재참여 및 추천 의향</span>
                  <span className="text-xs text-white/70">Warm & safe atmosphere</span>
                </div>
                <div className="text-3xl sm:text-4xl font-extrabold text-[#E06937]">
                  98%
                </div>
              </div>

              <div className="pt-6 border-t border-white/10 flex items-baseline justify-between">
                <div className="text-3xl sm:text-4xl font-extrabold text-[#FDFBF7]">
                  4.9/5
                </div>
                <p className="text-xs text-[#A8BDB1]">
                  Rating across 120+ sessions
                </p>
              </div>
            </div>

            <div className="pt-8 mt-6 border-t border-white/15 flex items-center gap-2 text-xs text-[#D5E3D9]">
              <span className="w-2 h-2 rounded-full bg-[#DF612D]" />
              <span>Trusted by Calgary Korean newcomers and long-term locals.</span>
            </div>
          </div>

          {/* Right Image Container */}
          <div className="lg:col-span-7 h-72 sm:h-96 lg:h-full relative overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=1200&q=80"
              alt="Reader journaling thoughts over book"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent flex items-end p-6">
              <div className="text-white text-xs sm:text-sm font-medium bg-black/40 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/20">
                ☕ 캘거리의 사계절을 가장 풍요롭게 채우는 방법은 좋은 사람들과 같은 책을 읽는 것입니다.
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
