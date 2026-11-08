import React from 'react';

interface VenuesSectionProps {
  onSelectArea: (area: any) => void;
}

const VENUES = [
  {
    name: 'Alforno Bakery & Cafe',
    area: 'Downtown / Eau Claire',
    desc: '보우 강변에 위치한 감각적인 베이커리 카페. 주말 오전 채광이 가득한 테이블에서 진행됩니다.',
    tag: '주말 브런치 & 독서',
    image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=600&q=80'
  },
  {
    name: 'Calgary Central Library (중앙도서관)',
    area: 'Downtown / East Village',
    desc: '세계적인 건축 디자인을 자랑하는 캘거리의 문화 심장부. 조용하고 쾌적한 3층 토론룸 이용.',
    tag: '집중도 높은 인문 토론',
    image: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=600&q=80'
  },
  {
    name: 'Analog Coffee',
    area: 'Beltline / 17th Ave SW',
    desc: '캘거리 대표 로스터리 카페. 활기찬 도심의 에너지를 느끼며 경제/자기계발 도서를 나눕니다.',
    tag: '커리어 & 경제 북클럽',
    image: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=600&q=80'
  },
  {
    name: 'Higher Ground Cafe (Kensington)',
    area: 'Kensington / 10 St NW',
    desc: '아늑한 조명과 유기농 커피가 매력적인 켄싱턴의 상징적인 카페. 여유로운 주말 오후 북토크 진행.',
    tag: '켄싱턴 문학 & 에세이',
    image: 'https://images.unsplash.com/photo-1442512595331-e89e73853f31?auto=format&fit=crop&w=600&q=80'
  }
];

export const VenuesSection: React.FC<VenuesSectionProps> = ({ onSelectArea }) => {
  return (
    <section className="py-20 md:py-28 bg-[#E9F0E1]/40 border-t border-[#DDE7D3]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center gap-12">
          {/* Left Visual Grid */}
          <div className="w-full md:w-1/2 grid grid-cols-2 gap-4">
            <div className="space-y-4">
              <div className="rounded-3xl overflow-hidden shadow-md aspect-square">
                <img
                  src="https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=600&q=80"
                  alt="Alforno Cafe"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="rounded-3xl overflow-hidden shadow-md aspect-[4/5]">
                <img
                  src="https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=600&q=80"
                  alt="Calgary Central Library"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <div className="space-y-4 pt-6">
              <div className="rounded-3xl overflow-hidden shadow-md aspect-[4/5]">
                <img
                  src="https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=600&q=80"
                  alt="Analog Coffee"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="rounded-3xl overflow-hidden shadow-md aspect-square">
                <img
                  src="https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?auto=format&fit=crop&w=800&q=80"
                  alt="Calgary Central Library (캘거리 중앙도서관)"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>

          {/* Right Text & List matching reference "Learn where you learn best" */}
          <div className="w-full md:w-1/2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white border border-[#D5E2CC] text-[#245D43] text-xs font-semibold mb-4">
              <span className="w-2 h-2 rounded-full bg-[#DF612D]" />
              <span>Calgary Community Spaces</span>
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-[44px] font-extrabold text-[#19221C] tracking-tight leading-tight mb-4">
              Read where you{' '}
              <span className="text-[#2D6A4F] font-serif-accent italic relative inline-block px-1">
                read best
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

            <p className="text-sm sm:text-base text-[#526055] leading-relaxed mb-6">
              캘거리 중심가의 분위기 좋은 단골 카페와 세계적인 건축상을 받은 중앙도서관 토론룸에서 따뜻한 온기를 나누며 생각을 펼칠 수 있는 모임 공간입니다.
            </p>

            {/* Pills list */}
            <div className="flex flex-wrap gap-2 mb-8 text-xs font-semibold">
              <span className="px-3.5 py-2 rounded-full bg-white border border-[#CFDFBF] text-[#2D6A4F]">
                ☕ 캘거리 다운타운 (Eau Claire)
              </span>
              <span className="px-3.5 py-2 rounded-full bg-white border border-[#CFDFBF] text-[#2D6A4F]">
                🏛️ 중앙도서관 (East Village)
              </span>
              <span className="px-3.5 py-2 rounded-full bg-white border border-[#CFDFBF] text-[#2D6A4F]">
                🧁 켄싱턴 로컬 카페
              </span>
              <span className="px-3.5 py-2 rounded-full bg-white border border-[#CFDFBF] text-[#2D6A4F]">
                ☕ 17th Ave 벨트라인 로스터리
              </span>
            </div>

            <a
              href="#explore-section"
              className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-[#DF612D] hover:bg-[#c95221] text-white text-xs sm:text-sm font-semibold shadow-xs transition-all cursor-pointer"
            >
              모임 장소별 일정 보기
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
