import React from 'react';

export const HowItWorks: React.FC = () => {
  return (
    <section className="py-20 md:py-28 bg-[#F4F0E5] border-t border-[#E6DFD2]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading matching "How it Works" */}
        <div className="mb-14">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#19221C] tracking-tight">
            How it{' '}
            <span className="text-[#2D6A4F] font-serif-accent italic relative inline-block px-1">
              Works
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
            책 선택부터 캘거리 로컬 카페에서의 만남까지, 쉽고 편안한 3단계 진행 과정
          </p>
        </div>

        {/* 2-Column: Photo on Left, 3 Steps on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Photo */}
          <div className="lg:col-span-5 rounded-3xl overflow-hidden shadow-lg border-4 border-white aspect-[4/3] lg:aspect-[4/5] bg-neutral-100">
            <img
              src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1000&q=80"
              alt="Two readers talking and laughing over coffee"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Right 3 Steps */}
          <div className="lg:col-span-7 space-y-4">
            {/* Step 01 */}
            <div className="bg-white rounded-3xl p-6 border border-[#EBE3D5] shadow-xs flex items-start gap-5 hover:border-[#DF612D]/40 transition-colors">
              <span className="w-10 h-10 rounded-2xl bg-[#EBF2FA] text-[#1E4E79] text-sm font-extrabold flex items-center justify-center flex-shrink-0">
                01
              </span>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-base font-bold text-[#19221C]">
                    모임 탐색 및 신청
                  </h3>
                </div>
                <p className="text-xs sm:text-sm text-[#526055] leading-relaxed">
                  관심 있는 책, 일정, 모임 지역을 둘러보고 신청을 확정합니다.
                </p>
              </div>
            </div>

            {/* Step 02 */}
            <div className="bg-white rounded-3xl p-6 border border-[#EBE3D5] shadow-xs flex items-start gap-5 hover:border-[#DF612D]/40 transition-colors">
              <span className="w-10 h-10 rounded-2xl bg-[#E8F2E8] text-[#2D6A4F] text-sm font-extrabold flex items-center justify-center flex-shrink-0">
                02
              </span>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-base font-bold text-[#19221C]">
                    발제문 확인 & 메모
                  </h3>
                </div>
                <p className="text-xs sm:text-sm text-[#526055] leading-relaxed">
                  '내 모임 관리'에서 호스트의 발제 질문을 미리 읽고, 내 생각과 인상 깊었던 구절을 노트에 간단히 메모해둡니다.
                </p>
              </div>
            </div>

            {/* Step 03 */}
            <div className="bg-white rounded-3xl p-6 border border-[#EBE3D5] shadow-xs flex items-start gap-5 hover:border-[#DF612D]/40 transition-colors">
              <span className="w-10 h-10 rounded-2xl bg-[#FDEEE3] text-[#DF612D] text-sm font-extrabold flex items-center justify-center flex-shrink-0">
                03
              </span>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-base font-bold text-[#19221C]">
                    멤버들과의 만남 & 깊은 대화
                  </h3>
                </div>
                <p className="text-xs sm:text-sm text-[#526055] leading-relaxed">
                  신청한 모임에 참여해 사람들과 서로 다른 생각을 나누며 즐거운 북토크를 즐깁니다.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
